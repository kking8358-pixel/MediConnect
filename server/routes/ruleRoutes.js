import { Router } from 'express';
import { RuleModel } from '../models/Rule.js';

const router = Router();

// GET /api/rules
router.get('/', async (req, res) => {
  try {
    const rules = await RuleModel.find();
    return res.json(rules);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/rules
router.post('/', async (req, res) => {
  try {
    const data = req.body;
    const newRule = new RuleModel({
      ...data,
      id: data.id || `rule-${Date.now()}`
    });
    const saved = await newRule.save();
    return res.status(201).json(saved);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// PUT /api/rules/:id
router.put('/:id', async (req, res) => {
  try {
    const updated = await RuleModel.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Rule not found' });
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// DELETE /api/rules/:id
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await RuleModel.findOneAndDelete({ id: req.params.id });
    if (!deleted) return res.status(404).json({ error: 'Rule not found' });
    return res.json({ success: true, message: 'Rule deleted' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// PATCH /api/rules/:id/toggle
router.patch('/:id/toggle', async (req, res) => {
  try {
    const rule = await RuleModel.findOne({ id: req.params.id });
    if (!rule) return res.status(404).json({ error: 'Rule not found' });
    rule.active = !rule.active;
    await rule.save();
    return res.json(rule);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
