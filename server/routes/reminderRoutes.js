import { Router } from 'express';
import { MedicineReminderModel } from '../models/MedicineReminder.js';

const router = Router();

// GET /api/reminders
router.get('/', async (req, res) => {
  try {
    const { patientId } = req.query;
    const filter = patientId ? { patientId } : {};
    const reminders = await MedicineReminderModel.find(filter).sort({ createdAt: -1 });
    return res.json(reminders);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/reminders
router.post('/', async (req, res) => {
  try {
    const data = req.body;
    const newReminder = new MedicineReminderModel({
      ...data,
      id: data.id || `rem-${Date.now()}`,
      logs: data.logs || []
    });
    const saved = await newReminder.save();
    return res.status(201).json(saved);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// PUT /api/reminders/:id
router.put('/:id', async (req, res) => {
  try {
    const updated = await MedicineReminderModel.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Reminder not found' });
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// DELETE /api/reminders/:id
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await MedicineReminderModel.findOneAndDelete({ id: req.params.id });
    if (!deleted) return res.status(404).json({ error: 'Reminder not found' });
    return res.json({ success: true, message: 'Reminder deleted' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/reminders/:id/log
router.post('/:id/log', async (req, res) => {
  try {
    const { state, scheduledAt } = req.body;
    const reminder = await MedicineReminderModel.findOne({ id: req.params.id });
    if (!reminder) return res.status(404).json({ error: 'Reminder not found' });

    const now = new Date();
    const newLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      scheduledAt: scheduledAt || now.toISOString(),
      state: state || 'taken',
      actedAt: now.toISOString()
    };

    reminder.logs.push(newLog);
    if (state === 'snoozed') {
      reminder.snoozedUntil = new Date(now.getTime() + 15 * 60 * 1000).toISOString();
    } else {
      reminder.snoozedUntil = undefined;
    }

    await reminder.save();
    return res.json(reminder);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
