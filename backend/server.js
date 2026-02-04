const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { testConnection } = require('./config/database');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// =============================================
// MIDDLEWARE
// =============================================

// CORS configuration
// CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175'
    ];

    // In development, allow any localhost origin
    const isDevelopment = process.env.NODE_ENV === 'development';

    if (allowedOrigins.includes(origin) || (isDevelopment && origin.startsWith('http://localhost:'))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request logging middleware (development)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// =============================================
// ROUTES
// =============================================

// Health check route
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Placement Management System API is running',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/drives', require('./routes/driveRoutes'));
app.use('/api/applications', require('./routes/applicationRoutes'));
app.use('/api/inbox', require('./routes/inboxRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));

// Admin API routes
app.use('/api/admin/companies', require('./routes/adminCompanyRoutes'));
app.use('/api/admin/students', require('./routes/adminStudentRoutes'));
app.use('/api/admin/applications', require('./routes/adminApplicationRoutes'));
app.use('/api/admin/messages', require('./routes/adminMessageRoutes'));
app.use('/api/admin/notifications', require('./routes/adminNotificationRoutes'));
app.use('/api/admin/stats', require('./routes/adminStatsRoutes'));

// =============================================
// ERROR HANDLING
// =============================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// =============================================
// SERVER INITIALIZATION
// =============================================

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Test database connection
    await testConnection();

    // Start server
    app.listen(PORT, () => {
      console.log(`\n🚀 Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV}`);
      console.log(`🔗 API URL: http://localhost:${PORT}`);
      console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
