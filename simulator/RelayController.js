/**
 * RelayController.js
 * Manages relay state for power output:
 * - ON/OFF switching
 * - Duration tracking
 * - Command queuing
 * - Soft-start simulation
 */

class RelayController {
  constructor(options = {}) {
    this.isOn = false;
    this.commandedState = "OFF"; // "ON" or "OFF"
    this.activatedAt = null;
    this.durationSeconds = 0;
    this.deactivateAt = null;

    // Soft-start delay (realistic relay activation time)
    this.softStartDelayMs = options.softStartDelayMs || 500;
    this.softStartStartTime = null;
    this.isSoftStarting = false;

    // Maximum relay duration (safety limit)
    this.maxDurationSeconds = options.maxDurationSeconds || 3600; // 1 hour

    // Command queue
    this.pendingCommand = null;

    // Logging
    this.verbose = options.verbose || false;
  }

  /**
   * Activate relay (turn ON)
   * @param {number} durationSeconds - How long to keep relay ON (0 = indefinite)
   */
  activateRelay(durationSeconds = 0) {
    if (this.verbose) {
      console.log(`[Relay] Activation requested for ${durationSeconds}s`);
    }

    this.commandedState = "ON";
    this.durationSeconds = Math.min(durationSeconds, this.maxDurationSeconds);

    // Start soft-start delay
    if (!this.isSoftStarting && !this.isOn) {
      this.isSoftStarting = true;
      this.softStartStartTime = Date.now();
      if (this.verbose) {
        console.log(`[Relay] Soft-start initiated (${this.softStartDelayMs}ms delay)`);
      }
    }
  }

  /**
   * Deactivate relay (turn OFF)
   */
  deactivateRelay() {
    if (this.verbose) {
      console.log(`[Relay] Deactivation requested`);
    }

    this.commandedState = "OFF";
    this.isOn = false;
    this.isSoftStarting = false;
    this.activatedAt = null;
    this.deactivateAt = null;
  }

  /**
   * Update relay state (called periodically)
   * @param {number} currentTimeMs - Current time in milliseconds
   */
  update(currentTimeMs = Date.now()) {
    // Handle soft-start completion
    if (this.isSoftStarting && this.commandedState === "ON") {
      const elapsedMs = currentTimeMs - this.softStartStartTime;
      if (elapsedMs >= this.softStartDelayMs) {
        this.isOn = true;
        this.isSoftStarting = false;
        this.activatedAt = currentTimeMs;

        if (this.durationSeconds > 0) {
          this.deactivateAt = currentTimeMs + (this.durationSeconds * 1000);
        }

        if (this.verbose) {
          console.log(
            `[Relay] Activated (will deactivate in ${this.durationSeconds}s)`
          );
        }
      }
    }

    // Handle duration expiry
    if (
      this.isOn &&
      this.durationSeconds > 0 &&
      this.deactivateAt &&
      currentTimeMs >= this.deactivateAt
    ) {
      if (this.verbose) {
        console.log(`[Relay] Duration expired, deactivating`);
      }
      this.deactivateRelay();
    }

    // Handle commanded OFF
    if (this.commandedState === "OFF" && this.isOn) {
      this.isOn = false;
      this.isSoftStarting = false;
      if (this.verbose) {
        console.log(`[Relay] Deactivated`);
      }
    }
  }

  /**
   * Get current relay state
   */
  getState() {
    const timeElapsedMs = this.activatedAt ? Date.now() - this.activatedAt : 0;
    const timeRemainingMs = this.deactivateAt
      ? Math.max(0, this.deactivateAt - Date.now())
      : 0;

    return {
      isOn: this.isOn,
      commandedState: this.commandedState,
      isSoftStarting: this.isSoftStarting,
      activatedAt: this.activatedAt,
      timeElapsedSeconds: Math.round(timeElapsedMs / 1000),
      timeRemainingSeconds: Math.round(timeRemainingMs / 1000),
      durationSeconds: this.durationSeconds
    };
  }

  /**
   * Determine output current based on relay state
   * (Used for realistic power draw during soft-start)
   */
  getOutputMultiplier() {
    if (!this.isSoftStarting) {
      return this.isOn ? 1.0 : 0.0;
    }

    // During soft-start, ramp up current linearly
    const elapsed = Date.now() - this.softStartStartTime;
    const progress = Math.min(1.0, elapsed / this.softStartDelayMs);
    return progress;
  }

  /**
   * Reset relay to OFF state (for testing)
   */
  reset() {
    this.isOn = false;
    this.commandedState = "OFF";
    this.isSoftStarting = false;
    this.activatedAt = null;
    this.deactivateAt = null;
    this.durationSeconds = 0;
  }

  /**
   * Set verbose logging
   */
  setVerbose(verbose) {
    this.verbose = verbose;
  }
}

module.exports = RelayController;
