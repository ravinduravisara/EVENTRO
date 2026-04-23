const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../../models/User');
const PendingRegistration = require('../../models/PendingRegistration');
const cloudinary = require('../../config/cloudinary');
const {
  sendVerificationEmail,
  sendReverificationSuccessEmail,
  sendForgotAccessOtpEmail,
} = require('../../utils/emailVerification');
const { sendBanNotificationEmail } = require('../../utils/banNotification');
const logger = require('../../utils/logger');

const generateNumericOtp = () => `${Math.floor(100000 + Math.random() * 900000)}`;

const hashOtp = (otp) => crypto.createHash('sha256').update(otp).digest('hex');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const normalizePaymentCards = (cards) => {
  if (!Array.isArray(cards)) {
    const error = new Error('Payment cards must be an array');
    error.statusCode = 400;
    throw error;
  }

  if (cards.length > 10) {
    const error = new Error('You can save up to 10 cards');
    error.statusCode = 400;
    throw error;
  }

  const normalizedCards = cards.map((card) => {
    const bankName = String(card?.bankName || '').trim();
    const cardholderName = String(card?.cardholderName || '').trim();
    const brand = String(card?.brand || 'Card').trim() || 'Card';
    const last4 = String(card?.last4 || '').replace(/\D/g, '').slice(-4);
    const expiryMonth = Number(card?.expiryMonth);
    const expiryYear = Number(card?.expiryYear);

    if (!bankName) {
      const error = new Error('Bank name is required for saved cards');
      error.statusCode = 400;
      throw error;
    }

    if (!cardholderName) {
      const error = new Error('Cardholder name is required for saved cards');
      error.statusCode = 400;
      throw error;
    }

    if (last4.length !== 4) {
      const error = new Error('Saved cards must include the last four digits');
      error.statusCode = 400;
      throw error;
    }

    if (!Number.isInteger(expiryMonth) || expiryMonth < 1 || expiryMonth > 12) {
      const error = new Error('Saved cards must include a valid expiry month');
      error.statusCode = 400;
      throw error;
    }

    if (!Number.isInteger(expiryYear) || expiryYear < 2000 || expiryYear > 9999) {
      const error = new Error('Saved cards must include a valid expiry year');
      error.statusCode = 400;
      throw error;
    }

    const normalizedCard = {
      bankName,
      cardholderName,
      brand,
      last4,
      expiryMonth,
      expiryYear,
      isDefault: Boolean(card?.isDefault),
    };

    if (card?._id && mongoose.Types.ObjectId.isValid(card._id)) {
      normalizedCard._id = card._id;
    }

    return normalizedCard;
  });

  if (normalizedCards.length > 0) {
    let defaultIndex = normalizedCards.findIndex((card) => card.isDefault);
    if (defaultIndex === -1) defaultIndex = 0;

    normalizedCards.forEach((card, index) => {
      card.isDefault = index === defaultIndex;
    });
  }

  return normalizedCards;
};

const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'eventro/avatars', resource_type: 'image' },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        if (!result || !result.secure_url) {
          reject(new Error('Cloudinary upload did not return a secure URL'));
          return;
        }
        resolve(result.secure_url);
      }
    );
    uploadStream.end(buffer);
  });
};

