/**
 * SensorSimulator.js
 * Generates realistic sensor readings:
 * - Voltage with noise and sag
 * - Current with load profile
 * - Power calculations
 * - Realistic noise/jitter
 */

class SensorSimulator {
  constructor(options = {}) {
    // Base specifications
    this.nominalVoltage = options.nominalVoltage || 48;
    this.maxCurrentA = options.maxCurrentA || 50; // 50A max output

    // Noise parameters
    this.voltageNoiseAmplitude = options.voltageNoise || 0.5; // ±0.5V
    this.currentNoisePercent = options.currentNoise || 2; // ±2%

    // Sensor state
    this.currentVoltage = this.nominalVoltage;
    this.currentCurrent = 0;
    this.currentPower = 0;

    // Time tracking for noise generation
    this.noisePhase = 0;

    // Realistic power draw profile (for testing buyer side)
    this.loadProfile = options.loadProfile || "constant";
    this.loadProfileTime = 0;
  }

  /**
   * Update sensors based on relay state and battery voltage
   * @param {number} batteryVoltage - Current battery voltage (V)
   * @param {number} relayOutputMultiplier - 0.0 to 1.0 (for soft-start)
   * @param {boolean} relayIsOn - Whether relay is ON
   * @param {number} deltaTimeSeconds - Time interval
   */
  update(batteryVoltage, relayOutputMultiplier, relayIsOn, deltaTimeSeconds) {
    this.loadProfileTime += deltaTimeSeconds;

    // Calculate current based on relay state
    let targetCurrent = 0;

    if (relayIsOn) {
      // Determine load profile
      targetCurrent = this._calculateLoadCurrent(this.loadProfileTime);
      targetCurrent = targetCurrent * relayOutputMultiplier; // Apply soft-start ramp
    }

    // Smooth current transitions (simulates inductor/capacitor filtering)
    const currentSmoothing = 0.3;
    this.currentCurrent =
      this.currentCurrent * (1 - currentSmoothing) +
      targetCurrent * currentSmoothing;

    // Voltage sag under load (realistic battery behavior)
    const voltageDropPerAmp = 0.08; // 0.08V per Amp (internal resistance)
    this.currentVoltage = batteryVoltage - this.currentCurrent * voltageDropPerAmp;

    // Add sensor noise
    this._addNoise(deltaTimeSeconds);

    // Calculate power
    this.currentPower = Math.max(0, this.currentVoltage * this.currentCurrent);

    // Clamp to realistic ranges
    this.currentVoltage = Math.max(0, Math.min(65, this.currentVoltage));
    this.currentCurrent = Math.max(0, Math.min(this.maxCurrentA, this.currentCurrent));
  }

  /**
   * Calculate load current based on profile
   * @param {number} timeSeconds - Elapsed time
   */
  _calculateLoadCurrent(timeSeconds) {
    switch (this.loadProfile) {
      case "constant":
        // Constant load: 30A
        return 30;

      case "pulsed":
        // Pulsed load: alternates between 20A and 35A every 5 seconds
        return timeSeconds % 10 < 5 ? 20 : 35;

      case "ramp":
        // Ramp up: 0A to 40A over 60 seconds, then hold
        return Math.min(40, (timeSeconds / 60) * 40);

      case "sine":
        // Sinusoidal load: simulates varying demand
        return 25 + 15 * Math.sin((timeSeconds / 10) * Math.PI * 2);

      case "low":
        // Low load: 5A
        return 5;

      case "high":
        // High load: 45A
        return 45;

      default:
        return 0;
    }
  }

  /**
   * Add realistic sensor noise
   */
  _addNoise(deltaTimeSeconds) {
    // Generate noise using Perlin-like simple noise
    this.noisePhase += deltaTimeSeconds * 0.5;

    // Voltage noise (±0.5V typically)
    const voltageNoise =
      Math.sin(this.noisePhase * 0.5) * this.voltageNoiseAmplitude +
      Math.sin(this.noisePhase * 1.3) * (this.voltageNoiseAmplitude * 0.3);

    // Current noise (±2% typically)
    const currentNoise =
      (Math.sin(this.noisePhase * 0.7) * this.currentNoisePercent +
        Math.sin(this.noisePhase * 2.1) * (this.currentNoisePercent * 0.5)) /
      100;

    this.currentVoltage += voltageNoise;
    this.currentCurrent = this.currentCurrent * (1 + currentNoise);
  }

  /**
   * Get current sensor readings
   */
  getReadings() {
    return {
      voltage: Math.round(this.currentVoltage * 100) / 100,
      current: Math.round(this.currentCurrent * 100) / 100,
      power: Math.round(this.currentPower * 10) / 10
    };
  }

  /**
   * Set load profile for testing
   */
  setLoadProfile(profile) {
    if (
      ["constant", "pulsed", "ramp", "sine", "low", "high"].includes(profile)
    ) {
      this.loadProfile = profile;
      this.loadProfileTime = 0;
    }
  }

  /**
   * Inject a fault (spike, dropout, etc.)
   */
  injectFault(faultType) {
    switch (faultType) {
      case "spike":
        this.currentCurrent = Math.min(
          this.maxCurrentA,
          this.currentCurrent * 1.5
        );
        break;
      case "dropout":
        this.currentCurrent *= 0.1;
        break;
      case "brownout":
        this.currentVoltage *= 0.85;
        break;
    }
  }
}

module.exports = SensorSimulator;
