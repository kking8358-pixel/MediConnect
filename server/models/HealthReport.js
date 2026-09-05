import mongoose from 'mongoose';

const DoctorNoteSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    doctorId: { type: String, required: true },
    doctorName: { type: String, required: true },
    doctorSpecialty: { type: String, required: true },
    diagnosis: { type: String, required: true },
    prescription: { type: String, required: true },
    testsRecommended: { type: [String], default: [] },
    advice: { type: String },
    createdAt: { type: String, default: () => new Date().toISOString() }
  },
  { _id: false }
);

const HealthReportSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    patientId: { type: String, required: true, index: true },
    patientName: { type: String, required: true },
    patientAge: { type: Number },
    patientGender: { type: String },
    symptomCheckId: { type: String, required: true },
    symptoms: { type: [String], default: [] },
    condition: { type: String, required: true },
    specialist: { type: String, required: true },
    severity: { type: String, enum: ['low', 'moderate', 'urgent'], required: true },
    confidence: { type: Number, default: 85 },
    sharedWithDoctorIds: { type: [String], default: [] },
    doctorNotes: { type: [DoctorNoteSchema], default: [] },
    createdAt: { type: String, default: () => new Date().toISOString() }
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

export const HealthReportModel = mongoose.model('HealthReport', HealthReportSchema);
