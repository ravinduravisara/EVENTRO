const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "" },
    sentiment: {
      type: String,
      enum: ["positive", "neutral", "negative"],
      default: "neutral",
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved",
    },
    moderationNotes: { type: String, default: "" },
    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    moderatedAt: { type: Date, default: null },

    tags: { type: [String], default: [] },
  },
  { timestamps: true },
);

feedbackSchema.index({ event: 1, createdAt: -1 });
feedbackSchema.index({ user: 1, event: 1 });
feedbackSchema.index({ event: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model("Feedback", feedbackSchema);
