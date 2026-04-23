/**
 * Deployment Verification & Contract Address Logger
 * Run this after truffle migrate to log all deployed contract addresses
 * 
 * Usage:
 * 1. Deploy: truffle migrate --network development
 * 2. Run this in browser console after deployment or use in a Node.js script
 * 
 * This helps verify:
 * - Contract addresses match hardcoded values
 * - ABI methods are available
 * - Network connectivity
 */

import fs from 'fs';
import path from 'path';

// Read contract artifacts from build/contracts
const getContractAddresses = (buildDir = './build/contracts') => {
  const addresses = {};
  
  // Common contracts we need to track
  const contracts = [
    'WTSWPToken',
    'energyAvailability',
    'BalanceViewer',
    'WattSwap',
    'transferFrom',
    'balanceOf'
  ];

  contracts.forEach(contractName => {
    try {
      const artifactPath = path.join(buildDir, `${contractName}.json`);
      if (fs.existsSync(artifactPath)) {
        const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
        
        if (artifact.networks) {
          // List all networks and their addresses
          Object.entries(artifact.networks).forEach(([networkId, networkData]) => {
            if (!addresses[networkId]) {
              addresses[networkId] = {};
            }
            addresses[networkId][contractName] = networkData.address;
          });
        }
      }
    } catch (err) {
      console.error(`Error reading ${contractName}:`, err.message);
    }
  });

  return addresses;
};

// Format and display addresses
const displayAddresses = (addresses) => {
  console.log('\n=====================================');
  console.log('DEPLOYED CONTRACT ADDRESSES');
  console.log('=====================================\n');

  Object.entries(addresses).forEach(([networkId, contracts]) => {
    console.log(`📡 Network ID: ${networkId}`);
    console.log('-'.repeat(50));
    
    Object.entries(contracts).forEach(([name, address]) => {
      console.log(`  ${name.padEnd(25)} ${address}`);
    });
    
    console.log('');
  });

  return addresses;
};

// Generate frontend config
const generateFrontendConfig = (addresses, networkId = 'unknown') => {
  const config = addresses[networkId] || addresses[Object.keys(addresses)[0]] || {};
  
  const configCode = `
// Auto-generated from deployment artifacts
// Update this in client/src/config/deployedContracts.js

export const DEPLOYED_CONTRACTS = {
  development: {
    tokenAddress: "${config.WTSWPToken || '0x...'}",
    balanceViewerAddress: "${config.BalanceViewer || '0x...'}",
    energyAvailabilityAddress: "${config.energyAvailability || '0x...'}",
    wattSwapAddress: "${config.WattSwap || '0x...'}",
  },
  // Add other networks as needed
};

export const getDeployedAddresses = (network = 'development') => {
  return DEPLOYED_CONTRACTS[network] || DEPLOYED_CONTRACTS.development;
};
`;

  console.log('\n=====================================');
  console.log('FRONTEND CONFIG CODE');
  console.log('=====================================\n');
  console.log(configCode);

  return configCode;
};

// Main export
export const DeploymentLogger = {
  getContractAddresses,
  displayAddresses,
  generateFrontendConfig,
  
  logDeployment: (buildDir = './build/contracts', networkId = 'unknown') => {
    console.log('🔍 Scanning deployment artifacts...\n');
    
    const addresses = getContractAddresses(buildDir);
    const displayed = displayAddresses(addresses);
    const config = generateFrontendConfig(displayed, networkId);

    console.log('\n✅ Deployment addresses logged successfully');
    console.log('📋 Copy the config code above to client/src/config/deployedContracts.js');
    
    return {
      addresses: displayed,
      config
    };
  }
};

// Browser-based version for checking via ethers.js
export const checkDeploymentInBrowser = async () => {
  if (!window.ethereum) {
    console.error('MetaMask not available');
    return;
  }

  const { ethers } = window;
  const provider = new ethers.BrowserProvider(window.ethereum);
  const network = await provider.getNetwork();

  console.log('\n🌐 Connected Network:');
  console.log(`   Name: ${network.name}`);
  console.log(`   Chain ID: ${network.chainId}`);

  // Try to check if contracts exist at addresses
  const addresses = {
    tokenAddress: "0xD833215cBcc3f914bD1C9ece3EE7BF8B14f841bb",
    balanceViewerAddress: "0x59d3631c86BbE35EF041872d502F218A39FBa150",
    energyContractAddress: "0xdf25d603B8B31Fb3DB3bc406BABD3dfE8Df24225",
  };

  console.log('\n📍 Checking contract existence:');
  for (const [name, address] of Object.entries(addresses)) {
    try {
      const code = await provider.getCode(address);
      const exists = code !== '0x';
      console.log(`   ${name}: ${exists ? '✅ DEPLOYED' : '❌ NOT FOUND'}`);
    } catch (err) {
      console.log(`   ${name}: ⚠️ Error checking`);
    }
  }
};

export default DeploymentLogger;
