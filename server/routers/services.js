const express = require('express');
const Service = require('../models/Service');
const Vehicle = require('../models/Vehicle');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

const ownsVehicle = async (userId, vehicleId) => {
  const v = await Vehicle.findOne({ licensePlate: vehicleId, userId });
  return !!v;
};

// הוספת טיפול לרכב
router.post('/', async (req, res) => {
    const { vehicleId, type, date, cost, note, garageName, kilometer } = req.body;
    try {
        if (!(await ownsVehicle(req.user.id, vehicleId)))
            return res.status(403).send('אין הרשאה לרכב זה');
        const service = await Service.create({ vehicleId, type, date, cost, note, garageName, kilometer });
        res.status(201).send(service);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// קבלת טיפולים לרכב
router.get('/:vehicleId', async (req, res) => {
    try {
        if (!(await ownsVehicle(req.user.id, req.params.vehicleId)))
            return res.status(403).send('אין הרשאה לרכב זה');
        const services = await Service.find({ vehicleId: req.params.vehicleId }).sort({ date: -1 });
        res.send(services);
    } catch (err) {
        res.status(500).send(err.message);
    }
});


router.put('/:id', async (req, res) => {
    const { type, date, cost, note, garageName, kilometer } = req.body;
    try {
        const existing = await Service.findById(req.params.id);
        if (!existing) return res.status(404).send('Service not found');
        if (!(await ownsVehicle(req.user.id, existing.vehicleId)))
            return res.status(403).send('אין הרשאה לרכב זה');
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
        const service = await Service.findById(req.params.id);
        if (!service) return res.status(404).send('Service not found');
        if (!(await ownsVehicle(req.user.id, service.vehicleId)))
            return res.status(403).send('אין הרשאה לרכב זה');
        await Service.findByIdAndDelete(req.params.id);
        res.send(service);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

module.exports = router;
