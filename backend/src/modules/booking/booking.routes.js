const express = require('express');
const router = express.Router();
const bookingController = require('./booking.controller');
const auth = require('../../middleware/auth');

router.post('/', auth, bookingController.createBooking);
router.get('/my', auth, bookingController.getUserBookings);
router.get('/:id', auth, bookingController.getBookingById);
router.patch('/:id/cancel', auth, bookingController.cancelBooking);
router.post('/validate-qr', auth, bookingController.validateQR);

module.exports = router;
