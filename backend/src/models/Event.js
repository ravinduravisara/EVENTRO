const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    category: { type: String, required: true },
    image: { type: String, default: '' },
    ticketPrice: { type: Number, default: 0 },
    totalTickets: { type: Number, required: true },
    availableTickets: { type: Number, required: true },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
<<<<<<< HEAD
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
=======
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
>>>>>>> parent of a197612 (Event management)
  },
  { timestamps: true }
);

// Indexes for common filters/sorts
eventSchema.index({ status: 1, category: 1, date: -1 });
eventSchema.index({ organizer: 1, date: -1 });

module.exports = mongoose.model('Event', eventSchema);
