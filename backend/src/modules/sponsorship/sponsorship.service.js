const SponsorInquiry = require("../../models/SponsorInquiry");
const { sendEmail } = require("../../utils/emailer");

const escapeHtml = (value) =>
  String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");

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

const approveInquiry = async ({ inquiryId, responseMessage, adminUser }) => {
  const id = String(inquiryId || "").trim();
  const msg = String(responseMessage || "").trim();
  if (!id) {
    const error = new Error("inquiryId is required");
    error.statusCode = 400;
    throw error;
  }
  if (!msg) {
    const error = new Error("responseMessage is required");
    error.statusCode = 400;
    throw error;
  }

  const inquiry = await SponsorInquiry.findById(id);
  if (!inquiry) {
    const error = new Error("Inquiry not found");
    error.statusCode = 404;
    throw error;
  }

  // Send the email first; only mark approved if email send succeeds.
  const subject = "Eventro Sponsorship Inquiry Approved";
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5">
      <h2 style="margin:0 0 12px">Sponsorship Inquiry Approved</h2>
      <p style="margin:0 0 10px">Hi ${escapeHtml(inquiry.contactName)},</p>
      <p style="margin:0 0 10px">Thank you for your interest in sponsoring our events.</p>
      <div style="margin:12px 0;padding:12px;border:1px solid #e5e7eb;border-radius:10px">
        <div><strong>Company:</strong> ${escapeHtml(inquiry.companyName)}</div>
        <div><strong>Tier:</strong> ${escapeHtml(inquiry.tier)}</div>
        ${Number.isFinite(inquiry.budget) ? `<div><strong>Budget:</strong> ${escapeHtml(inquiry.budget)}</div>` : ""}
      </div>
      <p style="margin:0 0 8px"><strong>Response from our team:</strong></p>
      <div style="white-space:pre-wrap;margin:0 0 12px;padding:12px;background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px">${escapeHtml(msg)}</div>
      <p style="margin:0">Regards,<br/>Eventro Team</p>
    </div>
  `;

  await sendEmail({
    to: inquiry.email,
    subject,
    html,
  });

  inquiry.status = "approved";
  inquiry.adminResponseMessage = msg;
  inquiry.adminRespondedAt = new Date();
  inquiry.adminRespondedBy = adminUser?._id || adminUser?.id || null;
  await inquiry.save();

  return inquiry.toObject();
};

module.exports = { createInquiry, listInquiries, approveInquiry };
