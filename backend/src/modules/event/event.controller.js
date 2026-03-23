const eventService = require('./event.service');

const getAllEvents = async (req, res, next) => {
  try {
    const events = await eventService.getAllEvents(req.query);
    res.json(events);
  } catch (error) {
    next(error);
  }
};

const getEventById = async (req, res, next) => {
  try {
    const event = await eventService.getEventById(req.params.id);
    res.json(event);
  } catch (error) {
    next(error);
  }
};

const getEventImage = async (req, res, next) => {
  try {
    const result = await eventService.getEventImage(req.params.id);

    // Cache images aggressively (URLs will be cached by browser/CDN too)
    res.setHeader('Cache-Control', 'public, max-age=86400');
    if (result.updatedAt) {
      res.setHeader('Last-Modified', new Date(result.updatedAt).toUTCString());
    }

    if (result.type === 'redirect') {
      return res.redirect(302, result.url);
    }

    res.type(result.contentType || 'image/png');
    return res.send(result.buffer);
  } catch (error) {
    // Image endpoints are typically consumed by <img> tags.
    // For missing resources, return an empty 404 instead of JSON.
    if ((error.statusCode || 500) === 404) {
      return res.status(404).end();
    }
    next(error);
  }
};

const createEvent = async (req, res, next) => {
  try {
    const imageFile = req.file || null;
    const event = await eventService.createEvent(
      { ...req.body, organizer: req.user.id },
      imageFile
    );
    res.status(201).json(event);
  } catch (error) {
    next(error);
  }
};

const updateEvent = async (req, res, next) => {
  try {
    const imageFile = req.file || null;
    const event = await eventService.updateEvent(req.params.id, req.body, req.user, imageFile);
    res.json(event);
  } catch (error) {
    next(error);
  }
};

const deleteEvent = async (req, res, next) => {
  try {
    await eventService.deleteEvent(req.params.id, req.user);
    res.json({ message: 'Event removed' });
  } catch (error) {
    next(error);
  }
};

const approveEvent = async (req, res, next) => {
  try {
    const event = await eventService.approveEvent(req.params.id, req.body.status);
    res.json(event);
  } catch (error) {
    next(error);
  }
};

const adminDeleteEvent = async (req, res, next) => {
  try {
    const Event = require('../../models/Event');
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    await event.deleteOne();
    res.json({ message: 'Event deleted' });
  } catch (error) {
    next(error);
  }
};

const getAttendanceStats = async (req, res, next) => {
  try {
    const stats = await eventService.getAttendanceStats(req.params.id);
    res.json(stats);
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllEvents, getEventById, getEventImage, createEvent, updateEvent, deleteEvent, approveEvent, adminDeleteEvent, getAttendanceStats };
