const express = require('express');
const router = express.Router();
const eventController = require('./event.controller');
const auth = require('../../middleware/auth');
const roleCheck = require('../../middleware/roleCheck');

router.get('/', eventController.getAllEvents);
router.get('/:id', eventController.getEventById);
router.post('/', auth, roleCheck('organizer', 'admin'), eventController.createEvent);
router.put('/:id', auth, roleCheck('organizer', 'admin'), eventController.updateEvent);
router.delete('/:id', auth, roleCheck('organizer', 'admin'), eventController.deleteEvent);
router.patch('/:id/approve', auth, roleCheck('admin'), eventController.approveEvent);

module.exports = router;
