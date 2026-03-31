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
    invoiceNumber: { type: String, default: '' },
    invoiceIssuedAt: { type: Date, default: null },
    qrCode: { type: String, default: '' },
    ticketJti: { type: String, default: '' },
    checkedInAt: { type: Date, default: null },
    checkedInBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    whatsappNumber: { type: String, default: '' },
    status: { type: String, enum: ['confirmed', 'cancelled', 'used'], default: 'confirmed' },
    refundRequestStatus: {
      type: String,
      enum: ['none', 'pending', 'approved', 'rejected'],
      default: 'none',
    },
    refundRequestedAt: { type: Date, default: null },
    refundReason: { type: String, default: '' },
    refundBankDetails: {
      bankName: { type: String, default: '' },
      accountHolderName: { type: String, default: '' },
      accountNumber: { type: String, default: '' },
      branchName: { type: String, default: '' },
    },
    refundReviewedAt: { type: Date, default: null },
    refundReviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    refundReviewNote: { type: String, default: '' },
    refundInvoiceNumber: { type: String, default: '' },
    refundInvoiceIssuedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ event: 1, status: 1, createdAt: -1 });
bookingSchema.index({ ticketJti: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
