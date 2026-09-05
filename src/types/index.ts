export type UserRole = 'patient' | 'doctor' | 'admin';
export type Language = 'en' | 'bn';
export type SeverityLevel = 'low' | 'moderate' | 'urgent';

export interface User {
  id: string;
  role: UserRole;
  name: string;
  email: string;
  phone: string;
  isVerified: boolean;
  language: Language;
  avatar?: string;
  createdAt: string;
  /**
   * Client-side demo credential only (salted non-crypto hash — see
   * hashDemoPassword in AuthContext). A production backend must store a
   * proper bcrypt/argon2 hash server-side and never trust the client.
   * Seed demo accounts have no hash and accept any valid password.
   */
  passwordHash?: string;
}

export interface Patient extends User {
  role: 'patient';
  medicalHistory: string[];
  allergies?: string[];
  age?: number;
  gender?: 'male' | 'female' | 'other';
  bloodGroup?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
}

export interface Doctor extends User {
  role: 'doctor';
  specialty: string;
  experienceYears: number;
  hospitalId: string;
  hospitalName: string;
  qualifications: string;
  bio?: string;
  consultationFee: number;
  availability: {
    day: string;
    slots: string[];
  }[];
  rating: number;
  ratingCount: number;
  bmdcRegNumber?: string;
}

export interface Admin extends User {
  role: 'admin';
  permissions: string[];
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  city: string;
  location: {
    lat: number;
    lng: number;
  };
  specialties: string[];
  contact: string;
  emergencyContact: string;
  rating: number;
  totalBeds?: number;
  ambulanceAvailable?: boolean;
  image?: string;
}

export interface Rule {
  id: string;
  symptoms: string[]; // normalized snake_case or lowercase string keys, e.g. ["chest_pain", "shortness_of_breath"]
  condition: string;  // e.g. "Possible Cardiac Issue"
  conditionBn?: string;
  specialist: string; // e.g. "Cardiologist"
  specialistBn?: string;
  severity: SeverityLevel;
  description: string;
  tips: string[];
  active: boolean;
  confidenceBase?: number; // e.g., 90%
}

export interface SymptomCheck {
  id: string;
  patientId: string;
  patientName?: string;
  symptomsSelected: string[];
  duration?: string;
  additionalNotes?: string;
  matchedRuleId: string | null;
  condition: string;
  specialist: string;
  severity: SeverityLevel;
  confidence: number;
  healthTips: string[];
  createdAt: string;
  reportId?: string;
}

export interface DoctorNote {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  diagnosis: string;
  prescription: string;
  testsRecommended?: string[];
  advice?: string;
  createdAt: string;
}

export interface HealthReport {
  id: string;
  patientId: string;
  patientName: string;
  patientAge?: number;
  patientGender?: string;
  symptomCheckId: string;
  symptoms: string[];
  condition: string;
  specialist: string;
  severity: SeverityLevel;
  confidence: number;
  sharedWithDoctorIds: string[];
  doctorNotes: DoctorNote[];
  createdAt: string;
}

export type AppointmentStatus = 'booked' | 'rescheduled' | 'cancelled' | 'completed';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  hospitalName: string;
  date: string;
  timeSlot: string;
  status: AppointmentStatus;
  reportId?: string;
  notes?: string;
  createdAt: string;
}

export type ReminderFrequency = 'daily' | 'weekly' | 'custom';
export type ReminderState = 'taken' | 'skipped' | 'snoozed' | 'pending';

export interface ReminderLog {
  id: string;
  scheduledAt: string;
  state: ReminderState;
  actedAt: string;
}

export interface MedicineReminder {
  id: string;
  patientId: string;
  medicineName: string;
  dosage: string; // e.g. "1 Tablet (500mg)", "2 Puffs"
  instruction: string; // e.g. "After meals", "Before sleep"
  times: string[]; // e.g. ["08:00", "14:00", "20:00"]
  frequency: ReminderFrequency;
  startDate: string;
  endDate: string;
  status: 'active' | 'paused' | 'completed';
  logs: ReminderLog[];
  color?: string;
  /** ISO timestamp until which the dose alert is snoozed (15-min snooze). */
  snoozedUntil?: string;
}

export interface Feedback {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  appointmentId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: 'reminder' | 'appointment' | 'system' | 'emergency';
  title: string;
  message: string;
  refId?: string;
  read: boolean;
  createdAt: string;
}
