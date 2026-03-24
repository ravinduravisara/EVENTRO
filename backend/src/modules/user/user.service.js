const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../../models/User');
const cloudinary = require('../../config/cloudinary');
const { sendVerificationEmail } = require('../../utils/emailVerification');
const logger = require('../../utils/logger');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'eventro/avatars', resource_type: 'image' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    uploadStream.end(buffer);
  });
};

const register = async ({ firstName, lastName, email, password, avatarBuffer }) => {
  const existingUser = await User.findOne({ email });
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
      console.error('Avatar upload failed:', uploadError);
      // Continue registration even if avatar upload fails
    }
  }

  // Generate email verification token
  const emailVerificationToken = crypto.randomBytes(32).toString('hex');
  const emailVerificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  const user = await User.create({ 
    firstName, 
    lastName, 
    email, 
    password,
    avatar: avatarUrl,
    emailVerificationToken,
    emailVerificationTokenExpires,
  });

  // Send verification email
  try {
    await sendVerificationEmail(email, firstName, emailVerificationToken);
  } catch (emailError) {
    logger.error(`Failed to send verification email: ${emailError.message}`);
    // Don't throw error, user can still complete registration
    // They can request email resend later
  }

  return {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    isEmailVerified: user.isEmailVerified,
    token: generateToken(user._id),
    message: 'Registration successful! Please check your email to verify your account.',
  };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
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

const updateProfile = async (userId, updateData) => {
  // Only allow safe, user-editable fields.
  const allowed = ['firstName', 'lastName', 'avatar'];
  const safeUpdate = allowed.reduce((acc, key) => {
    if (Object.prototype.hasOwnProperty.call(updateData || {}, key)) {
      acc[key] = updateData[key];
    }
    return acc;
  }, {});

  const user = await User.findByIdAndUpdate(userId, safeUpdate, {
    new: true,
    runValidators: true,
  }).select('-password');
  return user;
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

const resendVerificationEmail = async (email) => {
  const user = await User.findOne({ email });

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  if (user.isEmailVerified) {
    const error = new Error('Email already verified');
    error.statusCode = 400;
    throw error;
  }

  // Generate new verification token
  const emailVerificationToken = crypto.randomBytes(32).toString('hex');
  const emailVerificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  user.emailVerificationToken = emailVerificationToken;
  user.emailVerificationTokenExpires = emailVerificationTokenExpires;
  await user.save();

  // Send verification email
  try {
    await sendVerificationEmail(email, user.firstName, emailVerificationToken);
  } catch (emailError) {
    logger.error(`Failed to send verification email: ${emailError.message}`);
    throw new Error('Failed to send verification email');
  }

  return { message: 'Verification email sent!' };
};

const getAllUsers = async () => {
  const users = await User.find()
    .select('-password -emailVerificationToken -emailVerificationTokenExpires')
    .sort({ createdAt: -1 })
    .lean();
  return { users };
};

module.exports = { register, login, getProfile, updateProfile, verifyEmail, resendVerificationEmail, getAllUsers };
