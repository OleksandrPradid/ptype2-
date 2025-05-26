const User = require('../models/User');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Create user
    const user = await User.create({
      username,
      password
    });

    // Create token
    const token = jwt.sign({ id: user._id }, config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRE
    });

    // Set cookie
    res.cookie('token', token, {
      expires: new Date(Date.now() + config.COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    });

    res.status(201).json({
      success: true,
      data: {
        username: user.username,
        levelsCompleted: user.levelsCompleted,
        typingSpeed: user.typingSpeed,
        profilePicture: user.profilePicture
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Validate username and password
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username and password'
      });
    }

    // Check for user
    const user = await User.findOne({ username }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Create token
    const token = jwt.sign({ id: user._id }, config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRE
    });

    // Set cookie
    res.cookie('token', token, {
      expires: new Date(Date.now() + config.COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    });

    res.status(200).json({
      success: true,
      data: {
        username: user.username,
        levelsCompleted: user.levelsCompleted,
        typingSpeed: user.typingSpeed,
        profilePicture: user.profilePicture
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Logout user
// @route   GET /api/auth/logout
// @access  Private
exports.logout = (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    data: {}
  });
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        username: user.username,
        levelsCompleted: user.levelsCompleted,
        typingSpeed: user.typingSpeed,
        profilePicture: user.profilePicture
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Guest login
// @route   POST /api/auth/guest
// @access  Public
exports.guestLogin = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        username: 'Guest',
        levelsCompleted: 0,
        typingSpeed: 0,
        profilePicture: 'https://i.imgur.com/JqYeXZk.png'
      }
    });
  } catch (err) {
    next(err);
  }
};