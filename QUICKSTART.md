# WattSwap V2 - Quick Start Guide

## 5-Minute Setup

### Prerequisites
```bash
# Install Node.js 16+ (check with: node --version)
# Install npm 8+ (check with: npm --version)

# Install Truffle globally
npm install -g truffle

# Install Ganache (for local testing)
npm install -g ganache-cli
```

### 1. Clone & Install
```bash
cd WattSwap_Primary
npm install
cd client && npm install && cd ..
cd server && npm install && cd ..
```

### 2. Configure Environment
Create `.env` in root directory:
```env
# For local development with Ganache
AVAX_MNEMONIC="test test test test test test test test test test test junk"
AVAX_FUJI_RPC=https://api.avax-test.network/ext/bc/C/rpc
AVAX_MAINNET_RPC=https://api.avax.network/ext/bc/C/rpc

# For Solana Pay (optional)
SOLANA_RPC_URL=https://api.devnet.solana.com

# For Circle CCTP (optional)
CIRCLE_API_KEY=test_key_here

# Backend
PORT=5000
```

### 3. Start Local Development
```bash
# Terminal 1: Start Ganache
ganache-cli --deterministic --host 0.0.0.0 --port 8545

# Terminal 2: Deploy contracts locally
truffle migrate --network development

# Terminal 3: Start backend
npm run server

# Terminal 4: Start frontend
npm run client
```

**App running at**: http://localhost:3000

---

## Testing

### Quick Test Run
```bash
# With Ganache running
truffle test

# Expected: 31 passing tests in ~2 seconds
```

### Test Specific Features
```bash
# Run only listing creation tests
truffle test test/WattSwapV2.test.js --grep "Listing Creation"

# Run integration tests
npm run test:integration
```

---

## Core Components Overview

### Smart Contract
**File**: `contracts/WattSwapV2.sol`

Key functions:
```solidity
// Create energy listing
createListing(quantity, pricePerUnit, location)

// Deposit USDC for trading
depositToEscrow(amount)

// Place buy order
placeOrder(listingId, quantity)

// Both parties approve → funds transferred
approveOrderByBuyer(orderId)
approveOrderBySeller(orderId)
```

### Payment Components

**Avalanche USDC Payment**:
```jsx
import USDCPayment from './components/payment/USDCPayment'
<USDCPayment />
```

**Solana Pay**:
```jsx
import SolanaPay from './components/payment/SolanaPay'
<SolanaPay />
```

### Event Listening
```bash
# Start listening for blockchain events
npm run listen:events
```

---

## Common Tasks

### Deploy to Fuji Testnet
```bash
# Get test AVAX from faucet.avax.network

# Deploy contract
truffle migrate --network fuji

# Check deployment
truffle networks
```

### Bridge USDC (Circle)
```bash
# Requires CIRCLE_API_KEY in .env
npm run bridge
```

### Check Contract Status
```bash
# Connect to contract
truffle console --network development

# Check listing
const ws = await WattSwapV2.deployed()
const listing = await ws.getListing(0)
console.log(listing)

# Check balance
const balance = await ws.getEscrowBalance('0x...')
console.log(balance)

# Exit
.exit
```

### Monitor Transactions
```bash
# Mainnet Avalanche Explorer
https://snowtrace.io/

# Fuji Testnet Explorer
https://testnet.snowtrace.io/

# Search by contract address or txHash
```

---

## Project Structure

```
WattSwap_Primary/
├── contracts/              # Smart contracts
│   ├── WattSwapV2.sol     # Main contract
│   └── MockUSDC.sol       # For testing
├── migrations/             # Deployment scripts
│   └── 5_migration_wattswap_v2.js
├── scripts/                # Utility scripts
│   ├── bridge-usdc-circle.js
│   └── event-listener.js
├── test/                   # Test files
│   ├── WattSwapV2.test.js
│   └── CircleBridge.integration.test.js
├── client/                 # React frontend
│   ├── src/components/payment/
│   │   ├── USDCPayment.jsx
│   │   ├── SolanaPay.jsx
│   │   └── ...
│   └── src/context/
│       ├── USDCPaymentContext.js
│       └── SolanaPaymentContext.js
├── server/                 # Express backend
│   ├── routes/blockchainRoutes.js
│   ├── models/
│   └── index.js
├── truffle-config.js       # Network config
├── .env                    # Environment vars
└── package.json            # Dependencies
```

