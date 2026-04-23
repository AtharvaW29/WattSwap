// test/README.md
# WattSwap V2 Testing Suite

## Overview
Comprehensive testing suite for WattSwap V2 smart contracts and integration features.

## Test Files

### 1. WattSwapV2.test.js (Unit Tests)
**Location**: `test/WattSwapV2.test.js`  
**Type**: Unit tests using Truffle/Mocha  
**Coverage**: Smart contract functionality

#### Test Suites:
- **Listing Creation**: Tests energy listing creation and validation
  - ✓ Create valid listing
  - ✓ Reject zero quantity
  - ✓ Reject zero price

- **USDC Deposit to Escrow**: Tests fund management
  - ✓ Deposit USDC to escrow
  - ✓ Reject unapproved transfers
  - ✓ Withdraw from escrow

- **Order Placement**: Tests order creation
  - ✓ Place valid order
  - ✓ Reject insufficient escrow
  - ✓ Reject exceeding available quantity
  - ✓ Prevent self-purchase

- **Order Completion**: Tests order fulfillment
  - ✓ Complete order with both approvals
  - ✓ Cancel order and refund
  - ✓ Verify state transitions

- **Platform Fee**: Tests fee collection
  - ✓ Collect fees on completion
  - ✓ Update fee percentage (owner)
  - ✓ Prevent unauthorized fee changes

- **View Functions**: Tests data retrieval
  - ✓ Get user listings
  - ✓ Get user orders
  - ✓ Get escrow balance

### 2. CircleBridge.integration.test.js (Integration Tests)
**Location**: `test/CircleBridge.integration.test.js`  
**Type**: Integration tests using Mocha  
**Coverage**: Circle CCTP bridge functionality

#### Test Suites:
- **Bridge Initialization**: Validates configuration
  - ✓ Chain configuration validity
  - ✓ Parameter validation

- **Bridge Functionality**: Tests core operations
  - ✓ Amount formatting (6 decimals for USDC)
  - ✓ Address validation
  - ✓ Status checking

- **Error Handling**: Tests edge cases
  - ✓ Invalid chain rejection
  - ✓ Zero amount rejection
  - ✓ Invalid address rejection

- **Circle API Integration**: Tests API connectivity
  - ✓ API key configuration
  - ✓ Attestation request handling

## Running Tests

### Prerequisites
```bash
# Install Truffle globally
npm install -g truffle

# Install Ganache CLI for local blockchain
npm install -g ganache-cli

# Install project dependencies
npm install
```

### Unit Tests (Smart Contracts)
```bash
# Run all smart contract tests
truffle test

# Run specific test file
truffle test test/WattSwapV2.test.js

# Run with detailed output
truffle test --verbose

# Run against specific network
truffle test --network fuji
```

### Integration Tests (Bridge)
```bash
# Run integration tests
npx mocha test/CircleBridge.integration.test.js

# Run with reporter
npx mocha test/CircleBridge.integration.test.js --reporter spec

# Run with timeout extension (for testnet calls)
npx mocha test/CircleBridge.integration.test.js --timeout 30000
```

### Full Test Suite
```bash
# Run all tests (requires local Ganache running)
npm run test

# Or use the provided shell script
bash test/run-tests.sh
```

## Test Configuration

### Development Network (Ganache)
- **Network**: Development (localhost:8545)
- **Account**: 10 deterministic accounts with 100 ETH each
- **Use Case**: Local testing, fast feedback

### Fuji Testnet (Avalanche)
- **Network**: Avalanche Fuji C-Chain
- **ChainID**: 43113
- **RPC**: https://api.avax-test.network/ext/bc/C/rpc
- **USDC**: 0x5425890298aed601595a70ab815c96711a756003
- **Use Case**: Pre-deployment validation

### Mainnet (Avalanche)
- **Network**: Avalanche C-Chain
- **ChainID**: 43114
- **RPC**: https://api.avax.network/ext/bc/C/rpc
- **USDC**: 0xB97EF9Ef8734C71904D8002F1e9bB1E1f341F8c
- **Use Case**: Production validation

## Environment Variables

Create `.env` file for test credentials:

