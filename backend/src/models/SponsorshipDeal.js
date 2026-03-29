const mongoose = require("mongoose");

const sponsorshipDealSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    sponsor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sponsor",
      required: true,
    },

    tier: {
      type: String,
      enum: ["gold", "silver", "bronze", "custom"],
      default: "custom",
    },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "LKR" },

    // Exposure counters (tracked via endpoints)
    exposures: {
      impressions: { type: Number, default: 0 },
      linkClicks: { type: Number, default: 0 },
      qrScans: { type: Number, default: 0 },
    },

    notes: { type: String, default: "", trim: true },
  },
  { timestamps: true },
);

sponsorshipDealSchema.index({ event: 1, createdAt: -1 });
sponsorshipDealSchema.index({ sponsor: 1, createdAt: -1 });
sponsorshipDealSchema.index({ tier: 1, createdAt: -1 });

module.exports = mongoose.model("SponsorshipDeal", sponsorshipDealSchema);
