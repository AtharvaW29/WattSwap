# QUICK REFERENCE - Blockchain Stabilization

## 🚀 30-Second Startup

```bash
# Terminal 1: Start Ganache
ganache-cli --port 7545 --deterministic

# Terminal 2: Deploy contracts
cd a:\Projects\WattSwap\WattSwap_Primary
truffle migrate --reset --network development

# Terminal 3: Start frontend
cd client
npm start
```

## ⚙️ Update Addresses After Deployment

**Copy from migration output and update:**

| File | Variable | What to Update |
|------|----------|-----------------|
| `client/src/context/MetaMaskContext.js` | `tokenAddress` | WTSWPToken address from migration |
| `client/src/context/MetaMaskContext.js` | `balanceViewerAddress` | BalanceViewer address from migration |
| `client/src/components/listingForm/sellingForm.js` | `ENERGY_CONTRACT_ADDRESS` | energyAvailability address |
| `client/src/components/listingForm/sellingForm.js` | `FEE_ADDRESS` | Where to send transaction fees |

## 🔧 MetaMask Setup

1. Add Network:
   - Name: `Ganache Local`
   - RPC: `http://127.0.0.1:7545`
   - Chain ID: `5777`

2. Import Test Account:
   - Copy private key from Ganache
   - MetaMask → Import Account → Paste key

3. Add Token:
   - Token Address: `0x...` (from WTSWPToken deployment)
   - Symbol: `WTSWP`
   - Decimals: `18`

## ✅ Verify Everything Works

```javascript
// Paste in browser DevTools Console
await BlockchainVerification.fullDiagnostic()

// Should show 9/9 checks passed ✅
```

## 📊 Console Logs to Expect

```
✅ [BLOCKCHAIN ...] 🔗 Attempting to connect MetaMask...
✅ [BLOCKCHAIN ...] ✅ Connected to account: 0x...
✅ [BLOCKCHAIN ...] ✅ MetaMask Provider Network Info
✅ [BLOCKCHAIN ...] ✅ BalanceViewer contract initialized
✅ [BLOCKCHAIN ...] ✅ Balance fetched: { ... }
```

## ⚠️ Error Diagnostics

| Error | Fix |
|-------|-----|
| "BalanceOf.json not found" | Check import says `BalanceViewer.json` |
| "could not decode result data" | Wrong ABI or contract address |
| Balance shows "N/A" | Token address incorrect, or BalanceViewer not deployed |
| Infinite error loops | Restart browser, clear cache |
| Ganache won't respond | Kill process, restart on port 7545 |

## 🎯 Test Checklist

- [ ] Profile page shows wallet address
- [ ] Profile page shows WTSWP balance (not "N/A")
- [ ] Console shows green ✅ logs (no red ❌)
- [ ] Listing form shows account (can't edit)
- [ ] Form submits without ABI errors
- [ ] MetaMask shows WTSWP token with balance

## 🚨 Emergency Reset

```bash
# If everything breaks:
rm -r build
truffle compile
truffle migrate --reset --network development
# Update addresses in frontend again
```

## 📚 Full Guides

- **Detailed Guide:** `BLOCKCHAIN_STABILIZATION_GUIDE.md`
- **Summary:** `BLOCKCHAIN_STABILIZATION_SUMMARY.md`
- **This Card:** `QUICK_REFERENCE.md`

---

**Status:** Ready for local Ganache testing ✅  
**Last Updated:** April 23, 2026