const register = async ({ firstName, lastName, email, password, avatarBuffer, avatarMimeType }) => {
  const normalizedEmail = String(email || '').toLowerCase().trim();

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    const error = new Error('User already exists');
    error.statusCode = 400;
    throw error;
  }

  let avatarUrl = '';
  if (avatarBuffer) {
    try {
      avatarUrl = await uploadToCloudinary(avatarBuffer);
    } catch (uploadError) {
      logger.error(`Avatar upload failed: ${uploadError.message}`);

      // Fallback: persist avatar as data URL when cloud storage is unavailable.
      // This keeps profile images visible in environments without Cloudinary keys.
      const safeMimeType = String(avatarMimeType || 'image/jpeg').trim();
      avatarUrl = `data:${safeMimeType};base64,${avatarBuffer.toString('base64')}`;
    }
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  // Generate OTP for email verification
  const otp = generateNumericOtp();
  const otpHash = hashOtp(otp);
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await PendingRegistration.findOneAndUpdate(
    { email: normalizedEmail },
    {
      firstName,
      lastName,
      email: normalizedEmail,
      passwordHash,
      avatar: avatarUrl,
      otpHash,
      otpExpiresAt,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );

  // Clean up any legacy unverified user record for the same email.
  await User.deleteOne({ email: normalizedEmail, isEmailVerified: false });

  // Send verification OTP email
  try {
    await sendVerificationEmail(normalizedEmail, firstName, otp);
  } catch (emailError) {
    logger.error(`Failed to send verification email: ${emailError.message}`);
    // Don't block registration if email provider is unavailable.
  }

  return {
    firstName,
    lastName,
    email: normalizedEmail,
    role: 'user',
    avatar: avatarUrl,
    isEmailVerified: false,
    message: 'Registration successful! Enter the OTP sent to your email to verify your account.',
  };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  if (user.isBanned) {
    const error = new Error('Your account has been suspended. Please contact support.');
    error.statusCode = 403;
    throw error;
  }

  // Check if email is verified
  if (!user.isEmailVerified) {
    const error = new Error('Please verify your email before logging in');
    error.statusCode = 403;
    error.unverifiedEmail = true;
    throw error;
  }

  return {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    preferences: user.preferences,
    paymentCards: user.paymentCards,
    token: generateToken(user._id),
  };
};

const getProfile = async (userId) => {
  const user = await User.findById(userId).select('-password');
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  return user;
};

const updateProfile = async (userId, updateData, uploadData = {}) => {
  const { avatarBuffer, avatarMimeType } = uploadData;

  // Only allow safe, user-editable fields.
  const allowed = ['firstName', 'lastName', 'avatar', 'preferences', 'paymentCards'];
  const safeUpdate = allowed.reduce((acc, key) => {
    if (Object.prototype.hasOwnProperty.call(updateData || {}, key)) {
      acc[key] = updateData[key];
    }
    return acc;
  }, {});

  if (safeUpdate.preferences && typeof safeUpdate.preferences === 'object') {
    const incoming = safeUpdate.preferences;
    const allowedPreferenceKeys = [
      'emailNotifications',
      'marketingEmails',
      'eventReminders',
      'preferredLanguage',
      'preferredTheme',
    ];

    const nextPreferences = {};
    for (const key of allowedPreferenceKeys) {
      if (Object.prototype.hasOwnProperty.call(incoming, key)) {
        nextPreferences[key] = incoming[key];
      }
    }

    const booleanKeys = ['emailNotifications', 'marketingEmails', 'eventReminders'];
    for (const key of booleanKeys) {
      if (Object.prototype.hasOwnProperty.call(nextPreferences, key)) {
        nextPreferences[key] = Boolean(nextPreferences[key]);
      }
    }

    const allowedLanguages = ['en', 'si', 'ta'];
    if (
      Object.prototype.hasOwnProperty.call(nextPreferences, 'preferredLanguage') &&
      !allowedLanguages.includes(nextPreferences.preferredLanguage)
    ) {
      delete nextPreferences.preferredLanguage;
    }

    const allowedThemes = ['light', 'dark', 'system'];
    if (
      Object.prototype.hasOwnProperty.call(nextPreferences, 'preferredTheme') &&
      !allowedThemes.includes(nextPreferences.preferredTheme)
    ) {
      delete nextPreferences.preferredTheme;
    }

    safeUpdate.preferences = nextPreferences;
  }

  if (Object.prototype.hasOwnProperty.call(safeUpdate, 'paymentCards')) {
    safeUpdate.paymentCards = normalizePaymentCards(safeUpdate.paymentCards);
  }

  if (avatarBuffer) {
    try {
      safeUpdate.avatar = await uploadToCloudinary(avatarBuffer);
    } catch (uploadError) {
      logger.error(`Profile avatar upload failed: ${uploadError.message}`);
      const safeMimeType = String(avatarMimeType || 'image/jpeg').trim();
      safeUpdate.avatar = `data:${safeMimeType};base64,${avatarBuffer.toString('base64')}`;
    }
  }

  const user = await User.findByIdAndUpdate(userId, safeUpdate, {
    new: true,
    runValidators: true,
  }).select('-password');
  return user;
};

const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const isCurrentPasswordValid = await user.matchPassword(String(currentPassword || ''));
  if (!isCurrentPasswordValid) {
    const error = new Error('Current password is incorrect');
    error.statusCode = 400;
    throw error;
  }

  const nextPassword = String(newPassword || '');
  if (nextPassword.length < 8) {
    const error = new Error('New password must be at least 8 characters long');
    error.statusCode = 400;
    throw error;
  }
  if (!/[A-Z]/.test(nextPassword) || !/[a-z]/.test(nextPassword) || !/[0-9]/.test(nextPassword)) {
    const error = new Error('New password must include uppercase, lowercase, and a number');
    error.statusCode = 400;
    throw error;
  }

  const isSamePassword = await user.matchPassword(nextPassword);
  if (isSamePassword) {
    const error = new Error('New password must be different from the current password');
    error.statusCode = 400;
    throw error;
  }

  user.password = nextPassword;
  await user.save();

  return { message: 'Password updated successfully' };
};

