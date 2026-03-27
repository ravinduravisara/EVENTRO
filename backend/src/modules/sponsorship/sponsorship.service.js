const SponsorInquiry = require("../../models/SponsorInquiry");

const createInquiry = async (payload) => {
  const inquiryType = String(payload?.inquiryType || "custom")
    .trim()
    .toLowerCase();
  const companyName = String(payload?.companyName || "").trim();
  const contactName = String(payload?.contactName || "").trim();
  const email = String(payload?.email || "")
    .trim()
    .toLowerCase();
  const phone = String(payload?.phone || "").trim();
  const tier = String(payload?.tier || "custom")
    .trim()
    .toLowerCase();
  const budget = Number(payload?.budget || 0);
  const stallType = String(payload?.stallType || "").trim();
  const stallCount = Number(payload?.stallCount || 0);
  const needsPower = Boolean(payload?.needsPower);
  const needsWater = Boolean(payload?.needsWater);
  const expectedFootfall = Number(payload?.expectedFootfall || 0);
  const inKindItems = String(payload?.inKindItems || "").trim();
  const message = String(payload?.message || "").trim();

  if (!companyName || !contactName || !email) {
    const error = new Error("companyName, contactName and email are required");
    error.statusCode = 400;
    throw error;
  }

  const safeInquiryType = [
    "sponsor-tier",
    "vendor-stall",
    "in-kind",
    "custom",
  ].includes(inquiryType)
    ? inquiryType
    : "custom";
  const safeTier = ["gold", "silver", "bronze", "custom"].includes(tier)
    ? tier
    : "custom";
  const safeBudget = Number.isFinite(budget) && budget >= 0 ? budget : 0;
  const safeStallCount =
    Number.isFinite(stallCount) && stallCount >= 0 ? stallCount : 0;
  const safeExpectedFootfall =
    Number.isFinite(expectedFootfall) && expectedFootfall >= 0
      ? expectedFootfall
      : 0;

  return await SponsorInquiry.create({
    inquiryType: safeInquiryType,
    companyName,
    contactName,
    email,
    phone,
    tier: safeTier,
    budget: safeBudget,
    stallType,
    stallCount: safeStallCount,
    needsPower,
    needsWater,
    expectedFootfall: safeExpectedFootfall,
    inKindItems,
    message,
  });
};

const listInquiries = async () => {
  return await SponsorInquiry.find({}).sort({ createdAt: -1 }).lean();
};

module.exports = { createInquiry, listInquiries };
