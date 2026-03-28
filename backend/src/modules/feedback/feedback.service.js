const Feedback = require('../../models/Feedback');

const analyzeSentiment = (comment) => {
  const positiveWords = ['great', 'awesome', 'excellent', 'amazing', 'good', 'love', 'fantastic'];
  const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'poor', 'hate', 'worst'];
  const lower = comment.toLowerCase();
  const posCount = positiveWords.filter((w) => lower.includes(w)).length;
  const negCount = negativeWords.filter((w) => lower.includes(w)).length;
  if (posCount > negCount) return 'positive';
  if (negCount > posCount) return 'negative';
  return 'neutral';
};

const createFeedback = async ({ event, user, rating, comment }) => {
  const sentiment = comment ? analyzeSentiment(comment) : 'neutral';
  const feedback = await Feedback.create({ event, user, rating, comment, sentiment });
  return feedback;
};

const getEventFeedback = async (eventId) => {
  return await Feedback.find({ event: eventId })
    .populate('user', 'firstName lastName avatar')
    .sort({ createdAt: -1 })
    .lean();
};

const getEventAnalytics = async (eventId) => {
  const mongoose = require('mongoose');
  let eventObjectId;
  try {
    eventObjectId = mongoose.Types.ObjectId.createFromHexString(String(eventId));
  } catch {
    return { averageRating: 0, totalFeedbacks: 0, sentimentBreakdown: {} };
  }

  const rows = await Feedback.aggregate([
    { $match: { event: eventObjectId } },
    {
      $group: {
        _id: '$sentiment',
        count: { $sum: 1 },
        sumRating: { $sum: '$rating' },
      },
    },
  ]);

  if (!rows || rows.length === 0) {
    return { averageRating: 0, totalFeedbacks: 0, sentimentBreakdown: {} };
  }

  const sentimentBreakdown = {};
  let totalFeedbacks = 0;
  let totalRating = 0;
  for (const r of rows) {
    sentimentBreakdown[r._id || 'neutral'] = r.count || 0;
    totalFeedbacks += r.count || 0;
    totalRating += r.sumRating || 0;
  }

  const averageRating = totalFeedbacks ? totalRating / totalFeedbacks : 0;
  return {
    averageRating: Math.round(averageRating * 10) / 10,
    totalFeedbacks,
    sentimentBreakdown,
  };
};

module.exports = { createFeedback, getEventFeedback, getEventAnalytics };
