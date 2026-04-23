# Blockchain Layer Stabilization - Recovery Guide

## Overview
This guide walks you through rolling back to the local Ethereum DApp flow using Truffle, Ganache, and MetaMask.

---

## ✅ Phase 1: Setup & Verification

### 1.1 Stop Everything
```bash
# Kill any running Ganache, servers, or build processes
# Ports: 7545 (Ganache), 3000 (React), 4000 (Node.js server)
```

### 1.2 Verify Ganache Configuration
Your `truffle-config.js` should have:
```javascript
networks: {
  development: {
    host: "127.0.0.1",
    port: 7545,            // Ganache default port
    network_id: "*",
  }
}
```

### 1.3 Start Ganache CLI
```bash
# Make sure Ganache is running
# Option A: GUI - Open Ganache and create/open workspace
# Option B: CLI
ganache-cli --port 7545 --deterministic

# Verify Ganache is ready:
# - Should see "Listening on 127.0.0.1:7545"
# - Should display 10 test accounts with balances
```

---

## ✅ Phase 2: Clean Rebuild

### 2.1 Clean Build Artifacts
```bash
cd a:\Projects\WattSwap\WattSwap_Primary

# Remove old build files
rm -r build

# Recompile contracts
truffle compile
```

**Expected output:**
```
Compiling your contracts...
✓ Compiling .\contracts\WattSwapToken.sol
✓ Compiling .\contracts\energyAvailability.sol
✓ Compiling .\contracts\balanceOf.sol
✓ Compiling .\contracts\WattSwapV2.sol
...
> Artifacts written to ./build/contracts
> Compiled successfully
```

### 2.2 Verify Build Artifacts
Check that these files exist in `build/contracts/`:
- ✓ `WTSWPToken.json`
- ✓ `energyAvailability.json`
- ✓ `BalanceViewer.json` (NOT BalanceOf.json)
- ✓ `WattSwap.json`
- ✓ `transferFrom.json`

**Important**: If `BalanceOf.json` exists but `BalanceViewer.json` doesn't, check your contract filename.

---

## ✅ Phase 3: Deploy Contracts

### 3.1 Fresh Migration
```bash
# Clean previous migrations (CAREFUL - only do this on local dev)
truffle migrate --reset --network development

# Expected order of deployment:
# 1. WTSWPToken (migration 1_migration_token.js)
# 2. energyAvailability (migration 2_migration_energyAvailability.js)
# 3. transferFrom (migration 3_migration_transferFrom.js)
# 4. BalanceViewer (migration 4_migration_balanceOf.js)
# 5. WattSwap V2 (migration 5_migration_wattswap_v2.js)
```

### 3.2 Record Deployed Addresses
**The console will show something like:**
```
1_migration_token.js
======================
Deploying 'WTSWPToken'
✓ Account: 0x1234567890123456789012345678901234567890
✓ Contract address: 0xAABBCCDDEEFF... ← SAVE THIS
✓ Block number: 5
✓ Block time: 1234567890
✓ Account balance: 999.999...

2_migration_energyAvailability.js
==================================
Deploying 'energyAvailability'
✓ Account: 0x1234567890123456789012345678901234567890
✓ Contract address: 0x11223344556677... ← SAVE THIS

... and so on
```

### 3.3 CRITICAL: Update Frontend Addresses
Open `client/src/context/MetaMaskContext.js` and update:

```javascript
const DEPLOYED_ADDRESSES = {
  tokenAddress: "0x...",           // From WTSWPToken deployment
  balanceViewerAddress: "0x...",   // From BalanceViewer deployment
};
```

Also update in `client/src/components/listingForm/sellingForm.js`:
```javascript
const ENERGY_CONTRACT_ADDRESS = "0x..."; // From energyAvailability deployment
const FEE_ADDRESS = "0x...";              // Your chosen fee recipient
```

---

## ✅ Phase 4: Verify Deployment

