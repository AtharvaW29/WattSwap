/**
 * Quick integration test for simulator
 * Verifies Firebase connection and relay triggering
 */

require('dotenv').config({ path: './simulator/.env' });
const { initializeFirebase, triggerRelayViaFirebase, getDeviceStatus } = require('./server/firebaseInit');

async function testIntegration() {
  console.log('🧪 WattSwap Simulator Integration Test\n');

  try {
    // Test 1: Firebase connection
    console.log('Test 1: Firebase connection...');
    await initializeFirebase();
    console.log('✓ Firebase connected\n');

    // Test 2: Trigger relay
    const testDeviceId = 'test_device_' + Date.now();
    console.log(`Test 2: Trigger relay on ${testDeviceId}...`);
    const result = await triggerRelayViaFirebase(testDeviceId, 2.5, 1, {
      order_id: 'test_order',
      buyer_address: '0x' + '0'.repeat(40)
    });

    if (result.success) {
      console.log('✓ Relay triggered successfully\n');
    } else {
      throw new Error(result.error);
    }

    // Test 3: Read device status
    console.log(`Test 3: Read device status...`);
    const status = await getDeviceStatus(testDeviceId);
    if (status) {
      console.log('✓ Device status read:');
      console.log(JSON.stringify(status, null, 2));
    } else {
      console.log('⚠️  Device status not yet written (simulator may not be running)');
    }

    console.log('\n✓ All tests passed!');
    console.log('\nNext: Start the simulator with:');
    console.log('  node simulator/index.js');

    process.exit(0);
  } catch (error) {
    console.error('\n✗ Test failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('  - Check FIREBASE_DATABASE_URL in simulator/.env');
    console.error('  - Verify firebase-service-account.json exists and is valid');
    console.error('  - Check Firebase Realtime Database is enabled');
    process.exit(1);
  }
}

testIntegration();
