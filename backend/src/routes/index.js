const express = require('express');
const router = express.Router();

const userRoutes = require('../modules/user/user.routes');
const eventRoutes = require('../modules/event/event.routes');
const bookingRoutes = require('../modules/booking/booking.routes');
const feedbackRoutes = require('../modules/feedback/feedback.routes');

router.use('/users', userRoutes);
router.use('/events', eventRoutes);
router.use('/bookings', bookingRoutes);
router.use('/feedback', feedbackRoutes);

module.exports = router;
