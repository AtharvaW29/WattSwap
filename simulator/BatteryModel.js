/**
 * BatteryModel.js
 * Simulates realistic battery behavior:
 * - State of Charge (SoC) tracking
 * - Voltage curves based on SoC
 * - Temperature effects
 * - Discharge and charge rates
 */

class BatteryModel {
  constructor(options = {}) {
    // Battery specifications
    this.capacityWh = options.capacityWh || 5000; // 5 kWh (typical for household battery)
    this.nominalVoltage = options.nominalVoltage || 48; // 48V nominal
    this.minVoltage = options.minVoltage || 40; // Min safe voltage
    this.maxVoltage = options.maxVoltage || 58; // Max safe voltage (full charge)

    // Current state
    this.socPercent = options.initialSoC || 80; // Start at 80% (realistic demo state)
    this.temperatureCelsius = options.initialTemp || 25;
    this.isCharging = false;

    // Derived state
    this.currentCapacityWh = (this.socPercent / 100) * this.capacityWh;
    this.currentVoltage = this._calculateVoltageFromSoC(this.socPercent);

    // Efficiency factors
    this.chargeEfficiency = 0.95; // 95% efficient
    this.dischargeEfficiency = 0.98; // 98% efficient
    this.thermalEfficiency = 1.0; // Thermal factor (1.0 = no thermal loss)
  }

  /**
   * Update battery state over time interval
   * @param {number} powerWatts - Power draw (positive = discharge, negative = charge)
   * @param {number} deltaTimeSeconds - Time interval in seconds
   */
  update(powerWatts, deltaTimeSeconds) {
    const deltaTimeHours = deltaTimeSeconds / 3600;

    // Apply efficiency
    const effectivePower = powerWatts > 0 
      ? powerWatts / this.dischargeEfficiency
      : powerWatts * this.chargeEfficiency;

    // Calculate energy change
    const energyChangeWh = effectivePower * deltaTimeHours;
    this.currentCapacityWh = Math.max(0, Math.min(
      this.capacityWh,
      this.currentCapacityWh - energyChangeWh
    ));

    // Update SoC
    this.socPercent = (this.currentCapacityWh / this.capacityWh) * 100;

    // Update voltage based on SoC and power
    this.currentVoltage = this._calculateVoltageFromSoC(this.socPercent);

    // Apply simple thermal model (temperature drifts back to ambient)
    const ambientTemp = 25;
    const thermalLoss = 0.01;
    this.temperatureCelsius += (ambientTemp - this.temperatureCelsius) * thermalLoss;

    // Clamp SoC to realistic bounds
    this.socPercent = Math.max(0, Math.min(100, this.socPercent));
  }

  /**
   * Calculate voltage from SoC using realistic Li-ion curve
   * Li-ion batteries have characteristic discharge curves
   */
  _calculateVoltageFromSoC(socPercent) {
    // Simplified Li-ion discharge curve (48V nominal system)
    // 100% SoC = 58V, 0% SoC = 40V (3.2V per cell * 15 cells in series ≈ nominal)
    // Real Li-ion has a steep drop near 0%

    if (socPercent >= 90) {
      // Flat region: 90-100% SoC, voltage ~57-58V
      return 57 + (socPercent - 90) * 0.1;
    } else if (socPercent >= 20) {
      // Linear region: 20-90% SoC, voltage ~42-57V
      const slope = (57 - 42) / (90 - 20);
      return 42 + (socPercent - 20) * slope;
    } else {
      // Steep drop region: 0-20% SoC, voltage ~40-42V
      const slope = (42 - 40) / 20;
      return 40 + socPercent * slope;
    }
  }

  /**
   * Get current battery state
   */
  getState() {
    return {
      socPercent: Math.round(this.socPercent * 10) / 10,
      capacityWh: this.currentCapacityWh,
      voltage: Math.round(this.currentVoltage * 100) / 100,
      temperature: Math.round(this.temperatureCelsius * 10) / 10,
      isHealthy: this.socPercent > 10 && this.temperatureCelsius < 60
    };
  }

  /**
   * Check if battery can provide power
   */
  canDischarge() {
    return this.socPercent > 0 && this.temperatureCelsius < 70;
  }

  /**
   * Check if battery is critically low
   */
  isCriticallyLow() {
    return this.socPercent <= 10;
  }

  /**
   * Reset battery to full charge (for demo purposes)
   */
  resetToFull() {
    this.socPercent = 100;
    this.currentCapacityWh = this.capacityWh;
    this.currentVoltage = this.maxVoltage;
    this.temperatureCelsius = 25;
  }

  /**
   * Set SoC to specific value (for testing)
   */
  setSoC(socPercent) {
    this.socPercent = Math.max(0, Math.min(100, socPercent));
    this.currentCapacityWh = (this.socPercent / 100) * this.capacityWh;
    this.currentVoltage = this._calculateVoltageFromSoC(this.socPercent);
  }
}

module.exports = BatteryModel;
