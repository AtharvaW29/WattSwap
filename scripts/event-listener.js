/**
 * Event Listeners for WattSwap
 * Monitors blockchain events and updates the application state
 * 
 * Listens for:
 * - USDC transfers on Avalanche (payment confirmations)
 * - Solana SPL token transfers (for Solana payments)
 * - Smart contract events for energy orders
 */

require('dotenv').config();
const Web3 = require('web3');
const { Connection, PublicKey } = require('@solana/web3.js');
const axios = require('axios');

// Initialize Web3 for Avalanche
const web3Avalanche = new Web3(
    new Web3.providers.HttpProvider(process.env.AVAX_RPC_URL || 'https://api.avax-test.network/ext/bc/C/rpc')
);

// Initialize Solana connection
const solanaConnection = new Connection(
    process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
    'confirmed'
);

// USDC Contract ABI (Minimal - only Transfer event)
const USDC_ABI = [
    {
        "anonymous": false,
        "inputs": [
            {"indexed": true, "name": "from", "type": "address"},
            {"indexed": true, "name": "to", "type": "address"},
            {"indexed": false, "name": "value", "type": "uint256"}
        ],
        "name": "Transfer",
        "type": "event"
    }
];

// WattSwap Contract ABI (Events)
const WATTSWAP_ABI = [
    {
        "anonymous": false,
        "inputs": [
            {"indexed": true, "name": "orderId", "type": "uint256"},
            {"indexed": true, "name": "buyer", "type": "address"},
            {"indexed": true, "name": "seller", "type": "address"}
        ],
        "name": "OrderCompleted",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {"indexed": true, "name": "orderId", "type": "uint256"},
            {"indexed": false, "name": "listingId", "type": "uint256"},
            {"indexed": true, "name": "buyer", "type": "address"},
            {"indexed": false, "name": "seller", "type": "address"},
            {"indexed": false, "name": "quantity", "type": "uint256"},
            {"indexed": false, "name": "totalPrice", "type": "uint256"}
        ],
        "name": "OrderPlaced",
        "type": "event"
    }
];

class WattSwapEventListener {
    constructor() {
        this.usdcAddress = process.env.AVAX_USDC_ADDRESS || '0x5425890298aed601595a70ab815c96711a756003';
        this.wattswapAddress = process.env.WATTSWAP_CONTRACT_ADDRESS || '';
        this.solanaWalletAddress = process.env.SOLANA_WALLET_ADDRESS || '';
        this.lastBlock = 0;
        this.eventHandlers = {};
    }

    /**
     * Register event handler callback
     * @param {string} eventName - Name of event to listen for
     * @param {function} callback - Callback function
     */
    on(eventName, callback) {
        if (!this.eventHandlers[eventName]) {
            this.eventHandlers[eventName] = [];
        }
        this.eventHandlers[eventName].push(callback);
    }

