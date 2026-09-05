import React, { useState } from 'react';
import {
  X,
  User as UserIcon,
  Stethoscope,
  Shield,
  Heart,
  Lock,
  Mail,
  Phone,
  Building,
  Award,
  FileCheck,
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth, ADMIN_USER, passwordMatches, hashDemoPassword, upsertPatientRegistry } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { INITIAL_PATIENT, INITIAL_DOCTORS } from '../../data/mockData';
import { Patient, UserRole } from '../../types';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    loginAsUser,
    registerPatient,
    registerDoctor,
    language
  } = useAuth();
  const { doctors } = useAppData();

  const [roleToRegister, setRoleToRegister] = useState<'patient' | 'doctor'>('patient');

  // Sign in fields
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signInError, setSignInError] = useState('');
  const [regError, setRegError] = useState('');

  // Patient registration fields
  const [patientName, setPatientName] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientAge, setPatientAge] = useState('28');
  const [patientGender, setPatientGender] = useState<'male' | 'female' | 'other'>('male');
  const [patientPassword, setPatientPassword] = useState('');

  // Doctor registration fields
  const [doctorName, setDoctorName] = useState('');
  const [doctorEmail, setDoctorEmail] = useState('');
  const [doctorPhone, setDoctorPhone] = useState('');
  const [doctorSpecialty, setDoctorSpecialty] = useState('General Physician');
  const [doctorHospital, setDoctorHospital] = useState('Evercare Hospital Dhaka');
  const [doctorQualifications, setDoctorQualifications] = useState('');
  const [doctorBmdcReg, setDoctorBmdcReg] = useState('');
  const [doctorFee, setDoctorFee] = useState('1200');
  const [doctorPassword, setDoctorPassword] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError('');

    const emailClean = signInEmail.trim().toLowerCase();
    const digits = signInEmail.replace(/\D+/g, '');

    // Mock auth still requires a password so the field is not decorative.
    if (!signInPassword || signInPassword.length < 4) {
      setSignInError('Please enter your password (minimum 4 characters).');
      return;
    }

    // Check in doctors list — exact email or exact phone digits only.
    const foundDoc = doctors.find(
      (d) =>
        d.email.toLowerCase() === emailClean ||
        (digits.length >= 10 && d.phone.replace(/\D+/g, '') === digits)
    );
    if (foundDoc) {
      if (!passwordMatches(foundDoc, signInPassword)) {
        setSignInError('Incorrect password for this account.');
        return;
      }
      loginAsUser(foundDoc);
      return;
    }

    // Check admin
    if (emailClean.includes('admin')) {
      if (!passwordMatches(ADMIN_USER, signInPassword)) {
        setSignInError('Incorrect password for this account.');
        return;
      }
      loginAsUser(ADMIN_USER);
      return;
    }

    // Registered patient lookup (password enforced), then seed demo, then
    // auto-provision unknown emails with the entered password as credential.
    if (emailClean) {
      let known: Patient | null = null;
      try {
        const raw = localStorage.getItem('mc_patients');
        const all = raw ? (JSON.parse(raw) as Patient[]) : [];
        known = all.find((p) => p.email.toLowerCase() === emailClean) || null;
      } catch (e) { /* ignore */ }
      if (known) {
        if (!passwordMatches(known, signInPassword)) {
          setSignInError('Incorrect password for this account.');
          return;
        }
        loginAsUser(known);
        return;
      }
      if (emailClean === INITIAL_PATIENT.email.toLowerCase()) {
        if (!passwordMatches(INITIAL_PATIENT, signInPassword)) {
          setSignInError('Incorrect password for this account.');
          return;
        }
        loginAsUser(INITIAL_PATIENT);
      } else {
        const fresh: Patient = {
          ...INITIAL_PATIENT,
          id: `pat-${Date.now()}`,
          email: emailClean,
          name: emailClean.split('@')[0] || 'Patient User',
          passwordHash: hashDemoPassword(signInPassword)
        };
        upsertPatientRegistry(fresh);
        loginAsUser(fresh);
      }
      return;
    }

    setSignInError('Please enter a valid email or select a quick profile below.');
  };

  const handleRegisterPatient = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    if (!patientName || !patientEmail) return;
    if (!patientPassword || patientPassword.length < 4) {
      setRegError('Please choose a password with at least 4 characters.');
      return;
    }

    registerPatient({
      name: patientName,
      email: patientEmail,
      phone: patientPhone || '+880 1700-000000',
      age: parseInt(patientAge) || 28,
      gender: patientGender,
      password: patientPassword
    });

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  const handleRegisterDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    if (!doctorName || !doctorEmail || !doctorBmdcReg) return;
    if (!doctorPassword || doctorPassword.length < 4) {
      setRegError('Please choose a password with at least 4 characters.');
      return;
    }

    registerDoctor({
      name: doctorName.startsWith('Dr.') ? doctorName : `Dr. ${doctorName}`,
      email: doctorEmail,
      phone: doctorPhone || '+880 1711-000000',
      specialty: doctorSpecialty,
      hospitalName: doctorHospital,
      qualifications: doctorQualifications || 'MBBS, FCPS',
      bmdcRegNumber: doctorBmdcReg,
      consultationFee: parseInt(doctorFee) || 1200,
      password: doctorPassword
    });

    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-paper/90 backdrop-blur-sm animate-fade-in font-sans text-ink">
      <div className="relative w-full max-w-lg chart-panel p-6 sm:p-7 max-h-[92vh] overflow-y-auto custom-scrollbar shadow-xl border-2 border-ink">
        
        {/* Close Button */}
        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-5 right-5 p-1 border border-transparent hover:border-ink hover:bg-line transition-colors text-ink"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1 mb-5">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider border-b border-ink-soft pb-0.5 inline-block mb-1">
            MediConnect ID
          </span>
          <h2 className="text-xl font-bold uppercase tracking-tight">
            {authModalMode === 'signin' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-[11px] font-mono text-ink-soft mt-1 uppercase">
            {authModalMode === 'signin'
              ? 'Sign in to access your consultations, prescriptions, or clinical workspace.'
              : 'Register as a patient for triage or as a doctor to practice on MediConnect.'}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-2 border border-line bg-paper text-[10px] font-bold font-mono uppercase mb-5">
          <button
            type="button"
            onClick={() => { setAuthModalMode('signin'); setSignInError(''); setRegError(''); }}
            className={`py-2 transition-colors border-r border-line ${
              authModalMode === 'signin'
                ? 'bg-ink text-paper'
                : 'hover:bg-line text-ink-soft hover:text-ink'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setAuthModalMode('signup'); setSignInError(''); setRegError(''); }}
            className={`py-2 transition-colors ${
              authModalMode === 'signup'
                ? 'bg-ink text-paper'
                : 'hover:bg-line text-ink-soft hover:text-ink'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* SIGN IN FORM */}
        {authModalMode === 'signin' && (
          <div className="space-y-5">
            <form onSubmit={handleSignIn} className="space-y-4">
              {signInError && (
                <div className="p-3 border border-clinical-red bg-paper text-clinical-red text-[10px] font-mono font-bold uppercase flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{signInError}</span>
                </div>
              )}

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block mb-1">
                  Email Address or Mobile Number
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-ink-soft absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    placeholder="E.G. DR.SHAMS@SQUAREHOSPITAL.COM"
                    className="w-full pl-10 pr-4 py-2.5 bg-paper border border-line text-xs font-mono uppercase focus:bg-paper-raised focus:outline-none focus:border-ink rounded-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-ink-soft absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-paper border border-line text-xs font-mono focus:bg-paper-raised focus:outline-none focus:border-ink rounded-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 border border-ink bg-ink hover:bg-ink-soft text-paper text-[11px] font-bold font-mono uppercase transition-colors flex items-center justify-center gap-2 mt-2"
              >
                <span>Sign In to Account</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Quick Demo Switcher Presets */}
            <div className="pt-4 border-t border-ink">
              <span className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block mb-3 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-ink"></span>
                Quick 1-Click Demo Profiles
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                <button
                  type="button"
                  onClick={() => loginAsUser(INITIAL_PATIENT)}
                  className="p-3 border border-line bg-paper hover:border-ink text-left transition-colors flex items-center gap-3"
                >
                  <div className="w-8 h-8 border border-line bg-paper flex items-center justify-center shrink-0">
                    <Heart className="w-4 h-4 text-ink" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-[11px] font-bold uppercase text-ink truncate">Sajidul Islam</h4>
                    <p className="text-[9px] font-mono text-ink-soft mt-0.5">PATIENT ACCOUNT</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => loginAsUser(INITIAL_DOCTORS[0])}
                  className="p-3 border border-line bg-paper hover:border-ink text-left transition-colors flex items-center gap-3"
                >
                  <div className="w-8 h-8 border border-line bg-paper flex items-center justify-center shrink-0">
                    <Stethoscope className="w-4 h-4 text-ink" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-[11px] font-bold uppercase text-ink truncate">Dr. Shamsuzzaman</h4>
                    <p className="text-[9px] font-mono text-ink-soft mt-0.5">VERIFIED DOCTOR</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const unverified = doctors.find((d) => !d.isVerified) || INITIAL_DOCTORS[5];
                    loginAsUser(unverified);
                  }}
                  className="p-3 border border-line bg-paper hover:border-clinical-red text-left transition-colors flex items-center gap-3"
                >
                  <div className="w-8 h-8 border border-line bg-paper flex items-center justify-center shrink-0">
                    <FileCheck className="w-4 h-4 text-clinical-red" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-[11px] font-bold uppercase text-ink truncate">Dr. Farhana Yasmin</h4>
                    <p className="text-[9px] font-mono text-clinical-red font-bold mt-0.5">UNVERIFIED DOCTOR</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => loginAsUser(ADMIN_USER)}
                  className="p-3 border border-line bg-paper hover:border-ink text-left transition-colors flex items-center gap-3"
                >
                  <div className="w-8 h-8 border border-line bg-ink text-paper flex items-center justify-center shrink-0">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-[11px] font-bold uppercase text-ink truncate">Admin HQ</h4>
                    <p className="text-[9px] font-mono text-ink-soft mt-0.5">SYSTEM VERIFIER</p>
                  </div>
                </button>

              </div>
            </div>
          </div>
        )}

        {/* SIGN UP FORM */}
        {authModalMode === 'signup' && (
          <div className="space-y-5">
            {regError && (
              <div className="p-2.5 border border-clinical-red bg-paper text-clinical-red text-[10px] font-mono font-bold uppercase flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{regError}</span>
              </div>
            )}

            {/* Account Type Selector */}
            <div className="flex items-center border border-line bg-paper text-[10px] font-bold font-mono uppercase mb-2">
              <button
                type="button"
                onClick={() => setRoleToRegister('patient')}
                className={`flex-1 py-2.5 flex items-center justify-center gap-2 transition-colors border-r border-line ${
                  roleToRegister === 'patient'
                    ? 'bg-ink text-paper'
                    : 'hover:bg-line text-ink-soft hover:text-ink'
                }`}
              >
                <Heart className="w-3.5 h-3.5" />
                <span>I am a Patient</span>
              </button>

              <button
                type="button"
                onClick={() => setRoleToRegister('doctor')}
                className={`flex-1 py-2.5 flex items-center justify-center gap-2 transition-colors ${
                  roleToRegister === 'doctor'
                    ? 'bg-ink text-paper'
                    : 'hover:bg-line text-ink-soft hover:text-ink'
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>I am a Doctor</span>
              </button>
            </div>

            {/* PATIENT REGISTRATION */}
            {roleToRegister === 'patient' && (
              <form onSubmit={handleRegisterPatient} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="E.G. SAJIDUL ISLAM"
                    className="w-full p-2.5 bg-paper border border-line text-xs font-mono uppercase focus:bg-paper-raised focus:outline-none focus:border-ink rounded-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block mb-1">Email</label>
                    <input
                      type="email"
                      required
                      value={patientEmail}
                      onChange={(e) => setPatientEmail(e.target.value)}
                      placeholder="PATIENT@MAIL.COM"
                      className="w-full p-2.5 bg-paper border border-line text-xs font-mono uppercase focus:bg-paper-raised focus:outline-none focus:border-ink rounded-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block mb-1">Mobile</label>
                    <input
                      type="tel"
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value)}
                      placeholder="+880 17..."
                      className="w-full p-2.5 bg-paper border border-line text-xs font-mono uppercase focus:bg-paper-raised focus:outline-none focus:border-ink rounded-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block mb-1">Age</label>
                    <input
                      type="number"
                      value={patientAge}
                      onChange={(e) => setPatientAge(e.target.value)}
                      className="w-full p-2.5 bg-paper border border-line text-xs font-mono uppercase focus:bg-paper-raised focus:outline-none focus:border-ink rounded-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block mb-1">Gender</label>
                    <select
                      value={patientGender}
                      onChange={(e) => setPatientGender(e.target.value as any)}
                      className="w-full p-2.5 bg-paper border border-line text-xs font-mono uppercase focus:bg-paper-raised focus:outline-none focus:border-ink rounded-none"
                    >
                      <option value="male">MALE</option>
                      <option value="female">FEMALE</option>
                      <option value="other">OTHER</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block mb-1">Create Password</label>
                  <input
                    type="password"
                    value={patientPassword}
                    onChange={(e) => setPatientPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full p-2.5 bg-paper border border-line text-xs font-mono focus:bg-paper-raised focus:outline-none focus:border-ink rounded-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 border border-ink bg-ink hover:bg-ink-soft text-paper text-[11px] font-bold font-mono uppercase transition-colors flex items-center justify-center gap-2 mt-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Register Patient Account</span>
                </button>
              </form>
            )}

            {/* DOCTOR REGISTRATION */}
            {roleToRegister === 'doctor' && (
              <form onSubmit={handleRegisterDoctor} className="space-y-4">
                <div className="p-4 border border-line bg-paper-raised text-ink text-[10px] font-mono uppercase">
                  <div className="flex items-center gap-2 font-bold mb-1">
                    <Shield className="w-3.5 h-3.5 shrink-0" />
                    <span>Medical Board Verification Required</span>
                  </div>
                  <p className="text-ink-soft leading-relaxed mt-2">
                    New doctor accounts remain locked in a read-only pending state until an Administrator verifies your BMDC registration credentials.
                  </p>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block mb-1">Doctor Full Name</label>
                  <input
                    type="text"
                    required
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    placeholder="E.G. DR. NAZMUL HUDA"
                    className="w-full p-2.5 bg-paper border border-line text-xs font-mono uppercase focus:bg-paper-raised focus:outline-none focus:border-ink rounded-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block mb-1">Email</label>
                    <input
                      type="email"
                      required
                      value={doctorEmail}
                      onChange={(e) => setDoctorEmail(e.target.value)}
                      placeholder="DR.NAME@HOSPITAL.COM"
                      className="w-full p-2.5 bg-paper border border-line text-xs font-mono uppercase focus:bg-paper-raised focus:outline-none focus:border-ink rounded-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block mb-1">Mobile</label>
                    <input
                      type="tel"
                      value={doctorPhone}
                      onChange={(e) => setDoctorPhone(e.target.value)}
                      placeholder="+880 17..."
                      className="w-full p-2.5 bg-paper border border-line text-xs font-mono uppercase focus:bg-paper-raised focus:outline-none focus:border-ink rounded-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block mb-1">BMDC Reg. Number</label>
                    <input
                      type="text"
                      required
                      value={doctorBmdcReg}
                      onChange={(e) => setDoctorBmdcReg(e.target.value)}
                      placeholder="E.G. BMDC-A-99241"
                      className="w-full p-2.5 bg-paper border border-line text-xs font-mono uppercase focus:bg-paper-raised focus:outline-none focus:border-ink rounded-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block mb-1">Specialty</label>
                    <select
                      value={doctorSpecialty}
                      onChange={(e) => setDoctorSpecialty(e.target.value)}
                      className="w-full p-2.5 bg-paper border border-line text-[10px] font-bold font-mono uppercase focus:bg-paper-raised focus:outline-none focus:border-ink rounded-none"
                    >
                      <option value="General Physician">General Physician</option>
                      <option value="Cardiologist">Cardiologist</option>
                      <option value="Neurologist">Neurologist</option>
                      <option value="Dermatologist">Dermatologist</option>
                      <option value="Gastroenterologist">Gastroenterologist</option>
                      <option value="Pulmonologist">Pulmonologist</option>
                      <option value="Orthopedic / Rheumatologist">Orthopedics</option>
                      <option value="ENT Specialist">ENT Specialist</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block mb-1">Hospital / Clinic</label>
                    <input
                      type="text"
                      value={doctorHospital}
                      onChange={(e) => setDoctorHospital(e.target.value)}
                      placeholder="E.G. SQUARE HOSPITALS LTD."
                      className="w-full p-2.5 bg-paper border border-line text-xs font-mono uppercase focus:bg-paper-raised focus:outline-none focus:border-ink rounded-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block mb-1">Consultation Fee (BDT)</label>
                    <input
                      type="number"
                      value={doctorFee}
                      onChange={(e) => setDoctorFee(e.target.value)}
                      placeholder="1200"
                      className="w-full p-2.5 bg-paper border border-line text-xs font-mono uppercase focus:bg-paper-raised focus:outline-none focus:border-ink rounded-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block mb-1">Academic Qualifications</label>
                  <input
                    type="text"
                    value={doctorQualifications}
                    onChange={(e) => setDoctorQualifications(e.target.value)}
                    placeholder="E.G. MBBS, FCPS"
                    className="w-full p-2.5 bg-paper border border-line text-xs font-mono uppercase focus:bg-paper-raised focus:outline-none focus:border-ink rounded-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 border border-ink bg-ink hover:bg-ink-soft text-paper text-[11px] font-bold font-mono uppercase transition-colors flex items-center justify-center gap-2 mt-2"
                >
                  <Stethoscope className="w-4 h-4" />
                  <span>Submit Registration (Pending Verification)</span>
                </button>
              </form>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
