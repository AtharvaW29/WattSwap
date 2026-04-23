/**
 * VirtualESP32.js
 * Main device state machine that orchestrates:
 * - Battery model
 * - Relay controller
 * - Sensor simulator
 * - Firebase updates
 */

const BatteryModel = require("./BatteryModel");
const RelayController = require("./RelayController");
const SensorSimulator = require("./SensorSimulator");

class VirtualESP32 {
  constructor(deviceId, options = {}) {
    this.deviceId = deviceId;

    // Sub-components
    this.battery = new BatteryModel({
      capacityWh: options.capacityWh || 5000,
      nominalVoltage: options.nominalVoltage || 48,
      initialSoC: options.initialSoC || 80
    });

    this.relay = new RelayController({
      softStartDelayMs: options.softStartDelayMs || 500,
      maxDurationSeconds: options.maxDurationSeconds || 7200
    });

    this.sensors = new SensorSimulator({
      nominalVoltage: options.nominalVoltage || 48,
      maxCurrentA: options.maxCurrentA || 50,
      loadProfile: options.loadProfile || "constant"
    });

    // State tracking
    this.isRunning = false;
    this.updateInterval = options.updateInterval || 1000; // 1 second
    this.lastUpdateTime = Date.now();
    this.simulationTime = 0; // Virtual time in seconds

    // Transaction tracking
    this.activeTransaction = null;
    this.transactionStartTime = null;
    this.energyDeliveredWh = 0;

    // Firebase integration
    this.firebaseAdapter = null;
    this.shouldPublishMetrics = options.shouldPublishMetrics !== false;

    // Listener for relay commands
    this.relayCommandListener = null;

    // Options
    this.verbose = options.verbose || false;
    this.simulationSpeed = options.simulationSpeed || 1.0; // 1.0 = real-time
  }

  /**
   * Initialize the virtual device
   * @param {FirebaseAdapter} firebaseAdapter - Firebase connection
   */
  async initialize(firebaseAdapter) {
    this.firebaseAdapter = firebaseAdapter;

    // Set up listener for relay commands from Firebase
    this.relayCommandListener = firebaseAdapter.listenToPath(
      `/devices/${this.deviceId}/relay/command`,
      (commandData) => this._handleRelayCommand(commandData),
      `relay_cmd_${this.deviceId}`
    );

    // Write initial device config
    await firebaseAdapter.writeToPath(
      `/devices/${this.deviceId}/metadata/initialized`,
      {
        timestamp: Date.now(),
        version: "1.0",
        capacity_wh: this.battery.capacityWh,
        nominal_voltage: this.battery.nominalVoltage
      }
    );

    if (this.verbose) {
      console.log(`[${this.deviceId}] Initialized`);
    }
  }

  /**
   * Start the simulation loop
   */
  start() {
    if (this.isRunning) {
      console.warn(`[${this.deviceId}] Already running`);
      return;
    }

    this.isRunning = true;
    this.lastUpdateTime = Date.now();

    if (this.verbose) {
      console.log(`[${this.deviceId}] Simulation started`);
    }

    this._simulationLoop();
  }

  /**
   * Stop the simulation
   */
  stop() {
    this.isRunning = false;

    if (this.relayCommandListener) {
      this.firebaseAdapter.stopListening(this.relayCommandListener);
    }

    if (this.verbose) {
      console.log(`[${this.deviceId}] Simulation stopped`);
    }
  }

  /**
   * Main simulation loop
   */
  _simulationLoop() {
    if (!this.isRunning) {
      return;
    }

    const now = Date.now();
    const deltaTimeMs = (now - this.lastUpdateTime) * this.simulationSpeed;
    const deltaTimeSeconds = deltaTimeMs / 1000;

    this.lastUpdateTime = now;
    this.simulationTime += deltaTimeSeconds;

    try {
      // Update relay state
      this.relay.update(now);

      // Calculate power demand
      const powerWatts = this._calculatePowerDemand();

      // Update battery
      this.battery.update(powerWatts, deltaTimeSeconds);

      // Update sensors
      const relayOutputMultiplier = this.relay.getOutputMultiplier();
      this.sensors.update(
        this.battery.currentVoltage,
        relayOutputMultiplier,
        this.relay.isOn,
        deltaTimeSeconds
      );

      // Track energy delivered
      if (this.relay.isOn && this.activeTransaction) {
        const powerKw = this.sensors.currentPower / 1000;
        this.energyDeliveredWh += (powerKw * deltaTimeSeconds) / 3.6;
      }

      // Check for transaction completion
      this._checkTransactionStatus();

      // Publish metrics to Firebase
      if (this.shouldPublishMetrics) {
        this._publishMetrics();
      }

      // Log status periodically
      if (this.verbose && this.simulationTime % 5 < deltaTimeSeconds) {
        this._logStatus();
      }

      // Schedule next update
      setTimeout(() => this._simulationLoop(), this.updateInterval);
    } catch (error) {
      console.error(`[${this.deviceId}] Error in simulation loop:`, error);
      setTimeout(() => this._simulationLoop(), this.updateInterval);
    }
  }

  /**
   * Calculate power demand based on relay state and load profile
   */
  _calculatePowerDemand() {
    if (!this.relay.isOn) {
      return 0; // No load when relay is OFF
    }

    // Get power from sensors (includes soft-start ramp)
    const readings = this.sensors.getReadings();
    return readings.power;
  }

