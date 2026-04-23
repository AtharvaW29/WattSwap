const express = require('express');
const router = express.Router();
const axios = require('axios');
const { Web3 } = require('web3');
const { triggerRelayViaFirebase } = require('../firebaseInit');

// Initialize Web3
const web3 = new Web3(process.env.AVAX_RPC_URL || 'https://api.avax-test.network/ext/bc/C/rpc');

// Import models (assuming they exist)
const Order = require('../models/Listings'); // Adjust based on actual model name
const Invoice = require('../models/Invoice');
const User = require('../models/User');

/**
 * POST /api/payment-webhook
 * Handles payment confirmations from blockchain
 */
router.post('/payment-webhook', async (req, res) => {
    try {
        const { payerAddress, amount, chain, transactionHash } = req.body;

        console.log(`💳 Payment webhook received:`);
        console.log(`   Payer: ${payerAddress}`);
        console.log(`   Amount: ${amount} USDC`);
        console.log(`   Chain: ${chain}`);

        // Validate input
        if (!payerAddress || !amount || !chain) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Find buyer by wallet address
        const buyer = await User.findOne({ walletAddress: payerAddress.toLowerCase() });
        if (!buyer) {
            return res.status(404).json({ error: 'Buyer not found' });
        }

        // Find pending orders for this buyer matching the amount
        const pendingOrders = await Order.find({
            buyer: buyer._id,
            status: 'pending',
            // Amount matching logic
        });

        if (pendingOrders.length === 0) {
            return res.status(404).json({ error: 'No matching pending orders' });
        }

        // Match payment to order (use first matching order)
        const order = pendingOrders[0];

        // Update order status
        order.status = 'paid';
        order.paymentHash = transactionHash;
        order.paymentChain = chain;
        order.paymentTimestamp = new Date();
        await order.save();

        console.log(`✓ Order ${order._id} marked as paid`);

        // Create invoice
        const invoice = new Invoice({
            orderId: order._id,
            buyerId: buyer._id,
            sellerId: order.seller,
            amount: amount,
            currency: 'USDC',
            chain: chain,
            transactionHash: transactionHash,
            status: 'confirmed',
            createdAt: new Date()
        });

        await invoice.save();
        console.log(`✓ Invoice created: ${invoice._id}`);

        // Emit event for real-time updates
        // (if using Socket.io or similar)

        return res.json({
            success: true,
            orderId: order._id,
            invoiceId: invoice._id,
            message: 'Payment confirmed'
        });

    } catch (error) {
        console.error('Error processing payment webhook:', error);
        return res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/energy-delivery
 * Triggers energy delivery via IoT relay
 */
router.post('/energy-delivery', async (req, res) => {
    try {
        const { orderId } = req.body;

        console.log(`⚡ Energy delivery request for order: ${orderId}`);

        // Find order
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Verify order is paid
        if (order.status !== 'paid' && order.status !== 'completed') {
            return res.status(400).json({ error: 'Order not paid' });
        }

        // Get seller details (for IoT device identification)
        const seller = await User.findById(order.seller);
        if (!seller || !seller.deviceId) {
            return res.status(404).json({ error: 'Seller device not found' });
        }

        // Trigger IoT relay
        const result = await triggerIoTRelay(
            seller.deviceId,
            order.energyQuantity,
            order.duration
        );

        if (!result.success) {
            return res.status(500).json({ error: 'Failed to trigger energy delivery' });
        }

        // Update order status
        order.status = 'completed';
        order.deliveryStarted = new Date();
        await order.save();

        console.log(`✓ Energy delivery initiated for order ${orderId}`);

        return res.json({
            success: true,
            message: 'Energy delivery initiated',
            deviceId: seller.deviceId,
            energyQuantity: order.energyQuantity
        });

    } catch (error) {
        console.error('Error triggering energy delivery:', error);
        return res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/order-status
 * Get or update order status
 */
router.post('/order-status', async (req, res) => {
    try {
        const { orderId, status } = req.body;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        if (status) {
            order.status = status;
            await order.save();
        }

        return res.json({
            orderId: order._id,
            status: order.status,
            buyer: order.buyer,
            seller: order.seller,
            amount: order.amount,
            timestamp: order.createdAt
        });

    } catch (error) {
        console.error('Error getting order status:', error);
        return res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/blockchain-status
 * Health check for blockchain integration
 */
router.get('/blockchain-status', async (req, res) => {
    try {
        // Check Avalanche RPC connection
        const blockNumber = await web3.eth.getBlockNumber();
        const gasPrice = await web3.eth.getGasPrice();

        return res.json({
            status: 'connected',
            network: 'Avalanche',
            blockNumber: blockNumber,
            gasPrice: web3.utils.fromWei(gasPrice, 'gwei') + ' Gwei',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Blockchain connection error:', error);
        return res.status(500).json({
            status: 'disconnected',
            error: error.message
        });
    }
});

/**
 * Helper function to trigger IoT relay via Firebase
 * Works with both physical ESP32 devices and virtual simulator
 */
async function triggerIoTRelay(deviceId, energyQuantity, duration) {
    try {
        console.log(`🔌 Triggering IoT device: ${deviceId}`);
        console.log(`   Energy: ${energyQuantity} units`);
        console.log(`   Duration: ${duration} minutes`);

        // Send command to relay/smart meter via Firebase
        const durationHours = (duration || 60) / 60; // Convert minutes to hours
        const result = await triggerRelayViaFirebase(
            deviceId,
            energyQuantity,
            durationHours
        );

        if (result.success) {
            console.log(`✓ Device ${deviceId} relay triggered via Firebase`);
            return { success: true, deviceId, message: 'Device triggered' };
        } else {
            console.error(`✗ Failed to trigger device ${deviceId}:`, result.error);
            return { success: false, error: result.error };
        }
    } catch (error) {
        console.error('Error triggering IoT relay:', error);
        return { success: false, error: error.message };
    }
}

/**
 * POST /api/usdc-balance
 * Get USDC balance for user
 */
router.post('/usdc-balance', async (req, res) => {
    try {
        const { walletAddress } = req.body;

        if (!walletAddress) {
            return res.status(400).json({ error: 'Wallet address required' });
        }

        // Check escrow balance on smart contract
        // This would require calling the WattSwap contract
        // For now, return mock data
        
        return res.json({
            walletAddress: walletAddress,
            balance: '0',
            lockedBalance: '0',
            availableBalance: '0',
            currency: 'USDC',
            chain: 'avalanche'
        });

    } catch (error) {
        console.error('Error getting USDC balance:', error);
        return res.status(500).json({ error: error.message });
    }
});

module.exports = router;
