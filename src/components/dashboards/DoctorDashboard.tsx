import React, { useState } from 'react';
import {
  Stethoscope,
  Calendar,
  Clock,
  Building,
  Star,
  Send,
  Pill,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Lock,
  CheckCircle2,
  FileText
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { translations } from '../../i18n/translations';
import { Doctor, HealthReport } from '../../types';

export const DoctorDashboard: React.FC = () => {
  const { language, user, switchRole } = useAuth();
  const { appointments, reports, addDoctorNoteToReport, updateAppointmentStatus, verifyDoctor } = useAppData();
  const t = translations[language];

  const currentDoctor = user as Doctor;
  const [selectedReportForRx, setSelectedReportForRx] = useState<HealthReport | null>(null);
  const [diagnosisInput, setDiagnosisInput] = useState('');
  const [prescriptionInput, setPrescriptionInput] = useState('');
  const [adviceInput, setAdviceInput] = useState('');
  const [rxSuccess, setRxSuccess] = useState(false);

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
              <img
                src={currentDoctor?.avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80'}
                alt={currentDoctor?.name}
                className="w-16 h-16 rounded-sm object-cover border border-line"
              />
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

            <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-line bg-paper text-ink text-xs font-bold uppercase tracking-wider self-start sm:self-auto">
              <Lock className="w-4 h-4 shrink-0" />
              <span>Features Locked</span>
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

          {/* Demo & Testing Controls */}
          <div className="pt-4 border-t border-line flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-[11px] font-mono text-ink-soft max-w-sm uppercase">
              Admin verification typically takes 24 hours. For testing, you can switch to the Admin Panel or simulate instant verification:
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => switchRole('admin')}
                className="px-4 py-2 border border-line bg-paper hover:bg-line text-[10px] font-bold font-mono uppercase flex items-center justify-center gap-1.5 transition-colors"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Go to Admin Panel</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  verifyDoctor(currentDoctor.id, true);
                  confetti({
                    particleCount: 60,
                    spread: 70,
                    origin: { y: 0.6 }
                  });
                }}
                className="px-4 py-2 border border-clinical-green bg-clinical-green text-paper hover:bg-clinical-green/90 text-[10px] font-bold font-mono uppercase flex items-center justify-center gap-1.5 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Simulate Admin Approval</span>
              </button>
            </div>
          </div>

        </div>

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
          <img
            src={currentDoctor?.avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80'}
            alt={currentDoctor?.name}
            className="w-14 h-14 rounded-sm object-cover border border-line"
          />
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

    </div>
  );
};
