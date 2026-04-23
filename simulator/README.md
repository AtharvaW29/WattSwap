# WattSwap Virtual ESP32 Simulator

Software-only replacement for the ESP32 IoT hardware layer. Enables full end-to-end testing and hackathon demos without physical devices.

## Features

- ✅ Realistic battery simulation (5 kWh, Li-ion discharge curves)
- ✅ Relay control with soft-start delay (500ms)
- ✅ Dynamic sensor noise and realistic power profiling
- ✅ Firebase Realtime Database integration
- ✅ Transaction tracking and energy delivery calculation
- ✅ Multi-device support
- ✅ Configurable simulation speed (real-time or accelerated)
- ✅ Backward compatible with existing frontend (writes to `/LED` path)

## Installation

```bash
cd simulator
npm install
```

## Configuration

Create a `.env` file in the `simulator/` directory:

```env
# Firebase Configuration
FIREBASE_DATABASE_URL=https://wattswap-953a8-default-rtdb.asia-southeast1.firebasedatabase.app
FIREBASE_SERVICE_ACCOUNT_KEY_PATH=./firebase-service-account.json

# Simulator Configuration
SIMULATOR_ENABLED=true
DEVICE_IDS=seller_device_001
INITIAL_SOC=80
SIMULATION_SPEED=1.0
VERBOSE=false
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `FIREBASE_DATABASE_URL` | (required) | Firebase Realtime Database URL |
| `FIREBASE_SERVICE_ACCOUNT_KEY_PATH` | `./firebase-service-account.json` | Path to Firebase service account JSON |
| `SIMULATOR_ENABLED` | `true` | Enable/disable simulator |
| `DEVICE_IDS` | `seller_device_001` | Comma-separated device IDs (e.g., `dev1,dev2,dev3`) |
| `INITIAL_SOC` | `80` | Initial battery state of charge (0-100%) |
| `SIMULATION_SPEED` | `1.0` | 1.0 = real-time, 2.0 = 2x speed, etc. |
| `VERBOSE` | `false` | Enable detailed logging |

## Firebase Service Account Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select WattSwap project
3. Settings → Service Accounts
4. Generate new private key (JSON)
5. Save as `firebase-service-account.json` in `simulator/` directory

**Security:** Never commit `firebase-service-account.json` to version control. Add to `.gitignore`.

## Usage

### Start Simulator (Real-Time)

```bash
npm start
```

Output:
```
🔋 WattSwap Virtual ESP32 Simulator
===================================

🔌 Connecting to Firebase...
✓ Firebase initialized: https://wattswap-953a8-...firebasedatabase.app

📱 Creating 1 virtual device(s)...
   ✓ seller_device_001 ready

▶️  Starting simulation...

[seller_device_001] SoC: 80.0% | V: 48.2V | I: 30.5A | P: 1464W | Relay: OFF
```

### Start Multiple Devices

```bash
DEVICE_IDS=seller_device_001,seller_device_002,seller_device_003 npm start
```

### 2x Speed Simulation (for quick testing)

```bash
SIMULATION_SPEED=2.0 npm start
```

### Debug Mode (Verbose Logging)

```bash
VERBOSE=true npm start
```

### Development Mode (Auto-Restart)

```bash
npm run dev
```

## Data Flow

### Firebase Paths Written by Simulator

```
/devices/{deviceId}/
├── battery/
│   ├── soc                    # State of Charge (0-100%)
│   ├── voltage                # Battery voltage (V)
│   ├── capacity_wh            # Total capacity (Wh)
│   └── temperature            # Temperature (°C)
├── output/
│   ├── power                  # Output power (W)
│   ├── voltage                # Output voltage (V)
│   ├── current                # Output current (A)
│   └── relay_status           # "ON" or "OFF"
├── relay/
│   ├── state                  # "ON" or "OFF"
│   ├── commanded_state        # Last command
│   ├── time_elapsed_seconds   # Time relay has been ON
│   └── time_remaining_seconds # Time until auto-off
├── transaction/
│   ├── status                 # "pending" | "active" | "completed"
│   ├── order_id               # Linked order
│   ├── buyer_address          # Buyer wallet
│   ├── energy_requested_kwh   # Target energy
│   ├── energy_delivered_kwh   # Actual delivered
│   └── completed_at           # Completion timestamp
└── metadata/
    ├── initialized            # Initialization data
    ├── last_updated           # Last update timestamp
    └── simulator_version      # Version info

# Legacy path (backward compatibility)
/LED/
├── power                      # Mirrored from /devices/{id}/output/power
├── voltage                    # Mirrored from /devices/{id}/output/voltage
└── current                    # Mirrored from /devices/{id}/output/current
```

### Relay Activation from Backend

Backend writes to `/devices/{deviceId}/relay/command`:

```json
{
  "action": "ON",
  "order_id": "order_12345",
  "buyer_address": "0x...",
  "energy_kwh": 2.5,
  "duration_seconds": 3600
}
```

Simulator responds by:
1. Activating relay (with 500ms soft-start delay)
2. Starting battery discharge
3. Publishing sensor updates every second
4. Tracking energy delivered
5. Auto-deactivating relay when energy target is reached or duration expires

## Event Flow: Payment → Relay Activation

```
1. Buyer sends USDC payment (blockchain)
   ↓
