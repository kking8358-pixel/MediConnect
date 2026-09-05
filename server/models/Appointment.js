import mongoose from 'mongoose';

const AppointmentSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    patientId: { type: String, required: true, index: true },
    patientName: { type: String, required: true },
    patientPhone: { type: String, required: true },
    patientEmail: { type: String },
    doctorId: { type: String, required: true, index: true },
    doctorName: { type: String, required: true },
    doctorSpecialty: { type: String, required: true },
    doctorEmail: { type: String },
    hospitalName: { type: String, required: true },
    date: { type: String, required: true },
    timeSlot: { type: String, required: true },
    status: {
      type: String,
      enum: ['booked', 'rescheduled', 'cancelled', 'completed'],
      default: 'booked'
    },
    reportId: { type: String },
    notes: { type: String },
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

export const AppointmentModel = mongoose.model('Appointment', AppointmentSchema);
