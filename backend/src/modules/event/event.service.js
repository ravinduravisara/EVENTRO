const Event = require('../../models/Event');

const getAllEvents = async (query = {}) => {
  const { category, status, page = 1, limit = 10 } = query;
  const filter = {};
  if (status) filter.status = status;
  if (category) filter.category = category;

  const events = await Event.find(filter)
    .populate('organizer', 'name email')
    .sort({ date: 1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Event.countDocuments(filter);
  return { events, total, page: Number(page), pages: Math.ceil(total / limit) };
};

const getEventById = async (id) => {
  const event = await Event.findById(id).populate('organizer', 'name email');
  if (!event) {
    const error = new Error('Event not found');
    error.statusCode = 404;
    throw error;
  }
  return event;
};

const createEvent = async (eventData) => {
  const event = await Event.create(eventData);
  return event;
};

const updateEvent = async (id, updateData, user) => {
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
  const event = await Event.findByIdAndUpdate(id, { status }, { new: true });
  if (!event) {
    const error = new Error('Event not found');
    error.statusCode = 404;
    throw error;
  }
  return event;
};

module.exports = { getAllEvents, getEventById, createEvent, updateEvent, deleteEvent, approveEvent };
