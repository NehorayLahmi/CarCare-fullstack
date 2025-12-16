const express = require('express');
const router = express.Router();
const Transfer = require('../models/transfer');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle'); // ודא שהנתיב נכון

// יצירת בקשת העברה - עם בדיקת קיום משתמש
router.post('/', async (req, res) => {
  const { licensePlate, toId } = req.body;
  if (!licensePlate || !toId) {
    return res.status(400).json({ message: 'חסרים נתונים' });
  }
  try {
    // בדוק אם המשתמש המקבל קיים
    const toUser = await User.findOne({ id: toId });
    if (!toUser) {
      return res.status(404).json({ message: 'המשתמש לא קיים במערכת' });
    }

    // אפשר להוסיף בדיקה דומה גם לשולח אם צריך

    const transfer = new Transfer({ licensePlate, toId, status: 'pending' });
    await transfer.save();
    res.status(201).json({ message: 'הבקשה נוצרה', transfer });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// שליפת בקשות העברה עם אפשרות לסינון לפי toId, status
router.get('/', async (req, res) => {
  try {
    const { toId, status } = req.query;
    const filter = {};
    if (toId) filter.toId = toId;
    if (status) filter.status = status;

    const transfers = await Transfer.find(filter);
    res.json(transfers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// אישור/דחיית בקשה
router.post('/:id/respond', async (req, res) => {
  const { decision } = req.body; // 'approved' או 'rejected'
  if (!['approved', 'rejected'].includes(decision)) {
    return res.status(400).json({ message: 'החלטה לא תקינה' });
  }
  try {
    const transfer = await Transfer.findById(req.params.id);
    if (!transfer) return res.status(404).json({ message: 'בקשה לא נמצאה' });

    transfer.status = decision;
    await transfer.save();

    // אם הבקשה אושרה - עדכן את הבעלות ברכב
          console.log(`עדכון בעלות לרכב ${transfer.licensePlate} למשתמש ${transfer.toId}`);

    if (decision === 'approved') {
      const updatedVehicle = await Vehicle.findOneAndUpdate(
        { licensePlate: transfer.licensePlate },
        { userId: transfer.toId }, // שנה ל-ownerId אם זה שם השדה אצלך
        { new: true }
      );
      if (!updatedVehicle) {
        return res.status(404).json({ message: 'הרכב לא נמצא, הבעלות לא עודכנה' });
      }
    }

    res.json({ message: 'עודכן בהצלחה', transfer });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
