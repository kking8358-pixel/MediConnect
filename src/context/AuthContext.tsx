import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, Language, Patient, Doctor, Admin } from '../types';
import { INITIAL_PATIENT, INITIAL_DOCTORS, INITIAL_HOSPITALS } from '../data/mockData';
import { apiLogin, apiRegisterPatient, apiRegisterDoctor, apiUpdateProfile } from '../services/api';

interface AuthContextType {
  user: User | null;
  currentRole: UserRole;
  language: Language;
  token: string | null;
  setLanguage: (lang: Language) => void;
  switchRole: (role: UserRole) => void;
  login: (emailOrPhone: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  loginAsUser: (userToLogin: User) => void;
  registerPatient: (data: {
    name: string;
    email: string;
    phone: string;
    age?: number;
    gender?: 'male' | 'female' | 'other';
    bloodGroup?: string;
    password?: string;
  }) => Promise<Patient>;
  registerDoctor: (data: {
    name: string;
    email: string;
    phone: string;
    specialty: string;
    hospitalName: string;
    qualifications: string;
    bmdcRegNumber: string;
    consultationFee?: number;
    password?: string;
  }) => Promise<Doctor>;
  verifyOtp: (code: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updatedData: Partial<Patient | Doctor | Admin>) => void;
  isOtpModalOpen: boolean;
  setIsOtpModalOpen: (open: boolean) => void;
  pendingPhone: string | null;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalMode: 'signin' | 'signup';
  setAuthModalMode: (mode: 'signin' | 'signup') => void;
  openAuthModal: (mode?: 'signin' | 'signup') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const ADMIN_USER: Admin = {
  id: 'admin-1',
  role: 'admin',
  name: 'System Admin (MediConnect HQ)',
  email: 'admin@mediconnect.health',
  phone: '+880 1800-000000',
  isVerified: true,
  language: 'en',
  permissions: ['all'],
  createdAt: '2026-01-01T00:00:00.000Z'
};

/**
 * Demo-only password hashing (salted FNV-1a, synchronous). This is
 * obfuscation, NOT real security — it only exists so registered accounts
 * actually validate the password they signed up with on this device.
 * Production MUST verify bcrypt/argon2 hashes on a server instead.
 */
export function hashDemoPassword(pw: string): string {
  const salted = `mc-demo::${pw}`;
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193 ^ salted.length;
  for (let i = 0; i < salted.length; i++) {
    const c = salted.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 16777619);
    h2 = Math.imul(h2 ^ c, 2246822519);
  }
  return `d1$${(h1 >>> 0).toString(16)}${(h2 >>> 0).toString(16)}`;
}

function readPatientRegistry(): Patient[] {
  try {
    const raw = localStorage.getItem('mc_patients');
    return raw ? (JSON.parse(raw) as Patient[]) : [];
  } catch (e) {
    return [];
  }
}

export function upsertPatientRegistry(p: Patient) {
  try {
    const all = readPatientRegistry().filter((x) => x.email.toLowerCase() !== p.email.toLowerCase());
    localStorage.setItem('mc_patients', JSON.stringify([p, ...all]));
  } catch (e) { /* storage unavailable */ }
}

/**
 * Returns true when `input` satisfies the stored credential.
 * Seed demo accounts carry no hash and accept any ≥4-char password;
 * accounts created through registration must match exactly.
 */
export function passwordMatches(stored: User, input: string): boolean {
  if (!input || input.length < 4) return false;
  if (!stored.passwordHash) return true; // seed demo account
  return stored.passwordHash === hashDemoPassword(input);
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    return (localStorage.getItem('mc_role') as UserRole) || 'patient';
  });

  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('mc_lang') as Language) || 'en';
  });

  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('mc_user');
    if (saved === 'logged_out') {
      return null;
    }
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback to guest below
      }
    }
    // Start as guest so the guest landing page is reachable on first load.
    return null;
  });

  const [token, setToken] = useState<string | null>(() => {
    const savedUser = localStorage.getItem('mc_user');
    if (!savedUser || savedUser === 'logged_out') return null;
    return localStorage.getItem('mc_token') || 'mock-jwt-token-xyz789';
  });
  const [isOtpModalOpen, setIsOtpModalOpen] = useState<boolean>(false);
  const [pendingPhone, setPendingPhone] = useState<string | null>(null);
  
  // Login / Signup Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');

  useEffect(() => {
    localStorage.setItem('mc_lang', language);
    if (user) {
      localStorage.setItem('mc_role', currentRole);
      localStorage.setItem('mc_user', JSON.stringify(user));
    }
  }, [currentRole, language, user]);

  // Sync user verification when admin approves/revokes
  useEffect(() => {
    const handleDoctorVerified = (e: any) => {
      const { doctorId, verified } = e.detail || {};
      setUser((prev) => {
        if (prev && prev.id === doctorId) {
          const updated = { ...prev, isVerified: verified };
          localStorage.setItem('mc_user', JSON.stringify(updated));
          return updated;
        }
        return prev;
      });
    };

    window.addEventListener('mediconnect_doctor_verified', handleDoctorVerified);
    return () => window.removeEventListener('mediconnect_doctor_verified', handleDoctorVerified);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const openAuthModal = (mode: 'signin' | 'signup' = 'signin') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const switchRole = (newRole: UserRole) => {
    setCurrentRole(newRole);
    if (newRole === 'patient') {
      setUser(INITIAL_PATIENT);
    } else if (newRole === 'doctor') {
      setUser(INITIAL_DOCTORS[0]); // Dr. Shamsuzzaman (verified)
    } else if (newRole === 'admin') {
      setUser(ADMIN_USER);
    }
  };

  const loginAsUser = (userToLogin: User) => {
    setUser(userToLogin);
    setCurrentRole(userToLogin.role);
    const newToken = 'jwt-session-' + Date.now();
    setToken(newToken);
    localStorage.setItem('mc_user', JSON.stringify(userToLogin));
    localStorage.setItem('mc_role', userToLogin.role);
    localStorage.setItem('mc_token', newToken);
    setIsAuthModalOpen(false);
  };

  const registerPatient = async (data: {
    name: string;
    email: string;
    phone: string;
    age?: number;
    gender?: 'male' | 'female' | 'other';
    bloodGroup?: string;
    password?: string;
  }): Promise<Patient> => {
    const emailClean = data.email.trim().toLowerCase();
    const phoneClean = data.phone.trim();

    // Check if account already exists locally
    const existing = readPatientRegistry().find(
      (p) => p.email.toLowerCase() === emailClean || (phoneClean && p.phone === phoneClean)
    );
    if (existing) {
      throw new Error('An account with this email address or phone number already exists.');
    }

    const newPatient: Patient = {
      id: `pat-${Date.now()}`,
      role: 'patient',
      name: data.name.trim(),
      email: emailClean,
      phone: phoneClean,
      isVerified: true,
      language: language,
      medicalHistory: [],
      age: data.age || 26,
      gender: data.gender || 'male',
      bloodGroup: data.bloodGroup || 'O+',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      createdAt: new Date().toISOString(),
      passwordHash: data.password ? hashDemoPassword(data.password) : undefined,
    };

    try {
      const serverPatient = await apiRegisterPatient({ ...newPatient, password: data.password });
      if (serverPatient && serverPatient.id) {
        newPatient.id = serverPatient.id;
      }
    } catch (err: any) {
      if (err.message && err.message.toLowerCase().includes('already exists')) {
        throw err;
      }
    }

    upsertPatientRegistry(newPatient);
    loginAsUser(newPatient);
    return newPatient;
  };

  const registerDoctor = async (data: {
    name: string;
    email: string;
    phone: string;
    specialty: string;
    hospitalName: string;
    qualifications: string;
    bmdcRegNumber: string;
    consultationFee?: number;
    password?: string;
  }): Promise<Doctor> => {
    const emailClean = data.email.trim().toLowerCase();
    const phoneClean = data.phone.trim();

    const savedDocsRaw = localStorage.getItem('mc_doctors');
    let docPool = INITIAL_DOCTORS;
    try {
      if (savedDocsRaw) docPool = JSON.parse(savedDocsRaw);
    } catch (e) {}

    if (docPool.some((d) => d.email.toLowerCase() === emailClean)) {
      throw new Error('A doctor with this email address is already registered.');
    }

    const matchedHospital = INITIAL_HOSPITALS.find(
      (h) => h.name.toLowerCase() === data.hospitalName.trim().toLowerCase()
    );
    const newDoctor: Doctor = {
      id: `doc-${Date.now()}`,
      role: 'doctor',
      name: data.name.trim(),
      email: emailClean,
      phone: phoneClean,
      isVerified: false, // Must be verified by Admin!
      bmdcRegNumber: data.bmdcRegNumber.trim(),
      language: language,
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80',
      specialty: data.specialty,
      experienceYears: 1,
      hospitalId: matchedHospital ? matchedHospital.id : 'hosp-1',
      hospitalName: matchedHospital ? matchedHospital.name : data.hospitalName,
      qualifications: data.qualifications.trim(),
      bio: 'Clinician registered with BMDC credentials pending administrative audit.',
      consultationFee: data.consultationFee || 1000,
      rating: 5.0,
      ratingCount: 0,
      availability: [
        { day: 'Sun', slots: ['10:00 AM', '11:00 AM', '04:00 PM'] },
        { day: 'Tue', slots: ['10:00 AM', '11:00 AM', '04:00 PM'] },
        { day: 'Thu', slots: ['02:00 PM', '04:00 PM', '06:00 PM'] }
      ],
      createdAt: new Date().toISOString(),
      passwordHash: data.password ? hashDemoPassword(data.password) : undefined,
    };

    try {
      const serverDoc = await apiRegisterDoctor({ ...newDoctor, password: data.password });
      if (serverDoc && serverDoc.id) {
        newDoctor.id = serverDoc.id;
      }
    } catch (err: any) {
      if (err.message && err.message.toLowerCase().includes('already exists')) {
        throw err;
      }
    }

    // Save to localStorage doctors list
    try {
      const updated = [newDoctor, ...docPool.filter((d) => d.id !== newDoctor.id)];
      localStorage.setItem('mc_doctors', JSON.stringify(updated));
    } catch (e) {}

    // Dispatch event so AppDataContext updates its state
    window.dispatchEvent(new CustomEvent('mediconnect_new_doctor_registered', {
      detail: newDoctor
    }));

    loginAsUser(newDoctor);
    return newDoctor;
  };

  const login = async (
    emailOrPhone: string,
    pass: string
  ): Promise<{ success: boolean; error?: string }> => {
    const input = emailOrPhone.trim();
    if (!input) {
      return {
        success: false,
        error: language === 'bn' ? 'অনুগ্রহ করে ইমেইল বা ফোন নম্বর দিন।' : 'Please enter your email address or phone number.'
      };
    }

    if (!pass || pass.length < 4) {
      return {
        success: false,
        error: language === 'bn' ? 'পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে।' : 'Password must be at least 4 characters.'
      };
    }

    const emailClean = input.toLowerCase();
    const digits = input.replace(/\D+/g, '');

    // If phone number with no password, trigger OTP simulation (normalize spaces/dashes).
    if (/^\+?[\d\s\-()]{10,16}$/.test(input) && !pass) {
      setPendingPhone(input);
      setIsOtpModalOpen(true);
      return { success: false };
    }

    // 1. Try authenticating with backend / MongoDB Atlas first
    try {
      const res = await apiLogin(emailClean, pass);
      if (res?.success && res.user) {
        loginAsUser(res.user);
        return { success: true };
      }
    } catch (err: any) {
      const msg = (err.message || '').toLowerCase();
      if (msg.includes('password') || msg.includes('incorrect') || msg.includes('401')) {
        return {
          success: false,
          error: language === 'bn' ? 'ভুল পাসওয়ার্ড। অনুগ্রহ করে আবার চেষ্টা করুন।' : 'Incorrect password for this account. Please try again.'
        };
      }
    }

    // 2. Exact doctor match by email or exact phone digits
    const savedDocsRaw = localStorage.getItem('mc_doctors');
    let docPool = INITIAL_DOCTORS;
    try {
      if (savedDocsRaw) docPool = JSON.parse(savedDocsRaw);
    } catch (e) { /* use initials */ }
    const foundDoc =
      docPool.find((d) => d.email.toLowerCase() === emailClean) ||
      (digits.length >= 10
        ? docPool.find((d) => d.phone.replace(/\D+/g, '') === digits)
        : undefined);
    if (foundDoc) {
      if (!passwordMatches(foundDoc, pass)) {
        return {
          success: false,
          error: language === 'bn' ? 'ভুল পাসওয়ার্ড। অনুগ্রহ করে আবার চেষ্টা করুন।' : 'Incorrect password for this doctor account.'
        };
      }
      loginAsUser(foundDoc);
      return { success: true };
    }

    // 3. Strict Admin match (exact email match only - no substring leak!)
    if (
      emailClean === ADMIN_USER.email.toLowerCase() ||
      emailClean === 'admin@mediconnect.health' ||
      emailClean === 'admin@mediconnect.com' ||
      emailClean === 'admin'
    ) {
      if (!passwordMatches(ADMIN_USER, pass)) {
        return {
          success: false,
          error: language === 'bn' ? 'ভুল অ্যাডমিন পাসওয়ার্ড।' : 'Incorrect password for admin account.'
        };
      }
      loginAsUser(ADMIN_USER);
      return { success: true };
    }

    // 4. Registered patient lookup in localStorage
    const knownPatient = readPatientRegistry().find(
      (p) =>
        p.email.toLowerCase() === emailClean ||
        (digits.length >= 10 && p.phone.replace(/\D+/g, '') === digits)
    );
    if (knownPatient) {
      if (!passwordMatches(knownPatient, pass)) {
        return {
          success: false,
          error: language === 'bn' ? 'ভুল পাসওয়ার্ড। অনুগ্রহ করে আবার চেষ্টা করুন।' : 'Incorrect password for this account.'
        };
      }
      loginAsUser(knownPatient);
      return { success: true };
    }

    // 5. Seed demo patient
    if (
      emailClean === INITIAL_PATIENT.email.toLowerCase() ||
      (digits.length >= 10 && INITIAL_PATIENT.phone.replace(/\D+/g, '') === digits)
    ) {
      if (!passwordMatches(INITIAL_PATIENT, pass)) {
        return {
          success: false,
          error: language === 'bn' ? 'ভুল পাসওয়ার্ড। অনুগ্রহ করে আবার চেষ্টা করুন।' : 'Incorrect password for this account.'
        };
      }
      loginAsUser(INITIAL_PATIENT);
      return { success: true };
    }

    // 6. User DOES NOT EXIST anywhere! Reject login with clear error.
    return {
      success: false,
      error:
        language === 'bn'
          ? 'এই ইমেইল বা ফোন নম্বরে কোনো অ্যাকাউন্ট নেই। অনুগ্রহ করে "Create Account" করুন।'
          : 'No account found with this email or phone. Please click "Create Account" to register.'
    };
  };

  const verifyOtp = async (code: string): Promise<boolean> => {
    if (!/^\d{6}$/.test(code)) {
      return false;
    }
    setIsOtpModalOpen(false);
    const phone = pendingPhone;
    setPendingPhone(null);
    const newToken = 'jwt-auth-session-valid';
    setToken(newToken);
    localStorage.setItem('mc_token', newToken);
    // Phone OTP is a patient login flow. Don't clobber an existing
    // verified doctor/admin session — only establish a patient session
    // when there is none (or the current session is already a patient).
    setUser((prev) => {
      if (prev && prev.role !== 'patient') {
        localStorage.setItem('mc_user', JSON.stringify(prev));
        return prev;
      }
      const patientSession: Patient = {
        ...INITIAL_PATIENT,
        id: `pat-${Date.now()}`,
        phone: phone || INITIAL_PATIENT.phone,
      };
      setCurrentRole('patient');
      localStorage.setItem('mc_role', 'patient');
      localStorage.setItem('mc_user', JSON.stringify(patientSession));
      return patientSession;
    });
    return true;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.setItem('mc_user', 'logged_out');
    localStorage.removeItem('mc_role');
    localStorage.removeItem('mc_token');
  };

  const updateProfile = (updatedData: Partial<Patient | Doctor | Admin>) => {
    setUser((prev) => {
      if (!prev) return null;
      apiUpdateProfile(prev.id, updatedData).catch(() => {});
      return { ...prev, ...updatedData } as User;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        currentRole,
        language,
        token,
        setLanguage,
        switchRole,
        login,
        loginAsUser,
        registerPatient,
        registerDoctor,
        verifyOtp,
        logout,
        updateProfile,
        isOtpModalOpen,
        setIsOtpModalOpen,
        pendingPhone,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        openAuthModal
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