const verifyEmail = async (token) => {
  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationTokenExpires: { $gt: Date.now() },
  });

  if (!user) {
    const error = new Error('Invalid or expired verification token');
    error.statusCode = 400;
    throw error;
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = null;
  user.emailVerificationTokenExpires = null;
  await user.save();

  return {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    isEmailVerified: user.isEmailVerified,
    message: 'Email verified successfully!',
  };
};

const verifyEmailOtp = async (email, otp) => {
  const normalizedEmail = String(email || '').toLowerCase().trim();
  const normalizedOtp = String(otp || '').trim();

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser && existingUser.isEmailVerified) {
    return { message: 'Email is already verified.' };
  }

  // Prefer pending registration flow. Keep legacy user OTP as fallback.
  const pending = await PendingRegistration.findOne({ email: normalizedEmail });
  if (pending) {
    if (pending.otpExpiresAt.getTime() < Date.now()) {
      const error = new Error('OTP has expired. Please request a new OTP.');
      error.statusCode = 400;
      throw error;
    }

    if (hashOtp(normalizedOtp) !== pending.otpHash) {
      const error = new Error('Invalid OTP');
      error.statusCode = 400;
      throw error;
    }

    const user = await User.create({
      firstName: pending.firstName,
      lastName: pending.lastName,
      email: pending.email,
      password: pending.passwordHash,
      avatar: pending.avatar,
      isEmailVerified: true,
      emailVerificationOtpHash: null,
      emailVerificationOtpExpires: null,
      emailVerificationToken: null,
      emailVerificationTokenExpires: null,
    });

    await PendingRegistration.deleteOne({ _id: pending._id });

    try {
      await sendReverificationSuccessEmail(user.email, user.firstName);
    } catch (emailError) {
      logger.error(`Failed to send re-verification success email: ${emailError.message}`);
    }

    return {
      message: 'Email verified successfully. You can now log in.',
    };
  }

  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  if (user.isEmailVerified) {
    return { message: 'Email is already verified.' };
  }

  if (!user.emailVerificationOtpHash || !user.emailVerificationOtpExpires) {
    const error = new Error('No OTP found. Please request a new OTP.');
    error.statusCode = 400;
    throw error;
  }

  if (user.emailVerificationOtpExpires.getTime() < Date.now()) {
    const error = new Error('OTP has expired. Please request a new OTP.');
    error.statusCode = 400;
    throw error;
  }

  if (hashOtp(normalizedOtp) !== user.emailVerificationOtpHash) {
    const error = new Error('Invalid OTP');
    error.statusCode = 400;
    throw error;
  }

  user.isEmailVerified = true;
  user.emailVerificationOtpHash = null;
  user.emailVerificationOtpExpires = null;
  user.emailVerificationToken = null;
  user.emailVerificationTokenExpires = null;
  await user.save();

  try {
    await sendReverificationSuccessEmail(user.email, user.firstName);
  } catch (emailError) {
    logger.error(`Failed to send re-verification success email: ${emailError.message}`);
  }

  return {
    message: 'Email verified successfully. You can now log in.',
  };
};

