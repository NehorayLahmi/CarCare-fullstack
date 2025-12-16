const mongoose = require('mongoose');

const vehicleSchema = mongoose.Schema({
  userId: { type: String, required: true },
  licensePlate: { type: String, required: true, unique: true },
  model: String,
  year: Number,
  kilometer: { type: Number, default: 0 }
});

// אינדקס ייחודי על userId + licensePlate
vehicleSchema.index({ userId: 1, licensePlate: 1 }, { unique: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);
