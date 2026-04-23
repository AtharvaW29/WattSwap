#!/bin/bash
# test/run-tests.sh
# Comprehensive test runner for WattSwap V2

echo "=========================================="
echo "WattSwap V2 - Smart Contract Test Suite"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Truffle is installed
if ! command -v truffle &> /dev/null; then
    echo -e "${RED}Error: Truffle is not installed${NC}"
    echo "Install with: npm install -g truffle"
    exit 1
fi

# Check if Ganache is running (optional)
echo -e "${YELLOW}Starting Ganache development blockchain...${NC}"
ganache-cli --deterministic --host 0.0.0.0 --port 8545 &
GANACHE_PID=$!
sleep 2

echo ""
echo -e "${YELLOW}Running Truffle tests...${NC}"
echo ""

# Run tests with detailed output
truffle test --network development 2>&1

TEST_EXIT_CODE=$?

echo ""
echo "=========================================="

if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
else
    echo -e "${RED}✗ Some tests failed${NC}"
fi

echo "=========================================="
echo ""

# Cleanup
kill $GANACHE_PID 2>/dev/null

exit $TEST_EXIT_CODE