const resendVerificationEmail = async (email) => {
  const normalizedEmail = String(email || '').toLowerCase().trim();

  const user = await User.findOne({ email: normalizedEmail });

  if (user && user.isEmailVerified) {
    const error = new Error('Email already verified');
    error.statusCode = 400;
    throw error;
  }

  const pending = await PendingRegistration.findOne({ email: normalizedEmail });

  if (!user && !pending) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  // Generate and store new OTP
  const otp = generateNumericOtp();
  const otpHash = hashOtp(otp);
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

  let firstName = 'there';

  if (pending) {
    pending.otpHash = otpHash;
    pending.otpExpiresAt = otpExpiresAt;
    pending.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await pending.save();
    firstName = pending.firstName;
  } else {
    user.emailVerificationOtpHash = otpHash;
    user.emailVerificationOtpExpires = otpExpiresAt;
    user.emailVerificationToken = null;
    user.emailVerificationTokenExpires = null;
    await user.save();
    firstName = user.firstName;
  }

  // Send OTP email
  try {
    await sendVerificationEmail(normalizedEmail, firstName, otp);
  } catch (emailError) {
    logger.error(`Failed to send verification email: ${emailError.message}`);
    throw new Error('Failed to send verification email');
  }

  return { message: 'Verification OTP sent! Please check your email.' };
};

const requestForgotAccessOtp = async (email) => {
  const normalizedEmail = String(email || '').toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  if (user.isBanned) {
    const error = new Error('Your account has been suspended. Please contact support.');
    error.statusCode = 403;
    throw error;
  }

  if (!user.isEmailVerified) {
    const error = new Error('Please verify your email before using OTP access');
    error.statusCode = 403;
    error.unverifiedEmail = true;
    throw error;
  }

  const otp = generateNumericOtp();
  user.forgotAccessOtpHash = hashOtp(otp);
  user.forgotAccessOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  try {
    await sendForgotAccessOtpEmail(user.email, user.firstName, otp);
  } catch (emailError) {
    logger.error(`Failed to send forgot-access OTP email: ${emailError.message}`);
    throw new Error('Failed to send OTP');
  }

  return { message: 'OTP sent to your email. Enter it to access your account.' };
};

const verifyForgotAccessOtp = async (email, otp) => {
  const normalizedEmail = String(email || '').toLowerCase().trim();
  const normalizedOtp = String(otp || '').trim();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  if (user.isBanned) {
    const error = new Error('Your account has been suspended. Please contact support.');
    error.statusCode = 403;
    throw error;
  }

  if (!user.forgotAccessOtpHash || !user.forgotAccessOtpExpires) {
    const error = new Error('No OTP found. Please request a new OTP.');
    error.statusCode = 400;
    throw error;
  }

  if (user.forgotAccessOtpExpires.getTime() < Date.now()) {
    const error = new Error('OTP has expired. Please request a new OTP.');
    error.statusCode = 400;
    throw error;
  }

  if (hashOtp(normalizedOtp) !== user.forgotAccessOtpHash) {
    const error = new Error('Invalid OTP');
    error.statusCode = 400;
    throw error;
  }

  user.forgotAccessOtpHash = null;
  user.forgotAccessOtpExpires = null;
  await user.save();

  return {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    preferences: user.preferences,
    token: generateToken(user._id),
  };
};

