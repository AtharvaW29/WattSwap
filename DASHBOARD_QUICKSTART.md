# Dashboard Quick Start Guide

## 🎯 Get Dashboard Running in 3 Steps

### Step 1: Start Simulator (Terminal 1)
```bash
npm run simulator
```
Expected output:
```
✅ Firebase connected
🔄 Simulator started
📱 Device: seller_device_001
📊 Publishing to Firebase every 1 second...
```

### Step 2: Start Backend (Terminal 2)
```bash
npm run server
```
Expected output:
```
✅ Firebase initialized
🚀 Server running on port 4000
```

### Step 3: Start Frontend (Terminal 3)
```bash
cd client
npm start
```
Expected output:
```
✅ Compiled successfully
📱 Open http://localhost:3000
```

---

## 📍 Navigate to Dashboard

1. Open http://localhost:3000 in your browser
2. Sign in with your WattSwap account
3. Click **Dashboard** in the top navigation
4. Watch metrics update in real-time! 🎉

---

## 🎬 Live Demo (Trigger Relay)

In a new terminal, run:

```bash
curl -X POST http://localhost:4000/app/hardware/trigger-relay \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "seller_device_001",
    "energyKwh": 2.5,
    "durationHours": 1,
    "orderId": "order_123",
    "buyerAddress": "0x1234567890abcdef"
  }'
```

### Watch these happen:
✅ Relay status changes to "ON" with pulse animation
✅ Battery SoC starts decreasing
✅ Power meter jumps to 2500W
✅ Transaction flow advances from "Request" → "Validated" → "Activated"
✅ Event feed logs each step with timestamp
✅ Energy delivered progress bar fills up

**Total time: ~10 seconds** ⚡

---

## 🎮 Simulator Speed Control

### Real-time (1x speed) — Default
```bash
npm run simulator
```

### Fast demo (2x speed, 2 devices)
```bash
npm run simulator:demo
```

### Custom speed (e.g., 5x faster)
```bash
SIMULATION_SPEED=5.0 node simulator/index.js
```

---

## 🔍 Troubleshooting

### "Cannot connect to Firebase"
- Check `server/.env` has `FIREBASE_DATABASE_URL` and service account key path
- Verify simulator output shows "✅ Firebase connected"

### Dashboard page shows "No events"
- Wait 2-3 seconds for first update
- Check browser DevTools → Console for errors
- Verify simulator terminal shows "Publishing to Firebase..."

### Metrics not updating
- Refresh the page (Cmd+R / Ctrl+R)
- Check that Firebase listener initialized (see browser console)
- Verify backend can read from Firebase: `npm run test:simulator`

### Button "Trigger Relay" not responding (if added)
- Verify backend endpoint: `curl http://localhost:4000/app/hardware/device/seller_device_001`
- Check server logs for errors

---

## 📱 Dashboard Components Explained

| Component | What It Shows | Updates |
|-----------|---------------|---------|
| **System Mode Badge** | Current state (Idle, Active, etc.) | Every update |
| **Relay Indicator** | Relay ON/OFF + elapsed time | Every second |
| **Hardware Meters** | Battery %, Power kW, Voltage V, Current A | Every second |
| **Transaction Flow** | 5-stage pipeline + energy progress | On state change |
| **Event Feed** | Timestamped events from all sources | Every action |
| **System Status** | Simulator/Server/DB/Blockchain status | On connect |

---

## 💾 Files Overview

```
client/src/
├── context/HardwareStatusContext.js      ← Main state management
├── hooks/useHardwareStatus.js            ← Hook for components
├── pages/dashboard/Dashboard.js          ← Dashboard page
├── components/dashboard/
│   ├── HardwareMeters.jsx               ← Battery/Power/V/A meters
│   ├── RelayIndicator.jsx               ← Relay ON/OFF visual
│   ├── TransactionFlow.jsx              ← 5-stage pipeline
│   ├── EventFeed.jsx                    ← Live event log
│   └── SystemStatus.jsx                 ← Health indicators
└── App.js                               ← (Updated) Added Dashboard route
```

---

## 🎨 Visual Features

- ⚡ **Animated Pulse**: Relay indicator pulses when ON
- 📊 **Gradient Meters**: Color-coded progress bars (battery, power, etc.)
- 🎯 **Connected Stages**: Transaction stages with animated connectors
- 📬 **Sliding Events**: New events slide in with smooth animation
- 🟢 **Health Indicators**: Green/red status with floating animation
- 📱 **Responsive**: Works on mobile (375px width and up)

---

## 🚀 Production Checklist

- [ ] Simulator is running and publishing to Firebase
- [ ] Backend server initialized Firebase
- [ ] Dashboard page is accessible and renders without errors
- [ ] All 5 dashboard components display correctly
- [ ] Real-time updates flow at 1-second intervals
- [ ] Relay trigger API works and updates dashboard within 1 second
- [ ] Event feed logs all actions with timestamps
- [ ] System health shows all components connected
- [ ] No console errors in browser DevTools
- [ ] Responsive layout works on mobile devices

---

## 📞 Need Help?

1. Check the full implementation guide: `DASHBOARD_IMPLEMENTATION.md`
2. Check simulator setup: `SIMULATOR_SETUP.md`
3. Review React component structure: `client/src/components/dashboard/`
4. Inspect Firebase rules: `database.rules.json`

You're all set! 🎉 Enjoy the live hardware dashboard!
