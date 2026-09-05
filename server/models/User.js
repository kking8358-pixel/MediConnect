import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    role: { type: String, enum: ['patient', 'doctor', 'admin'], required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    language: { type: String, enum: ['en', 'bn'], default: 'en' },
    avatar: { type: String },
    passwordHash: { type: String },
    createdAt: { type: String, default: () => new Date().toISOString() },

    // Patient specific fields
    medicalHistory: { type: [String], default: [] },
    allergies: { type: [String], default: [] },
    age: { type: Number },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    bloodGroup: { type: String },
    emergencyContact: {
      name: { type: String },
      phone: { type: String },
      relation: { type: String }
    },
    location: {
      lat: { type: Number },
      lng: { type: Number },
      address: { type: String }
    },

    // Doctor specific fields
    specialty: { type: String },
    experienceYears: { type: Number, default: 0 },
    hospitalId: { type: String },
    hospitalName: { type: String },
    qualifications: { type: String },
    bio: { type: String },
    consultationFee: { type: Number, default: 0 },
    availability: [
      {
        day: { type: String, required: true },
        slots: { type: [String], default: [] }
      }
    ],
    rating: { type: Number, default: 5.0 },
    ratingCount: { type: Number, default: 0 },
    bmdcRegNumber: { type: String },

    // Admin specific fields
    permissions: { type: [String], default: [] }
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

export const UserModel = mongoose.model('User', UserSchema);
