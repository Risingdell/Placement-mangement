const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const path = require('path');
const { testConnection } = require('./config/database');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Trust proxy for rate limiting on Render
app.set('trust proxy', 1);

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow Cloudinary/Supabase assets
}));

// =============================================
// MIDDLEWARE
// =============================================

// CORS — explicit whitelist only, no wildcards
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server / curl (no Origin header)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // In development only, allow any localhost
    if (process.env.NODE_ENV === 'development' && origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
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

const healthResponse = () => ({
  status: 'OK',
  message: 'Placement Management System API is running',
  timestamp: new Date().toISOString()
});

// Health check routes for Render, Uptime Kuma, and direct browser checks
app.get('/', (req, res) => {
  res.json(healthResponse());
});

app.get('/health', (req, res) => {
  res.json({
    ...healthResponse()
  });
});

// API routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/drives', require('./routes/driveRoutes'));
app.use('/api', require('./routes/attendeeRoutes'));
app.use('/api/applications', require('./routes/applicationRoutes'));
app.use('/api/inbox', require('./routes/inboxRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));

// Public companies list (for student dashboard)
app.use('/api/companies', require('./routes/companyRoutes'));

// Admin API routes
app.use('/api/admin/companies', require('./routes/adminCompanyRoutes'));
app.use('/api/admin/students', require('./routes/adminStudentRoutes'));
app.use('/api/admin/applications', require('./routes/adminApplicationRoutes'));
app.use('/api/admin/messages', require('./routes/adminMessageRoutes'));
app.use('/api/admin/notifications', require('./routes/adminNotificationRoutes'));
app.use('/api/admin/stats', require('./routes/adminStatsRoutes'));
app.use('/api/admin/authorized-emails', require('./routes/authorizedEmailRoutes'));

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
