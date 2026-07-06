const mongoose = require('mongoose');

const serviceSchema = mongoose.Schema({
  vehicleId: { type: String, required: true },
  type: { type: String, required: true },
  date: { type: String, required: true },
  cost: { type: Number, required: true },
  note: String,
  garageName: String,
  kilometer: String,
});

module.exports = mongoose.model('Service', serviceSchema);
