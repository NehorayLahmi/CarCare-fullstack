const express = require('express');
const User = require('../models/User');

const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

// שליפת פרופיל המשתמש המחובר
router.get('/', async (req, res) => {
  try {
    const user = await User.findOne({ id: req.user.id }, '-password -resetCode -resetCodeExpires');
    if (!user) return res.status(404).send('משתמש לא נמצא');
    res.json(user);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// עדכון פרטי פרופיל (שם, מייל, טלפון)
router.put('/', async (req, res) => {
  const { name, email, phone } = req.body;
  try {
    const user = await User.findOneAndUpdate(
      { id: req.user.id },
      { name, email, phone },
      { new: true, projection: '-password -resetCode -resetCodeExpires' }
    );
    if (!user) return res.status(404).send('משתמש לא נמצא');
    res.json(user);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
