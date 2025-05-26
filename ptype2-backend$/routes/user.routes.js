const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ message: 'No token provided' });
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Invalid token' });
        req.userId = decoded.id;
        next();
    });
};

router.get('/me', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.put('/progress', verifyToken, async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.userId,
            { $set: req.body },
            { new: true }
        ).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;