const express = require('express');
const Service = require('../models/Service');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

// הוספת טיפול לרכב
router.post('/', async (req, res) => {
    const { vehicleId, type, date, cost, note, garageName, kilometer } = req.body;
    try {
        const service = await Service.create({ vehicleId, type, date, cost, note, garageName, kilometer });
        res.status(201).send(service);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// קבלת טיפולים לרכב
router.get('/:vehicleId', async (req, res) => {
    try {
        const services = await Service.find({ vehicleId: req.params.vehicleId }).sort({ date: -1 });
        res.send(services);
    } catch (err) {
        res.status(500).send(err.message);
    }
});


router.put('/:id', async (req, res) => {
    const { type, date, cost, note, garageName, kilometer } = req.body;
    try {
        const service = await Service.findByIdAndUpdate(
            req.params.id,
            { type, date, cost, note, garageName, kilometer },
            { new: true }
        );
        if (!service) {
            return res.status(404).send('Service not found');
        }
        res.send(service);
    } catch (err) {
        res.status(500).send(err.message);
    }
});


router.delete('/:id', async (req, res) => {
    try {
        const service = await Service.findByIdAndDelete(req.params.id);
        if (!service) {
            return res.status(404).send('Service not found');
        }
        res.send(service);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

module.exports = router;
