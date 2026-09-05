import { Router } from 'express';
import { HospitalModel } from '../models/Hospital.js';

const router = Router();

// GET /api/hospitals
router.get('/', async (req, res) => {
  try {
    const hospitals = await HospitalModel.find().sort({ rating: -1 });
    return res.json(hospitals);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/hospitals/:id
router.get('/:id', async (req, res) => {
  try {
    const hospital = await HospitalModel.findOne({ id: req.params.id });
    if (!hospital) return res.status(404).json({ error: 'Hospital not found' });
    return res.json(hospital);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/hospitals
router.post('/', async (req, res) => {
  try {
    const data = req.body;
    const newHospital = new HospitalModel({
      ...data,
      id: data.id || `hosp-${Date.now()}`
    });
    const saved = await newHospital.save();
    return res.status(201).json(saved);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// PUT /api/hospitals/:id
router.put('/:id', async (req, res) => {
  try {
    const updated = await HospitalModel.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Hospital not found' });
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// DELETE /api/hospitals/:id
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await HospitalModel.findOneAndDelete({ id: req.params.id });
    if (!deleted) return res.status(404).json({ error: 'Hospital not found' });
    return res.json({ success: true, message: 'Hospital deleted' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
