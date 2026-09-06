import React, { useState, useRef } from 'react';
import {
  Stethoscope,
  Calendar,
  Clock,
  Building,
  Star,
  Send,
  Pill,
  ShieldAlert,
  Lock,
  CheckCircle2,
  FileText,
  Camera,
  Upload,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { translations } from '../../i18n/translations';
import { Doctor, HealthReport } from '../../types';

export const DoctorDashboard: React.FC = () => {
  const { language, user, updateProfile } = useAuth();
  const { appointments, reports, addDoctorNoteToReport, updateAppointmentStatus, updateDoctor } = useAppData();
  const t = translations[language];

  const currentDoctor = user as Doctor;
  const [selectedReportForRx, setSelectedReportForRx] = useState<HealthReport | null>(null);
  const [diagnosisInput, setDiagnosisInput] = useState('');
  const [prescriptionInput, setPrescriptionInput] = useState('');
  const [adviceInput, setAdviceInput] = useState('');
  const [rxSuccess, setRxSuccess] = useState(false);

  // Profile Photo Upload State
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [previewAvatar, setPreviewAvatar] = useState<string>(currentDoctor?.avatar || '');
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const DOCTOR_AVATAR_PRESETS = [
    { label: 'Specialist 1', url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80' },
    { label: 'Specialist 2', url: 'https://images.unsplash.com/photo-1594824813576-90e6a8efee5e?auto=format&fit=crop&w=400&q=80' },
    { label: 'Specialist 3', url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80' },
    { label: 'Specialist 4', url: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&q=80' },
    { label: 'Specialist 5', url: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=400&q=80' },
    { label: 'Specialist 6', url: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=400&q=80' },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError(
        language === 'bn'
          ? 'অনুগ্রহ করে একটি ছবি ফাইল (JPG, PNG, WebP) নির্বাচন করুন।'
          : 'Please select a valid image file (JPG, PNG, WebP).'
      );
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError(
        language === 'bn'
          ? 'ছবির সাইজ ১০ মেগাবাইটের কম হতে হবে।'
          : 'Image file size must be less than 10MB.'
      );
      return;
    }

    setIsProcessingFile(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        try {
          const maxDim = 400;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const optimized = canvas.toDataURL('image/jpeg', 0.88);
            setPreviewAvatar(optimized);
          } else {
            setPreviewAvatar(event.target?.result as string);
          }
        } catch (err) {
          setPreviewAvatar(event.target?.result as string);
        } finally {
          setIsProcessingFile(false);
        }
      };
      img.onerror = () => {
        setUploadError('Failed to decode image file.');
        setIsProcessingFile(false);
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      setUploadError('Failed to read image file.');
      setIsProcessingFile(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSavePhoto = () => {
    if (!previewAvatar) return;

    // Update AuthContext session user (propagates to Navbar and session store)
    updateProfile({ avatar: previewAvatar });

    // Update AppDataContext doctors list (propagates to DoctorDirectory, etc.)
    if (currentDoctor?.id) {
      updateDoctor(currentDoctor.id, { avatar: previewAvatar });
    }

    setUploadSuccess(true);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });

    setTimeout(() => {
      setIsPhotoModalOpen(false);
      setUploadSuccess(false);
      setUploadError('');
    }, 900);
  };

  const renderPhotoModal = () => {
    if (!isPhotoModalOpen) return null;

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-paper/90 backdrop-blur-sm animate-fade-in font-sans text-ink">
        <div className="relative w-full max-w-lg chart-panel p-6 sm:p-7 max-h-[92vh] overflow-y-auto custom-scrollbar shadow-2xl border-2 border-ink space-y-5">
          {/* Close Button */}
          <button
            onClick={() => { setIsPhotoModalOpen(false); setUploadError(''); }}
            className="absolute top-5 right-5 p-1 border border-transparent hover:border-ink hover:bg-line transition-colors text-ink"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider border-b border-ink pb-0.5 inline-block mb-1">
              Clinical Practitioner Identity
            </span>
            <h2 className="text-xl font-bold uppercase tracking-tight flex items-center gap-2">
              <Camera className="w-5 h-5" />
              <span>Upload Profile Picture</span>
            </h2>
            <p className="text-[11px] font-mono text-ink-soft mt-1 uppercase">
              Update your professional medical portrait displayed to patients and in directory searches.
            </p>
          </div>

          {uploadError && (
            <div className="p-3 border border-clinical-red bg-paper text-clinical-red text-[10px] font-mono font-bold uppercase flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {uploadSuccess && (
            <div className="p-3 border border-emerald-600 bg-emerald-50 text-emerald-900 text-[10px] font-mono font-bold uppercase flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>Profile picture updated successfully!</span>
            </div>
          )}

          {/* Avatar Preview */}
          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 border border-line bg-paper-raised">
            <div className="relative shrink-0">
              <img
                src={previewAvatar || currentDoctor?.avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80'}
                alt="Avatar Preview"
                className="w-24 h-24 rounded-sm object-cover border-2 border-ink shadow-md"
              />
              <span className="absolute -bottom-2 -right-2 px-1.5 py-0.5 bg-ink text-paper text-[9px] font-mono font-bold uppercase">
                PREVIEW
              </span>
            </div>
            <div className="text-center sm:text-left space-y-1">
              <h3 className="text-sm font-bold uppercase">{currentDoctor?.name}</h3>
              <p className="text-[11px] font-mono text-ink-soft uppercase">{currentDoctor?.specialty} • {currentDoctor?.hospitalName}</p>
              <p className="text-[10px] font-mono text-ink-soft">BMDC: {currentDoctor?.bmdcRegNumber || 'BMDC-A-Pending'}</p>
            </div>
          </div>

          {/* File Upload Zone */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block">
              Upload from Device (JPG, PNG, WebP)
            </label>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/png, image/jpeg, image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-line hover:border-ink bg-paper p-6 text-center cursor-pointer transition-colors space-y-2"
            >
              <Upload className="w-6 h-6 mx-auto text-ink-soft" />
              <div>
                <p className="text-xs font-bold uppercase">
                  {isProcessingFile ? 'Processing Image...' : 'Click to Browse Image File'}
                </p>
                <p className="text-[10px] font-mono text-ink-soft uppercase mt-0.5">
                  Supports high-resolution images &bull; auto-optimized for clinical profile
                </p>
              </div>
            </div>
          </div>

          {/* Presets Row */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block">
              Or Select Professional Medical Portrait
            </label>
            <div className="grid grid-cols-6 gap-2">
              {DOCTOR_AVATAR_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => { setPreviewAvatar(preset.url); setUploadError(''); }}
                  className={`relative p-0.5 border transition-all ${
                    previewAvatar === preset.url ? 'border-2 border-ink ring-2 ring-ink/20 scale-105' : 'border-line hover:border-ink'
                  }`}
                >
                  <img
                    src={preset.url}
                    alt={preset.label}
                    className="w-full h-12 object-cover rounded-none"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Custom URL Input */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block">
              Or Paste Image Web URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={customUrlInput}
                onChange={(e) => setCustomUrlInput(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className="flex-1 px-3 py-2 bg-paper border border-line text-xs font-mono focus:bg-paper-raised focus:outline-none focus:border-ink rounded-none"
              />
              <button
                type="button"
                onClick={() => {
                  if (customUrlInput.trim()) {
                    setPreviewAvatar(customUrlInput.trim());
                    setCustomUrlInput('');
                  }
                }}
                className="px-3 py-2 border border-ink bg-paper text-ink hover:bg-ink hover:text-paper text-[10px] font-mono font-bold uppercase shrink-0"
              >
                Apply
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-line">
            <button
              type="button"
              onClick={() => { setIsPhotoModalOpen(false); setUploadError(''); }}
              className="px-4 py-2.5 border border-line bg-paper hover:bg-line text-[11px] font-bold font-mono uppercase text-ink-soft hover:text-ink transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSavePhoto}
              disabled={!previewAvatar || isProcessingFile}
              className="px-5 py-2.5 border border-ink bg-ink hover:bg-ink-soft text-paper text-[11px] font-bold font-mono uppercase flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Profile Picture</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ROLE GUARD — patients/admins must never see the clinical workstation,
  // even if they navigate here directly.
  if (!user || user.role !== 'doctor') {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center max-w-md mx-auto my-10 shadow-sm">
        <h2 className="text-base font-bold text-slate-900">Doctor access only</h2>
        <p className="text-xs text-slate-500 mt-1">Please sign in with a doctor account to open the clinical workstation.</p>
      </div>
    );
  }

  // UNVERIFIED DOCTOR GATE
  if (!currentDoctor?.isVerified) {
    return (
      <div className="space-y-6 animate-fade-in max-w-4xl mx-auto font-sans text-ink">
        
        {/* Unverified Doctor Card */}
        <div className="chart-panel p-6 sm:p-8 space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-line">
            <div className="flex items-center gap-4">
              <div
                className="relative group cursor-pointer shrink-0"
                onClick={() => {
                  setPreviewAvatar(currentDoctor?.avatar || '');
                  setUploadError('');
                  setIsPhotoModalOpen(true);
                }}
                title="Click to change profile picture"
              >
                <img
                  src={currentDoctor?.avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80'}
                  alt={currentDoctor?.name}
                  className="w-16 h-16 rounded-sm object-cover border border-line group-hover:opacity-80 transition-opacity"
                />
                <div className="absolute inset-0 bg-ink/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-sm text-paper">
                  <Camera className="w-4 h-4" />
                  <span className="text-[8px] font-mono font-bold uppercase mt-0.5">Upload</span>
                </div>
                <div className="absolute -bottom-1 -right-1 p-1 bg-ink text-paper border border-paper rounded-full shadow-sm">
                  <Camera className="w-2.5 h-2.5" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-ink-soft border-b border-ink-soft pb-0.5">
                    {currentDoctor?.specialty || 'General Physician'}
                  </span>
                  <span className="text-[10px] font-mono font-bold uppercase border border-line bg-paper px-2 py-0.5 flex items-center gap-1 text-ink-soft">
                    <Clock className="w-3 h-3" />
                    <span>Pending Administrative Verification</span>
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold mt-1">
                  {currentDoctor?.name}
                </h1>
                <p className="text-xs text-ink-soft mt-0.5">
                  {currentDoctor?.hospitalName} • BMDC Reg: <span className="font-mono font-bold text-ink">{currentDoctor?.bmdcRegNumber || 'BMDC-A-Pending'}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => {
                  setPreviewAvatar(currentDoctor?.avatar || '');
                  setUploadError('');
                  setIsPhotoModalOpen(true);
                }}
                className="px-3 py-1.5 border border-ink bg-paper hover:bg-ink hover:text-paper text-ink text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Upload Photo</span>
              </button>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-line bg-paper text-ink text-xs font-bold uppercase tracking-wider">
                <Lock className="w-4 h-4 shrink-0" />
                <span>Features Locked</span>
              </div>
            </div>
          </div>

          {/* Explanation Alert */}
          <div className="chart-panel border-clinical-red p-5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-clinical-red font-bold text-sm uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>Medical License Verification Required</span>
              </div>
              <span className="stamp-severe">HOLD</span>
            </div>
            <p className="text-xs text-ink-soft font-mono leading-relaxed uppercase">
              In compliance with BMDC guidelines and patient privacy standards, your doctor account cannot accept appointments, access the triage queue, or issue digital prescriptions until your medical license and credentials are verified by a MediConnect Administrator.
            </p>
          </div>

          {/* Submitted Credentials Summary */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-ink-soft">
              Submitted Medical Profile
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-line border border-line bg-paper-raised text-xs">
              <div className="p-4">
                <span className="text-ink-soft text-[10px] uppercase font-bold block mb-1">BMDC Registration Number</span>
                <span className="font-bold font-mono text-sm">{currentDoctor?.bmdcRegNumber || 'BMDC-A-Pending'}</span>
              </div>
              <div className="p-4">
                <span className="text-ink-soft text-[10px] uppercase font-bold block mb-1">Specialty</span>
                <span className="font-bold text-sm uppercase">{currentDoctor?.specialty}</span>
              </div>
              <div className="p-4">
                <span className="text-ink-soft text-[10px] uppercase font-bold block mb-1">Hospital / Institution</span>
                <span className="font-bold uppercase">{currentDoctor?.hospitalName}</span>
              </div>
              <div className="p-4">
                <span className="text-ink-soft text-[10px] uppercase font-bold block mb-1">Qualifications</span>
                <span className="font-bold uppercase">{currentDoctor?.qualifications || 'MBBS, FCPS'}</span>
              </div>
            </div>
          </div>

          {/* Verification Notice */}
          <div className="pt-4 border-t border-line">
            <p className="text-[11px] font-mono text-ink-soft uppercase">
              Admin verification typically takes 24 hours. Your clinical workspace will unlock once your BMDC credentials have been reviewed.
            </p>
          </div>

        </div>

        {renderPhotoModal()}

      </div>
    );
  }

  // Strict ID match — never substring-match on display names.
  const doctorAppointments = appointments.filter(
    (a) => a.doctorId === currentDoctor?.id
  );

  // Triage queue: explicitly shared with this doctor, plus unreviewed
  // reports of their own specialty. Reviewed reports leave the queue so it
  // can't fill with duplicates after prescribing.
  const pendingReports = reports.filter((r) => {
    if (!currentDoctor?.id) return false;
    if (r.sharedWithDoctorIds.includes(currentDoctor.id)) return true;
    const hasNotes = r.doctorNotes && r.doctorNotes.length > 0;
    return !hasNotes && r.specialist === currentDoctor.specialty;
  });

  const handleOpenRxModal = (report: HealthReport) => {
    setSelectedReportForRx(report);
    setDiagnosisInput(`Clinical evaluation of ${report.condition}`);
    setPrescriptionInput('1. Tab ... (1-0-1 after meals)\n2. Cap ... (0-1-0 before sleep)\n3. Adequate hydration');
    setAdviceInput('Review in 7 days or if symptoms escalate.');
    setRxSuccess(false);
  };

  const handleSavePrescription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReportForRx || !diagnosisInput || !prescriptionInput) return;

    addDoctorNoteToReport(selectedReportForRx.id, {
      doctorId: currentDoctor.id,
      doctorName: currentDoctor.name,
      doctorSpecialty: currentDoctor.specialty,
      diagnosis: diagnosisInput,
      prescription: prescriptionInput,
      advice: adviceInput
    });

    setRxSuccess(true);
    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.6 }
    });

    setTimeout(() => {
      setSelectedReportForRx(null);
      setRxSuccess(false);
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans text-ink">
      
      {/* Doctor Header Banner */}
      <div className="chart-panel p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className="relative group cursor-pointer shrink-0"
            onClick={() => {
              setPreviewAvatar(currentDoctor?.avatar || '');
              setUploadError('');
              setIsPhotoModalOpen(true);
            }}
            title="Click to change profile picture"
          >
            <img
              src={currentDoctor?.avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80'}
              alt={currentDoctor?.name}
              className="w-14 h-14 rounded-sm object-cover border border-line group-hover:opacity-80 transition-opacity"
            />
            <div className="absolute inset-0 bg-ink/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-sm text-paper">
              <Camera className="w-4 h-4" />
              <span className="text-[8px] font-mono font-bold uppercase mt-0.5">Upload</span>
            </div>
            <div className="absolute -bottom-1 -right-1 p-1 bg-ink text-paper border border-paper rounded-full shadow-sm">
              <Camera className="w-2.5 h-2.5" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-ink-soft border-b border-ink-soft pb-0.5">
                {currentDoctor?.specialty || 'Cardiologist'}
              </span>
              <span className="text-xs font-mono font-bold flex items-center gap-1">
                <Star className="w-3 h-3 fill-current text-ink" /> {currentDoctor?.rating || 4.9}
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold mt-1 uppercase">
              {currentDoctor?.name || 'Prof. Dr. Mohammad Shamsuzzaman'}
            </h1>
            <p className="text-xs text-ink-soft flex items-center gap-1 mt-0.5 uppercase">
              <Building className="w-3.5 h-3.5" />
              <span>{currentDoctor?.hospitalName || 'Square Hospitals Ltd.'} • {currentDoctor?.experienceYears || 18} yrs experience</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              setPreviewAvatar(currentDoctor?.avatar || '');
              setUploadError('');
              setIsPhotoModalOpen(true);
            }}
            className="px-3.5 py-2.5 border border-ink bg-paper hover:bg-ink hover:text-paper text-[10px] font-mono font-bold uppercase flex items-center gap-1.5 transition-colors shrink-0"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Upload Photo</span>
          </button>
          <div className="p-3 bg-paper border border-line text-center min-w-[90px]">
            <span className="text-[10px] uppercase font-bold text-ink-soft block mb-1">Today's Visits</span>
            <span className="text-xl font-bold font-mono">{doctorAppointments.length}</span>
          </div>
          <div className="p-3 bg-paper border border-line text-center min-w-[90px]">
            <span className="text-[10px] uppercase font-bold text-ink-soft block mb-1">Triage Queue</span>
            <span className="text-xl font-bold font-mono text-clinical-green">{pendingReports.length}</span>
          </div>
        </div>
      </div>

      {/* Grid: Appointments & Shared Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Appointments */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-ink pb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>{t.doc_upcoming_appointments}</span>
            </h2>
            <span className="text-[10px] font-mono text-ink-soft">{doctorAppointments.length} Scheduled</span>
          </div>

          {doctorAppointments.length === 0 ? (
            <div className="chart-panel p-8 text-center text-ink-soft">
              <Calendar className="w-6 h-6 mx-auto mb-2" />
              <p className="text-xs font-bold uppercase tracking-wider">No appointments scheduled today.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {doctorAppointments.map((apt) => (
                <div key={apt.id} className="chart-panel p-4 flex flex-col gap-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-ink-soft uppercase border-b border-line pb-0.5">
                        REF:{apt.id.toUpperCase()}
                      </span>
                      <h4 className="text-sm font-bold uppercase mt-2">{apt.patientName}</h4>
                      <p className="text-[11px] font-mono text-ink-soft mt-0.5">{apt.patientPhone}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] font-bold font-mono bg-paper border border-line px-2 py-0.5">
                        {apt.timeSlot}
                      </span>
                      <span className="block text-[10px] font-mono text-ink-soft mt-1">{apt.date}</span>
                    </div>
                  </div>

                  {apt.notes && (
                    <p className="text-[10px] text-ink-soft font-mono bg-paper p-2 border border-line uppercase">
                      Reason: {apt.notes}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-line mt-1">
                    <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 border ${
                      apt.status === 'completed' ? 'border-ink text-ink' : 'border-line bg-paper text-ink-soft'
                    }`}>
                      {apt.status}
                    </span>
                    {apt.status !== 'completed' && apt.status !== 'cancelled' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (window.confirm(`Cancel the appointment with ${apt.patientName}?`)) {
                              updateAppointmentStatus(apt.id, 'cancelled');
                            }
                          }}
                          className="px-3 py-1 bg-paper hover:bg-paper-raised border border-line hover:border-clinical-red hover:text-clinical-red text-ink-soft text-[10px] font-bold font-mono uppercase transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => updateAppointmentStatus(apt.id, 'completed')}
                          className="px-3 py-1 bg-paper hover:bg-line border border-line text-ink text-[10px] font-bold font-mono uppercase transition-colors"
                        >
                          Mark Complete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Reports Triage Queue */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-ink pb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Stethoscope className="w-4 h-4" />
              <span>{t.doc_shared_reports}</span>
            </h2>
            <span className="text-[10px] font-mono text-ink-soft">Triage Queue</span>
          </div>

          {pendingReports.length === 0 ? (
            <div className="chart-panel p-8 text-center text-ink-soft">
              <FileText className="w-6 h-6 mx-auto mb-2" />
              <p className="text-xs font-bold uppercase tracking-wider">No pending reports.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingReports.map((rep) => {
                const hasNotes = rep.doctorNotes && rep.doctorNotes.length > 0;
                const isUrgent = rep.severity === 'urgent';

                return (
                  <div key={rep.id} className="chart-panel p-4 flex flex-col gap-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-[10px] font-mono font-bold text-ink-soft uppercase border-b border-line pb-0.5">
                            REF:{rep.id.toUpperCase()}
                          </span>
                          {isUrgent && <span className="stamp-urgent">URGENT</span>}
                        </div>
                        <h4 className="text-sm font-bold uppercase">{rep.condition}</h4>
                        <p className="text-[11px] font-mono text-ink-soft mt-0.5">Patient: {rep.patientName}</p>
                      </div>

                      <button
                        onClick={() => handleOpenRxModal(rep)}
                        className={`px-3 py-1.5 border text-[10px] font-bold font-mono uppercase flex items-center gap-1.5 transition-colors ${
                          hasNotes
                            ? 'bg-paper border-line hover:bg-line text-ink'
                            : 'bg-ink border-ink hover:bg-ink-soft text-paper'
                        }`}
                      >
                        <Stethoscope className="w-3.5 h-3.5" />
                        <span>{hasNotes ? 'Edit Rx' : '+ Prescribe'}</span>
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-line mt-1">
                      {rep.symptoms.map((s, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-mono font-bold uppercase bg-paper border border-line px-1.5 py-0.5 text-ink-soft"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* PRESCRIPTION MODAL */}
      {selectedReportForRx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-paper/90 backdrop-blur-sm animate-fade-in">
          <div className="chart-panel border-2 border-ink w-full max-w-lg p-6 shadow-none text-ink space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider">{t.doc_write_prescription}</h3>
                <p className="text-[10px] font-mono text-ink-soft mt-1">
                  PATIENT: {selectedReportForRx.patientName} • REF:{selectedReportForRx.id.toUpperCase()}
                </p>
              </div>
            </div>

            <form onSubmit={handleSavePrescription} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block mb-1">Clinical Diagnosis</label>
                <input
                  type="text"
                  required
                  value={diagnosisInput}
                  onChange={(e) => setDiagnosisInput(e.target.value)}
                  className="w-full p-2.5 bg-paper border border-line text-xs font-mono focus:bg-paper-raised focus:outline-none focus:border-ink rounded-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block mb-1">
                  Prescription (Rx)
                </label>
                <textarea
                  rows={4}
                  required
                  value={prescriptionInput}
                  onChange={(e) => setPrescriptionInput(e.target.value)}
                  className="w-full p-2.5 bg-paper border border-line text-xs font-mono focus:bg-paper-raised focus:outline-none focus:border-ink leading-relaxed rounded-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block mb-1">Doctor Advice</label>
                <textarea
                  rows={2}
                  value={adviceInput}
                  onChange={(e) => setAdviceInput(e.target.value)}
                  className="w-full p-2.5 bg-paper border border-line text-xs font-mono focus:bg-paper-raised focus:outline-none focus:border-ink rounded-none"
                />
              </div>

              {rxSuccess ? (
                <div className="p-3 bg-paper border border-ink text-center text-xs font-mono font-bold uppercase">
                  [ ✓ ] Prescription signed and recorded
                </div>
              ) : (
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedReportForRx(null)}
                    className="flex-1 py-2 border border-line bg-paper hover:bg-line text-[10px] font-bold font-mono uppercase transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 border border-ink bg-ink hover:bg-ink-soft text-paper text-[10px] font-bold font-mono uppercase flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{t.doc_prescribe_btn}</span>
                  </button>
                </div>
              )}
            </form>

          </div>
        </div>
      )}

      {renderPhotoModal()}

    </div>
  );
};