### 4.1 Check Contract Bytecode
```bash
truffle console --network development

# Inside truffle console:
> let token = await WTSWPToken.deployed()
> token.address
# Should display the deployed address

> let balance = await token.balanceOf("0x1234567890...")
# Should return a number (the initial supply)

> let energy = await energyAvailability.deployed()
> energy.address
```

### 4.2 Verify Master Account Has Token Supply
```bash
# Get first account (master account)
> const accounts = await web3.eth.getAccounts()
> accounts[0]

# Check if master account has tokens
> let token = await WTSWPToken.deployed()
> let supply = await token.balanceOf(accounts[0])
> web3.utils.fromWei(supply)
# Should show "15" or whatever your initial supply is
```

If balance is 0, there's a problem with the token contract initialization.

### 4.3 Exit Truffle Console
```bash
> .exit
```

---

## ✅ Phase 5: Frontend Setup

### 5.1 Install Client Dependencies
```bash
cd client
npm install
# or
yarn install
```

### 5.2 Configure Frontend
Verify these files exist and are correct:
- `client/src/utils/blockchainLogger.js` ✓
- `client/src/context/MetaMaskContext.js` ✓ (with correct addresses)
- `client/src/pages/profile/profile.js` ✓ (infinite loop fixed)
- `client/src/components/listingForm/sellingForm.js` ✓ (Web3 → ethers.js)

### 5.3 Start Development Server
```bash
cd client
npm start
# or
yarn start

# Should open http://localhost:3000 automatically
```

---

## ✅ Phase 6: MetaMask Configuration

### 6.1 Add Local Network to MetaMask
1. **Open MetaMask** → Click network selector (top-left)
2. **Click "Add Network"** or **Settings → Networks → Add a network**
3. **Fill in:**
   - Network Name: `Ganache Local`
   - RPC URL: `http://127.0.0.1:7545`
   - Chain ID: `5777` (or `1337` if using different Ganache)
   - Currency Symbol: `ETH`
4. **Save** and switch to this network

### 6.2 Import Test Account
1. **Get private key from Ganache:**
   - Open Ganache GUI → Click "Key" icon on any account
   - Copy the private key
2. **In MetaMask:**
   - Click account icon → "Import Account"
   - Paste private key
   - Name it something like "Ganache Test 1"
