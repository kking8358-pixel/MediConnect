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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

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

// Start Node.js server and initialize MongoDB Atlas connection
async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`\n[MediConnect Node.js Server] Running at http://localhost:${PORT}`);
    console.log(`[Health Check] http://localhost:${PORT}/api/health\n`);
  });
}

startServer();
