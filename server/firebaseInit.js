/**
 * firebaseInit.js
 * Firebase Admin SDK initialization for backend
 * Enables communication with simulator via Realtime Database
 */

const admin = require('firebase-admin');
const path = require('path');

let db = null;
let isInitialized = false;

/**
 * Initialize Firebase Admin SDK
 * Call this once at server startup
 */
async function initializeFirebase() {
  try {
    if (isInitialized && db) {
      console.log('[Firebase] Already initialized');
      return db;
    }

    // Check if already initialized (multiple calls to initializeApp)
    if (!admin.apps.length) {
      const serviceAccountKeyPath =
        process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH ||
        path.join(__dirname, './firebase-adminsdk.json');

      const databaseURL =
        process.env.FIREBASE_DATABASE_URL ||
        'https://wattswap-23188-default-rtdb.firebaseio.com/';

      admin.initializeApp({
        credential: admin.credential.cert(require(serviceAccountKeyPath)),
        databaseURL: databaseURL
      });

      console.log('✓ Firebase Admin SDK initialized');
    }

    db = admin.database();
    isInitialized = true;

    return db;
  } catch (error) {
    console.error('[Firebase] Initialization failed:', error.message);
    throw error;
  }
}

/**
 * Get Firebase database reference
 * Must call initializeFirebase() first
 */
function getDatabase() {
  if (!db) {
    throw new Error(
      '[Firebase] Not initialized. Call initializeFirebase() first.'
    );
  }
  return db;
}

/**
 * Trigger IoT relay via Firebase
 * Writes command to /devices/{deviceId}/relay/command
 *
 * @param {string} deviceId - Device identifier
 * @param {number} energyQuantity - Energy to deliver (kWh)
 * @param {number} durationHours - Duration to run (hours)
 * @param {object} additionalData - Additional data (orderId, buyerAddress, etc.)
 */
async function triggerRelayViaFirebase(
  deviceId,
  energyQuantity,
  durationHours,
  additionalData = {}
) {
  try {
    const database = getDatabase();

    const commandPayload = {
      action: 'ON',
      energy_kwh: energyQuantity,
      duration_seconds: Math.round(durationHours * 3600),
      timestamp: Date.now(),
      ...additionalData
    };

    await database.ref(`/devices/${deviceId}/relay/command`).set(commandPayload);

    console.log(
      `[Firebase] Relay activated on ${deviceId}: ${energyQuantity} kWh for ${durationHours} hours`
    );

    return { success: true, deviceId, commandPayload };
  } catch (error) {
    console.error(
      `[Firebase] Failed to trigger relay on ${deviceId}:`,
      error.message
    );
    return { success: false, error: error.message };
  }
}

/**
 * Deactivate relay via Firebase
 */
async function deactivateRelayViaFirebase(deviceId) {
  try {
    const database = getDatabase();

    await database.ref(`/devices/${deviceId}/relay/command`).set({
      action: 'OFF',
      timestamp: Date.now()
    });

    console.log(`[Firebase] Relay deactivated on ${deviceId}`);

    return { success: true, deviceId };
  } catch (error) {
    console.error(
      `[Firebase] Failed to deactivate relay on ${deviceId}:`,
      error.message
    );
    return { success: false, error: error.message };
  }
}

/**
 * Read device status from Firebase
 */
async function getDeviceStatus(deviceId) {
  try {
    const database = getDatabase();
    const snapshot = await database.ref(`/devices/${deviceId}`).once('value');
    return snapshot.val();
  } catch (error) {
    console.error(
      `[Firebase] Failed to read device status for ${deviceId}:`,
      error.message
    );
    return null;
  }
}

/**
 * Listen to device status changes
 */
function watchDeviceStatus(deviceId, callback) {
  try {
    const database = getDatabase();
    const ref = database.ref(`/devices/${deviceId}`);

    ref.on('value', (snapshot) => {
      callback(snapshot.val());
    });

    return ref;
  } catch (error) {
    console.error(
      `[Firebase] Failed to watch device status for ${deviceId}:`,
      error.message
    );
    return null;
  }
}

module.exports = {
  initializeFirebase,
  getDatabase,
  triggerRelayViaFirebase,
  deactivateRelayViaFirebase,
  getDeviceStatus,
  watchDeviceStatus
};
