const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: String,
  email: String,
  phone: String,
  password: { type: String, required: true },
  resetCode: String,
  resetCodeExpires: Date,
  role: { type: String, enum: ['user', 'admin'], default: 'user' },  // שדה חדש עם ברירת מחדל בלבד
});


module.exports = mongoose.model('User', userSchema);