2. Event listener detects transaction
   ↓
3. Backend calls POST /api/energy-delivery
   ↓
4. Backend triggers relay via Firebase:
      db.ref(`/devices/{id}/relay/command`).set({action: "ON", ...})
   ↓
5. Simulator detects relay command
   ↓
6. Simulator activates relay (500ms delay)
   ↓
7. Battery begins to discharge
   ↓
8. Sensor updates published to Firebase every 1s
   ↓
9. Frontend reads /LED/power and updates UI charts
   ↓
10. When energy delivered = requested or duration expires:
       Relay deactivates
       Transaction marked "completed"
       Backend can settle on blockchain
```

## Testing Scenarios

### Scenario 1: Successful Energy Delivery

```bash
# Terminal 1: Start simulator
npm start

# Terminal 2: Simulate payment (from backend)
node -e "
const admin = require('firebase-admin');
require('dotenv').config();
admin.initializeApp({
  credential: admin.credential.cert(require('./firebase-service-account.json')),
  databaseURL: process.env.FIREBASE_DATABASE_URL
});
const db = admin.database();
db.ref('/devices/seller_device_001/relay/command').set({
  action: 'ON',
  order_id: 'test_order_001',
  buyer_address: '0x123...',
  energy_kwh: 1.0,
  duration_seconds: 3600
});
console.log('✓ Relay activated');
"

# Observe: Relay turns ON, battery decreases, energy tracked
# After ~60 seconds (at 1kW constant load), relay auto-deactivates
```

### Scenario 2: Multiple Devices

```bash
DEVICE_IDS=seller_device_001,seller_device_002 npm start

# Simulate transactions on different devices independently
```

### Scenario 3: Accelerated Time (Hackathon Demo)

```bash
SIMULATION_SPEED=10.0 npm start

# Run 10x speed - demo full cycle in seconds
# Activate relay, observe battery drain and re-charge, complete transaction
```

## Module Architecture

| Module | Responsibility |
|--------|-----------------|
| **VirtualESP32.js** | Main state machine orchestrating battery, relay, sensors |
| **BatteryModel.js** | Li-ion battery SoC, voltage, temperature simulation |
| **RelayController.js** | Relay ON/OFF with soft-start delay and duration tracking |
| **SensorSimulator.js** | Realistic power, voltage, current with noise |
| **FirebaseAdapter.js** | Firebase RTDB read/write operations |

## Integration with Backend

No backend changes required for basic functionality. Optional enhancement:

**hardwareController.js:**
```javascript
// Before
async function triggerIoTRelay(deviceId, energyQuantity, duration) {
    return { success: true };
}

// After (with simulator)
async function triggerIoTRelay(deviceId, energyQuantity, duration) {
    const admin = require('firebase-admin');
    const db = admin.database();
    await db.ref(`/devices/${deviceId}/relay/command`).set({
        action: "ON",
        energy_kwh: energyQuantity,
        duration_seconds: duration * 3600,
        timestamp: Date.now()
    });
    return { success: true };
}
```

## Frontend Compatibility

No changes needed! Frontend continues reading from `/LED` path:

```javascript
const readings = ref(database, '/LED');
onValue(readings, (snapshot) => {
  const data = snapshot.val();
  // data.power, data.voltage, data.current automatically updated
});
```

## Troubleshooting

### "Failed to initialize Firebase"

- Check `FIREBASE_DATABASE_URL` is correct
- Verify `firebase-service-account.json` exists and is valid
- Check file permissions

### "Simulator not writing to Firebase"

- Verify Firebase Realtime Database rules allow writes
- Check network connectivity
- Enable `VERBOSE=true` for detailed logs

### Battery not discharging

- Ensure relay is ON (check `/devices/{id}/relay/state` in Firebase)
- Check that load profile generates non-zero current
- Verify battery SoC is above 0%

### Relay not responding to commands

- Verify command written to correct path: `/devices/{deviceId}/relay/command`
- Check `action` field is "ON" or "OFF"
- Enable `VERBOSE=true` in simulator

## Performance

- Single device: ~2% CPU on modern machine
- 10 devices: ~5% CPU
- Update frequency: 1 update/second (configurable)
- Firebase writes: ~10 per update per device (batched)

## Future Enhancements

- [ ] Multi-phase AC output simulation
- [ ] Grid frequency monitoring
- [ ] Harmonics and power quality metrics
- [ ] Over-temperature shutdown scenarios
- [ ] Battery degradation model (cycle counting)
- [ ] Weather-based solar simulation
- [ ] REST API for web dashboard

## License

MIT - See LICENSE file

## Support

For issues or questions, contact the WattSwap development team.
