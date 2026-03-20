const Event = require('../../models/Event');
const Booking = require('../../models/Booking');

// Convert image buffer to base64 data URI for MongoDB storage
const bufferToDataURI = (buffer, mimetype) => {
  const base64 = buffer.toString('base64');
  return `data:${mimetype || 'image/png'};base64,${base64}`;
};

const getAllEvents = async (query = {}) => {
  const { category, status, page = 1, limit = 50 } = query;
  const filter = {};
  if (status) filter.status = status;
  if (category) filter.category = category;

  const events = await Event.find(filter)
    .populate('organizer', 'firstName lastName email')
    .sort({ date: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Event.countDocuments(filter);
  return { events, total, page: Number(page), pages: Math.ceil(total / limit) };
};

const getEventById = async (id) => {
  const event = await Event.findById(id).populate('organizer', 'firstName lastName email');
  if (!event) {
    const error = new Error('Event not found');
    error.statusCode = 404;
    throw error;
  }
  return event;
};

const createEvent = async (eventData, imageFile) => {
  // Store image as base64 data URI in MongoDB
  if (imageFile) {
    try {
      eventData.image = bufferToDataURI(imageFile.buffer, imageFile.mimetype);
    } catch (err) {
      console.error('Event image conversion failed:', err);
    }
  }

  // Parse ticketTiers if sent as JSON string (multipart form)
  if (typeof eventData.ticketTiers === 'string') {
    try {
      eventData.ticketTiers = JSON.parse(eventData.ticketTiers);
    } catch {
      eventData.ticketTiers = [];
    }
  }

  // Compute legacy totalTickets / availableTickets from tiers
  const tiers = eventData.ticketTiers || [];
  if (tiers.length > 0) {
    const totalFromTiers = tiers.reduce((s, t) => s + Number(t.totalQuantity || 0), 0);
    eventData.totalTickets = totalFromTiers;
    eventData.availableTickets = totalFromTiers;
    // Set ticketPrice to cheapest tier for display
    eventData.ticketPrice = Math.min(...tiers.map((t) => Number(t.price || 0)));
  } else {
    eventData.availableTickets = eventData.totalTickets;
  }

  const event = await Event.create(eventData);
  return event;
};

const updateEvent = async (id, updateData, user, imageFile) => {
  const event = await Event.findById(id);
  if (!event) {
    const error = new Error('Event not found');
    error.statusCode = 404;
    throw error;
  }
  if (event.organizer.toString() !== user.id && user.role !== 'admin') {
    const error = new Error('Not authorized');
    error.statusCode = 403;
    throw error;
  }

  if (imageFile) {
    try {
      updateData.image = bufferToDataURI(imageFile.buffer, imageFile.mimetype);
    } catch (err) {
      console.error('Event image update conversion failed:', err);
    }
  }

  if (typeof updateData.ticketTiers === 'string') {
    try {
      updateData.ticketTiers = JSON.parse(updateData.ticketTiers);
    } catch {
      delete updateData.ticketTiers;
    }
  }

  Object.assign(event, updateData);
  return await event.save();
};

const deleteEvent = async (id, user) => {
  const event = await Event.findById(id);
  if (!event) {
    const error = new Error('Event not found');
    error.statusCode = 404;
    throw error;
  }
  if (event.organizer.toString() !== user.id && user.role !== 'admin') {
    const error = new Error('Not authorized');
    error.statusCode = 403;
    throw error;
  }
  await event.deleteOne();
};

const approveEvent = async (id, status) => {
  const validStatuses = ['pending', 'approved', 'rejected', 'live', 'closed', 'cancelled'];
  if (!validStatuses.includes(status)) {
    const error = new Error('Invalid status');
    error.statusCode = 400;
    throw error;
  }
  const event = await Event.findByIdAndUpdate(id, { status }, { new: true });
  if (!event) {
    const error = new Error('Event not found');
    error.statusCode = 404;
    throw error;
  }
  return event;
};

const getAttendanceStats = async (eventId) => {
  const event = await Event.findById(eventId).select('title date availableTickets totalTickets');
  if (!event) {
    const error = new Error('Event not found');
    error.statusCode = 404;
    throw error;
  }

  const [totals] = await Booking.aggregate([
    { $match: { event: event._id, status: { $in: ['confirmed', 'used'] } } },
    {
      $group: {
        _id: null,
        soldTickets: { $sum: '$ticketCount' },
        checkedInTickets: {
          $sum: {
            $cond: [{ $eq: ['$status', 'used'] }, '$ticketCount', 0],
          },
        },
        totalBookings: { $sum: 1 },
        checkedInBookings: {
          $sum: { $cond: [{ $eq: ['$status', 'used'] }, 1, 0] },
        },
      },
    },
  ]);

  const soldTickets = totals?.soldTickets || 0;
  const checkedInTickets = totals?.checkedInTickets || 0;

  return {
    eventId: String(event._id),
    title: event.title,
    date: event.date,
    totalTickets: event.totalTickets,
    remainingSeats: event.availableTickets,
    soldTickets,
    checkedInTickets,
    totalBookings: totals?.totalBookings || 0,
    checkedInBookings: totals?.checkedInBookings || 0,
  };
};

module.exports = { getAllEvents, getEventById, createEvent, updateEvent, deleteEvent, approveEvent, getAttendanceStats };
