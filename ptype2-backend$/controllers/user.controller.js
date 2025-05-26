const User = require('../models/User');

// @desc    Update user profile
// @route   PUT /api/users/update
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { levelsCompleted, typingSpeed } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        levelsCompleted,
        typingSpeed
      },
      {
        new: true,
        runValidators: true
      }
    );

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