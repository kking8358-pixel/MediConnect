import mongoose from 'mongoose';

const ReminderLogSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    scheduledAt: { type: String, required: true },
    state: {
      type: String,
      enum: ['taken', 'skipped', 'snoozed', 'pending'],
      default: 'pending'
    },
    actedAt: { type: String, required: true }
  },
  { _id: false }
);

const MedicineReminderSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    patientId: { type: String, required: true, index: true },
    medicineName: { type: String, required: true },
    dosage: { type: String, required: true },
    instruction: { type: String, default: '' },
    times: { type: [String], default: [] },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'custom'],
      default: 'daily'
    },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    status: {
      type: String,
      enum: ['active', 'paused', 'completed'],
      default: 'active'
    },
    logs: { type: [ReminderLogSchema], default: [] },
    color: { type: String },
    snoozedUntil: { type: String }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

export const MedicineReminderModel = mongoose.model('MedicineReminder', MedicineReminderSchema);
