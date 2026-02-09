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
    .populate('user', 'name avatar')
    .sort({ createdAt: -1 });
};

const getEventAnalytics = async (eventId) => {
  const feedbacks = await Feedback.find({ event: eventId });
  const totalFeedbacks = feedbacks.length;
  if (totalFeedbacks === 0) return { averageRating: 0, totalFeedbacks: 0, sentimentBreakdown: {} };

  const averageRating = feedbacks.reduce((sum, f) => sum + f.rating, 0) / totalFeedbacks;
  const sentimentBreakdown = feedbacks.reduce((acc, f) => {
    acc[f.sentiment] = (acc[f.sentiment] || 0) + 1;
    return acc;
  }, {});

  return { averageRating: Math.round(averageRating * 10) / 10, totalFeedbacks, sentimentBreakdown };
};

module.exports = { createFeedback, getEventFeedback, getEventAnalytics };
