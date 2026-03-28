const mongoose = require("mongoose");

const sponsorInquirySchema = new mongoose.Schema(
  {
    inquiryType: {
      type: String,
      enum: ["sponsor-tier", "vendor-stall", "in-kind", "custom"],
      default: "custom",
    },
    companyName: { type: String, required: true, trim: true },
    contactName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, default: "", trim: true },
    tier: {
      type: String,
      enum: ["gold", "silver", "bronze", "custom"],
      default: "custom",
    },
    budget: { type: Number, default: 0 },

    // Vendor / vending shops
    stallType: { type: String, default: "", trim: true },
    stallCount: { type: Number, default: 0 },
    needsPower: { type: Boolean, default: false },
    needsWater: { type: Boolean, default: false },
    expectedFootfall: { type: Number, default: 0 },

    // In-kind sponsorship
    inKindItems: { type: String, default: "", trim: true },
    message: { type: String, default: "", trim: true },
    status: {
      type: String,
      enum: ["new", "reviewing", "approved", "rejected"],
      default: "new",
    },
  },
  { timestamps: true },
);

sponsorInquirySchema.index({ createdAt: -1 });
sponsorInquirySchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("SponsorInquiry", sponsorInquirySchema);
