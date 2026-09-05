import mongoose from 'mongoose';

const SymptomCheckSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    patientId: { type: String, required: true, index: true },
    patientName: { type: String },
    symptomsSelected: { type: [String], default: [] },
    duration: { type: String },
    additionalNotes: { type: String },
    matchedRuleId: { type: String, default: null },
    condition: { type: String, required: true },
    specialist: { type: String, required: true },
    severity: { type: String, enum: ['low', 'moderate', 'urgent'], required: true },
    confidence: { type: Number, default: 80 },
    healthTips: { type: [String], default: [] },
    createdAt: { type: String, default: () => new Date().toISOString() },
    reportId: { type: String }
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

export const SymptomCheckModel = mongoose.model('SymptomCheck', SymptomCheckSchema);
