const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const auth = require('../../middleware/auth');
const roleCheck = require('../../middleware/roleCheck');
const upload = require('../../middleware/upload');

router.post('/register', upload.single('avatar'), userController.register);
router.post('/login', userController.login);
router.get('/verify-email', userController.verifyEmail);
router.post('/verify-email-otp', userController.verifyEmailOtp);
router.post('/resend-verification-email', userController.resendVerificationEmail);
router.post('/forgot-access-otp/request', userController.requestForgotAccessOtp);
router.post('/forgot-access-otp/verify', userController.verifyForgotAccessOtp);
router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, upload.single('avatar'), userController.updateProfile);
router.put('/profile/password', auth, userController.changePassword);
router.delete('/profile', auth, userController.deleteOwnProfile);
router.get('/', auth, roleCheck('admin', 'organizer'), userController.getAllUsers);
router.patch('/:id/role', auth, roleCheck('admin', 'organizer'), userController.updateUserRole);
router.patch('/:id/status', auth, roleCheck('admin', 'organizer'), userController.updateUserStatus);
router.delete('/:id', auth, roleCheck('admin'), userController.deleteUser);

module.exports = router;
