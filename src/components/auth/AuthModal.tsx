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
  AlertCircle,
  KeyRound,
  RefreshCw
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
    login,
    loginAsUser,
    registerPatient,
    registerDoctor,
    requestPasswordReset,
    resetPassword,
    language
  } = useAuth();
  const { doctors } = useAppData();

  const [roleToRegister, setRoleToRegister] = useState<'patient' | 'doctor'>('patient');

  // Sign in fields
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signInError, setSignInError] = useState('');
  const [regError, setRegError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forgot password fields
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotCode, setForgotCode] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotStep, setForgotStep] = useState<'request' | 'reset'>('request');
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [dispatchedCode, setDispatchedCode] = useState<string | null>(null);
  const [maskedEmailNotice, setMaskedEmailNotice] = useState<string>('');

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

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError('');

    const emailClean = signInEmail.trim();
    if (!emailClean) {
      setSignInError(
        language === 'bn'
          ? 'অনুগ্রহ করে ইমেইল বা ফোন নম্বর দিন।'
          : 'Please enter your email address or phone number.'
      );
      return;
    }

    if (!signInPassword || signInPassword.length < 4) {
      setSignInError(
        language === 'bn'
          ? 'অনুগ্রহ করে পাসওয়ার্ড লিখুন (কমপক্ষে ৪ অক্ষর)।'
          : 'Please enter your password (minimum 4 characters).'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await login(signInEmail, signInPassword);
      if (!result.success) {
        setSignInError(
          result.error ||
            (language === 'bn'
              ? 'লগইন ব্যর্থ হয়েছে। তথ্য যাচাই করুন।'
              : 'Sign in failed. Please check your credentials.')
        );
        return;
      }

      // Success
      setSignInEmail('');
      setSignInPassword('');
      setSignInError('');
      setIsAuthModalOpen(false);
    } catch (err: any) {
      setSignInError(err.message || 'Authentication error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    if (!patientName.trim() || !patientEmail.trim()) {
      setRegError(
        language === 'bn'
          ? 'নাম ও ইমেইল উভয়ই প্রদান করুন।'
          : 'Please enter your full name and email address.'
      );
      return;
    }
    if (!patientPassword || patientPassword.length < 4) {
      setRegError(
        language === 'bn'
          ? 'পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে।'
          : 'Please choose a password with at least 4 characters.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await registerPatient({
        name: patientName.trim(),
        email: patientEmail.trim().toLowerCase(),
        phone: patientPhone.trim() || '+880 1700-000000',
        age: parseInt(patientAge) || 28,
        gender: patientGender,
        password: patientPassword
      });

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
      setIsAuthModalOpen(false);
    } catch (err: any) {
      setRegError(err.message || 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    if (!doctorName.trim() || !doctorEmail.trim() || !doctorBmdcReg.trim()) {
      setRegError(
        language === 'bn'
          ? 'অনুগ্রহ করে সকল প্রয়োজনীয় তথ্য পূরণ করুন।'
          : 'Please fill in all required doctor credential fields.'
      );
      return;
    }
    if (!doctorPassword || doctorPassword.length < 4) {
      setRegError(
        language === 'bn'
          ? 'পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে।'
          : 'Please choose a password with at least 4 characters.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await registerDoctor({
        name: doctorName.trim().startsWith('Dr.') ? doctorName.trim() : `Dr. ${doctorName.trim()}`,
        email: doctorEmail.trim().toLowerCase(),
        phone: doctorPhone.trim() || '+880 1711-000000',
        specialty: doctorSpecialty,
        hospitalName: doctorHospital,
        qualifications: doctorQualifications.trim() || 'MBBS, FCPS',
        bmdcRegNumber: doctorBmdcReg.trim(),
        consultationFee: parseInt(doctorFee) || 1200,
        password: doctorPassword
      });

      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 }
      });
      setDoctorName('');
      setDoctorEmail('');
      setDoctorPhone('');
      setDoctorQualifications('');
      setDoctorBmdcReg('');
      setDoctorPassword('');
      setIsAuthModalOpen(false);
    } catch (err: any) {
      setRegError(err.message || 'Doctor registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');
    setDispatchedCode(null);

    const emailClean = forgotEmail.trim();
    if (!emailClean) {
      setForgotError(
        language === 'bn'
          ? 'অনুগ্রহ করে ইমেইল বা ফোন নম্বর দিন।'
          : 'Please enter your registered email address or mobile number.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await requestPasswordReset(emailClean);
      if (!res.success) {
        setForgotError(res.error || 'Failed to dispatch password reset code.');
        return;
      }

      setMaskedEmailNotice(res.maskedEmail || emailClean);
      if (res.code) {
        setDispatchedCode(res.code);
      }
      setForgotStep('reset');
      setForgotSuccess(res.message || 'Verification code dispatched successfully.');
    } catch (err: any) {
      setForgotError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePerformPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    if (!forgotCode.trim()) {
      setForgotError(
        language === 'bn'
          ? '৬ ডিজিটের যাচাইকরণ কোড লিখুন।'
          : 'Please enter the 6-digit verification code.'
      );
      return;
    }

    if (!forgotNewPassword || forgotNewPassword.length < 4) {
      setForgotError(
        language === 'bn'
          ? 'পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে।'
          : 'New password must be at least 4 characters.'
      );
      return;
    }

    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError(
        language === 'bn'
          ? 'পাসওয়ার্ড দুটি মিলছে না।'
          : 'Passwords do not match. Please re-enter.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await resetPassword(forgotEmail, forgotCode, forgotNewPassword);
      if (!res.success) {
        setForgotError(res.error || 'Failed to reset password.');
        return;
      }

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });

      setForgotSuccess(
        language === 'bn'
          ? 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে! সাইন ইন পেজে নিয়ে যাওয়া হচ্ছে...'
          : 'Password reset successfully! Redirecting to Sign In...'
      );

      setSignInEmail(forgotEmail);
      setSignInPassword('');
      setTimeout(() => {
        setAuthModalMode('signin');
        setForgotStep('request');
        setForgotCode('');
        setForgotNewPassword('');
        setForgotConfirmPassword('');
        setForgotSuccess('');
        setDispatchedCode(null);
      }, 1400);
    } catch (err: any) {
      setForgotError(err.message || 'Failed to reset password.');
    } finally {
      setIsSubmitting(false);
    }
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
            {authModalMode === 'signin'
              ? 'Welcome Back'
              : authModalMode === 'signup'
              ? 'Create Account'
              : 'Password Recovery'}
          </h2>
          <p className="text-[11px] font-mono text-ink-soft mt-1 uppercase">
            {authModalMode === 'signin'
              ? 'Sign in to access your consultations, prescriptions, or clinical workspace.'
              : authModalMode === 'signup'
              ? 'Register as a patient for triage or as a doctor to practice on MediConnect.'
              : 'Recover account access with a verified security dispatch code.'}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-3 border border-line bg-paper text-[10px] font-bold font-mono uppercase mb-5">
          <button
            type="button"
            onClick={() => { setAuthModalMode('signin'); setSignInError(''); setRegError(''); setForgotError(''); }}
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
            onClick={() => { setAuthModalMode('signup'); setSignInError(''); setRegError(''); setForgotError(''); }}
            className={`py-2 transition-colors border-r border-line ${
              authModalMode === 'signup'
                ? 'bg-ink text-paper'
                : 'hover:bg-line text-ink-soft hover:text-ink'
            }`}
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => {
              setForgotEmail(signInEmail || forgotEmail);
              setAuthModalMode('forgot-password');
              setSignInError('');
              setRegError('');
              setForgotError('');
            }}
            className={`py-2 transition-colors ${
              authModalMode === 'forgot-password'
                ? 'bg-ink text-paper'
                : 'hover:bg-line text-ink-soft hover:text-ink'
            }`}
          >
            Forgot Password
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
                    placeholder="e.g. dr.shams@squarehospital.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-paper border border-line text-xs font-mono focus:bg-paper-raised focus:outline-none focus:border-ink rounded-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-ink-soft">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(signInEmail || forgotEmail);
                      setAuthModalMode('forgot-password');
                      setForgotError('');
                      setForgotSuccess('');
                    }}
                    className="text-[10px] font-mono text-ink-soft hover:text-ink underline uppercase cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
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
                disabled={isSubmitting}
                className="w-full py-2.5 border border-ink bg-ink hover:bg-ink-soft text-paper text-[11px] font-bold font-mono uppercase transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Authenticating...' : 'Sign In to Account'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div className="pt-3 border-t border-line text-[10px] font-mono text-ink-soft flex items-center justify-between">
                <span>Don't have an account yet?</span>
                <button
                  type="button"
                  onClick={() => { setAuthModalMode('signup'); setSignInError(''); }}
                  className="font-bold underline text-ink hover:text-ink-soft uppercase"
                >
                  Create Account &rarr;
                </button>
              </div>
            </form>
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
                    placeholder="e.g. Sajidul Islam"
                    className="w-full p-2.5 bg-paper border border-line text-xs font-mono focus:bg-paper-raised focus:outline-none focus:border-ink rounded-none"
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
                      placeholder="patient@mail.com"
                      className="w-full p-2.5 bg-paper border border-line text-xs font-mono focus:bg-paper-raised focus:outline-none focus:border-ink rounded-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block mb-1">Mobile</label>
                    <input
                      type="tel"
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value)}
                      placeholder="+880 17..."
                      className="w-full p-2.5 bg-paper border border-line text-xs font-mono focus:bg-paper-raised focus:outline-none focus:border-ink rounded-none"
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
                      className="w-full p-2.5 bg-paper border border-line text-xs font-mono focus:bg-paper-raised focus:outline-none focus:border-ink rounded-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block mb-1">Gender</label>
                    <select
                      value={patientGender}
                      onChange={(e) => setPatientGender(e.target.value as any)}
                      className="w-full p-2.5 bg-paper border border-line text-xs font-mono focus:bg-paper-raised focus:outline-none focus:border-ink rounded-none"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
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
                  disabled={isSubmitting}
                  className="w-full py-2.5 border border-ink bg-ink hover:bg-ink-soft text-paper text-[11px] font-bold font-mono uppercase transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmitting ? 'Registering Account...' : 'Register Patient Account'}</span>
                </button>

                <div className="pt-3 border-t border-line text-[10px] font-mono text-ink-soft flex items-center justify-between">
                  <span>Already have an account?</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => { setAuthModalMode('signin'); setRegError(''); }}
                      className="font-bold underline text-ink hover:text-ink-soft uppercase"
                    >
                      Sign In
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotEmail(patientEmail);
                        setAuthModalMode('forgot-password');
                        setRegError('');
                      }}
                      className="font-bold underline text-ink hover:text-ink-soft uppercase"
                    >
                      Forgot Password?
                    </button>
                  </div>
                </div>
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
                    placeholder="e.g. Dr. Nazmul Huda"
                    className="w-full p-2.5 bg-paper border border-line text-xs font-mono focus:bg-paper-raised focus:outline-none focus:border-ink rounded-none"
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
                      placeholder="dr.name@hospital.com"
                      className="w-full p-2.5 bg-paper border border-line text-xs font-mono focus:bg-paper-raised focus:outline-none focus:border-ink rounded-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block mb-1">Mobile</label>
                    <input
                      type="tel"
                      value={doctorPhone}
                      onChange={(e) => setDoctorPhone(e.target.value)}
                      placeholder="+880 17..."
                      className="w-full p-2.5 bg-paper border border-line text-xs font-mono focus:bg-paper-raised focus:outline-none focus:border-ink rounded-none"
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
                      placeholder="e.g. BMDC-A-99241"
                      className="w-full p-2.5 bg-paper border border-line text-xs font-mono focus:bg-paper-raised focus:outline-none focus:border-ink rounded-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block mb-1">Specialty</label>
                    <select
                      value={doctorSpecialty}
                      onChange={(e) => setDoctorSpecialty(e.target.value)}
                      className="w-full p-2.5 bg-paper border border-line text-[10px] font-bold font-mono focus:bg-paper-raised focus:outline-none focus:border-ink rounded-none"
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
                      placeholder="e.g. Square Hospitals Ltd."
                      className="w-full p-2.5 bg-paper border border-line text-xs font-mono focus:bg-paper-raised focus:outline-none focus:border-ink rounded-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block mb-1">Consultation Fee (BDT)</label>
                    <input
                      type="number"
                      value={doctorFee}
                      onChange={(e) => setDoctorFee(e.target.value)}
                      placeholder="1200"
                      className="w-full p-2.5 bg-paper border border-line text-xs font-mono focus:bg-paper-raised focus:outline-none focus:border-ink rounded-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block mb-1">Academic Qualifications</label>
                  <input
                    type="text"
                    value={doctorQualifications}
                    onChange={(e) => setDoctorQualifications(e.target.value)}
                    placeholder="e.g. MBBS, FCPS"
                    className="w-full p-2.5 bg-paper border border-line text-xs font-mono focus:bg-paper-raised focus:outline-none focus:border-ink rounded-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block mb-1">Create Password</label>
                  <input
                    type="password"
                    required
                    value={doctorPassword}
                    onChange={(e) => setDoctorPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full p-2.5 bg-paper border border-line text-xs font-mono focus:bg-paper-raised focus:outline-none focus:border-ink rounded-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 border border-ink bg-ink hover:bg-ink-soft text-paper text-[11px] font-bold font-mono uppercase transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                >
                  <Stethoscope className="w-4 h-4" />
                  <span>{isSubmitting ? 'Submitting Credentials...' : 'Submit Registration (Pending Verification)'}</span>
                </button>

                <div className="pt-3 border-t border-line text-[10px] font-mono text-ink-soft flex items-center justify-between">
                  <span>Already have an account?</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => { setAuthModalMode('signin'); setRegError(''); }}
                      className="font-bold underline text-ink hover:text-ink-soft uppercase"
                    >
                      Sign In
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotEmail(doctorEmail);
                        setAuthModalMode('forgot-password');
                        setRegError('');
                      }}
                      className="font-bold underline text-ink hover:text-ink-soft uppercase"
                    >
                      Forgot Password?
                    </button>
                  </div>
                </div>
              </form>
            )}

          </div>
        )}

        {/* FORGOT PASSWORD FORM */}
        {authModalMode === 'forgot-password' && (
          <div className="space-y-5">
            {forgotError && (
              <div className="p-3 border border-clinical-red bg-paper text-clinical-red text-[10px] font-mono font-bold uppercase flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{forgotError}</span>
              </div>
            )}

            {forgotSuccess && (
              <div className="p-3 border border-emerald-600 bg-emerald-50 text-emerald-900 text-[10px] font-mono font-bold uppercase flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{forgotSuccess}</span>
              </div>
            )}

            {/* STEP 1: Request Security Verification Code */}
            {forgotStep === 'request' && (
              <form onSubmit={handleRequestResetCode} className="space-y-4">
                <div className="p-3.5 border border-line bg-paper-raised text-ink text-[10px] font-mono uppercase">
                  <div className="flex items-center gap-2 font-bold mb-1">
                    <KeyRound className="w-3.5 h-3.5 shrink-0" />
                    <span>Identity Verification Dispatch</span>
                  </div>
                  <p className="text-ink-soft leading-relaxed mt-1">
                    Enter the email address or phone number associated with your patient, doctor, or administrator profile to receive a security verification code.
                  </p>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block mb-1">
                    Registered Email Address or Mobile Number
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-ink-soft absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="e.g. doctor@hospital.com or +880..."
                      className="w-full pl-10 pr-4 py-2.5 bg-paper border border-line text-xs font-mono focus:bg-paper-raised focus:outline-none focus:border-ink rounded-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 border border-ink bg-ink hover:bg-ink-soft text-paper text-[11px] font-bold font-mono uppercase transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Verifying Account...' : 'Send Verification Code'}</span>
                </button>

                <div className="pt-3 border-t border-line text-[10px] font-mono text-ink-soft flex items-center justify-between">
                  <span>Remembered your password?</span>
                  <button
                    type="button"
                    onClick={() => { setAuthModalMode('signin'); setForgotError(''); }}
                    className="font-bold underline text-ink hover:text-ink-soft uppercase"
                  >
                    Back to Sign In &rarr;
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: Enter Verification Code & Set New Password */}
            {forgotStep === 'reset' && (
              <form onSubmit={handlePerformPasswordReset} className="space-y-4">
                <div className="p-3 border border-line bg-paper-raised flex items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="text-[9px] font-mono font-bold uppercase text-ink-soft block">Resetting Password For</span>
                    <span className="font-mono font-bold text-ink">{maskedEmailNotice || forgotEmail}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setForgotStep('request'); setForgotError(''); setForgotSuccess(''); }}
                    className="text-[10px] font-mono text-ink-soft hover:text-ink underline uppercase"
                  >
                    Change
                  </button>
                </div>

                {/* Convenience Demo / Live Dispatch Code Indicator */}
                {dispatchedCode && (
                  <div className="p-2.5 border border-ink bg-paper text-[10px] font-mono flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="font-bold uppercase text-ink">Security Dispatch Code:</span>
                      <span className="font-bold px-1.5 py-0.5 bg-ink text-paper tracking-widest">{dispatchedCode}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setForgotCode(dispatchedCode)}
                      className="text-[9px] font-bold uppercase underline hover:text-ink-soft text-ink shrink-0"
                    >
                      Autofill Code
                    </button>
                  </div>
                )}

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block mb-1">
                    6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={forgotCode}
                    onChange={(e) => setForgotCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    className="w-full p-2.5 bg-paper border border-line text-center text-lg font-mono tracking-widest font-bold focus:bg-paper-raised focus:outline-none focus:border-ink rounded-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-ink-soft absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 bg-paper border border-line text-xs font-mono focus:bg-paper-raised focus:outline-none focus:border-ink rounded-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-ink-soft absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={forgotConfirmPassword}
                      onChange={(e) => setForgotConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 bg-paper border border-line text-xs font-mono focus:bg-paper-raised focus:outline-none focus:border-ink rounded-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 border border-ink bg-ink hover:bg-ink-soft text-paper text-[11px] font-bold font-mono uppercase transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Updating Password...' : 'Save New Password & Sign In'}</span>
                </button>

                <div className="flex items-center justify-between text-[10px] font-mono text-ink-soft pt-2 border-t border-line">
                  <button
                    type="button"
                    onClick={handleRequestResetCode}
                    disabled={isSubmitting}
                    className="underline hover:text-ink uppercase flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Resend Code</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAuthModalMode('signin'); setForgotError(''); }}
                    className="underline hover:text-ink uppercase"
                  >
                    Cancel / Sign In
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