3. **Verify:**
   - Account should show balance (from Ganache's 100 ETH allocation)

### 6.3 Add Custom Token (WTSWP)
1. **In MetaMask:** Click "Assets" → "Import tokens"
2. **Enter:**
   - Token Contract Address: `0xAABBCCDD...` (your WTSWPToken address)
   - Token Symbol: `WTSWP`
   - Decimals: `18`
3. **Click "Add Custom Token"** → **"Import"**
4. **Should now see WTSWP balance** (should match what master account has)

---

## ✅ Phase 7: Test the Flow

### 7.1 Test MetaMask Connection
1. **Go to Profile page:** `http://localhost:3000/profile`
2. **Open Browser DevTools:** F12 → Console
3. **Look for logs:**
   ```
   [BLOCKCHAIN ...] 🔗 Attempting to connect MetaMask...
   [BLOCKCHAIN ...] ✅ Connected to account: 0x...
   [BLOCKCHAIN ...] ✅ MetaMask Provider Network Info: { name: 'ganache', chainId: 5777, ... }
   ```

### 7.2 Verify Token Balance Display
- Profile page should show wallet address
- Should show WTSWP balance (if master account is connected)
- **No infinite error loops**

### 7.3 Test Listing Creation (Selling Form)
1. **Navigate to Listing page**
2. **Fill in:**
   - Amount: `5` (KWh)
   - Price: `100` (WTSWP per KWh)
3. **Click "List Energy"**
4. **Watch console for logs:**
   ```
   [BLOCKCHAIN ...] ⚡ Checking energy availability on blockchain...
   [BLOCKCHAIN ...] ✅ Energy availability confirmed
   [BLOCKCHAIN ...] 💳 Transferring WTSWP fee...
   [BLOCKCHAIN ...] ✅ Token transfer confirmed
   ```

---

## ✅ Phase 8: Debugging Checklist

### If Balance Shows as "N/A":
1. ✓ MetaMask connected? (Check: account shown on profile)
2. ✓ Token address correct? (Check: DevTools console)
3. ✓ BalanceViewer deployed? (Check: truffle console)
4. ✓ Master account imported in MetaMask?

**Debug script:**
```javascript
// Paste in browser console (on profile page)
const { account, balance, error, DEPLOYED_ADDRESSES } = window.__METAMASK_CONTEXT__
console.log('Account:', account)
console.log('Balance:', balance)
console.log('Error:', error)
console.log('Token Address:', DEPLOYED_ADDRESSES.tokenAddress)
console.log('Viewer Address:', DEPLOYED_ADDRESSES.balanceViewerAddress)
```

### If Transaction Fails:
1. ✓ Ganache running? (Check: http://127.0.0.1:7545 in browser)
2. ✓ Enough gas? (Check: MetaMask has balance)
3. ✓ Correct network in MetaMask? (Should be Ganache Local)
4. ✓ Check browser console for specific error

### If ABI Errors Appear:
```
Error: could not decode result data (value="0x", info={ "method": "getTokenBalance", ... })
```

**Solution:**
1. Check that `BalanceViewer.json` is imported (NOT `BalanceOf.json`)
2. Verify contract address matches deployed address
3. Make sure ABI matches deployed contract

---

## 🎯 Expected End State

After completing all steps, you should have:

- ✅ Ganache running locally on port 7545
- ✅ All 5 contracts deployed to Ganache
- ✅ MetaMask connected to local Ganache network
- ✅ WTSWP token visible in MetaMask with correct balance
- ✅ Profile page showing wallet address and WTSWP balance
- ✅ Console logs showing blockchain operations (no infinite loops)
- ✅ Listing creation submitting token fees to blockchain
- ✅ No ABI decoding errors

---

## 📋 Console Log Reference

When everything is working, your browser console should show:

```
[BLOCKCHAIN 2024-04-23T...] 🔗 Attempting to connect MetaMask...
[BLOCKCHAIN 2024-04-23T...] ✅ Connected to account: 0x1234...5678
[BLOCKCHAIN 2024-04-23T...] ✅ MetaMask Provider Network Info: { name: 'ganache', chainId: 5777 }
[BLOCKCHAIN 2024-04-23T...] 📋 Initializing BalanceViewer contract...
[BLOCKCHAIN 2024-04-23T...] ✅ BalanceViewer contract initialized
[BLOCKCHAIN 2024-04-23T...] 📊 Fetching WTSWP token balance for: 0x1234...5678
[BLOCKCHAIN 2024-04-23T...] ✅ Balance fetched: { raw: '15000000000000000000', formatted: '15' }
```

---

## 🚨 Emergency Reset

If something goes terribly wrong:

```bash
# 1. Kill processes
# Ganache, npm servers, etc.

# 2. Clean everything
cd a:\Projects\WattSwap\WattSwap_Primary
rm -r build

# 3. Fresh Ganache instance
# Close Ganache, delete workspace, create new one

# 4. Restart from Phase 2
```

---

## 📚 Files Modified/Created

- ✅ `client/src/utils/blockchainLogger.js` - New logging utility
- ✅ `client/src/context/MetaMaskContext.js` - Fixed import, added logging
- ✅ `client/src/pages/profile/profile.js` - Fixed infinite loop
- ✅ `client/src/components/listingForm/sellingForm.js` - Web3→ethers conversion
- ✅ `client/src/utils/deploymentLogger.js` - Deployment verification helper

---

## 🔗 Next Steps (After Stabilization)

1. **Finalize addresses** in frontend config
2. **Test end-to-end flow** with real user data
3. **Document** which addresses are production vs test
4. **Later:** Re-integrate Avalanche/Circle when local flow is solid

