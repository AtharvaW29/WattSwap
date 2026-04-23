# WattSwap V2 - Deployment Checklist

## Pre-Deployment (Local Testing)

### Setup & Installation
- [ ] Node.js v16+ installed (`node --version`)
- [ ] npm v8+ installed (`npm --version`)
- [ ] Truffle installed globally (`npm install -g truffle`)
- [ ] Repository cloned locally
- [ ] `npm install` completed for root, client, and server
- [ ] `.env` file created with configuration
- [ ] All dependencies resolved (704 packages)

### Local Testing
- [ ] Ganache CLI installed (`npm install -g ganache-cli`)
- [ ] Ganache started: `ganache-cli --deterministic`
- [ ] Contracts compiled: `truffle compile`
- [ ] Contracts migrated: `truffle migrate --network development`
- [ ] Unit tests passing: `truffle test` (31/31 passing)
- [ ] Integration tests passing: `npm run test:integration` (10/10 passing)
- [ ] Backend server starts: `npm run server` (runs on port 5000)
- [ ] React client starts: `npm run client` (runs on http://localhost:3000)

### Local Feature Testing
- [ ] MetaMask installed in browser
- [ ] Phantom wallet installed (for Solana testing)
- [ ] Can connect wallet to app
- [ ] USDC balance displays correctly
- [ ] Can trigger deposit to escrow
- [ ] Can view test listings
- [ ] Can place test orders
- [ ] Event listener captures events

---

## Fuji Testnet Deployment

### Prerequisites
- [ ] Test AVAX obtained from [faucet.avax.network](https://faucet.avax.network) (~2 AVAX)
- [ ] AVAX_FUJI_RPC set in `.env`
- [ ] AVAX_MNEMONIC with funded account in `.env`
- [ ] MetaMask connected to Fuji network (ChainID: 43113)

### Deployment
- [ ] Contract compilation verified: `truffle compile`
- [ ] Contract deployed to Fuji: `truffle migrate --network fuji`
- [ ] Deployment transaction recorded
- [ ] WattSwapV2 contract address noted
- [ ] Contract added to Snowtrace testnet explorer
- [ ] Contract verification attempted on Snowtrace (optional)

### Configuration After Deployment
- [ ] Update `.env` with deployed contract address
  ```env
  WATTSWAP_CONTRACT_ADDRESS=0x[DEPLOYED_ADDRESS]
  ```
- [ ] Update `client/.env`:
  ```env
  REACT_APP_WATTSWAP_CONTRACT_ADDRESS=0x[DEPLOYED_ADDRESS]
  REACT_APP_USDC_ADDRESS=0x5425890298aed601595a70ab815c96711a756003
  ```

### Testnet Features Testing
- [ ] Connect MetaMask to Fuji testnet
- [ ] View app data from deployed contract
- [ ] Test USDC balance retrieval
- [ ] Create test listing on-chain
- [ ] Place test order on-chain
- [ ] Verify transaction on [Snowtrace](https://testnet.snowtrace.io)

### Backend Integration Testing
- [ ] Event listener connecting to Fuji RPC
- [ ] Backend receiving Avalanche events
- [ ] Payment webhook processing correctly
- [ ] Order status updating from blockchain
- [ ] IoT device integration test (mock)

### Bridge Testing (Circle CCTP)
- [ ] Circle API key obtained from [Circle Console](https://console.circle.com)
- [ ] Circle Entity Secret configured
- [ ] Bridge script can connect to Circle API
- [ ] Test bridge from Ethereum to Avalanche
- [ ] Verify USDC minted on destination
- [ ] Check attestation status

### Solana Pay Testing
- [ ] Solana RPC URL configured
- [ ] Phantom wallet added for Solana Devnet
- [ ] QR code generation works
- [ ] Can initiate Solana Pay transactions
- [ ] Verify transactions on [Solana Explorer](https://explorer.solana.com)

---

## Mainnet Deployment (Avalanche)

### Prerequisites
- [ ] Security audit completed (optional but recommended)
- [ ] All testnet testing passed
- [ ] Mainnet AVAX obtained for gas (~0.5-1 AVAX)
- [ ] Mainnet seed phrase secure and backed up
- [ ] AVAX_MAINNET_RPC verified
- [ ] Monitoring/alerting systems configured

### Pre-Deployment Review
- [ ] Smart contract logic reviewed once more
- [ ] Platform fee percentage finalized
- [ ] Emergency pause functionality tested
- [ ] Fee withdrawal mechanism tested
- [ ] Rollback plan documented

### Deployment
- [ ] Verify truffle network config for mainnet
- [ ] Deploy contract: `truffle migrate --network avalanche`
- [ ] Deployment transaction recorded and saved
- [ ] WattSwapV2 contract address verified
- [ ] Contract added to [Snowtrace](https://snowtrace.io) explorer

### Post-Deployment Verification
- [ ] Contract verified on Snowtrace
- [ ] Contract address added to all `.env` files
- [ ] Backend environment updated
- [ ] Frontend environment updated
- [ ] Event listeners restarted with mainnet RPC

### Production Configuration
- [ ] `NODE_ENV=production` set in backend
- [ ] SSL/HTTPS enforced for all endpoints
- [ ] CORS configured for production domain
- [ ] Rate limiting enabled
- [ ] Database backups configured
- [ ] Monitoring dashboard set up

### Go-Live Checklist
- [ ] All services running on production servers
- [ ] Load balancing configured (if needed)
- [ ] DNS pointing to production
- [ ] SSL certificates active
- [ ] Firewall rules configured
- [ ] Backup systems operational

### Monitoring Setup
- [ ] Event listener health checks enabled
- [ ] Backend uptime monitoring
- [ ] Contract event monitoring
- [ ] Transaction failure alerts
- [ ] Gas price alerts
- [ ] Error logging centralized

---

## Post-Deployment Operations

### Day 1 (Launch Day)
- [ ] Monitor all systems closely
- [ ] Check for error logs
- [ ] Verify no transaction failures
- [ ] Monitor event queue depth
- [ ] Check database performance
- [ ] Have support team on standby

### Week 1
- [ ] Review all completed transactions
- [ ] Verify escrow deposits/withdrawals working
- [ ] Test energy delivery workflows end-to-end
- [ ] Monitor IoT device integration
- [ ] Collect user feedback
- [ ] Check for any edge case issues

### Month 1
- [ ] Analyze transaction volumes
- [ ] Review platform fee collection
- [ ] Optimize gas costs if needed
- [ ] Update documentation based on issues
- [ ] Plan for next feature release
- [ ] Consider security audit results

### Ongoing
- [ ] Daily health checks
- [ ] Weekly log reviews
- [ ] Monthly performance reports
- [ ] Quarterly security assessments
- [ ] Annual audit consideration

---

## Troubleshooting During Deployment

### Migration Failures
**Issue**: `Error: Error: Could not connect to your Ethereum client`
```bash
# Solution: Verify RPC endpoints
curl https://api.avax-test.network/ext/bc/C/rpc \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

### Contract Deployment Errors
**Issue**: `Error: Returned error: insufficient funds for gas`
```bash
# Solution: Ensure account has AVAX
# Check balance: truffle console --network fuji
# > web3.eth.getBalance('0x...')
```

### Event Listener Not Connecting
**Issue**: `Error: Cannot connect to event listener RPC`
```bash
# Solution: Verify RPC endpoint is correct and accessible
# Check: echo $AVAX_FUJI_RPC or echo $AVAX_MAINNET_RPC
```

### Frontend Not Connecting to Contract
**Issue**: `Error: Contract address not found`
```bash
# Solution: Verify REACT_APP_WATTSWAP_CONTRACT_ADDRESS is set
# Check: cat client/.env | grep CONTRACT
# Restart: npm run client
```

### Payment Webhook Not Triggering
**Issue**: Backend doesn't receive payment notifications
```bash
# Solution: Check backend logs for incoming requests
# Verify: Event listener is running
# Check: Backend port 5000 is accessible
```

---

## Performance Targets

### Smart Contract
- [ ] Listing creation: < 0.1 AVAX gas
- [ ] Order placement: < 0.15 AVAX gas
- [ ] Order approval: < 0.1 AVAX gas
- [ ] USDC transfer: < 0.05 AVAX gas

### Backend
- [ ] API response time: < 200ms
- [ ] Event processing: < 5 seconds
- [ ] Database queries: < 100ms
- [ ] Webhook delivery: < 10 seconds

### Frontend
- [ ] Page load: < 3 seconds
- [ ] Component render: < 500ms
- [ ] Balance update: < 2 seconds
- [ ] Transaction submit: < 1 second

---

## Security Checklist

### Smart Contract Security
- [ ] ReentrancyGuard protection verified
- [ ] Input validation checked
- [ ] Access control roles defined
- [ ] Emergency pause function tested
- [ ] Fee distribution verified

### Backend Security
- [ ] API authentication implemented
- [ ] Rate limiting enabled
- [ ] Input sanitization checked
- [ ] SQL injection prevention verified
- [ ] HTTPS/TLS enforced

### Frontend Security
- [ ] Content Security Policy configured
- [ ] Dependencies scanned for vulnerabilities
- [ ] No sensitive data in storage
- [ ] Wallet connection via provider only
- [ ] CORS headers configured

### Infrastructure Security
- [ ] VPC/firewall configured
- [ ] SSH key management in place
- [ ] Access logs monitored
- [ ] Backup encryption enabled
- [ ] Disaster recovery tested

---

## Rollback Plan

### If Major Issue Discovered
1. [ ] Pause contracts using `pauseListings()` (owner only)
2. [ ] Stop accepting new orders
3. [ ] Notify users via app banner
4. [ ] Investigate root cause
5. [ ] Prepare fix deployment
6. [ ] Deploy hotfix
7. [ ] Resume normal operations

### If Data Integrity Issue
1. [ ] Identify affected orders/users
2. [ ] Restore from latest backup
3. [ ] Verify data consistency
4. [ ] Compensate affected users
5. [ ] Document lessons learned

---

## Approval Sign-offs

### Development Team
- [ ] Name: _________________ Date: _______
- [ ] All code review comments addressed
- [ ] All tests passing
- [ ] Documentation complete

### QA Team
- [ ] Name: _________________ Date: _______
- [ ] Testnet testing complete
- [ ] No critical bugs found
- [ ] Performance targets met

### Security Review
- [ ] Name: _________________ Date: _______
- [ ] Smart contract reviewed
- [ ] Backend security verified
- [ ] Infrastructure secured

### Product Owner
- [ ] Name: _________________ Date: _______
- [ ] Features working as specified
- [ ] User experience verified
- [ ] Ready for launch

### DevOps/Operations
- [ ] Name: _________________ Date: _______
- [ ] Infrastructure prepared
- [ ] Monitoring configured
- [ ] Runbooks documented

---

## Rollback Sign-off (If Needed)

**Date**: ________________
**Reason for Rollback**: _________________________________
**Approved by**: _________________ 
**Timestamp**: _________________

---

## Launch Day Schedule

```
06:00 AM - Final systems check
06:30 AM - All teams on standby
07:00 AM - Go-live signal
07:15 AM - Contract deployed
07:30 AM - Frontend pointing to prod
07:45 AM - Event listeners started
08:00 AM - First users connecting
09:00 AM - First orders processed
10:00 AM - Business as usual

On-call rotation:
- Smart contract issues: [Name]
- Backend/API issues: [Name]
- Frontend issues: [Name]
- Infrastructure issues: [Name]
- Communications: [Name]
```

---

## Post-Launch Monitoring URLs

- **Mainnet Explorer**: https://snowtrace.io
- **Contract Address**: 0x[ADDRESS]
- **Backend Health**: https://api.wattswap.com/api/blockchain-status
- **Monitoring Dashboard**: [Internal URL]
- **Alert System**: [PagerDuty/etc URL]

---

**Checklist Version**: 2.0  
**Last Updated**: January 2024  
**Created by**: Copilot Agent  
**Status**: Ready for Launch ✅
