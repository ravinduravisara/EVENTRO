const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    transferredFrom: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    transferredAt: { type: Date, default: null },
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

bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ event: 1, status: 1, createdAt: -1 });
bookingSchema.index({ ticketJti: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
