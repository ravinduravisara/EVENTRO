const mongoose = require("mongoose");

const sponsorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    industry: { type: String, default: "", trim: true },
    website: { type: String, default: "", trim: true },
    logoUrl: { type: String, default: "", trim: true },
    contactName: { type: String, default: "", trim: true },
    contactEmail: { type: String, default: "", trim: true, lowercase: true },
    contactPhone: { type: String, default: "", trim: true },
  },
  { timestamps: true },
);

sponsorSchema.index({ name: 1 });

module.exports = mongoose.model("Sponsor", sponsorSchema);
