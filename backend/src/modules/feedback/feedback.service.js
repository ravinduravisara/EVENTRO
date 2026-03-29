const Feedback = require("../../models/Feedback");
const Booking = require("../../models/Booking");

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

const analyzeSentiment = (comment) => {
  const positiveWords = [
    "great",
    "awesome",
    "excellent",
    "amazing",
    "good",
    "love",
    "fantastic",
  ];
  const negativeWords = [
    "bad",
    "terrible",
    "awful",
    "horrible",
    "poor",
    "hate",
    "worst",
  ];
  const lower = comment.toLowerCase();
  const posCount = positiveWords.filter((w) => lower.includes(w)).length;
  const negCount = negativeWords.filter((w) => lower.includes(w)).length;
  if (posCount > negCount) return "positive";
  if (negCount > posCount) return "negative";
  return "neutral";
};

const extractTags = (comment) => {
  const text = String(comment || "").toLowerCase();
  const tagRules = [
    { tag: "content", words: ["content", "topic", "speaker", "session"] },
    { tag: "venue", words: ["venue", "hall", "room", "seat", "ac", "air"] },
    { tag: "timing", words: ["time", "timing", "schedule", "late", "delay"] },
    {
      tag: "organization",
      words: ["organize", "organized", "management", "queue", "registration"],
    },
    { tag: "value", words: ["worth", "value", "useful", "learned"] },
  ];
  const tags = [];
  for (const rule of tagRules) {
    if (rule.words.some((w) => text.includes(w))) tags.push(rule.tag);
  }
  return [...new Set(tags)];
};

const requireAttendance = async ({ event, user }) => {
  const booking = await Booking.findOne({ event, user, status: "used" })
    .select("_id checkedInAt")
    .lean();
  if (!booking) {
    const error = new Error("Attendance required to submit feedback");
    error.statusCode = 403;
    throw error;
  }
  return booking;
};

const createFeedback = async ({ event, user, rating, comment }) => {
  const numericRating = Number(rating);
  if (
    !Number.isFinite(numericRating) ||
    numericRating < 1 ||
    numericRating > 5
  ) {
    const error = new Error("Rating must be between 1 and 5");
    error.statusCode = 400;
    throw error;
  }

  // Attendance-verified: must have checked in (QR validated -> booking.status used)
  const booking = await requireAttendance({ event, user });

  // One feedback per user per event
  const existing = await Feedback.findOne({ event, user }).select("_id").lean();
  if (existing) {
    const error = new Error(
      "You have already submitted feedback for this event",
    );
    error.statusCode = 409;
    throw error;
  }

  const sentiment = comment ? analyzeSentiment(comment) : "neutral";
  const tags = comment ? extractTags(comment) : [];
  const feedback = await Feedback.create({
    event,
    user,
    booking: booking?._id || null,
    rating: numericRating,
    comment,
    sentiment,
    tags,
    status: "approved",
  });
  return feedback;
};

const getEventFeedback = async (eventId) => {
  return await Feedback.find({ event: eventId, status: "approved" })
    .populate("user", "firstName lastName avatar")
    .sort({ createdAt: -1 })
    .lean();
};

const getEventFeedbackForModeration = async (eventId) => {
  return await Feedback.find({ event: eventId })
    .populate("user", "firstName lastName email avatar")
    .sort({ createdAt: -1 })
    .lean();
};

const moderateFeedback = async ({ feedbackId, status, notes, moderatedBy }) => {
  const nextStatus = String(status || "").toLowerCase();
  if (!["approved", "rejected", "pending"].includes(nextStatus)) {
    const error = new Error("Invalid moderation status");
    error.statusCode = 400;
    throw error;
  }
  const updated = await Feedback.findByIdAndUpdate(
    feedbackId,
    {
      $set: {
        status: nextStatus,
        moderationNotes: String(notes || ""),
        moderatedBy: moderatedBy || null,
        moderatedAt: new Date(),
      },
    },
    { new: true },
  )
    .populate("user", "firstName lastName email avatar")
    .lean();

  if (!updated) {
    const error = new Error("Feedback not found");
    error.statusCode = 404;
    throw error;
  }
  return updated;
};

const getEventAnalytics = async (eventId) => {
  const mongoose = require("mongoose");
  let eventObjectId;
  try {
    eventObjectId = mongoose.Types.ObjectId.createFromHexString(
      String(eventId),
    );
  } catch {
    return {
      averageRating: 0,
      totalFeedbacks: 0,
      sentimentBreakdown: {},
      performanceScore: 0,
    };
  }

  const rows = await Feedback.aggregate([
    { $match: { event: eventObjectId, status: "approved" } },
    {
      $group: {
        _id: "$sentiment",
        count: { $sum: 1 },
        sumRating: { $sum: "$rating" },
      },
    },
  ]);

  if (!rows || rows.length === 0) {
    return {
      averageRating: 0,
      totalFeedbacks: 0,
      sentimentBreakdown: {},
      performanceScore: 0,
    };
  }

  const sentimentBreakdown = {};
  let totalFeedbacks = 0;
  let totalRating = 0;
  for (const r of rows) {
    sentimentBreakdown[r._id || "neutral"] = r.count || 0;
    totalFeedbacks += r.count || 0;
    totalRating += r.sumRating || 0;
  }

  const averageRating = totalFeedbacks ? totalRating / totalFeedbacks : 0;

  // Simple performance score: combines rating + sentiment balance + confidence
  // - ratingScore: 0..100
  const ratingScore = clamp((averageRating / 5) * 100, 0, 100);
  const pos = sentimentBreakdown.positive || 0;
  const neg = sentimentBreakdown.negative || 0;
  const neu = sentimentBreakdown.neutral || 0;
  const total = pos + neg + neu;
  const sentimentScore = total
    ? clamp(((pos - neg) / total) * 50 + 50, 0, 100)
    : 50;
  const confidence = clamp(Math.log10(totalFeedbacks + 1) / 2, 0, 1); // ~0..1
  const performanceScore =
    Math.round((ratingScore * 0.7 + sentimentScore * 0.3) * confidence * 10) /
    10;

  return {
    averageRating: Math.round(averageRating * 10) / 10,
    totalFeedbacks,
    sentimentBreakdown,
    performanceScore,
  };
};

module.exports = {
  createFeedback,
  getEventFeedback,
  getEventFeedbackForModeration,
  moderateFeedback,
  getEventAnalytics,
};
