import { Router } from 'express';
import { NotificationModel } from '../models/Notification.js';

const router = Router();

// GET /api/notifications
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    const filter = userId ? { userId } : {};
    const notifs = await NotificationModel.find(filter).sort({ createdAt: -1 });
    return res.json(notifs);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/notifications
router.post('/', async (req, res) => {
  try {
    const data = req.body;
    const newNotif = new NotificationModel({
      ...data,
      id: data.id || `notif-${Date.now()}`,
      createdAt: data.createdAt || new Date().toISOString(),
      read: false
    });
    const saved = await newNotif.save();
    return res.status(201).json(saved);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', async (req, res) => {
  try {
    const updated = await NotificationModel.findOneAndUpdate(
      { id: req.params.id },
      { $set: { read: true } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Notification not found' });
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
