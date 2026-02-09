const Booking = require('../../models/Booking');
const Event = require('../../models/Event');
const { generateQRCode } = require('../../utils/qrCodeGenerator');

const createBooking = async ({ event: eventId, user, ticketCount = 1 }) => {
  const event = await Event.findById(eventId);
  if (!event) {
    const error = new Error('Event not found');
    error.statusCode = 404;
    throw error;
  }
  if (event.availableTickets < ticketCount) {
    const error = new Error('Not enough tickets available');
    error.statusCode = 400;
    throw error;
  }

  const totalPrice = event.ticketPrice * ticketCount;
  const booking = await Booking.create({ event: eventId, user, ticketCount, totalPrice });

  const qrCode = await generateQRCode(
    JSON.stringify({ bookingId: booking._id, eventId, userId: user })
  );
  booking.qrCode = qrCode;
  await booking.save();

  event.availableTickets -= ticketCount;
  await event.save();

  return booking;
};

const getUserBookings = async (userId) => {
  return await Booking.find({ user: userId }).populate('event', 'title date location');
};

const getBookingById = async (id, userId) => {
  const booking = await Booking.findOne({ _id: id, user: userId }).populate('event');
  if (!booking) {
    const error = new Error('Booking not found');
    error.statusCode = 404;
    throw error;
  }
  return booking;
};

const cancelBooking = async (id, userId) => {
  const booking = await Booking.findOne({ _id: id, user: userId });
  if (!booking) {
    const error = new Error('Booking not found');
    error.statusCode = 404;
    throw error;
  }
  booking.status = 'cancelled';
  await booking.save();

  const event = await Event.findById(booking.event);
  event.availableTickets += booking.ticketCount;
  await event.save();

  return booking;
};

const validateQR = async (qrData) => {
  try {
    const data = JSON.parse(qrData);
    const booking = await Booking.findById(data.bookingId).populate('event user');
    if (!booking) return { valid: false, message: 'Booking not found' };
    if (booking.status === 'used') return { valid: false, message: 'Ticket already used' };
    if (booking.status === 'cancelled') return { valid: false, message: 'Booking cancelled' };

    booking.status = 'used';
    await booking.save();
    return { valid: true, booking };
  } catch {
    return { valid: false, message: 'Invalid QR data' };
  }
};

module.exports = { createBooking, getUserBookings, getBookingById, cancelBooking, validateQR };
