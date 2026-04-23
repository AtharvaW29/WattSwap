/**
 * Bridging Script for Circle CCTP (Cross-Chain Transfer Protocol)
 * Bridges USDC across blockchain networks using Circle's infrastructure
 * 
 * This script enables WattSwap to move USDC liquidity between chains
 * Example: Ethereum -> Avalanche, Solana -> Ethereum, etc.
 */

require('dotenv').config();
const Web3 = require('web3');
const { ethers } = require('ethers');

// Initialize Web3 instances for different chains
const web3Avalanche = new Web3(process.env.AVAX_MAINNET_RPC || 'https://api.avax.network/ext/bc/C/rpc');
const web3Ethereum = new Web3('https://mainnet.infura.io/v3/' + process.env.PROJECT_ID);

// USDC contract ABI (minimal)
const USDC_ABI = [
    {
        "constant": false,
        "inputs": [
            {"name": "_to", "type": "address"},
            {"name": "_value", "type": "uint256"}
        ],
        "name": "transfer",
        "outputs": [{"name": "", "type": "bool"}],
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [{"name": "_owner", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"name": "balance", "type": "uint256"}],
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {"name": "_spender", "type": "address"},
            {"name": "_value", "type": "uint256"}
        ],
        "name": "approve",
        "outputs": [{"name": "", "type": "bool"}],
        "type": "function"
    }
];

// Circle Gateway Bridge Gateway ABI (simplified)
const CIRCLE_GATEWAY_ABI = [
    {
        "inputs": [
            {"internalType": "uint256", "name": "amount", "type": "uint256"},
            {"internalType": "uint32", "name": "destinationDomain", "type": "uint32"},
            {"internalType": "bytes32", "name": "mintRecipient", "type": "bytes32"}
        ],
        "name": "depositForBurn",
        "outputs": [{"internalType": "uint64", "name": "", "type": "uint64"}],
        "type": "function",
        "stateMutability": "nonpayable"
    }
];

// Configuration for different chains
const CHAIN_CONFIG = {
    ethereum: {
        rpc: 'https://mainnet.infura.io/v3/' + process.env.PROJECT_ID,
        chainId: 1,
        circleDomain: 0,
        usdcAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        gatewayAddress: '0xBD3fa81B58BA92a82136038B25aDec7066af3155'
    },
    avalanche: {
        rpc: process.env.AVAX_MAINNET_RPC || 'https://api.avax.network/ext/bc/C/rpc',
        chainId: 43114,
        circleDomain: 1,
        usdcAddress: '0xB97EF9Ef8734C71904D8002F1e9bB1E1f341F8c',
        gatewayAddress: '0x16CDA4028CDAb756311c4581A47DD1E38b42b122'
    },
    solana: {
        network: 'mainnet-beta',
        circleDomain: 5,
        usdcMint: 'EPjFWaLb3odcccccccccccccccccccccccccccccccc'
    }
};

/**
 * Bridge USDC from source chain to destination chain using Circle CCTP
 * @param {string} sourceChain - Source blockchain (ethereum, avalanche)
 * @param {string} destinationChain - Destination blockchain
 * @param {string} amount - Amount of USDC to bridge (in smallest units)
 * @param {string} recipientAddress - Recipient address on destination chain
 */
