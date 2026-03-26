const Booking = require('../../models/Booking');
const Event = require('../../models/Event');
const { generateQRCode } = require('../../utils/qrCodeGenerator');
const User = require('../../models/User');
const { createTicketToken, verifyTicketToken } = require('../../utils/ticketToken');
const { sendTicketEmail } = require('../../utils/ticketEmail');
const { sendTicketWhatsApp } = require('../../utils/whatsapp');
const logger = require('../../utils/logger');

const createBooking = async ({
  event: eventId,
  user,
  ticketCount = 1,
  whatsappNumber = '',
  tierName,
  ticketTier,
  tierId,
}) => {
  if (!user) {
    const error = new Error('Authentication required');
    error.statusCode = 401;
    throw error;
  }

  const event = await Event.findById(eventId);
  if (!event) {
    const error = new Error('Event not found');
    error.statusCode = 404;
    throw error;
  }

  const qty = Number(ticketCount || 1);
  if (!Number.isFinite(qty) || qty < 1) {
    const error = new Error('Invalid ticket quantity');
    error.statusCode = 400;
    throw error;
  }

  if (Number(event.availableTickets || 0) < qty) {
    const error = new Error('Not enough tickets available');
    error.statusCode = 400;
    throw error;
  }

  const tiers = Array.isArray(event.ticketTiers) ? event.ticketTiers : [];
  const hasTiers = tiers.length > 0;

  let chosenTier = null;
  if (hasTiers) {
    const wantedId = String(tierId || '').trim();
    const wantedName = String(tierName || ticketTier || '').trim();

    if (wantedId) {
      chosenTier = event.ticketTiers.id(wantedId) || null;
    } else if (wantedName) {
      chosenTier = tiers.find((t) => String(t.name) === wantedName) || null;
    }

    if (!chosenTier) {
      const error = new Error('Select a ticket tier');
      error.statusCode = 400;
      throw error;
    }

    const tierAvail = Number(chosenTier.totalQuantity || 0) - Number(chosenTier.soldQuantity || 0);
    if (tierAvail < qty) {
      const error = new Error('Not enough tickets available for this tier');
      error.statusCode = 400;
      throw error;
    }
  }

  const pricePerTicket = hasTiers ? Number(chosenTier.price || 0) : Number(event.ticketPrice || 0);
  const totalPrice = pricePerTicket * qty;

  const booking = await Booking.create({
    event: eventId,
    user,
    ticketTier: chosenTier?.name || '',
    ticketCount: qty,
    totalPrice,
    whatsappNumber,
  });

  const expiresAt = (() => {
    const base = event.endDate || event.date;
    if (!base) return null;
    const dt = new Date(base);
    dt.setDate(dt.getDate() + 2);
    return dt;
  })();

  const { token: ticketToken, jti } = createTicketToken({
    bookingId: booking._id,
    eventId,
    expiresAt,
  });

  const qrCode = await generateQRCode(ticketToken);
  booking.qrCode = qrCode;
  booking.ticketJti = jti;
  await booking.save();

  // Update inventory
  event.availableTickets = Number(event.availableTickets || 0) - qty;
  if (hasTiers && chosenTier) {
    chosenTier.soldQuantity = Number(chosenTier.soldQuantity || 0) + qty;
  }
  await event.save();

  // Best-effort delivery
  try {
    const dbUser = await User.findById(user).select('firstName email');
    const recipientEmail = dbUser?.email;
    const recipientFirstName = dbUser?.firstName;

    const ticketUrlBase = process.env.FRONTEND_BASE_URL || process.env.FRONTEND_URL || '';
    const ticketUrl = ticketUrlBase
      ? `${ticketUrlBase.replace(/\/$/, '')}/bookings/${booking._id}/ticket`
      : '';

    if (recipientEmail) {
      await sendTicketEmail({
        to: recipientEmail,
        firstName: recipientFirstName,
        eventTitle: event.title,
        eventDate: event.date ? new Date(event.date).toLocaleString() : '',
        ticketCount: booking.ticketCount,
        totalPrice: booking.totalPrice,
        qrCodeDataUrl: booking.qrCode,
        ticketUrl,
      });
    }

    if (booking.whatsappNumber && ticketUrl) {
      await sendTicketWhatsApp({
        to: booking.whatsappNumber,
        eventTitle: event.title,
        eventDate: event.date ? new Date(event.date).toLocaleString() : '',
        ticketCount: booking.ticketCount,
        ticketUrl,
      });
    }
  } catch (deliveryError) {
    logger.error(`Ticket delivery failed: ${deliveryError.message}`);
  }

  return booking;
};

