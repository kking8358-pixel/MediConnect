import { Router } from 'express';
import { UserModel } from '../models/User.js';

const router = Router();

function hashPassword(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return 'pw_' + Math.abs(hash).toString(36);
}

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;
    if (!emailOrPhone) {
      return res.status(400).json({ error: 'Email or phone is required' });
    }

    const cleanInput = emailOrPhone.trim().toLowerCase();
    const user = await UserModel.findOne({
      $or: [{ email: cleanInput }, { phone: cleanInput }]
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.passwordHash) {
      if (!password) {
        return res.status(401).json({ error: 'Password is required' });
      }
      const computed = hashPassword(password);
      if (user.passwordHash !== computed && user.passwordHash !== password) {
        return res.status(401).json({ error: 'Incorrect password' });
      }
    }

    return res.json({ success: true, user });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/register-patient
router.post('/register-patient', async (req, res) => {
  try {
    const data = req.body;
    const existing = await UserModel.findOne({
      $or: [{ email: data.email.toLowerCase() }, { phone: data.phone }]
    });

    if (existing) {
      return res.status(409).json({ error: 'User with this email or phone already exists' });
    }

    const newPatient = new UserModel({
      id: data.id || `pat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      role: 'patient',
      name: data.name,
      email: data.email.toLowerCase(),
      phone: data.phone,
      isVerified: true,
      language: 'en',
      age: data.age,
      gender: data.gender,
      bloodGroup: data.bloodGroup,
      passwordHash: data.password ? hashPassword(data.password) : undefined,
      medicalHistory: [],
      allergies: [],
      createdAt: new Date().toISOString()
    });

    const saved = await newPatient.save();
    return res.status(201).json(saved);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/register-doctor
router.post('/register-doctor', async (req, res) => {
  try {
    const data = req.body;
    const existing = await UserModel.findOne({
      $or: [{ email: data.email.toLowerCase() }, { phone: data.phone }]
    });

    if (existing) {
      return res.status(409).json({ error: 'User with this email or phone already exists' });
    }

    const newDoctor = new UserModel({
      id: data.id || `doc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      role: 'doctor',
      name: data.name,
      email: data.email.toLowerCase(),
      phone: data.phone,
      isVerified: false,
      language: 'en',
      specialty: data.specialty,
      hospitalName: data.hospitalName,
      hospitalId: data.hospitalId || 'hosp-1',
      qualifications: data.qualifications,
      bmdcRegNumber: data.bmdcRegNumber,
      consultationFee: data.consultationFee || 1000,
      experienceYears: data.experienceYears || 5,
      rating: 5.0,
      ratingCount: 0,
      availability: [
        { day: 'Mon', slots: ['09:00 AM', '10:00 AM', '02:00 PM', '03:00 PM'] },
        { day: 'Wed', slots: ['10:00 AM', '11:00 AM', '04:00 PM', '05:00 PM'] },
        { day: 'Fri', slots: ['09:00 AM', '11:00 AM', '03:00 PM'] }
      ],
      passwordHash: data.password ? hashPassword(data.password) : undefined,
      createdAt: new Date().toISOString()
    });

    const saved = await newDoctor.save();
    return res.status(201).json(saved);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// PUT /api/auth/profile/:id
router.put('/profile/:id', async (req, res) => {
  try {
    const updated = await UserModel.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/user/:id
router.get('/user/:id', async (req, res) => {
  try {
    const user = await UserModel.findOne({ id: req.params.id });
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json(user);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