async function bridgeUSDC(sourceChain, destinationChain, amount, recipientAddress) {
    try {
        console.log(`\n🌉 Starting USDC bridge from ${sourceChain} to ${destinationChain}`);
        console.log(`Amount: ${amount}, Recipient: ${recipientAddress}`);
        
        const sourceConfig = CHAIN_CONFIG[sourceChain];
        const destConfig = CHAIN_CONFIG[destinationChain];
        
        if (!sourceConfig || !destConfig) {
            throw new Error(`Invalid chain configuration for ${sourceChain} or ${destinationChain}`);
        }
        
        // Initialize provider
        const provider = new ethers.providers.JsonRpcProvider(sourceConfig.rpc);
        const wallet = new ethers.Wallet(process.env.AVAX_MNEMONIC, provider);
        
        // Initialize USDC contract
        const usdcContract = new ethers.Contract(
            sourceConfig.usdcAddress,
            USDC_ABI,
            wallet
        );
        
        // Check balance
        const balance = await usdcContract.balanceOf(wallet.address);
        console.log(`💰 Wallet USDC balance: ${ethers.utils.formatUnits(balance, 6)} USDC`);
        
        if (balance < amount) {
            throw new Error(`Insufficient USDC balance. Have ${balance}, need ${amount}`);
        }
        
        // Initialize Circle Gateway contract
        const gatewayContract = new ethers.Contract(
            sourceConfig.gatewayAddress,
            CIRCLE_GATEWAY_ABI,
            wallet
        );
        
        // Step 1: Approve USDC transfer to gateway
        console.log(`\n✅ Step 1: Approving USDC transfer to Circle Gateway...`);
        const approveTx = await usdcContract.approve(sourceConfig.gatewayAddress, amount);
        await approveTx.wait();
        console.log(`✓ Approval confirmed. Tx: ${approveTx.hash}`);
        
        // Step 2: Initiate bridge
        console.log(`\n✅ Step 2: Initiating bridge via Circle Gateway...`);
        
        // Convert recipient address to bytes32 format (padding with zeros)
        const recipient32 = ethers.utils.hexZeroPad(recipientAddress, 32);
        
        const bridgeTx = await gatewayContract.depositForBurn(
            amount,
            destConfig.circleDomain,
            recipient32,
            sourceConfig.usdcAddress
        );
        
        console.log(`⏳ Waiting for transaction confirmation...`);
        const receipt = await bridgeTx.wait();
        console.log(`✓ Bridge initiated. Tx: ${bridgeTx.hash}`);
        console.log(`✓ Gas used: ${receipt.gasUsed.toString()}`);
        
        // Step 3: Get attestation from Circle
        console.log(`\n✅ Step 3: Waiting for Circle attestation...`);
        console.log(`This typically takes 5-10 minutes`);
        
        // Extract nonce from transaction logs
        const burnEvent = receipt.logs
            .map(log => {
                try {
                    return usdcContract.interface.parseLog(log);
                } catch (e) {
                    return null;
                }
            })
            .find(event => event && event.name === 'Burn');
        
        if (burnEvent) {
            console.log(`✓ Burn event found. Nonce: ${burnEvent.args.nonce}`);
        }
        
        console.log(`\n✅ Bridge initiated successfully!`);
        console.log(`Source Tx: ${bridgeTx.hash}`);
        console.log(`Status: Waiting for attestation from Circle...`);
        console.log(`Next step: Complete the bridge on the destination chain`);
        
        return {
            success: true,
            sourceTx: bridgeTx.hash,
            amount: ethers.utils.formatUnits(amount, 6),
            sourceChain,
            destinationChain,
            recipient: recipientAddress
        };
        
    } catch (error) {
        console.error(`❌ Bridge error:`, error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Monitor bridge transaction status
 * @param {string} txHash - Transaction hash on source chain
 * @param {string} sourceChain - Source blockchain
 */
async function checkBridgeStatus(txHash, sourceChain) {
    try {
        const sourceConfig = CHAIN_CONFIG[sourceChain];
        const provider = new ethers.providers.JsonRpcProvider(sourceConfig.rpc);
        
        const receipt = await provider.getTransactionReceipt(txHash);
        
        if (!receipt) {
            console.log(`Transaction not found or still pending: ${txHash}`);
            return { status: 'pending' };
        }
        
        console.log(`✓ Transaction confirmed`);
        console.log(`Block: ${receipt.blockNumber}`);
        console.log(`Gas used: ${receipt.gasUsed.toString()}`);
        
        return { status: 'confirmed', receipt };
        
    } catch (error) {
        console.error(`Error checking bridge status:`, error.message);
        return { status: 'error', error: error.message };
    }
}

/**
 * Example usage for different bridge scenarios
 */
async function runBridgeExamples() {
    console.log('='.repeat(60));
    console.log('WattSwap Circle CCTP Bridge Script');
    console.log('='.repeat(60));
    
    // Example 1: Bridge 100 USDC from Ethereum to Avalanche
    const amount = ethers.utils.parseUnits('100', 6); // 100 USDC
    const recipientAddress = process.env.WATTSWAP_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';
    
    console.log('\n📝 Example: Bridge 100 USDC from Ethereum to Avalanche');
    console.log('Recipient:', recipientAddress);
    
    // Uncomment to execute
    // const result = await bridgeUSDC('ethereum', 'avalanche', amount.toString(), recipientAddress);
    // console.log('Result:', result);
}

// Export functions for use in other scripts
module.exports = {
    bridgeUSDC,
    checkBridgeStatus,
    CHAIN_CONFIG
};

// Run examples if executed directly
if (require.main === module) {
    runBridgeExamples().catch(console.error);
}
