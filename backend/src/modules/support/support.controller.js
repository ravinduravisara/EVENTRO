const supportService = require('./support.service');

const createPublicMessage = async (req, res, next) => {
  try {
    const result = await supportService.createPublicMessage(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const getAdminNotifications = async (req, res, next) => {
  try {
    const result = await supportService.getAdminNotifications();
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const markThreadRead = async (req, res, next) => {
  try {
    const result = await supportService.markThreadRead(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const replyToThread = async (req, res, next) => {
  try {
    const result = await supportService.replyToThread(req.params.id, req.body?.message, req.user);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPublicMessage,
  getAdminNotifications,
  markThreadRead,
  replyToThread,
};