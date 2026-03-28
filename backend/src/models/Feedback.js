const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '' },
    sentiment: { type: String, enum: ['positive', 'neutral', 'negative'], default: 'neutral' },
  },
  { timestamps: true }
);

feedbackSchema.index({ event: 1, createdAt: -1 });
feedbackSchema.index({ user: 1, event: 1 });

module.exports = mongoose.model('Feedback', feedbackSchema);
