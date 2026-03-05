const userService = require('./user.service');

const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const avatarBuffer = req.file ? req.file.buffer : null;
    
    const result = await userService.register({
      firstName,
      lastName,
      email,
      password,
      avatarBuffer,
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
    const user = await userService.updateProfile(req.user.id, req.body);
    res.json(user);
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

const getAllUsers = async (req, res, next) => {
  try {
    const result = await userService.getAllUsers();
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getProfile, updateProfile, verifyEmail, resendVerificationEmail, getAllUsers };
