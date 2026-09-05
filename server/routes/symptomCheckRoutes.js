import { Router } from 'express';
import { SymptomCheckModel } from '../models/SymptomCheck.js';

const router = Router();

// GET /api/symptom-checks
router.get('/', async (req, res) => {
  try {
    const { patientId } = req.query;
    const filter = patientId ? { patientId } : {};
    const checks = await SymptomCheckModel.find(filter).sort({ createdAt: -1 });
    return res.json(checks);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/symptom-checks
router.post('/', async (req, res) => {
  try {
    const data = req.body;
    const newCheck = new SymptomCheckModel({
      ...data,
      id: data.id || `chk-${Date.now()}`,
      createdAt: data.createdAt || new Date().toISOString()
    });
    const saved = await newCheck.save();
    return res.status(201).json(saved);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
