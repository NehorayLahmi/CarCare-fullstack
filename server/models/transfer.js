// models/transfer.js
const mongoose = require('mongoose');

const transferSchema = new mongoose.Schema({
  licensePlate: { type: String, required: true },
  toId: { type: String, required: true },   // תעודת זהות מקבל
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transfer', transferSchema);
