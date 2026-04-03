const express = require('express');

const supportController = require('./support.controller');
const auth = require('../../middleware/auth');
const roleCheck = require('../../middleware/roleCheck');

const router = express.Router();

router.post('/messages', supportController.createPublicMessage);
router.get('/admin/notifications', auth, roleCheck('admin', 'organizer'), supportController.getAdminNotifications);
router.post('/admin/threads/:id/read', auth, roleCheck('admin', 'organizer'), supportController.markThreadRead);
router.post('/admin/threads/:id/reply', auth, roleCheck('admin', 'organizer'), supportController.replyToThread);

module.exports = router;