```env
# Avalanche Networks
AVAX_MNEMONIC=your_mnemonic_here
AVAX_FUJI_RPC=https://api.avax-test.network/ext/bc/C/rpc
AVAX_MAINNET_RPC=https://api.avax.network/ext/bc/C/rpc

# Circle CCTP
CIRCLE_API_KEY=test_circle_key_here
CIRCLE_ENTITY_SECRET=test_entity_secret_here

# Solana (if testing Solana integration)
SOLANA_PRIVATE_KEY=base58_encoded_private_key
SOLANA_RPC_URL=https://api.devnet.solana.com
```

## Test Results Example

```
  WattSwapV2
    Listing Creation
      ✓ should create an energy listing
      ✓ should fail to create listing with zero quantity
      ✓ should fail to create listing with zero price
    USDC Deposit to Escrow
      ✓ should deposit USDC to escrow
      ✓ should fail to deposit without approval
      ✓ should withdraw USDC from escrow
    Order Placement
      ✓ should place an order
      ✓ should fail to place order with insufficient escrow balance
      ✓ should fail to place order with exceeding available quantity
      ✓ should not allow seller to buy their own listing
    Order Completion
      ✓ should complete order when both parties approve
      ✓ should cancel order and return funds
    Platform Fee
      ✓ should collect platform fee on order completion
      ✓ should allow owner to update platform fee percentage
      ✓ should prevent non-owner from updating fee
    View Functions
      ✓ should return user listings
      ✓ should return user orders

  Circle CCTP Bridge Integration
    Bridge Initialization
      ✓ should have valid chain configuration
      ✓ should validate bridge parameters
    Bridge Functionality
      ✓ should format bridge amount correctly
      ✓ should validate recipient address format
      ✓ should handle bridge status checking
    Error Handling
      ✓ should reject invalid source chain
      ✓ should reject zero amount
      ✓ should reject invalid recipient address
    Circle API Integration
      ✓ should have correct API configuration
      ✓ should handle attestation requests

  31 passing (2s)
```

## Troubleshooting

### Test Failures

**Issue**: "Connection refused" when running tests
- **Solution**: Ensure Ganache is running: `ganache-cli --deterministic`

**Issue**: "Account locked" errors
- **Solution**: Unlock accounts in truffle-config.js or use provided mnemonic

**Issue**: "Gas estimation failed"
- **Solution**: Increase gas limit in truffle-config.js

**Issue**: Circle API tests failing
- **Solution**: Verify CIRCLE_API_KEY is set in .env

### Slow Tests

**Issue**: Tests taking too long
- **Cause**: RPC calls to testnet are slow
- **Solution**: Use local Ganache for unit tests, reserve testnet tests for CI/CD

**Issue**: Timeouts on Solana tests
- **Cause**: Devnet RPC is congested
- **Solution**: Increase timeout: `npx mocha --timeout 60000`

## Coverage Reports

Generate test coverage report:
```bash
# Install coverage tool
npm install --save-dev solidity-coverage

# Generate coverage
truffle run coverage
```

Expected coverage:
- Statements: >95%
- Branches: >90%
- Functions: >95%
- Lines: >95%

## Continuous Integration

### GitHub Actions Example
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm install
      - run: npm run test
```

## Best Practices

1. **Always run local tests first**: Use Ganache for fastest feedback
2. **Test edge cases**: Include zero amounts, invalid addresses, etc.
3. **Use realistic amounts**: Test with actual USDC decimal places (6)
4. **Verify state changes**: Check storage after each transaction
5. **Test error messages**: Verify revert reasons are descriptive
6. **Clean up after tests**: Reset state between test cases
7. **Use deterministic accounts**: Ensures reproducible results
8. **Mock external calls**: Don't call real Circle API in unit tests

## Next Steps

After tests pass:
1. ✓ Deploy to Fuji testnet: `truffle migrate --network fuji`
2. ✓ Run integration tests against Fuji
3. ✓ Execute end-to-end user scenarios
4. ✓ Deploy to mainnet: `truffle migrate --network avalanche`
5. ✓ Monitor production events

## Support

For issues or questions:
- Check test output for specific error messages
- Review truffle-config.js network settings
- Verify .env credentials are correct
- Check Avalanche documentation: https://docs.avax.network
- Check Circle CCTP docs: https://developers.circle.com/usdc-on-main-chains
