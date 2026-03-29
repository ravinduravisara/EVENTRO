const Sponsor = require("../../models/Sponsor");
const SponsorshipDeal = require("../../models/SponsorshipDeal");

const upsertSponsorByName = async ({
  name,
  industry,
  website,
  logoUrl,
  contactName,
  contactEmail,
  contactPhone,
}) => {
  const cleanName = String(name || "").trim();
  if (!cleanName) {
    const error = new Error("Sponsor name is required");
    error.statusCode = 400;
    throw error;
  }

  const update = {
    industry: String(industry || "").trim(),
    website: String(website || "").trim(),
    logoUrl: String(logoUrl || "").trim(),
    contactName: String(contactName || "").trim(),
    contactEmail: String(contactEmail || "")
      .trim()
      .toLowerCase(),
    contactPhone: String(contactPhone || "").trim(),
  };

  const sponsor = await Sponsor.findOneAndUpdate(
    { name: cleanName },
    { $setOnInsert: { name: cleanName }, $set: update },
    { new: true, upsert: true },
  );

  return sponsor;
};

const createDeal = async ({
  eventId,
  sponsorName,
  tier,
  amount,
  currency,
  sponsorMeta,
  notes,
}) => {
  const safeTier = ["gold", "silver", "bronze", "custom"].includes(
    String(tier || "").toLowerCase(),
  )
    ? String(tier).toLowerCase()
    : "custom";
  const safeAmount = Number(amount);
  if (!Number.isFinite(safeAmount) || safeAmount < 0) {
    const error = new Error("amount must be a non-negative number");
    error.statusCode = 400;
    throw error;
  }

  const sponsor = await upsertSponsorByName({
    name: sponsorName,
    ...(sponsorMeta || {}),
  });

  return await SponsorshipDeal.create({
    event: eventId,
    sponsor: sponsor._id,
    tier: safeTier,
    amount: safeAmount,
    currency: String(currency || "LKR").trim() || "LKR",
    notes: String(notes || "").trim(),
  });
};

const listDealsByEvent = async (eventId) => {
  return await SponsorshipDeal.find({ event: eventId })
    .populate("sponsor", "name industry website logoUrl")
    .sort({ createdAt: -1 })
    .lean();
};

const incrementExposure = async ({ dealId, kind, by = 1 }) => {
  const safeBy = Number(by);
  const inc = Number.isFinite(safeBy) && safeBy > 0 ? safeBy : 1;
  const map = {
    impression: "exposures.impressions",
    click: "exposures.linkClicks",
    scan: "exposures.qrScans",
  };
  const field = map[String(kind || "").toLowerCase()];
  if (!field) {
    const error = new Error("Invalid exposure kind");
    error.statusCode = 400;
    throw error;
  }

  const updated = await SponsorshipDeal.findByIdAndUpdate(
    dealId,
    { $inc: { [field]: inc } },
    { new: true },
  )
    .populate("sponsor", "name industry website logoUrl")
    .lean();

  if (!updated) {
    const error = new Error("Deal not found");
    error.statusCode = 404;
    throw error;
  }

  return updated;
};

const getRevenueAnalytics = async ({ eventId } = {}) => {
  const match = {};
  if (eventId)
    match.event = require("mongoose").Types.ObjectId.createFromHexString(
      String(eventId),
    );

  const rows = await SponsorshipDeal.aggregate([
    { $match: match },
    {
      $group: {
        _id: { event: "$event", tier: "$tier" },
        revenue: { $sum: "$amount" },
        deals: { $sum: 1 },
        impressions: { $sum: "$exposures.impressions" },
        linkClicks: { $sum: "$exposures.linkClicks" },
        qrScans: { $sum: "$exposures.qrScans" },
      },
    },
  ]);

  const byEvent = new Map();
  for (const r of rows) {
    const eid = String(r._id.event);
    if (!byEvent.has(eid)) {
      byEvent.set(eid, {
        eventId: eid,
        totalRevenue: 0,
        totals: { deals: 0, impressions: 0, linkClicks: 0, qrScans: 0 },
        byTier: {},
      });
    }
    const agg = byEvent.get(eid);
    agg.totalRevenue += r.revenue || 0;
    agg.totals.deals += r.deals || 0;
    agg.totals.impressions += r.impressions || 0;
    agg.totals.linkClicks += r.linkClicks || 0;
    agg.totals.qrScans += r.qrScans || 0;
    agg.byTier[r._id.tier] = {
      revenue: r.revenue || 0,
      deals: r.deals || 0,
      impressions: r.impressions || 0,
      linkClicks: r.linkClicks || 0,
      qrScans: r.qrScans || 0,
    };
  }

  return { events: Array.from(byEvent.values()) };
};

module.exports = {
  createDeal,
  listDealsByEvent,
  incrementExposure,
  getRevenueAnalytics,
};
