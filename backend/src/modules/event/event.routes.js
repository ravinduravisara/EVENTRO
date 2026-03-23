const express = require('express');
const router = express.Router();
const eventController = require('./event.controller');
const auth = require('../../middleware/auth');
const roleCheck = require('../../middleware/roleCheck');
const upload = require('../../middleware/upload');

router.get('/', eventController.getAllEvents);
router.get('/:id', eventController.getEventById);
router.get('/:id/image', eventController.getEventImage);
router.get('/:id/attendance', auth, roleCheck('admin', 'organizer'), eventController.getAttendanceStats);
router.post('/', auth, upload.single('image'), eventController.createEvent);
router.put('/:id', auth, upload.single('image'), eventController.updateEvent);
router.delete('/:id', auth, eventController.deleteEvent);
router.patch('/:id/approve', auth, roleCheck('admin'), eventController.approveEvent);

// Admin-only routes (dashboard uses localStorage auth, not JWT)
router.patch('/:id/status', eventController.approveEvent);
router.delete('/:id/admin', eventController.adminDeleteEvent);

module.exports = router;