---

## API Quick Reference

### Create Order
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "listingId": 0,
    "quantity": 50,
    "buyerAddress": "0x..."
  }'
```

### Get User Listings
```bash
curl http://localhost:5000/api/listings?location=Austin
```

### Check Blockchain Status
```bash
curl http://localhost:5000/api/blockchain-status
```

### Get USDC Balance
```bash
curl http://localhost:5000/api/usdc-balance/0x...
```

---

## Troubleshooting

### "Connection refused" on contract calls
- Check Ganache is running: `ganache-cli --deterministic`
- Verify port 8545 is open

### Tests failing
```bash
# Reset and recompile
truffle compile --all
truffle migrate --reset --network development
truffle test
```

### Frontend shows "Not Connected"
- Open MetaMask
- Switch to Localhost 8545 network
- Refresh page

### Events not firing
```bash
# Check event listener is running
npm run listen:events

# Check backend is accessible
curl http://localhost:5000/api/blockchain-status
```

### "Insufficient escrow balance"
- Deposit USDC first: Use USDCPayment component
- Check balance: `GET /api/usdc-balance/0x...`

---

## Development Workflow

### 1. Make Smart Contract Changes
```bash
# Edit: contracts/WattSwapV2.sol

# Recompile and redeploy
truffle compile
truffle migrate --reset --network development

# Test changes
truffle test
```

### 2. Update React Components
```bash
# Edit: client/src/components/payment/

# Changes auto-reload via npm start
# Check browser console for errors
```

### 3. Modify Backend Routes
```bash
# Edit: server/routes/blockchainRoutes.js

# Restart server (Ctrl+C then npm run server)
```

### 4. Add New Tests
```bash
# Edit: test/WattSwapV2.test.js

# Run tests
truffle test
```

---

## Performance Tips

### Faster Local Testing
```bash
# Use --network test flag for faster migrations
truffle test --network development

# Skip unnecessary logging
NODE_LOG_LEVEL=error truffle test
```

### Optimize Gas on Mainnet
- View gas in contract migration output
- Adjust `gas` in truffle-config.js networks section
- Batch operations when possible

### Better Frontend Performance
- Use `npm run client:build` for production
- Enable code splitting
- Cache API responses

---

## Next Steps

1. ✅ **Local Development**: Run `ganache-cli` and `npm run client`
2. ✅ **Test Smart Contracts**: Run `truffle test`
3. **Deploy to Fuji**: Get test AVAX, run `truffle migrate --network fuji`
4. **Test on Testnet**: Connect MetaMask to Fuji, use actual contract
5. **Deploy to Mainnet**: Follow DEPLOYMENT.md guide

---

## Helpful Resources

- **Avalanche Docs**: https://docs.avax.network
- **Truffle Guide**: https://trufflesuite.com/docs
- **Circle CCTP**: https://developers.circle.com/usdc-on-main-chains
- **Solana Pay**: https://docs.solanapay.com
- **MetaMask**: https://metamask.io/download

---

## Get Help

### Common Commands Reference
```bash
# Show available networks
truffle networks

# Display contract info
truffle console --network development
> const ws = await WattSwapV2.deployed()
> ws.address

# View deployed contracts
cat build/contracts/WattSwapV2.json | grep networks

# Check gas prices
curl https://api.avax-test.network/ext/bc/C/rpc \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_gasPrice","params":[],"id":1}'
```

---

**Ready to build? Start with**: `ganache-cli --deterministic`

**Questions?** Check `DEPLOYMENT.md`, `API.md`, or `test/README.md`
