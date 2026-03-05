const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const auth = require('../../middleware/auth');
const roleCheck = require('../../middleware/roleCheck');
const upload = require('../../middleware/upload');

router.post('/register', upload.single('avatar'), userController.register);
router.post('/login', userController.login);
router.get('/verify-email', userController.verifyEmail);
router.post('/resend-verification-email', userController.resendVerificationEmail);
router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, userController.updateProfile);
router.get('/', userController.getAllUsers);

module.exports = router;
