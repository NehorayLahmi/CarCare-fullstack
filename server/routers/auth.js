const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const nodemailer = require('nodemailer');

const router = express.Router();

// הגדרת Nodemailer transporter בראש הקובץ
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // כתובת הג'ימייל שלך
    pass: process.env.EMAIL_PASS  // סיסמת אפליקציה (App Password)
  },
});

// פונקציה ליצירת קוד רנדומלי בן 6 ספרות
const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

// הרשמה
router.post('/register', async (req, res) => {
  const { id, name, email, phone, password } = req.body;
  if (!id || !name || !email || !phone || !password)
    return res.status(400).send("שדות חסרים");

  try {
    const existing = await User.findOne({ id });
    if (existing) return res.status(409).send("משתמש כבר קיים");

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ id, name, email, phone, password: hashedPassword });
    console.log(`User registered: ${hashedPassword}`);

    res.status(201).send("נרשמת בהצלחה");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// התחברות
router.post('/login', async (req, res) => {
  const { id, password } = req.body;
  if (!id || !password)
    return res.status(400).send("שדות חסרים");

  try {
    const user = await User.findOne({ id });
    if (!user) return res.status(404).send("משתמש לא נמצא");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).send("סיסמה לא נכונה");

    const token = jwt.sign(
      { id: user.id, role: user.role },  // <-- הוסף כאן את ה-role
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log(`User logged in: ${token}`);

    res.json({ token });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// שליחת קוד אימות לאיפוס סיסמה
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'מייל לא נמצא' });

  const code = generateCode();
  const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 דקות

  user.resetCode = code;
  user.resetCodeExpires = expires;
  await user.save();

  // שליחת מייל עם הקוד
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'קוד לאיפוס סיסמה',
    text: `קוד האימות שלך הוא: ${code}`,
    html: `<div>
      <p>קוד האימות שלך לאיפוס סיסמה:</p>
      <h2>${code}</h2>
      <p>.הקוד בתוקף ל-15 דקות</p>
    </div>`
  });

  res.json({ message: "קוד אימות נשלח למייל" });
});

// אימות קוד איפוס
router.post('/verify-reset-code', async (req, res) => {
  const { email, code } = req.body;
  const user = await User.findOne({ email });
  if (!user || !user.resetCode || !user.resetCodeExpires)
    return res.status(400).json({ message: 'יש לבקש קוד חדש' });

  if (String(user.resetCode) !== String(code))
    return res.status(401).json({ message: 'קוד שגוי' });


  if (user.resetCodeExpires < new Date())
    return res.status(401).json({ message: 'הקוד פג תוקף' });

  res.json({ message: "קוד אומת בהצלחה" });
});

// איפוס הסיסמה בפועל
router.post('/reset-password', async (req, res) => {
  const { email, code, newPassword } = req.body;
  const user = await User.findOne({ email });
  if (!user || !user.resetCode || !user.resetCodeExpires)
    return res.status(400).json({ message: 'יש לבקש קוד חדש' });

  if (user.resetCode !== code)
    return res.status(401).json({ message: 'קוד שגוי' });

  if (user.resetCodeExpires < new Date())
    return res.status(401).json({ message: 'הקוד פג תוקף' });

  user.password = await bcrypt.hash(newPassword, 10);
  user.resetCode = undefined;
  user.resetCodeExpires = undefined;
  await user.save();

  res.json({ message: "הסיסמה אופסה בהצלחה" });
});

module.exports = router;
