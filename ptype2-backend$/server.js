require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5500',  // VS Code Live Server
    'http://127.0.0.1:5500',  // Alternative Live Server URL
    'http://localhost:3000'   // React/Vite
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'))

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/game', require('./routes/game.routes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

// Modified server startup with error handling
const PORT = process.env.PORT || 5001; // Changed from 5000 to 5001

const startServer = async () => {
  try {
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.log(`Port ${PORT} is in use, trying port ${Number(PORT)+1}...`);
        app.listen(Number(PORT)+1);
      } else {
        console.error('Server error:', error);
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();