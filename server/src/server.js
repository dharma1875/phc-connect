const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const { testConnection, pool } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const ddhsRoutes = require('./modules/ddhs/ddhsRoutes');
const alertRoutes = require('./modules/alerts/alertRoutes');
const { startAlertScheduler } = require('./modules/alerts/alertScheduler');
const reportRoutes = require('./modules/reports/reportRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
let server;
let schedulerTimer;

app.set('trust proxy', 1);
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origin === CLIENT_URL || /^http:\/\/localhost(:\d+)?$/.test(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error('CORS policy does not allow this origin.'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Please try again later.' },
  skipSuccessfulRequests: false,
});

app.use('/api/auth/login', loginLimiter);

app.get('/api/health', async (req, res) => {
  const dbReady = await testConnection();

  res.status(dbReady ? 200 : 503).json({
    success: true,
    message: 'PHC CONNECT API is running',
    database: dbReady ? 'connected' : 'unavailable',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/ddhs', ddhsRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/reports', reportRoutes);

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'PHC CONNECT API is running.',
  });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

app.use((error, req, res, next) => {
  if (error && error.message && /CORS policy/.test(error.message)) {
    return res.status(403).json({ success: false, message: 'Origin not allowed.' });
  }

  console.error('Unhandled API error:', error.message || error);
  return res.status(500).json({ success: false, message: 'Internal server error.' });
});

function shutdown(signal) {
  if (schedulerTimer) {
    clearInterval(schedulerTimer);
    schedulerTimer = null;
  }

  if (server) {
    server.close(() => {
      if (pool && typeof pool.end === 'function') {
        pool.end(() => {
          console.log(`Server shutdown complete after ${signal}.`);
          process.exit(0);
        });
      } else {
        console.log(`Server shutdown complete after ${signal}.`);
        process.exit(0);
      }
    });
  } else {
    process.exit(0);
  }
}

if (require.main === module) {
  schedulerTimer = startAlertScheduler();
  server = app.listen(PORT, () => {
    console.log(`PHC CONNECT server is running on port ${PORT}`);
  });

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

module.exports = app;
