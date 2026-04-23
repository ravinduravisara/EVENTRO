const express = require('express');
const router = express.Router();
const eventController = require('./event.controller');
const auth = require('../../middleware/auth');
const roleCheck = require('../../middleware/roleCheck');

router.get('/', eventController.getAllEvents);
router.get('/:id', eventController.getEventById);
<<<<<<< HEAD
router.get('/:id/image', eventController.getEventImage);
router.get('/:id/attendance', auth, roleCheck('admin', 'organizer'), eventController.getAttendanceStats);
router.post('/', auth, upload.single('image'), eventController.createEvent);
router.put('/:id', auth, upload.single('image'), eventController.updateEvent);
router.delete('/:id', auth, eventController.deleteEvent);
=======
router.post('/', auth, roleCheck('organizer', 'admin'), eventController.createEvent);
router.put('/:id', auth, roleCheck('organizer', 'admin'), eventController.updateEvent);
router.delete('/:id', auth, roleCheck('organizer', 'admin'), eventController.deleteEvent);
>>>>>>> parent of a197612 (Event management)
router.patch('/:id/approve', auth, roleCheck('admin'), eventController.approveEvent);

module.exports = router;
