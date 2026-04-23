/**
 * BLOCKCHAIN STABILIZATION - VERIFICATION CHECKLIST
 * 
 * This script provides an interactive checklist for verifying the blockchain layer
 * Run this from the browser console after following the BLOCKCHAIN_STABILIZATION_GUIDE.md
 */

// Color codes for console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = (message, status = 'info') => {
  const timestamp = new Date().toLocaleTimeString();
  let color = colors.blue;
  let symbol = 'ℹ️ ';
  
  if (status === 'success') {
    color = colors.green;
    symbol = '✅ ';
  } else if (status === 'error') {
    color = colors.red;
    symbol = '❌ ';
  } else if (status === 'warning') {
    color = colors.yellow;
    symbol = '⚠️  ';
  }
  
  console.log(`${color}${symbol}[${timestamp}] ${message}${colors.reset}`);
};

// Main verification suite
export const BlockchainVerification = {
  
  checkMetaMaskInstalled: async () => {
    log('Checking MetaMask installation...');
    if (!window.ethereum) {
      log('MetaMask not detected', 'error');
      return false;
    }
    log('MetaMask detected', 'success');
    return true;
  },

  checkGanacheConnection: async () => {
    log('Checking Ganache connection...');
    if (!window.ethereum) {
      log('MetaMask not available', 'error');
      return false;
    }

    try {
      const { ethers } = window;
      if (!ethers) {
        log('ethers.js not available in window', 'error');
        return false;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      
      log(`Connected to network: ${network.name} (Chain ID: ${network.chainId})`, 'success');
      
      if (network.chainId !== 5777n && network.chainId !== 1337n) {
        log('⚠️  Warning: Not connected to Ganache. Expected chain ID 5777 or 1337, got ' + network.chainId, 'warning');
      }
      
      return true;
    } catch (err) {
      log(`Failed to connect: ${err.message}`, 'error');
      return false;
    }
  },

  checkMetaMaskAccount: async () => {
    log('Checking MetaMask account...');
    if (!window.ethereum) {
      log('MetaMask not available', 'error');
      return false;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      
      if (!accounts || accounts.length === 0) {
        log('No accounts in MetaMask. Please connect an account.', 'warning');
        return false;
      }

      log(`Connected account: ${accounts[0]}`, 'success');
      return true;
    } catch (err) {
      log(`Failed to get accounts: ${err.message}`, 'error');
      return false;
    }
  },

  checkContractDeployment: async (contractName, contractAddress) => {
    log(`Checking if ${contractName} is deployed at ${contractAddress}...`);
    
    if (!window.ethereum || !window.ethers) {
      log('MetaMask or ethers not available', 'error');
      return false;
    }

    try {
      const { ethers } = window;
      const provider = new ethers.BrowserProvider(window.ethereum);
      const code = await provider.getCode(contractAddress);
      
      if (code === '0x') {
        log(`${contractName} not found at address`, 'error');
        return false;
      }

      log(`${contractName} is deployed`, 'success');
      return true;
    } catch (err) {
      log(`Failed to check deployment: ${err.message}`, 'error');
      return false;
    }
  },

  checkTokenBalance: async (tokenAddress, walletAddress) => {
    log(`Checking token balance for ${walletAddress}...`);
    
    if (!window.ethereum || !window.ethers) {
      log('MetaMask or ethers not available', 'error');
      return null;
    }

    try {
      const { ethers } = window;
      const provider = new ethers.BrowserProvider(window.ethereum);

      // Minimal ERC20 ABI
      const erc20Abi = [
        'function balanceOf(address account) view returns (uint256)',
        'function name() view returns (string)',
        'function symbol() view returns (string)',
        'function decimals() view returns (uint8)',
        'function totalSupply() view returns (uint256)'
      ];

      const contract = new ethers.Contract(tokenAddress, erc20Abi, provider);
      
      const [balance, name, symbol, decimals] = await Promise.all([
        contract.balanceOf(walletAddress),
        contract.name(),
        contract.symbol(),
        contract.decimals()
      ]);

      const formattedBalance = ethers.formatUnits(balance, decimals);
      
      log(`${symbol} Balance: ${formattedBalance} (${name})`, 'success');
      return {
        raw: balance.toString(),
        formatted: formattedBalance,
        symbol,
        decimals: decimals.toString()
      };
    } catch (err) {
      log(`Failed to check balance: ${err.message}`, 'error');
      return null;
    }
  },

  checkBalanceViewer: async (balanceViewerAddress, tokenAddress, walletAddress) => {
    log(`Checking BalanceViewer contract...`);
    
    if (!window.ethereum || !window.ethers) {
      log('MetaMask or ethers not available', 'error');
      return false;
    }

    try {
      const { ethers } = window;
      const provider = new ethers.BrowserProvider(window.ethereum);

      const balanceViewerAbi = [
        'function getTokenBalance(address tokenAddress, address walletAddress) view returns (uint256)'
      ];

      const contract = new ethers.Contract(balanceViewerAddress, balanceViewerAbi, provider);
      const balance = await contract.getTokenBalance(tokenAddress, walletAddress);
      
      const formattedBalance = ethers.formatEther(balance);
      log(`BalanceViewer returned: ${formattedBalance} tokens`, 'success');
      
      return {
        raw: balance.toString(),
        formatted: formattedBalance
      };
    } catch (err) {
      log(`BalanceViewer check failed: ${err.message}`, 'error');
      return null;
    }
  },

  checkEnergyAvailability: async (energyContractAddress, availablePower, requestedAmount) => {
    log(`Checking energy availability: ${availablePower} >= ${requestedAmount}...`);
    
    if (!window.ethereum || !window.ethers) {
      log('MetaMask or ethers not available', 'error');
      return false;
    }

    try {
      const { ethers } = window;
      const provider = new ethers.BrowserProvider(window.ethereum);

      const energyAbi = [
        'function isEnergyAvailable(uint256 availablePower, uint256 amount) view returns (bool)'
      ];

      const contract = new ethers.Contract(energyContractAddress, energyAbi, provider);
      const result = await contract.isEnergyAvailable(availablePower, requestedAmount);
      
      if (result) {
        log(`Energy available: YES`, 'success');
      } else {
        log(`Energy available: NO (insufficient)`, 'warning');
      }
      
      return result;
    } catch (err) {
      log(`Energy check failed: ${err.message}`, 'error');
      return false;
    }
  },

  fullDiagnostic: async (config = {}) => {
    const defaults = {
      tokenAddress: "0x55Aa1139351D41329e4806611a957E76c162D0de",
      balanceViewerAddress: "0x3CB6799Ee99227f484c025DbD33A46D0093b0291",
      energyContractAddress: "0xDB34b5f7ED7cE4400A38b4Af1FF357E00Bd48F5C"
    };

    const settings = { ...defaults, ...config };

    console.log(`\n${'='.repeat(60)}`);
    console.log('🔍 BLOCKCHAIN STABILIZATION - FULL DIAGNOSTIC');
    console.log('='.repeat(60)\n);

    let passedChecks = 0;
    let totalChecks = 0;

    // Check 1: MetaMask
    totalChecks++;
    if (await this.checkMetaMaskInstalled()) passedChecks++;

    // Check 2: Ganache Connection
    totalChecks++;
    if (await this.checkGanacheConnection()) passedChecks++;

    // Check 3: Account
    totalChecks++;
    let account = null;
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      account = accounts[0];
      if (accounts.length > 0) passedChecks++;
    } catch (err) {
      log('Could not get account', 'error');
    }

    // Check 4-6: Contract Deployments
    totalChecks += 3;
    if (await this.checkContractDeployment('WTSWPToken', settings.tokenAddress)) passedChecks++;
    if (await this.checkContractDeployment('BalanceViewer', settings.balanceViewerAddress)) passedChecks++;
    if (await this.checkContractDeployment('EnergyAvailability', settings.energyContractAddress)) passedChecks++;

    // Check 7: Token Balance (if account available)
    totalChecks++;
    if (account) {
      const balance = await this.checkTokenBalance(settings.tokenAddress, account);
      if (balance) passedChecks++;
    }

    // Check 8: BalanceViewer (if account available)
    totalChecks++;
    if (account) {
      const viewerBalance = await this.checkBalanceViewer(
        settings.balanceViewerAddress,
        settings.tokenAddress,
        account
      );
      if (viewerBalance) passedChecks++;
    }

    // Check 9: Energy Check
    totalChecks++;
    const energyOk = await this.checkEnergyAvailability(settings.energyContractAddress, 100, 50);
    if (energyOk !== false) passedChecks++;

    console.log(`\n${'='.repeat(60)}`);
    console.log(`📊 RESULTS: ${passedChecks}/${totalChecks} checks passed`);
    console.log('='.repeat(60)\n);

    if (passedChecks === totalChecks) {
      log('✅ ALL CHECKS PASSED - Blockchain layer is stable!', 'success');
    } else {
      const failed = totalChecks - passedChecks;
      log(`⚠️  ${failed} check(s) failed - See details above`, 'warning');
    }

    return {
      passed: passedChecks,
      total: totalChecks,
      success: passedChecks === totalChecks
    };
  }
};

// Export for use
export default BlockchainVerification;

// Usage in browser console:
// BlockchainVerification.fullDiagnostic()
// BlockchainVerification.fullDiagnostic({ tokenAddress: '0x...', ... })
