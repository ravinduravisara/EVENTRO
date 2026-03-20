const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ticketTier: { type: String, default: '' },
    ticketCount: { type: Number, required: true, default: 1 },
    totalPrice: { type: Number, required: true },
    qrCode: { type: String, default: '' },
    ticketJti: { type: String, default: '' },
    checkedInAt: { type: Date, default: null },
    checkedInBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    whatsappNumber: { type: String, default: '' },
    status: { type: String, enum: ['confirmed', 'cancelled', 'used'], default: 'confirmed' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