const getUserBookings = async (userId) => {
  return await Booking.find({ user: userId })
    .select('-ticketJti -__v')
    .populate('event', 'title date location')
    .sort({ createdAt: -1 })
    .lean();
};

const getAllBookings = async ({ eventId } = {}) => {
  const filter = {};
  if (eventId) filter.event = eventId;
  return await Booking.find(filter)
    .select('-qrCode -ticketJti -__v')
    .populate('event', 'title date location')
    .populate('user', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .lean();
};

const getBookingById = async (id, userId) => {
  const booking = await Booking.findOne({ _id: id, user: userId }).populate('event');
  if (!booking) {
    const error = new Error('Booking not found');
    error.statusCode = 404;
    throw error;
  }

  // Backfill QR for legacy bookings that were created without QR data.
  if (!booking.qrCode) {
    try {
      const { token: ticketToken, jti } = createTicketToken({
        bookingId: booking._id,
        eventId: booking.event?._id || booking.event,
      });
      booking.qrCode = await generateQRCode(ticketToken);
      booking.ticketJti = jti;
      await booking.save();
    } catch (error) {
      logger.error(`Failed to backfill QR for booking ${booking._id}: ${error.message}`);
    }
  }

  return booking.toObject();
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

const validateQR = async ({ ticketToken, qrData, scannedByUserId, eventId }) => {
  // Backward compat: older clients send {qrData} JSON
  const rawToken = ticketToken || '';
  if (!rawToken && typeof qrData === 'string') {
    // Try legacy JSON QR
    try {
      const parsed = JSON.parse(qrData);
      if (parsed && parsed.bookingId) {
        const booking = await Booking.findById(parsed.bookingId).populate('event user');
        if (!booking) return { valid: false, message: 'Booking not found' };
        if (booking.status === 'used') return { valid: false, message: 'Ticket already used' };
        if (booking.status === 'cancelled') return { valid: false, message: 'Booking cancelled' };

        booking.status = 'used';
        booking.checkedInAt = new Date();
        booking.checkedInBy = scannedByUserId || null;
        await booking.save();
        return { valid: true, booking };
      }
    } catch {
      // fallthrough
    }
    return { valid: false, message: 'Invalid QR data' };
  }

  if (!rawToken) return { valid: false, message: 'Missing ticket token' };

  try {
    const decoded = verifyTicketToken(rawToken);
    if (!decoded || decoded.typ !== 'eventro_ticket' || !decoded.bid) {
      return { valid: false, message: 'Invalid ticket token' };
    }

    if (eventId && decoded.eid && String(eventId) !== String(decoded.eid)) {
      return { valid: false, message: 'Ticket is for a different event' };
    }

    // Atomic one-time check-in
    const updated = await Booking.findOneAndUpdate(
      { _id: decoded.bid, status: 'confirmed', ticketJti: decoded.jti || '' },
      { $set: { status: 'used', checkedInAt: new Date(), checkedInBy: scannedByUserId || null } },
      { new: true }
    ).populate('event user');

    if (updated) {
      return { valid: true, booking: updated };
    }

    const existing = await Booking.findById(decoded.bid).populate('event user');
    if (!existing) return { valid: false, message: 'Booking not found' };
    if (existing.status === 'used') return { valid: false, message: 'Ticket already used' };
    if (existing.status === 'cancelled') return { valid: false, message: 'Booking cancelled' };
    return { valid: false, message: 'Ticket validation failed' };
  } catch {
    return { valid: false, message: 'Invalid or expired ticket token' };
  }
};

module.exports = { createBooking, getUserBookings, getAllBookings, getBookingById, cancelBooking, validateQR };
