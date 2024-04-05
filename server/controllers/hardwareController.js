const switchOnRelay = async (req, res, next) => {
    const calculateTransferTime = (capacity, voltage) => {
        const capacityAh = capacity/1000;

        const timeHours = capacityAh / voltage

        return timeHours
    }
    const { capacity, voltage } = req.query;

    if(!capacity || !voltage || isNaN(capacity) || isNaN(voltage)) {
        return res.status(400).json({ error: 'Invalid Input Params' })
    }

    const capacityNum = parseFloat(capacity);
    const powerNum = parseFloat(voltage);

    const transferTimeHours= calculateTransferTime(capacityNum, powerNum);

    res.json({ transferTimeHours })
}

module.exports = { switchOnRelay }