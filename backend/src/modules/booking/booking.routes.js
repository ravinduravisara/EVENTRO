const express = require('express');
const router = express.Router();
const bookingController = require('./booking.controller');
const auth = require('../../middleware/auth');
const roleCheck = require('../../middleware/roleCheck');

router.post('/', auth, bookingController.createBooking);
router.get('/', auth, roleCheck('admin', 'organizer'), bookingController.getAllBookings);
router.get('/my', auth, bookingController.getUserBookings);
router.get('/:id', auth, bookingController.getBookingById);
router.post('/:id/transfer', auth, bookingController.transferBooking);
router.patch('/:id/cancel', auth, bookingController.cancelBooking);
router.post('/validate-qr', auth, roleCheck('admin', 'organizer'), bookingController.validateQR);

module.exports = router;
