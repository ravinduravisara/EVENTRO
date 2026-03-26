const express = require('express');
const router = express.Router();

const marketingController = require('./marketing.controller');
const auth = require('../../middleware/auth');
const roleCheck = require('../../middleware/roleCheck');

router.post('/send', auth, roleCheck('admin', 'organizer'), marketingController.sendCampaign);

module.exports = router;
