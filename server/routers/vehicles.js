const express = require('express');
const Vehicle = require('../models/Vehicle');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

// הוספת רכב
router.post('/', async (req, res) => {
  const { licensePlate, model, year, kilometer } = req.body;
  if (!licensePlate || !model || !year) {
    return res.status(400).send('נא למלא את כל השדות');
  }
  const yearNum = Number(year);
  if (isNaN(yearNum) || !Number.isInteger(yearNum) || yearNum < 1886 || yearNum > new Date().getFullYear() + 1) {
    return res.status(400).send('שנת ייצור לא תקינה');
  }
  const licensePlateTrimmed = Number(licensePlate.trim());
  if (!Number.isInteger(licensePlateTrimmed) || licensePlate.length < 5 || licensePlate.length > 8) {
    return res.status(400).send('מספר רישוי לא תקין');
  }
  const kilometerNum = Number(kilometer);
  if (!Number.isInteger(kilometerNum) || kilometerNum < 0 || isNaN(kilometerNum)) {
    return res.status(400).send('קילומטרז\' לא תקין');
  }


  try {
    const exists = await Vehicle.findOne({ userId: req.user.id, licensePlate });
    if (exists) return res.status(400).send('רכב כבר קיים במערכת');
    const vehicle = await Vehicle.create({
      userId: req.user.id,
      licensePlate,
      model,
      year,
      kilometer: kilometer || 0

    });
    res.status(201).send(vehicle);
  } catch (err) {
    res.status(500).send(err.message);
  }
});







// כל הרכבים של המשתמש
router.get('/', async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ userId: req.user.id });
    //console.log(`User vehicles: ${vehicles}`);
    res.send(vehicles);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// פרטי רכב בודד
router.get('/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({ _id: req.params.id, userId: req.user.id });
    console.log(vehicle);
    if (!vehicle) return res.status(404).send("רכב לא נמצא");
    res.send(vehicle);
  } catch (err) {
    res.status(500).send(err.message);
  }
});



// עדכון קילומטרז' לפי licensePlate (או לפי _id אם תרצה)
router.put('/:licensePlate/kilometer', async (req, res) => {
  try {
    const { kilometer } = req.body;
    if (typeof kilometer !== 'number') {
      return res.status(400).send('ערך קילומטרז\' לא תקין');
    }
    const vehicle = await Vehicle.findOneAndUpdate(
      { licensePlate: req.params.licensePlate, userId: req.user.id },
      { kilometer },
      { new: true }
    );
    if (!vehicle) return res.status(404).send('רכב לא נמצא');
    res.send(vehicle);
  } catch (err) {
    res.status(500).send(err.message);
  }
});


// עדכון קילומטרז' לפי licensePlate (או לפי _id אם תרצה)
router.put('/:licensePlate/kilometer', async (req, res) => {
  try {
    const { kilometer } = req.body;
    if (typeof kilometer !== 'number') {
      return res.status(400).send('ערך קילומטרז\' לא תקין');
    }
    const vehicle = await Vehicle.findOneAndUpdate(
      { licensePlate: req.params.licensePlate, userId: req.user.id },
      { kilometer },
      { new: true }
    );
    if (!vehicle) return res.status(404).send('רכב לא נמצא');
    res.send(vehicle);
  } catch (err) {
    res.status(500).send(err.message);
  }
});



// מחיקת רכב
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Vehicle.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!deleted) return res.status(404).send("רכב לא נמצא");
    res.send({ success: true });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
