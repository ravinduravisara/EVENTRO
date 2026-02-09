const feedbackService = require('./feedback.service');

const createFeedback = async (req, res, next) => {
  try {
    const feedback = await feedbackService.createFeedback({ ...req.body, user: req.user.id });
    res.status(201).json(feedback);
  } catch (error) {
    next(error);
  }
};

const getEventFeedback = async (req, res, next) => {
  try {
    const feedback = await feedbackService.getEventFeedback(req.params.eventId);
    res.json(feedback);
  } catch (error) {
    next(error);
  }
};

const getEventAnalytics = async (req, res, next) => {
  try {
    const analytics = await feedbackService.getEventAnalytics(req.params.eventId);
    res.json(analytics);
  } catch (error) {
    next(error);
  }
};

module.exports = { createFeedback, getEventFeedback, getEventAnalytics };
