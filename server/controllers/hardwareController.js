const { triggerRelayViaFirebase, getDeviceStatus } = require('../firebaseInit');

const switchOnRelay = async (req, res, next) => {
    const calculateTransferTime = (capacity, voltage) => {
        const capacityAh = capacity / 1000;
        const timeHours = capacityAh / voltage;
        return timeHours;
    };

    const { capacity, voltage } = req.query;

    if (!capacity || !voltage || isNaN(capacity) || isNaN(voltage)) {
        return res.status(400).json({ error: 'Invalid Input Params' });
    }

    const capacityNum = parseFloat(capacity);
    const powerNum = parseFloat(voltage);

    const transferTimeHours = calculateTransferTime(capacityNum, powerNum);

    res.json({ transferTimeHours });
};

/**
 * Trigger relay activation via Firebase
 * Called when payment is confirmed and energy delivery should start
 */
const triggerRelay = async (req, res, next) => {
    try {
        const { deviceId, energyKwh, durationHours, orderId, buyerAddress } = req.body;

        if (!deviceId || !energyKwh || !durationHours) {
            return res.status(400).json({
                error: 'Missing required fields: deviceId, energyKwh, durationHours'
            });
        }

        // Trigger relay via Firebase (works with physical ESP32 or simulator)
        const result = await triggerRelayViaFirebase(deviceId, energyKwh, durationHours, {
            order_id: orderId,
            buyer_address: buyerAddress
        });

        if (!result.success) {
            return res.status(500).json({
                error: 'Failed to trigger relay',
                details: result.error
            });
        }

        console.log(`✓ Relay triggered for ${deviceId}: ${energyKwh} kWh`);

        return res.json({
            success: true,
            message: 'Relay activated successfully',
            deviceId,
            energyKwh,
            durationHours,
            orderId
        });
    } catch (error) {
        console.error('Error triggering relay:', error);
        return res.status(500).json({ error: error.message });
    }
};

/**
 * Get device status (battery, relay, sensors)
 */
const getDeviceInfo = async (req, res, next) => {
    try {
        const { deviceId } = req.params;

        if (!deviceId) {
            return res.status(400).json({ error: 'deviceId parameter required' });
        }

        const status = await getDeviceStatus(deviceId);

        if (!status) {
            return res.status(404).json({ error: 'Device not found or offline' });
        }

        return res.json({
            deviceId,
            status,
            timestamp: Date.now()
        });
    } catch (error) {
        console.error('Error getting device status:', error);
        return res.status(500).json({ error: error.message });
    }
};

module.exports = { switchOnRelay, triggerRelay, getDeviceInfo };
