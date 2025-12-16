const mongoose = require('mongoose');

const modelServiceSchema = new mongoose.Schema({
  tozeret_nm: { type: String, required: true },      // יצרן
  degem_nm: { type: String, required: true },        // דגם
  serviceType: { type: String, required: true },     // סוג טיפול
  serviceIntervalKm: { type: Number },               // מרחק בק"מ לטיפול
  serviceIntervalMonths: { type: Number },           // חודשים לטיפול
  notes: { type: String },                           // הערות נוספות
  averageCost: { type: Number },                     // עלות ממוצעת
  garageName: { type: String },                      // מוסך מומלץ
}, {
  timestamps: true,
});

// לא לאפשר כפילות של אותו טיפול לאותו דגם
modelServiceSchema.index({ tozeret_nm: 1, degem_nm: 1, serviceType: 1 }, { unique: true });

module.exports = mongoose.model('ModelService', modelServiceSchema);
