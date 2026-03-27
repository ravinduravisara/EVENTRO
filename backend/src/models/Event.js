const mongoose = require('mongoose');

const ticketTierSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, default: 0 },
    totalQuantity: { type: Number, required: true },
    soldQuantity: { type: Number, default: 0 },
  },
  { _id: true }
);

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    endDate: { type: Date },
    registrationDeadline: { type: Date },
    location: { type: String, required: true },
    category: { type: String, required: true },
    image: { type: String, default: '' },
    // Legacy single-price fields kept for backward compat
    ticketPrice: { type: Number, default: 0 },
    totalTickets: { type: Number, required: true },
    availableTickets: { type: Number, required: true },
    // Multi-tier tickets
    ticketTiers: [ticketTierSchema],
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['draft', 'pending', 'approved', 'rejected', 'live', 'closed', 'cancelled'],
      default: 'pending',
    },
    reminders: {
      // Tracks reminder delivery so jobs can be safely re-run.
      oneDay: { sentAt: { type: Date, default: null } },
      oneHour: { sentAt: { type: Date, default: null } },
    },
    rules: { type: String, default: '' },
    schedule: { type: String, default: '' },
  },
  { timestamps: true }
);

// Indexes for common filters/sorts
eventSchema.index({ status: 1, category: 1, date: -1 });
eventSchema.index({ organizer: 1, date: -1 });

module.exports = mongoose.model('Event', eventSchema);
