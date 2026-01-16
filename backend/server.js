// ==========================
// server.js
// ==========================

// Imports
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const { setIO } = require('./src/utils/socket');
const quizRoutes = require('./src/routes/quizRoutes');
const authRoutes = require('./src/routes/authRoutes');
const quizAttemptRoutes = require('./src/routes/quizAttemptRoutes');
const dns = require('dns');

// Set DNS to use IPv4 first
dns.setDefaultResultOrder('ipv4first');

// Load environment variables
dotenv.config();

// Initialize app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================
// Routes
// ==========================
app.use('/api/quizzes', quizRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/quiz-attempts', quizAttemptRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date(),
    mongoConnected: mongoose.connection.readyState === 1,
  });
});

// Test Register Route
app.post('/api/test-register', (req, res) => {
  console.log('Test register route hit');
  console.log('Body:', req.body);
  res.json({ message: 'Test route works' });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('=== ERROR ===');
  console.error('Path:', req.path);
  console.error('Method:', req.method);
  console.error('Message:', err.message);
  console.error('Stack:', err.stack);
  console.error('=== END ERROR ===');

  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
  });
});

// ==========================
// MongoDB Connection & Start Server
// ==========================
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) throw new Error('MONGO_URI not defined in .env');

    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 30000, // 30 seconds timeout
      socketTimeoutMS: 45000,
      family: 4, // Force IPv4 (Node.js sometimes has issues with IPv6 DNS)
      retryWrites: true,
      w: 'majority',
      maxPoolSize: 10,
      minPoolSize: 2,
      maxIdleTimeMS: 30000,
      connectTimeoutMS: 30000,
      heartbeatFrequencyMS: 10000,
      retryReads: true,
      directConnection: false, // Use replica set routing
    });
    console.log('✓ MongoDB connected successfully');
    console.log(`Connected to DB: ${mongoose.connection.name}`);

    // Setup mongoose connection event handlers for resilience
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✓ MongoDB reconnected successfully');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message);
    });

    // ===== Socket.IO setup =====
    const server = http.createServer(app);
    const io = new Server(server, {
      cors: {
        origin: '*', // allow all origins for development
      },
    });

    setIO(io);

    // Socket event handlers (create a separate file socket.js)
    require('./socket')(io);

    server.listen(PORT, () => {
      console.log(`\n🚀 Server + Socket running at http://localhost:${PORT}`);
      console.log(`📝 Health check: http://localhost:${PORT}/api/health\n`);
    });

  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
};

startServer();
