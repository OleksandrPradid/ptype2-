const mongoose = require('mongoose');

const GameStatsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  level: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  wpm: {
    type: Number,
    required: true
  },
  accuracy: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  time: {
    type: Number,
    required: true
  },
  completedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('GameStats', GameStatsSchema);