import { Router } from 'express';
import { HealthReportModel } from '../models/HealthReport.js';

const router = Router();

// GET /api/reports
router.get('/', async (req, res) => {
  try {
    const { patientId, doctorId } = req.query;
    const filter = {};
    if (patientId) filter.patientId = patientId;
    if (doctorId) filter.sharedWithDoctorIds = doctorId;

    const reports = await HealthReportModel.find(filter).sort({ createdAt: -1 });
    return res.json(reports);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/reports
router.post('/', async (req, res) => {
  try {
    const data = req.body;
    const newReport = new HealthReportModel({
      ...data,
      id: data.id || `rep-${Date.now()}`,
      createdAt: data.createdAt || new Date().toISOString(),
      sharedWithDoctorIds: data.sharedWithDoctorIds || [],
      doctorNotes: data.doctorNotes || []
    });
    const saved = await newReport.save();
    return res.status(201).json(saved);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/reports/:id/share
router.post('/:id/share', async (req, res) => {
  try {
    const { doctorId } = req.body;
    const report = await HealthReportModel.findOne({ id: req.params.id });
    if (!report) return res.status(404).json({ error: 'Report not found' });

    if (!report.sharedWithDoctorIds.includes(doctorId)) {
      report.sharedWithDoctorIds.push(doctorId);
      await report.save();
    }
    return res.json(report);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/reports/:id/notes
router.post('/:id/notes', async (req, res) => {
  try {
    const noteData = req.body;
    const report = await HealthReportModel.findOne({ id: req.params.id });
    if (!report) return res.status(404).json({ error: 'Report not found' });

    const note = {
      ...noteData,
      id: noteData.id || `note-${Date.now()}`,
      createdAt: noteData.createdAt || new Date().toISOString()
    };

    report.doctorNotes.push(note);
    await report.save();
    return res.status(201).json(report);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