    /**
     * Emit event to registered handlers
     */
    emit(eventName, data) {
        if (this.eventHandlers[eventName]) {
            this.eventHandlers[eventName].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event handler for ${eventName}:`, error);
                }
            });
        }
    }

    /**
     * Start listening to Avalanche USDC transfers
     */
    startAvalancheListener() {
        console.log('🔍 Starting Avalanche USDC listener...');
        
        const usdcContract = new web3Avalanche.eth.Contract(USDC_ABI, this.usdcAddress);
        
        // Listen for past events first
        usdcContract.getPastEvents(
            'Transfer',
            {
                filter: { to: this.wattswapAddress },
                fromBlock: 'latest',
                toBlock: 'latest'
            }
        ).then(events => {
            console.log(`✓ Found ${events.length} past USDC transfer events`);
            events.forEach(event => this.handleUSDCTransfer(event));
        }).catch(error => {
            console.error('Error getting past events:', error);
        });

        // Watch for new events
        usdcContract.events.Transfer({
            filter: { to: this.wattswapAddress }
        })
        .on('data', event => {
            console.log('💳 New USDC Transfer Event:');
            this.handleUSDCTransfer(event);
        })
        .on('error', error => {
            console.error('Avalanche listener error:', error);
            // Reconnect after error
            setTimeout(() => this.startAvalancheListener(), 5000);
        });
    }

    /**
     * Handle USDC transfer event
     */
    handleUSDCTransfer(event) {
        const {
            returnValues: { from, to, value },
            transactionHash,
            blockNumber
        } = event;

        const amountUSDC = web3Avalanche.utils.fromWei(value, 'mwei'); // USDC has 6 decimals
        
        console.log(`   From: ${from}`);
        console.log(`   To: ${to}`);
        console.log(`   Amount: ${amountUSDC} USDC`);
        console.log(`   Tx: ${transactionHash}`);
        console.log(`   Block: ${blockNumber}`);

        // Emit event for payment received
        this.emit('payment_received', {
            type: 'avalanche_usdc',
            from,
            to,
            amount: amountUSDC,
            txHash: transactionHash,
            block: blockNumber,
            timestamp: new Date().toISOString()
        });

        // Trigger order fulfillment
        this.fulfillOrderFromPayment(from, amountUSDC, 'avalanche');
    }

    /**
     * Listen to WattSwap smart contract events
     */
    startWattSwapListener() {
        if (!this.wattswapAddress) {
            console.warn('⚠️  WATTSWAP_CONTRACT_ADDRESS not configured');
            return;
        }

        console.log('🔍 Starting WattSwap contract listener...');
        
        const wattswapContract = new web3Avalanche.eth.Contract(
            WATTSWAP_ABI,
            this.wattswapAddress
        );

        // Listen for OrderCompleted events
        wattswapContract.events.OrderCompleted()
            .on('data', event => {
                console.log('✅ Order Completed Event:');
                const { returnValues: { orderId, buyer, seller } } = event;
                
                console.log(`   Order ID: ${orderId}`);
                console.log(`   Buyer: ${buyer}`);
                console.log(`   Seller: ${seller}`);

                this.emit('order_completed', {
                    orderId,
                    buyer,
                    seller,
                    timestamp: new Date().toISOString()
                });

                // Trigger energy delivery
                this.triggerEnergyDelivery(orderId);
            })
            .on('error', error => {
                console.error('WattSwap listener error:', error);
                setTimeout(() => this.startWattSwapListener(), 5000);
            });

        // Listen for OrderPlaced events
        wattswapContract.events.OrderPlaced()
            .on('data', event => {
                console.log('📋 Order Placed Event:');
                const { returnValues } = event;
                console.log(`   Order ID: ${returnValues.orderId}`);
                console.log(`   Listing ID: ${returnValues.listingId}`);
                console.log(`   Quantity: ${returnValues.quantity}`);
                console.log(`   Total Price: ${returnValues.totalPrice}`);

                this.emit('order_placed', returnValues);
            })
            .on('error', error => {
                console.error('Order placed listener error:', error);
            });
    }

    /**
     * Listen for Solana SPL token transfers (USDC on Solana)
     */
    async startSolanaListener() {
        if (!this.solanaWalletAddress) {
            console.warn('⚠️  SOLANA_WALLET_ADDRESS not configured');
            return;
        }

        console.log('🔍 Starting Solana listener...');
        
        try {
            const walletPubkey = new PublicKey(this.solanaWalletAddress);
            
            // Listen for transaction signatures
            solanaConnection.onSignature(
                walletPubkey,
                (notification) => {
                    console.log('📡 Solana Transaction Detected:');
                    console.log(`   Signature: ${notification.signature}`);
                    
                    this.handleSolanaTransaction(notification.signature);
                },
                'confirmed'
            );

            console.log('✓ Solana listener started');

        } catch (error) {
            console.error('Error starting Solana listener:', error);
        }
    }

    /**
     * Handle Solana transaction
     */
    async handleSolanaTransaction(signature) {
        try {
            const tx = await solanaConnection.getTransaction(signature);
            
            if (tx && tx.meta) {
                console.log(`   Fee: ${tx.meta.fee} lamports`);
                console.log(`   Status: ${tx.meta.err ? 'Failed' : 'Success'}`);

                // Parse transaction details for token transfers
                if (tx.transaction.message) {
                    // Extract USDC transfer amount from transaction
                    // This would require parsing the transaction instructions
                    
                    this.emit('solana_payment_received', {
                        signature,
                        fee: tx.meta.fee,
                        timestamp: new Date().toISOString()
                    });
                }
            }

        } catch (error) {
            console.error('Error handling Solana transaction:', error);
        }
    }

    /**
     * Fulfill order when payment is detected
     */
    async fulfillOrderFromPayment(payerAddress, amount, chain) {
        console.log(`\n💰 Processing payment: ${amount} USDC from ${payerAddress} on ${chain}`);
        
        try {
            // Call backend API to match payment with order
            const response = await axios.post('http://localhost:5000/api/payment-webhook', {
                payerAddress,
                amount,
                chain,
                timestamp: new Date().toISOString()
            });

            console.log('✓ Payment recorded:', response.data);
            return response.data;

        } catch (error) {
            console.error('Error fulfilling order from payment:', error.message);
        }
    }

    /**
     * Trigger energy delivery for completed order
     */
    async triggerEnergyDelivery(orderId) {
        console.log(`\n⚡ Triggering energy delivery for order ${orderId}`);
        
        try {
            // Call backend API to trigger IoT relay
            const response = await axios.post('http://localhost:5000/api/energy-delivery', {
                orderId,
                timestamp: new Date().toISOString()
            });

            console.log('✓ Energy delivery triggered:', response.data);
            return response.data;

        } catch (error) {
            console.error('Error triggering energy delivery:', error.message);
        }
    }

    /**
     * Start all listeners
     */
    startAll() {
        console.log('='.repeat(60));
        console.log('🚀 WattSwap Event Listener Starting');
        console.log('='.repeat(60));
        
        this.startAvalancheListener();
        this.startWattSwapListener();
        this.startSolanaListener();

        console.log('\n✅ All listeners started successfully');
        console.log('Listening for events...\n');
    }
}

// Export listener
module.exports = WattSwapEventListener;

// Start listener if executed directly
if (require.main === module) {
    const listener = new WattSwapEventListener();
    
    // Register event handlers
    listener.on('payment_received', (data) => {
        console.log('📍 Event handler triggered: payment_received');
    });

    listener.on('order_completed', (data) => {
        console.log('📍 Event handler triggered: order_completed');
    });

    listener.startAll();

    // Graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n\nShutting down listener...');
        process.exit(0);
    });
}
