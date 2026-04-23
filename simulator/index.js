/**
 * WattSwap Virtual ESP32 Simulator
 * Main entry point for running the software-only hardware simulator
 *
 * Usage:
 *   node index.js
 *
 * Environment variables:
 *   FIREBASE_DATABASE_URL - Firebase Realtime Database URL
 *   FIREBASE_SERVICE_ACCOUNT_KEY_PATH - Path to service account JSON
 *   SIMULATOR_ENABLED - Enable/disable simulator (default: true)
 *   DEVICE_IDS - Comma-separated list of device IDs (default: seller_device_001)
 *   INITIAL_SOC - Initial state of charge (0-100, default: 80)
 *   SIMULATION_SPEED - 1.0 = real-time, 2.0 = 2x speed (default: 1.0)
 *   VERBOSE - Enable debug logging (default: false)
 */

require("dotenv").config();
const firebase = require("firebase-admin");
const VirtualESP32 = require("./VirtualESP32");
const FirebaseAdapter = require("./FirebaseAdapter");

// Configuration
const config = {
  firebaseDatabaseUrl:
    process.env.FIREBASE_DATABASE_URL ||
    "https://wattswap-23188-default-rtdb.firebaseio.com/",
  serviceAccountKeyPath:
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH ||
    "./firebase-adminsdk.json",
  simulatorEnabled: process.env.SIMULATOR_ENABLED !== "false",
  deviceIds: (process.env.DEVICE_IDS || "seller_device_001").split(","),
  initialSoC: parseFloat(process.env.INITIAL_SOC || "80"),
  simulationSpeed: parseFloat(process.env.SIMULATION_SPEED || "1.0"),
  verbose: process.env.VERBOSE === "true"
};

class SimulatorManager {
  constructor() {
    this.devices = [];
    this.firebaseAdapter = null;
    this.isRunning = false;
  }

  /**
   * Initialize and start the simulator
   */
  async start() {
    try {
      console.log("🔋 WattSwap Virtual ESP32 Simulator");
      console.log("===================================\n");

      if (!config.simulatorEnabled) {
        console.log("⚠️  Simulator disabled via SIMULATOR_ENABLED");
        return;
      }

      // Initialize Firebase
      console.log("🔌 Connecting to Firebase...");
      this.firebaseAdapter = new FirebaseAdapter(
        firebase,
        config.firebaseDatabaseUrl
      );

      const initialized = await this.firebaseAdapter.initialize(
        config.serviceAccountKeyPath
      );

      if (!initialized) {
        console.error(
          "✗ Failed to initialize Firebase. Check credentials and configuration."
        );
        process.exit(1);
      }

      // Create and initialize virtual devices
      console.log(`\n📱 Creating ${config.deviceIds.length} virtual device(s)...`);

      for (const deviceId of config.deviceIds) {
        const device = new VirtualESP32(deviceId.trim(), {
          initialSoC: config.initialSoC,
          simulationSpeed: config.simulationSpeed,
          verbose: config.verbose,
          updateInterval: 1000
        });

        await device.initialize(this.firebaseAdapter);
        this.devices.push(device);

        console.log(`   ✓ ${deviceId.trim()} ready`);
      }

      // Start all devices
      console.log(`\n▶️  Starting simulation...\n`);

      for (const device of this.devices) {
        device.start();
      }

      this.isRunning = true;

      // Print initial status
      this._printStatus();

      // Periodic status updates
      setInterval(() => this._printStatus(), 30000);

      // Handle graceful shutdown
      process.on("SIGINT", () => this.stop());
      process.on("SIGTERM", () => this.stop());
    } catch (error) {
      console.error("✗ Simulator startup failed:", error);
      process.exit(1);
    }
  }

  /**
   * Stop the simulator
   */
  async stop() {
    console.log("\n\n⏹️  Shutting down simulator...");

    for (const device of this.devices) {
      device.stop();
    }

    if (this.firebaseAdapter) {
      await this.firebaseAdapter.disconnect();
    }

    this.isRunning = false;
    console.log("✓ Simulator stopped");
    process.exit(0);
  }

  /**
   * Print status of all devices
   */
  _printStatus() {
    if (!this.isRunning) {
      return;
    }

    console.log("\n📊 Status Report:");
    console.log("─".repeat(80));

    for (const device of this.devices) {
      const status = device.getStatus();

      console.log(`\n${device.deviceId}:`);
      console.log(
        `  Battery:  ${status.battery.socPercent.toFixed(1)}% SoC | ${status.battery.voltage.toFixed(1)}V | ${status.battery.temperature.toFixed(1)}°C`
      );
      console.log(
        `  Output:   ${status.sensors.power.toFixed(0)}W | ${status.sensors.voltage.toFixed(1)}V | ${status.sensors.current.toFixed(1)}A`
      );
      console.log(
        `  Relay:    ${status.relay.state} (${status.relay.timeRemainingSeconds}s remaining)`
      );

      if (status.activeTransaction) {
        console.log(
          `  Deal:     ${status.activeTransaction.orderId || "active"} | Energy: ${status.activeTransaction.energyRequested} kWh`
        );
      }
    }

    console.log("\n" + "─".repeat(80));
  }

  /**
   * Get simulator status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      deviceCount: this.devices.length,
      devices: this.devices.map((d) => d.getStatus()),
      firebaseConnected: this.firebaseAdapter?.isHealthy() || false
    };
  }
}

// Main execution
if (require.main === module) {
  const manager = new SimulatorManager();
  manager.start().catch(console.error);

  // Expose manager for programmatic control
  global.simulatorManager = manager;
}

module.exports = SimulatorManager;
