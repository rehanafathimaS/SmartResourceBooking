const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  resourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource', required: true },
  date: { type: String, required: true },
  startPeriod: { type: Number, required: true, min: 1, max: 8 },
  endPeriod: { type: Number, required: true, min: 1, max: 8 },
  purpose: { type: String, required: true },
  priorityScore: { type: Number, default: 10 },
  status: {
  type: String,
  enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'],
  default: 'Pending'
},
  rejectionReason: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);