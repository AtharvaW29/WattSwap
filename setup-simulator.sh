#!/bin/bash

# WattSwap Simulator Setup Guide
# This script helps set up the virtual ESP32 simulator for hackathon demo

set -e

echo "🔧 WattSwap Simulator Setup"
echo "============================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js not found. Please install Node.js 16+${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js$(node -v)${NC}"

# Check if firebase-service-account.json exists
if [ ! -f "firebase-service-account.json" ]; then
    echo -e "${YELLOW}⚠️  firebase-service-account.json not found${NC}"
    echo "    To use simulator:"
    echo "    1. Go to Firebase Console > WattSwap Project > Settings > Service Accounts"
    echo "    2. Generate new private key (JSON)"
    echo "    3. Save as firebase-service-account.json in project root"
    echo ""
fi

# Create .env file in simulator if not exists
if [ ! -f "simulator/.env" ]; then
    echo -e "${YELLOW}⚠️  simulator/.env not found${NC}"
    echo "    Creating from .env.example..."
    cp simulator/.env.example simulator/.env
    echo -e "${GREEN}✓ Created simulator/.env${NC}"
fi

# Create .env file in server if not exists
if [ ! -f "server/.env" ]; then
    echo -e "${YELLOW}⚠️  server/.env not found${NC}"
    echo "    Creating from .env.example..."
    cp server/.env.example server/.env
    echo -e "${GREEN}✓ Created server/.env${NC}"
fi

# Install simulator dependencies
echo ""
echo "📦 Installing simulator dependencies..."
cd simulator
npm install
cd ..
echo -e "${GREEN}✓ Simulator dependencies installed${NC}"

# Install server dependencies (if not done)
echo ""
echo "📦 Checking server dependencies..."
if ! grep -q "firebase-admin" server/package.json; then
    echo "    Installing firebase-admin..."
    cd server
    npm install firebase-admin
    cd ..
else
    echo -e "${GREEN}✓ firebase-admin already installed${NC}"
fi

echo ""
echo -e "${GREEN}✓ Setup complete!${NC}"
echo ""
echo "📖 Next steps:"
echo "   1. Configure Firebase:"
echo "      - Add firebase-service-account.json to project root"
echo "      - Update FIREBASE_DATABASE_URL in simulator/.env"
echo ""
echo "   2. Run the simulator:"
echo "      npm run simulator"
echo ""
echo "   3. In another terminal, run the backend:"
echo "      npm run server"
echo ""
echo "   4. In another terminal, run the frontend:"
echo "      npm run client"
echo ""
echo "   5. Trigger a mock transaction to test relay activation:"
echo "      node simulator/test-transaction.js"
echo ""
