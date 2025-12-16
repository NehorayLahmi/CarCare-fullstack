const express = require('express');
const router = express.Router();
const ModelService = require('../models/modelService');
const auth = require('../middleware/auth');

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).send('אין הרשאה');
  next();
};


router.get('/', auth, async (req, res) => {
  try {
    const services = await ModelService.find();
    res.json(services);
  } catch (err) {
    res.status(500).send(err.message);
  }
});





// הוצאת טיפולים לפי יצרן ודגם (GET)
router.get('/:tozeret_nm/:degem_nm', auth, async (req, res) => {
  const tozeret = req.params.tozeret_nm.trim();
  const degem = req.params.degem_nm.trim();

  console.log('Received tozeret:', tozeret, ', degem:', degem);

  try {
    const services = await ModelService.find({ tozeret_nm: tozeret, degem_nm: degem });
    console.log('Found services:', services);
    res.json(services);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});


// הוספת טיפול חדש
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const service = new ModelService(req.body);
    if (!service.tozeret_nm || !service.degem_nm) {
      return res.status(400).json({ message: 'tozeret_nm ו-degem_nm הם שדות חובה' });
    }
    if (service.serviceIntervalKm != null) {
      if (typeof service.serviceIntervalKm !== 'number' || !Number.isInteger(service.serviceIntervalKm) || service.serviceIntervalKm < 0) {
        return res.status(400).json({ message: 'מרחק חייב להיות מספר שלם תקין וללא אותיות' });
      }
    }

    if (service.serviceIntervalMonths == null) {
      return res.status(400).json({ message: 'יש לספק מספר חודשים תקין' });
    }
    if (typeof service.serviceIntervalMonths !== 'number' || !Number.isInteger(service.serviceIntervalMonths) || service.serviceIntervalMonths < 0) {
      return res.status(400).json({ message: 'מספר חודשים חייב להיות מספר שלם תקין וללא אותיות' });
    }

    if (service.averageCost != null) {
      if (typeof service.averageCost !== 'number' || service.averageCost < 0) {
        return res.status(400).json({ message: 'עלות ממוצעת חייבת להיות מספר חיובי וללא אותיות' });
      }
    }



    await service.save();
    res.status(201).json(service);
  } catch (err) {
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: 'Validation failed', errors });
    }
    res.status(500).send(err.message);
  }
});

// עדכון טיפולים לפי יצרן ודגם (PUT)
router.put('/:tozeret_nm/:degem_nm', auth, adminOnly, async (req, res) => {
  try {
    const filter = { tozeret_nm: req.params.tozeret_nm, degem_nm: req.params.degem_nm };

    // אפשר לעדכן את כל המסמכים שמתאימים ליצרן ודגם
    // אם ברצונך לעדכן רק מסמך ספציפי - יש צורך במזהה ייחודי (id)
    const updateResult = await ModelService.updateMany(filter, req.body, { runValidators: true });

    if (updateResult.matchedCount === 0) {
      return res.status(404).send('טיפול לא נמצא לעדכון');
    }

    res.json({ message: 'טיפולים עודכנו בהצלחה', modifiedCount: updateResult.modifiedCount });
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// מחיקת טיפולים לפי יצרן ודגם
router.delete('/:tozeret_nm/:degem_nm', auth, adminOnly, async (req, res) => {
  try {
    const filter = { tozeret_nm: req.params.tozeret_nm, degem_nm: req.params.degem_nm };
    const deleteResult = await ModelService.deleteMany(filter);

    if (deleteResult.deletedCount === 0) {
      return res.status(404).send('לא נמצאו טיפולים למחיקה');
    }

    res.json({ message: 'טיפולים נמחקו בהצלחה', deletedCount: deleteResult.deletedCount });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
