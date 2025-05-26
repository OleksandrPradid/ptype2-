const express = require('express');
const { register, login, logout, getMe, guestLogin } = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.js');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/guest', guestLogin);
router.get('/logout', protect, logout);
router.get('/me', protect, getMe);
router.get('/guest', guestLogin);

module.exports = router;