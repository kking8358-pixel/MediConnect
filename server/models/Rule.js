import mongoose from 'mongoose';

const RuleSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    symptoms: { type: [String], required: true },
    condition: { type: String, required: true },
    conditionBn: { type: String },
    specialist: { type: String, required: true },
    specialistBn: { type: String },
    severity: { type: String, enum: ['low', 'moderate', 'urgent'], required: true },
    description: { type: String, required: true },
    tips: { type: [String], default: [] },
    active: { type: Boolean, default: true },
    confidenceBase: { type: Number, default: 85 }
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

export const RuleModel = mongoose.model('Rule', RuleSchema);
