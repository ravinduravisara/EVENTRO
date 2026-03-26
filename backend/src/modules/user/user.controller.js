const userService = require('./user.service');

const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const avatarBuffer = req.file ? req.file.buffer : null;
    const avatarMimeType = req.file ? req.file.mimetype : null;
    
    const result = await userService.register({
      firstName,
      lastName,
      email,
      password,
      avatarBuffer,
      avatarMimeType,
    });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await userService.login(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user = await userService.getProfile(req.user.id);
    res.json(user);
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const avatarBuffer = req.file ? req.file.buffer : null;
    const avatarMimeType = req.file ? req.file.mimetype : null;

    if (!req.file && typeof req.body?.avatarUrl === 'string') {
      req.body.avatar = req.body.avatarUrl;
    }

    const user = await userService.updateProfile(req.user.id, req.body, {
      avatarBuffer,
      avatarMimeType,
    });
    res.json(user);
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      const error = new Error('Current password, new password, and confirm password are required');
      error.statusCode = 400;
      throw error;
    }

    if (newPassword !== confirmPassword) {
      const error = new Error('New password and confirm password do not match');
      error.statusCode = 400;
      throw error;
    }

    const result = await userService.changePassword(req.user.id, currentPassword, newPassword);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;
    if (!token) {
      const error = new Error('Verification token is required');
      error.statusCode = 400;
      throw error;
    }
    const result = await userService.verifyEmail(token);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const verifyEmailOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      const error = new Error('Email and OTP are required');
      error.statusCode = 400;
      throw error;
    }

    const result = await userService.verifyEmailOtp(email, otp);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const resendVerificationEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      const error = new Error('Email is required');
      error.statusCode = 400;
      throw error;
    }
    const result = await userService.resendVerificationEmail(email);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const requestForgotAccessOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      const error = new Error('Email is required');
      error.statusCode = 400;
      throw error;
    }

    const result = await userService.requestForgotAccessOtp(email);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const verifyForgotAccessOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      const error = new Error('Email and OTP are required');
      error.statusCode = 400;
      throw error;
    }

    const result = await userService.verifyForgotAccessOtp(email, otp);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const result = await userService.getAllUsers();
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!role) {
      const error = new Error('Role is required');
      error.statusCode = 400;
      throw error;
    }

    const result = await userService.updateUserRole(id, role, req.user.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isBanned } = req.body;
    if (typeof isBanned !== 'boolean') {
      const error = new Error('isBanned must be boolean');
      error.statusCode = 400;
      throw error;
    }

    const result = await userService.updateUserStatus(id, isBanned, req.user.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await userService.deleteUser(id, req.user.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const deleteOwnProfile = async (req, res, next) => {
  try {
    const { currentPassword } = req.body;
    if (!currentPassword) {
      const error = new Error('Current password is required');
      error.statusCode = 400;
      throw error;
    }

    const result = await userService.deleteOwnProfile(req.user.id, currentPassword);
    res.json(result);
  } catch (error) {
    next(error);
  }
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
