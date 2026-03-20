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

module.exports = { getAllEvents, getEventById, createEvent, updateEvent, deleteEvent, approveEvent, adminDeleteEvent, getAttendanceStats };
