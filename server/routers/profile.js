const express = require('express');
const Service = require('../models/Service');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

// הוספת טיפול
router.post('/', async (req, res) => {
  const { vehicleId, type, date, cost, note } = req.body;
  try {
    const service = await Service.create({ vehicleId, type, date, cost, note });
    res.status(201).send(service);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// טיפולים לרכב מסוים
router.get('/:vehicleId', async (req, res) => {
  try {
    const services = await Service.find({ vehicleId: req.params.vehicleId }).sort({ date: -1 });
    res.send(services);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