  /**
   * Handle relay command from Firebase
   */
  _handleRelayCommand(commandData) {
    if (!commandData) {
      return;
    }

    if (commandData.action === "ON") {
      const duration = commandData.duration_seconds || 0;
      if (this.verbose) {
        console.log(
          `[${this.deviceId}] Relay command received: ON (${duration}s)`
        );
      }

      // Store transaction info
      this.activeTransaction = {
        orderId: commandData.order_id,
        buyerAddress: commandData.buyer_address,
        energyRequested: commandData.energy_kwh,
        duration: duration
      };
      this.transactionStartTime = Date.now();
      this.energyDeliveredWh = 0;

      // Activate relay
      this.relay.activateRelay(duration);
    } else if (commandData.action === "OFF") {
      if (this.verbose) {
        console.log(`[${this.deviceId}] Relay command received: OFF`);
      }
      this.relay.deactivateRelay();
      this.activeTransaction = null;
    }
  }

  /**
   * Check if transaction should be completed
   */
  _checkTransactionStatus() {
    if (!this.activeTransaction) {
      return;
    }

    // Check if relay turned OFF (auto-completion)
    if (!this.relay.isOn && !this.relay.isSoftStarting) {
      this._completeTransaction();
    }

    // Check if energy delivered meets target
    const energyDeliveredKwh = this.energyDeliveredWh / 1000;
    if (
      this.activeTransaction.energyRequested > 0 &&
      energyDeliveredKwh >= this.activeTransaction.energyRequested
    ) {
      if (this.verbose) {
        console.log(
          `[${this.deviceId}] Energy target reached: ${energyDeliveredKwh.toFixed(2)} kWh`
        );
      }
      this.relay.deactivateRelay();
    }

    // Check for battery critical
    if (this.battery.isCriticallyLow()) {
      if (this.verbose) {
        console.log(`[${this.deviceId}] Battery critical, shutting down relay`);
      }
      this.relay.deactivateRelay();
    }
  }

  /**
   * Complete transaction and update Firebase
   */
  async _completeTransaction() {
    if (!this.activeTransaction) {
      return;
    }

    const transaction = this.activeTransaction;
    const durationSeconds = (Date.now() - this.transactionStartTime) / 1000;
    const energyDeliveredKwh = this.energyDeliveredWh / 1000;

    if (this.verbose) {
      console.log(
        `[${this.deviceId}] Transaction completed: ${energyDeliveredKwh.toFixed(2)} kWh in ${durationSeconds.toFixed(1)}s`
      );
    }

    // Update transaction status in Firebase
    if (this.firebaseAdapter) {
      await this.firebaseAdapter.updatePath(
        `/devices/${this.deviceId}/transaction`,
        {
          status: "completed",
          completed_at: Date.now(),
          duration_seconds: Math.round(durationSeconds),
          energy_delivered_kwh: Math.round(energyDeliveredKwh * 100) / 100
        }
      );
    }

    this.activeTransaction = null;
  }

  /**
   * Publish metrics to Firebase
   */
  async _publishMetrics() {
    if (!this.firebaseAdapter) {
      return;
    }

    const batteryState = this.battery.getState();
    const sensorReadings = this.sensors.getReadings();
    const relayState = this.relay.getState();

    const metrics = {
      battery: {
        soc: batteryState.socPercent,
        voltage: batteryState.voltage,
        capacity_wh: batteryState.capacityWh,
        temperature: batteryState.temperature
      },
      output: {
        power: sensorReadings.power,
        voltage: sensorReadings.voltage,
        current: sensorReadings.current,
        relay_status: relayState.isOn ? "ON" : "OFF"
      },
      relayState: {
        state: relayState.isOn ? "ON" : "OFF",
        commanded_state: relayState.commandedState,
        time_remaining_seconds: relayState.timeRemainingSeconds,
        time_elapsed_seconds: relayState.timeElapsedSeconds
      }
    };

    await this.firebaseAdapter.writeSensorBatch(this.deviceId, metrics);
  }

  /**
   * Log current status
   */
  _logStatus() {
    const battery = this.battery.getState();
    const sensors = this.sensors.getReadings();
    const relay = this.relay.getState();

    console.log(
      `[${this.deviceId}] SoC: ${battery.socPercent.toFixed(1)}% | ` +
        `V: ${sensors.voltage.toFixed(1)}V | ` +
        `I: ${sensors.current.toFixed(1)}A | ` +
        `P: ${sensors.power.toFixed(0)}W | ` +
        `Relay: ${relay.isOn ? "ON" : "OFF"}`
    );
  }

  /**
   * Get current device state
   */
  getStatus() {
    const battery = this.battery.getState();
    const sensors = this.sensors.getReadings();
    const relay = this.relay.getState();

    return {
      deviceId: this.deviceId,
      isRunning: this.isRunning,
      simulationTime: this.simulationTime,
      battery,
      sensors,
      relay,
      activeTransaction: this.activeTransaction
    };
  }

  /**
   * Set load profile for testing
   */
  setLoadProfile(profile) {
    this.sensors.setLoadProfile(profile);
  }

  /**
   * Inject a fault for testing
   */
  injectFault(faultType) {
    this.sensors.injectFault(faultType);
  }

  /**
   * Reset device state
   */
  reset() {
    this.battery.resetToFull();
    this.relay.reset();
    this.sensors = new SensorSimulator({
      nominalVoltage: this.battery.nominalVoltage,
      maxCurrentA: 50,
      loadProfile: this.sensors.loadProfile
    });
    this.activeTransaction = null;
    this.energyDeliveredWh = 0;
    this.simulationTime = 0;

    if (this.verbose) {
      console.log(`[${this.deviceId}] Reset to initial state`);
    }
  }
}

module.exports = VirtualESP32;
