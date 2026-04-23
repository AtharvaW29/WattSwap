# WattSwap V2 - Deployment Guide

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    React Frontend (Client)                   │
│  • USDCPaymentContext (Avalanche USDC)                      │
│  • SolanaPaymentContext (Solana Pay/USDC)                   │
│  • Energy Marketplace & Checkout                             │
└────────────────┬────────────────────────────────────────────┘
                 │
┌────────────────┴────────────────────────────────────────────┐
│                  Express Backend (Server)                    │
│  • Payment Webhook Endpoints                                │
│  • Energy Delivery Triggers                                 │
│  • Order Status Management                                  │
│  • IoT Device Integration                                   │
└────────────────┬────────────────────────────────────────────┘
                 │
    ┌────────────┼────────────┬───────────────┐
    │            │            │               │
┌───▼──┐   ┌───▼──┐   ┌──────▼────┐   ┌─────▼─────┐
│Avalanche│ │Circle│   │  Solana   │   │  Event    │
│  USDC  │ │ CCTP │   │   Pay     │   │ Listeners │
└────────┘ └──────┘   └───────────┘   └───────────┘
```

## Phase 1: Development Setup

### 1.1 Prerequisites
```bash
# Node.js 16+
node --version

# npm 8+
npm --version

# Truffle globally installed
npm install -g truffle

# Ganache CLI for local development
npm install -g ganache-cli
```

### 1.2 Environment Configuration
Create `.env` file in root:
```env
# Avalanche Networks
AVAX_MNEMONIC="your seed phrase here"
AVAX_FUJI_RPC=https://api.avax-test.network/ext/bc/C/rpc
AVAX_MAINNET_RPC=https://api.avax.network/ext/bc/C/rpc

# Circle CCTP
CIRCLE_API_KEY=your_circle_api_key
CIRCLE_ENTITY_SECRET=your_entity_secret

# Solana
SOLANA_PRIVATE_KEY=base58_encoded_key
SOLANA_RPC_URL=https://api.devnet.solana.com

# Backend
PORT=5000
MONGODB_URI=mongodb://localhost:27017/wattswap

# Optional: ERC-4337 Bundler
BUNDLER_ENDPOINT=http://localhost:14337
PAYMASTER_ADDRESS=0x...
```

### 1.3 Local Setup
```bash
# Install dependencies
npm install
cd client && npm install
cd ../server && npm install
cd ..

# Verify Truffle config
truffle compile
```

## Phase 2: Local Testing

### 2.1 Run Ganache Development Network
```bash
ganache-cli \
  --deterministic \
  --mnemonic "test test test test test test test test test test test junk" \
  --host 0.0.0.0 \
  --port 8545 \
  --gasPrice 20000000000 \
  --gasLimit 8000000
```

### 2.2 Deploy to Local Network
```bash
truffle migrate --network development

# Output should show:
# Compiling your contracts...
# Migrations
# ==========
# > Network name: 'development'
# > 
# WattSwapV2 deployed at: 0x...
```

### 2.3 Run Smart Contract Tests
```bash
# Run all tests
truffle test

# Expected output:
# WattSwapV2
#   Listing Creation
#     ✓ should create an energy listing
#     ✓ should fail to create listing with zero quantity
#     ✓ should fail to create listing with zero price
#   USDC Deposit to Escrow
#     ✓ should deposit USDC to escrow
#     ...
#   31 passing (2s)
```

### 2.4 Test Integration Scripts
```bash
# Start event listener (in terminal 1)
node scripts/event-listener.js

# Run bridge script (in terminal 2, against testnet)
node scripts/bridge-usdc-circle.js

# Start server (in terminal 3)
npm run server

# Start client development server (in terminal 4)
npm run client
```

## Phase 3: Fuji Testnet Deployment

### 3.1 Obtain Test AVAX
1. Visit [Avalanche Faucet](https://faucet.avax.network)
2. Enter your wallet address
3. Receive 2 AVAX on Fuji testnet

### 3.2 Deploy WattSwapV2 to Fuji
```bash
truffle migrate --network fuji

# Verify deployment
truffle run verify WattSwapV2 --network fuji \
  --address 0x[CONTRACT_ADDRESS]
```

### 3.3 Get Test USDC on Fuji
1. Obtain from [Circle Testnet Faucet](https://www.circle.com/en/usdc/testnet)
2. Or bridge from Ethereum testnet using bridge script

### 3.4 Test on Fuji
```bash
# Run integration tests
npm run test:fuji

# Monitor events
NETWORK=fuji node scripts/event-listener.js

# Test bridging
NETWORK=fuji node scripts/bridge-usdc-circle.js
```

## Phase 4: Production Deployment (Mainnet)

### 4.1 Pre-Deployment Checklist
- [ ] All tests passing on Fuji
- [ ] Smart contract audited
- [ ] Environment variables configured
- [ ] Backup seed phrase securely stored
- [ ] Gas price optimization verified
- [ ] Insurance/coverage considered

### 4.2 Deploy to Mainnet
```bash
# Compile
truffle compile

# Migrate to mainnet
truffle migrate --network avalanche

# Record contract address and verify
truffle run verify WattSwapV2 --network avalanche
```

### 4.3 Configure Mainnet Environment
```env
# .env updates for production
AVAX_MAINNET_RPC=https://api.avax.network/ext/bc/C/rpc
WATTSWAP_CONTRACT_ADDRESS=0x[DEPLOYED_ADDRESS]
NODE_ENV=production
USDC_ADDRESS=0xB97EF9Ef8734C71904D8002F1e9bB1E1f341F8c
```

### 4.4 Start Production Services
```bash
# Backend
NODE_ENV=production npm run server

