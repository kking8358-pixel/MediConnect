import { Router } from 'express';
import { UserModel } from '../models/User.js';

const router = Router();

// GET /api/doctors
router.get('/', async (req, res) => {
  try {
    const doctors = await UserModel.find({ role: 'doctor' }).sort({ rating: -1 });
    return res.json(doctors);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/doctors/:id
router.get('/:id', async (req, res) => {
  try {
    const doctor = await UserModel.findOne({ id: req.params.id, role: 'doctor' });
    if (!doctor) return res.status(404).json({ error: 'Doctor not found' });
    return res.json(doctor);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/doctors
router.post('/', async (req, res) => {
  try {
    const data = req.body;
    const newDoc = new UserModel({
      ...data,
      id: data.id || `doc-${Date.now()}`,
      role: 'doctor'
    });
    const saved = await newDoc.save();
    return res.status(201).json(saved);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// PUT /api/doctors/:id
router.put('/:id', async (req, res) => {
  try {
    const updated = await UserModel.findOneAndUpdate(
      { id: req.params.id, role: 'doctor' },
      { $set: req.body },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Doctor not found' });
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// PATCH /api/doctors/:id/verify
router.patch('/:id/verify', async (req, res) => {
  try {
    const { verified } = req.body;
    const updated = await UserModel.findOneAndUpdate(
      { id: req.params.id, role: 'doctor' },
      { $set: { isVerified: Boolean(verified) } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Doctor not found' });
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
