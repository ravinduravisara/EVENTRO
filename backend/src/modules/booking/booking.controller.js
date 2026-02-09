const bookingService = require('./booking.service');

const createBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.createBooking({ ...req.body, user: req.user.id });
    res.status(201).json(booking);
  } catch (error) {
    next(error);
  }
};

const getUserBookings = async (req, res, next) => {
  try {
    const bookings = await bookingService.getUserBookings(req.user.id);
    res.json(bookings);
  } catch (error) {
    next(error);
  }
};

const getBookingById = async (req, res, next) => {
  try {
    const booking = await bookingService.getBookingById(req.params.id, req.user.id);
    res.json(booking);
  } catch (error) {
    next(error);
  }
};

const cancelBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.cancelBooking(req.params.id, req.user.id);
    res.json(booking);
  } catch (error) {
    next(error);
  }
};

const validateQR = async (req, res, next) => {
  try {
    const result = await bookingService.validateQR(req.body.qrData);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = { createBooking, getUserBookings, getBookingById, cancelBooking, validateQR };