# Start event listeners for all chains
NODE_ENV=production node scripts/event-listener.js

# Client should point to production server
# Update REACT_APP_API_URL in client/.env.production
```

## Phase 5: Continuous Operations

### 5.1 Monitoring
```bash
# Check contract events
curl http://localhost:5000/api/blockchain-status

# Monitor backend
curl http://localhost:5000/api/health

# Check escrow balances
curl http://localhost:5000/api/escrow-balance/0x[USER_ADDRESS]
```

### 5.2 Maintenance Tasks
```bash
# Update platform fee
truffle console --network avalanche
# > const ws = await WattSwapV2.deployed()
# > await ws.setPlatformFeePercentage(5)

# Pause listings (emergency)
# > await ws.pauseListings()

# Withdraw accumulated fees
# > await ws.withdrawFees()
```

## Component Architecture

### Smart Contracts
```
contracts/
├── WattSwapV2.sol          (Main trading contract)
├── MockUSDC.sol            (For testing)
└── Interfaces/
    └── IERC20.sol          (USDC interface)
```

### Backend Services
```
server/
├── routes/
│   ├── blockchainRoutes.js (Payment webhooks)
│   └── approutes.js        (User routes)
├── models/
│   ├── Order.js
│   ├── Listings.js
│   ├── MarketPlace.js
│   └── User.js
└── controllers/
    ├── transactionController.js
    └── userController.js
```

### React Components
```
client/src/components/payment/
├── USDCPayment.jsx         (Avalanche USDC)
├── USDCPayment.css
├── SolanaPay.jsx           (Solana Pay)
└── SolanaPay.css

client/src/context/
├── USDCPaymentContext.js   (Avalanche provider)
└── SolanaPaymentContext.js (Solana provider)
```

## Transaction Flow

### Energy Purchase Workflow
```
1. Buyer connects Avalanche wallet
2. Buyer deposits USDC to escrow (USDCPayment component)
3. Buyer selects energy listing
4. Buyer places order (triggers placeOrder contract call)
5. Event emitted → Backend webhook triggered
6. Order marked as "pending seller approval"
7. Seller reviews and approves
8. Both approvals → Order completed
9. USDC transferred: Buyer → Seller (minus platform fee)
10. Event emitted → IoT device activated
11. Energy delivery begins
```

### Circle Bridge Workflow
```
1. User initiates bridge USDC from Ethereum → Avalanche
2. Script approves USDC transfer to Circle Gateway
3. Script calls depositForBurn on Gateway
4. Circle burns source tokens, creates attestation
5. Attestation fetched from Circle API
6. Script calls receiveMessage on destination chain
7. Destination USDC minted to user's address
8. Cross-chain transfer complete
```

### Solana Pay Workflow
```
1. User connects Phantom wallet (Solana network)
2. User enters payment amount
3. QR code generated via Solana Pay protocol
4. User scans with mobile wallet
5. Mobile wallet handles transaction
6. Backend receives payment confirmation
7. Order marked as completed
8. Energy delivery triggered
```

## Scaling & Optimization

### Gas Optimization
- Batch operations when possible
- Use event filters to reduce log queries
- Cache contract state locally

### Database Optimization
- Index: userId, listingId, orderId, status
- Archive old orders monthly
- Use connection pooling

### Frontend Optimization
- Lazy load payment components
- Cache USDC balance for 10 seconds
- Debounce real-time updates

## Security Considerations

### Smart Contract
- ✓ ReentrancyGuard on all external calls
- ✓ Input validation on amounts
- ✓ Access control via Ownable
- ✓ Event logging for all state changes

### Backend
- ✓ Private key never exposed
- ✓ API rate limiting
- ✓ Request validation
- ✓ HTTPS only in production

### Frontend
- ✓ No private keys stored
- ✓ Use wallet providers (MetaMask, Phantom)
- ✓ REACT_APP_ prefix for safe env variables
- ✓ CSP headers

## Troubleshooting

### Migration Failures
```bash
# Reset Ganache state
ganache-cli --deterministic

# Recompile contracts
truffle compile --all

# Retry migration
truffle migrate --reset --network development
```

### Event Listener Issues
```bash
# Check RPC connectivity
curl https://api.avax-test.network/ext/bc/C/rpc \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

# Verify contract address
truffle networks
```

### Frontend Connection Issues
```bash
# Verify MetaMask is connected to Avalanche Fuji
# Check browser console for error messages
# Verify REACT_APP_USDC_ADDRESS is correct

# Test contract interaction
truffle console --network fuji
> const w = await WattSwapV2.deployed()
> const bal = await w.getEscrowBalance('0x...')
```

## Next Steps

1. ✅ Phase 1-3: Development and Fuji testing
2. Phase 4: Mainnet deployment
3. Phase 5: Production monitoring
4. Advanced features:
   - ERC-4337 Account Abstraction (gasless transactions)
   - Multi-sig for larger transactions
   - DAO governance for platform fee decisions
   - Cross-chain order matching

## Support & Resources

- **Truffle Docs**: https://trufflesuite.com/docs
- **Avalanche Docs**: https://docs.avax.network
- **Circle CCTP**: https://developers.circle.com/usdc-on-main-chains
- **Solana Pay**: https://docs.solanapay.com
- **OpenZeppelin Contracts**: https://docs.openzeppelin.com/contracts

---

**Deployment Checklist**: All phases implemented for Avalanche Fuji testnet with production deployment pathway.
