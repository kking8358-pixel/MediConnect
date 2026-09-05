import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, isDbConnected } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import hospitalRoutes from './routes/hospitalRoutes.js';
import ruleRoutes from './routes/ruleRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import reminderRoutes from './routes/reminderRoutes.js';
import symptomCheckRoutes from './routes/symptomCheckRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import { buildDocumentationPDF } from './generateDocsPdf.js';
import { testEmailConnection } from './services/emailService.js';

dotenv.config();

// Process safety: prevent unhandled errors from terminating the server process
process.on('uncaughtException', (err) => {
  console.error('[Server Safety] Uncaught Exception:', err.message);
});

process.on('unhandledRejection', (reason) => {
  console.error('[Server Safety] Unhandled Rejection:', reason);
});

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Health Check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    database: isDbConnected() ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// PDF Documentation Re-Generator
app.get('/api/generate-docs-pdf', (_req, res) => {
  try {
    const result = buildDocumentationPDF();
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Test Email Notification Route
app.get('/api/test-email', async (req, res) => {
  try {
    const to = req.query.to;
    const result = await testEmailConnection(to);
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/rules', ruleRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/symptom-checks', symptomCheckRoutes);
app.use('/api/notifications', notificationRoutes);

// 404 handler for unknown API routes
app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Graceful server starter with EADDRINUSE auto-retry
let serverInstance = null;

function listenWithRetry(port, attempts = 5) {
  serverInstance = app.listen(port, () => {
    console.log(`\n[MediConnect Node.js Server] Running at http://localhost:${port}`);
    console.log(`[Health Check] http://localhost:${port}/api/health\n`);
  });

  serverInstance.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`[Server] Port ${port} is busy. Retrying in 1.5 seconds (attempts remaining: ${attempts})...`);
      if (attempts > 0) {
        setTimeout(() => {
          try {
            serverInstance.close();
          } catch (_) {}
          listenWithRetry(port, attempts - 1);
        }, 1500);
      } else {
        console.error(`[Server Error] Port ${port} is permanently in use by another process.`);
      }
    } else {
      console.error('[Server Error]', err.message);
    }
  });
}

// Graceful process shutdown
function shutdown() {
  if (serverInstance) {
    serverInstance.close(() => {
      console.log('[Server] Closed existing server.');
    });
  }
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

async function startServer() {
  await connectDB();
  listenWithRetry(PORT);
}

startServer();
