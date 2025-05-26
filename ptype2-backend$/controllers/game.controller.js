const GameStats = require('../models/GameStats');
const User = require('../models/User');

// @desc    Save game results
// @route   POST /api/game/save
// @access  Private
exports.saveGameStats = async (req, res, next) => {
  try {
    const { level, wpm, accuracy, time } = req.body;

    // Save game stats
    const gameStats = await GameStats.create({
      user: req.user.id,
      level,
      wpm,
      accuracy,
      time
    });

    // Update user's progress if they completed a new level
    const user = await User.findById(req.user.id);
    if (level === user.levelsCompleted + 1) {
      user.levelsCompleted = level;
      user.typingSpeed = wpm;
      await user.save();
    }

    res.status(201).json({
      success: true,
      data: {
        username: user.username,
        levelsCompleted: user.levelsCompleted,
        typingSpeed: user.typingSpeed,
        profilePicture: user.profilePicture,
        stats: gameStats
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user's game history
// @route   GET /api/game/history
// @access  Private
exports.getGameHistory = async (req, res, next) => {
  try {
    const gameStats = await GameStats.find({ user: req.user.id })
      .sort('-completedAt')
      .limit(10);

    res.status(200).json({
      success: true,
      count: gameStats.length,
      data: gameStats
    });
  } catch (err) {
    next(err);
  }
};