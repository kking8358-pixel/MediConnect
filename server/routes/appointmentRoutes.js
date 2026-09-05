import { Router } from 'express';
import { AppointmentModel } from '../models/Appointment.js';
import { UserModel } from '../models/User.js';
import {
  sendPatientAppointmentConfirmation,
  sendDoctorAppointmentAlert
} from '../services/emailService.js';

const router = Router();

// GET /api/appointments
router.get('/', async (req, res) => {
  try {
    const { patientId, doctorId } = req.query;
    const filter = {};
    if (patientId) filter.patientId = patientId;
    if (doctorId) filter.doctorId = doctorId;

    const appointments = await AppointmentModel.find(filter).sort({ createdAt: -1 });
    return res.json(appointments);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/appointments
router.post('/', async (req, res) => {
  try {
    const data = req.body;
    if (!data.patientId || data.patientId === 'guest') {
      return res.status(401).json({ error: 'Authentication required. Please sign in to book an appointment.' });
    }

    if (!data.doctorId || !data.date || !data.timeSlot) {
      return res.status(400).json({ error: 'Doctor, date, and time slot are required.' });
    }

    // Guard against Double Booking: Check if slot is already booked for this doctor on this date
    const existingConflict = await AppointmentModel.findOne({
      doctorId: data.doctorId,
      date: data.date,
      timeSlot: data.timeSlot,
      status: { $in: ['booked', 'rescheduled'] }
    });

    if (existingConflict) {
      return res.status(409).json({
        error: `The time slot "${data.timeSlot}" on ${data.date} is already booked for ${data.doctorName || 'this doctor'}. Please select another slot.`
      });
    }

    const newAppointment = new AppointmentModel({
      ...data,
      id: data.id || `apt-${Date.now()}`,
      status: data.status || 'booked',
      createdAt: data.createdAt || new Date().toISOString()
    });
    const saved = await newAppointment.save();

    // Look up Doctor and Patient emails for notifications
    try {
      const [doctorUser, patientUser] = await Promise.all([
        UserModel.findOne({ id: data.doctorId, role: 'doctor' }),
        UserModel.findOne({ id: data.patientId })
      ]);

      const doctorEmail = doctorUser?.email || data.doctorEmail;
      const patientEmail = patientUser?.email || data.patientEmail;

      // Send confirmation email to patient
      if (patientEmail) {
        sendPatientAppointmentConfirmation({
          patientEmail,
          patientName: data.patientName || patientUser?.name || 'Valued Patient',
          doctorName: data.doctorName,
          doctorSpecialty: data.doctorSpecialty,
          hospitalName: data.hospitalName,
          date: data.date,
          timeSlot: data.timeSlot,
          consultationFee: doctorUser?.consultationFee || 1200,
          appointmentId: saved.id
        }).catch((e) => console.error('Patient email send error:', e.message));
      }

      // Send alert email to doctor
      if (doctorEmail) {
        sendDoctorAppointmentAlert({
          doctorEmail,
          doctorName: data.doctorName,
          patientName: data.patientName || patientUser?.name || 'Patient',
          patientPhone: data.patientPhone || patientUser?.phone || 'N/A',
          patientAge: patientUser?.age,
          patientGender: patientUser?.gender,
          date: data.date,
          timeSlot: data.timeSlot,
          notes: data.notes,
          appointmentId: saved.id
        }).catch((e) => console.error('Doctor email send error:', e.message));
      }
    } catch (mailErr) {
      console.error('Mail dispatch error:', mailErr.message);
    }

    return res.status(201).json(saved);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// PATCH /api/appointments/:id/status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await AppointmentModel.findOneAndUpdate(
      { id: req.params.id },
      { $set: { status } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Appointment not found' });
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