<<<<<<< HEAD
const getAllUsers = async () => {
  const users = await User.find()
    .select('-password -emailVerificationToken -emailVerificationTokenExpires -emailVerificationOtpHash -emailVerificationOtpExpires')
    .sort({ createdAt: -1 })
    .lean();
  return { users };
};

const updateUserRole = async (userId, role, actorId) => {
  const allowedRoles = ['user', 'organizer', 'admin'];
  if (!allowedRoles.includes(role)) {
    const error = new Error('Invalid role');
    error.statusCode = 400;
    throw error;
  }

  if (String(userId) === String(actorId) && role !== 'admin') {
    const error = new Error('You cannot remove your own admin access');
    error.statusCode = 400;
    throw error;
  }

  const targetUser = await User.findById(userId).select('email');
  if (!targetUser) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const protectedAdminEmail = 'admin@eventro.com';
  const isProtectedAdmin =
    String(targetUser.email || '').toLowerCase() === protectedAdminEmail;
  const isSelfUpdate = String(userId) === String(actorId);

  if (isProtectedAdmin && !isSelfUpdate) {
    const error = new Error('Role for the protected admin account cannot be changed by other admins');
    error.statusCode = 403;
    throw error;
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { role },
    { new: true, runValidators: true }
  ).select('-password -emailVerificationToken -emailVerificationTokenExpires -emailVerificationOtpHash -emailVerificationOtpExpires');

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return { message: 'User role updated successfully', user };
};

const updateUserStatus = async (userId, isBanned, actorId) => {
  if (String(userId) === String(actorId) && isBanned) {
    const error = new Error('You cannot ban your own account');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { isBanned },
    { new: true, runValidators: true }
  ).select('-password -emailVerificationToken -emailVerificationTokenExpires -emailVerificationOtpHash -emailVerificationOtpExpires');

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  if (isBanned) {
    try {
      await sendBanNotificationEmail(user.email, user.firstName);
    } catch (emailError) {
      // Ban action should still succeed even if email delivery fails.
      logger.error(`Ban email dispatch failed for ${user.email}: ${emailError.message}`);
    }
  }

  return {
    message: isBanned ? 'User banned successfully' : 'User unbanned successfully',
    user,
  };
};

const deleteUser = async (userId, actorId) => {
  if (String(userId) === String(actorId)) {
    const error = new Error('You cannot delete your own account');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findById(userId).select('role');
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  if (user.role === 'admin') {
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount <= 1) {
      const error = new Error('Cannot delete the last admin account');
      error.statusCode = 400;
      throw error;
    }
  }

  await User.findByIdAndDelete(userId);
  return { message: 'User deleted successfully' };
};

const deleteOwnProfile = async (userId, currentPassword) => {
  const user = await User.findById(userId).select('email role password');
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const valid = await user.matchPassword(String(currentPassword || ''));
  if (!valid) {
    const error = new Error('Current password is incorrect');
    error.statusCode = 400;
    throw error;
  }

  const protectedAdminEmail = 'admin@eventro.com';
  const isProtectedAdmin = String(user.email || '').toLowerCase() === protectedAdminEmail;
  if (isProtectedAdmin) {
    const error = new Error('Protected admin account cannot be deleted');
    error.statusCode = 403;
    throw error;
  }

  if (user.role === 'admin') {
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount <= 1) {
      const error = new Error('Cannot delete the last admin account');
      error.statusCode = 400;
      throw error;
    }
  }

  await User.findByIdAndDelete(userId);
  return { message: 'Your profile has been deleted successfully' };
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  verifyEmail,
  verifyEmailOtp,
  resendVerificationEmail,
  requestForgotAccessOtp,
  verifyForgotAccessOtp,
  getAllUsers,
  updateUserRole,
  updateUserStatus,
  deleteUser,
  deleteOwnProfile,
};
=======
module.exports = { register, login, getProfile, updateProfile, verifyEmail, resendVerificationEmail };
>>>>>>> parent of a197612 (Event management)
