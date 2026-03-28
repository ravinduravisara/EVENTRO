const express = require('express');
const router = express.Router();
const feedbackController = require('./feedback.controller');
const auth = require('../../middleware/auth');

router.post('/', auth, feedbackController.createFeedback);
router.get('/event/:eventId', feedbackController.getEventFeedback);
router.get('/analytics/:eventId', auth, feedbackController.getEventAnalytics);

module.exports = router;
