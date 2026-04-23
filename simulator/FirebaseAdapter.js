/**
 * FirebaseAdapter.js
 * Handles all Firebase Realtime Database operations
 * - Write sensor data
 * - Listen for commands
 * - Connection management
 */

class FirebaseAdapter {
  constructor(admin, databaseURL) {
    this.admin = admin;
    this.databaseURL = databaseURL;
    this.db = null;
    this.listeners = new Map();
    this.isConnected = false;
  }

  /**
   * Initialize Firebase Admin SDK connection
   */
  async initialize(serviceAccountPath) {
    try {
      if (!this.admin.apps.length) {
        this.admin.initializeApp({
          credential: this.admin.credential.cert(
            require(serviceAccountPath)
          ),
          databaseURL: this.databaseURL
        });
      }

      this.db = this.admin.database();
      this.isConnected = true;
      console.log(`✓ Firebase initialized: ${this.databaseURL}`);
      return true;
    } catch (error) {
      console.error(`✗ Firebase initialization failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Write data to a path
   * @param {string} path - Firebase path (e.g., '/devices/esp1/battery')
   * @param {object} data - Data to write
   */
  async writeToPath(path, data) {
    if (!this.isConnected) {
      console.warn(`[Firebase] Not connected, skipping write to ${path}`);
      return false;
    }

    try {
      await this.db.ref(path).set(data);
      return true;
    } catch (error) {
      console.error(
        `[Firebase] Write error to ${path}: ${error.message}`
      );
      return false;
    }
  }

  /**
   * Update data at a path (merge instead of replace)
   * @param {string} path - Firebase path
   * @param {object} data - Data to merge
   */
  async updatePath(path, data) {
    if (!this.isConnected) {
      console.warn(`[Firebase] Not connected, skipping update to ${path}`);
      return false;
    }

    try {
      await this.db.ref(path).update(data);
      return true;
    } catch (error) {
      console.error(
        `[Firebase] Update error to ${path}: ${error.message}`
      );
      return false;
    }
  }

  /**
   * Read data once from a path
   * @param {string} path - Firebase path
   */
  async readOnce(path) {
    if (!this.isConnected) {
      console.warn(`[Firebase] Not connected, skipping read from ${path}`);
      return null;
    }

    try {
      const snapshot = await this.db.ref(path).once("value");
      return snapshot.val();
    } catch (error) {
      console.error(
        `[Firebase] Read error from ${path}: ${error.message}`
      );
      return null;
    }
  }

  /**
   * Listen to a path for changes
   * @param {string} path - Firebase path
   * @param {function} callback - Called when value changes
   * @param {string} listenerId - Unique ID for this listener
   */
  listenToPath(path, callback, listenerId = null) {
    if (!this.isConnected) {
      console.warn(`[Firebase] Not connected, skipping listener on ${path}`);
      return false;
    }

    const id = listenerId || `listener_${Date.now()}_${Math.random()}`;

    try {
      const ref = this.db.ref(path);
      const listener = ref.on("value", (snapshot) => {
        callback(snapshot.val());
      });

      this.listeners.set(id, { path, ref, listener });
      console.log(`[Firebase] Listener attached: ${id} on ${path}`);
      return id;
    } catch (error) {
      console.error(
        `[Firebase] Listener error on ${path}: ${error.message}`
      );
      return null;
    }
  }

  /**
   * Stop listening to a path
   * @param {string} listenerId - ID returned from listenToPath
   */
  stopListening(listenerId) {
    if (this.listeners.has(listenerId)) {
      const { path, ref } = this.listeners.get(listenerId);
      ref.off("value");
      this.listeners.delete(listenerId);
      console.log(`[Firebase] Listener removed: ${listenerId}`);
      return true;
    }
    return false;
  }

  /**
   * Write device sensor data in batch
   * Updates multiple paths atomically
   */
  async writeSensorBatch(deviceId, sensorData) {
    if (!this.isConnected) {
      return false;
    }

    const updates = {};

    // Device-specific paths (new structure)
    updates[`/devices/${deviceId}/battery`] = sensorData.battery;
    updates[`/devices/${deviceId}/output`] = sensorData.output;
    updates[`/devices/${deviceId}/relay`] = sensorData.relay;
    if (sensorData.transaction) {
      updates[`/devices/${deviceId}/transaction`] = sensorData.transaction;
    }
    updates[`/devices/${deviceId}/metadata/last_updated`] = Date.now();

    // Legacy path for backward compatibility with existing frontend code
    updates[`/LED`] = {
      power: Math.round(sensorData.output.power),
      voltage: Math.round(sensorData.output.voltage * 100) / 100,
      current: Math.round(sensorData.output.current * 100) / 100,
      relayState: sensorData.relay.state,
      batteryLevel: Math.round(sensorData.battery.soc),
      transferStatus: sensorData.transaction?.status || 'idle',
      energyTransferred: sensorData.transaction?.energy_delivered_kwh || 0,
      updatedAt: Date.now()
    };

    try {
      await this.db.ref().update(updates);
      return true;
    } catch (error) {
      console.error(`[Firebase] Batch write error: ${error.message}`);
      return false;
    }
  }

  /**
   * Write transaction data
   */
  async writeTransaction(deviceId, orderId, transactionData) {
    if (!this.isConnected) {
      return false;
    }

    try {
      await this.db
        .ref(`/devices/${deviceId}/transaction/${orderId}`)
        .set(transactionData);
      return true;
    } catch (error) {
      console.error(`[Firebase] Transaction write error: ${error.message}`);
      return false;
    }
  }

  /**
   * Get connection status
   */
  isHealthy() {
    return this.isConnected;
  }

  /**
   * Disconnect and cleanup
   */
  async disconnect() {
    // Stop all listeners
    for (const [id, { ref }] of this.listeners.entries()) {
      ref.off("value");
    }
    this.listeners.clear();

    this.isConnected = false;
    console.log(`[Firebase] Disconnected`);
  }
}

module.exports = FirebaseAdapter;
