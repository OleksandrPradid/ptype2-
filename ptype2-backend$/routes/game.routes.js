const express = require('express');
const { saveGameStats, getGameHistory } = require('../controllers/game.controller');
const { protect } = require('../middlewares/auth');

const router = express.Router();

router.post('/save', protect, saveGameStats);
router.get('/history', protect, getGameHistory);

module.exports = router;