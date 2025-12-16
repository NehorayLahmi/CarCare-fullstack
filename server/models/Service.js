const mongoose = require('mongoose');

const serviceSchema = mongoose.Schema({
  vehicleId: String,
  type: String,
  date: String,
  cost: Number,
  note: String,
  garageName: String,
  kilometer:String

});

module.exports = mongoose.model('Service', serviceSchema);
