import mongoose from 'mongoose';

const HospitalSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    },
    specialties: { type: [String], default: [] },
    contact: { type: String, required: true },
    emergencyContact: { type: String, required: true },
    rating: { type: Number, default: 4.5 },
    totalBeds: { type: Number },
    ambulanceAvailable: { type: Boolean, default: true },
    image: { type: String }
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

export const HospitalModel = mongoose.model('Hospital', HospitalSchema);
