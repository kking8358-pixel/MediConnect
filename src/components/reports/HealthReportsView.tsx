import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Share2,
  Calendar,
  Stethoscope,
  Pill,
  ArrowRight
} from 'lucide-react';
import { HealthReport } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { translations } from '../../i18n/translations';
import { generateHealthReportPDF } from '../../services/pdfGenerator';

export const HealthReportsView: React.FC = () => {
  const { language, user, openAuthModal } = useAuth();
  const { reports, doctors, shareReportWithDoctor } = useAppData();
  const t = translations[language];

  // Patients only ever see their own records.
  const visibleReports =
    user && user.role === 'patient'
      ? reports.filter((r) => r.patientId === user.id)
      : reports;

  const [selectedReport, setSelectedReport] = useState<HealthReport | null>(
    visibleReports[0] || null
  );
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareDoctorId, setShareDoctorId] = useState<string>(doctors[0]?.id || '');
  const [shareSuccess, setShareSuccess] = useState(false);

  // Keep selection and share target valid as data changes.
  useEffect(() => {
    if (visibleReports.length === 0) {
      setSelectedReport(null);
    } else if (!visibleReports.some((r) => r.id === selectedReport?.id)) {
      setSelectedReport(visibleReports[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reports, user?.id]);
  useEffect(() => {
    if (!doctors.some((d) => d.id === shareDoctorId) && doctors.length > 0) {
      setShareDoctorId(doctors[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctors]);

  const [shareError, setShareError] = useState<string | null>(null);

  const handleShare = () => {
    setShareError(null);
    if (!selectedReport) return;
    if (!shareDoctorId || !doctors.some((d) => d.id === shareDoctorId)) {
      setShareError('No doctor available to share with.');
      return;
    }
    if (selectedReport.sharedWithDoctorIds.includes(shareDoctorId)) {
      setShareError('Already shared with this doctor.');
      return;
    }
    shareReportWithDoctor(selectedReport.id, shareDoctorId);
    setShareSuccess(true);
    setTimeout(() => {
      setShareSuccess(false);
      setShareModalOpen(false);
    }, 1200);
  };

  const handleDownload = (report: HealthReport) => {
    void generateHealthReportPDF(report).catch(() => undefined);
  };

  if (!user) {
    return (
      <div className="chart-panel p-8 sm:p-12 text-center max-w-lg mx-auto my-12 animate-fade-in font-sans text-ink">
        <div className="w-12 h-12 border-2 border-ink bg-paper text-ink flex items-center justify-center mx-auto mb-4">
          <FileText className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold uppercase tracking-tight">
          {language === 'en' ? 'Sign In to View Health Reports' : 'স্বাস্থ্য রিপোর্ট দেখতে সাইন ইন করুন'}
        </h2>
        <p className="text-[11px] font-mono text-ink-soft uppercase leading-relaxed mt-2">
          {language === 'en'
            ? 'Electronic health records, prescriptions, and lab summaries are securely stored in your personal profile. Please sign in or create an account to view your medical history.'
            : 'ডিজিটাল প্রেসক্রিপশন ও মেডিকেল রিপোর্ট দেখতে অনুগ্রহ করে আপনার অ্যাকাউন্টে সাইন ইন করুন।'}
        </p>
        <div className="pt-4 mt-4 border-t border-line">
          <button
            onClick={() => openAuthModal('signin')}
            className="px-5 py-2.5 border border-ink bg-ink hover:bg-ink-soft text-paper text-[11px] font-bold font-mono uppercase inline-flex items-center gap-2 transition-colors"
          >
            <span>{language === 'en' ? 'Sign In / Register' : 'সাইন ইন / রেজিস্টার'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in font-sans text-ink">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 border border-line bg-paper text-ink text-[9px] font-mono font-bold uppercase mb-2">
            <FileText className="w-3 h-3" />
            <span>{language === 'en' ? 'Electronic Health Records' : 'ডিজিটাল স্বাস্থ্য রেকর্ড'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight">
            {t.rep_title}
          </h1>
          <p className="text-[11px] font-mono text-ink-soft uppercase mt-1">
            {t.rep_subtitle}
          </p>
        </div>
      </div>

      {visibleReports.length === 0 ? (
        <div className="chart-panel p-12 text-center text-ink-soft">
          <FileText className="w-10 h-10 mx-auto mb-3" />
          <h3 className="text-sm font-bold uppercase">{t.rep_no_reports}</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Report List */}
          <div className="space-y-3">
            <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-ink-soft block mb-1">
              {language === 'en' ? 'Past Consultations & Records' : 'পূর্ববর্তী স্বাস্থ্য রেকর্ড'}
            </span>

            {visibleReports.map((rep) => {
              const isSelected = selectedReport?.id === rep.id;
              const hasNotes = rep.doctorNotes && rep.doctorNotes.length > 0;

              return (
                <div
                  key={rep.id}
                  onClick={() => setSelectedReport(rep)}
                  className={`p-4 border cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-paper-raised border-ink border-l-4'
                      : 'bg-paper border-line hover:border-ink hover:bg-paper-raised'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[9px] font-mono font-bold text-ink-soft uppercase border border-line px-1 py-0.5">
                        #{rep.id.toUpperCase()}
                      </span>
                      <h4 className="text-sm font-bold uppercase mt-2">{rep.condition}</h4>
                      <p className="text-[10px] font-mono text-ink-soft uppercase">{rep.specialist}</p>
                    </div>

                    <span className={`text-[8px] px-1 py-0.5 font-mono font-bold uppercase ${
                      rep.severity === 'urgent'
                        ? 'stamp-severe border-clinical-red text-clinical-red'
                        : rep.severity === 'moderate'
                        ? 'border border-ink text-ink bg-paper'
                        : 'border border-clinical-green text-clinical-green'
                    }`}>
                      {rep.severity}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[9px] font-mono font-bold text-ink-soft uppercase pt-3 mt-3 border-t border-line">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" />
                      {new Date(rep.createdAt).toLocaleDateString()}
                    </span>

                    {hasNotes && (
                      <span className="text-ink flex items-center gap-1.5">
                        <Stethoscope className="w-3 h-3" />
                        Rx Signed
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Detailed Document Preview */}
          {selectedReport && (
            <div className="lg:col-span-2 chart-panel p-6 sm:p-8 space-y-6">
              
              {/* Top Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b-2 border-ink">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 bg-ink text-paper">
                      Record #{selectedReport.id.toUpperCase()}
                    </span>
                    <span className="text-[10px] font-mono text-ink-soft uppercase">
                      {new Date(selectedReport.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold uppercase mt-2">
                    {selectedReport.condition}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShareModalOpen(true)}
                    className="px-3 py-2 border border-line bg-paper hover:border-ink hover:bg-paper-raised text-ink text-[10px] font-mono font-bold uppercase flex items-center gap-1.5 transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{t.rep_share_btn}</span>
                  </button>

                  <button
                    onClick={() => handleDownload(selectedReport)}
                    className="px-4 py-2 border border-ink bg-ink hover:bg-ink-soft text-paper text-[10px] font-mono font-bold uppercase flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{t.rep_download}</span>
                  </button>
                </div>
              </div>

              {/* Patient Profile & Triage Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 border border-line bg-paper-raised space-y-1">
                  <span className="text-[9px] font-mono font-bold uppercase text-ink-soft">
                    {t.rep_patient_details}
                  </span>
                  <p className="text-sm font-bold uppercase text-ink">{selectedReport.patientName}</p>
                  <p className="text-[10px] font-mono uppercase text-ink-soft">
                    Age: {selectedReport.patientAge || 26} yrs • Gender: {selectedReport.patientGender || 'Male'}
                  </p>
                </div>

                <div className="p-4 border border-line bg-paper-raised space-y-1">
                  <span className="text-[9px] font-mono font-bold uppercase text-ink-soft">
                    {t.rep_recommended}
                  </span>
                  <p className="text-sm font-bold uppercase text-ink">{selectedReport.specialist}</p>
                  <p className="text-[10px] font-mono uppercase text-ink-soft">
                    Match Confidence: {selectedReport.confidence}%
                  </p>
                </div>
              </div>

              {/* Symptoms Checklist */}
              <div>
                <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-ink-soft block mb-2">
                  {t.rep_reported_symptoms}
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedReport.symptoms.map((sym, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-paper border border-line text-ink text-[10px] font-mono uppercase font-bold"
                    >
                      • {sym}
                    </span>
                  ))}
                </div>
              </div>

              {/* Doctor Clinical Notes */}
              <div className="space-y-4 pt-4 border-t border-line">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold font-mono uppercase tracking-wider text-ink flex items-center gap-2">
                    <Stethoscope className="w-4 h-4" />
                    <span>{t.rep_doctor_notes}</span>
                  </span>
                </div>

                {selectedReport.doctorNotes && selectedReport.doctorNotes.length > 0 ? (
                  <div className="space-y-4">
                    {selectedReport.doctorNotes.map((note) => (
                      <div
                        key={note.id}
                        className="p-5 border-2 border-line bg-paper space-y-4"
                      >
                        <div className="flex items-center justify-between pb-3 border-b border-line">
                          <div>
                            <h4 className="text-sm font-bold uppercase">{note.doctorName}</h4>
                            <p className="text-[10px] font-mono uppercase text-ink-soft">{note.doctorSpecialty}</p>
                          </div>
                          <span className="text-[10px] text-ink-soft font-mono uppercase border border-line px-1.5 py-0.5">
                            {new Date(note.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <div>
                          <span className="text-[9px] font-mono font-bold text-ink-soft uppercase block mb-1">{t.rep_diagnosis}</span>
                          <p className="text-sm font-bold uppercase text-ink">{note.diagnosis}</p>
                        </div>

                        <div className="p-4 bg-paper-raised border border-line">
                          <span className="text-[9px] font-mono font-bold text-ink-soft uppercase block mb-2 flex items-center gap-1.5">
                            <Pill className="w-3 h-3" />
                            <span>{t.rep_rx}</span>
                          </span>
                          <p className="text-xs font-mono uppercase text-ink whitespace-pre-line leading-relaxed">
                            {note.prescription}
                          </p>
                        </div>

                        {note.advice && (
                          <div className="p-3 border-l-2 border-ink">
                            <span className="text-[9px] font-mono font-bold text-ink-soft uppercase block mb-1">Advice</span>
                            <p className="text-[11px] font-mono uppercase text-ink leading-relaxed">
                              {note.advice}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 border border-line bg-paper-raised text-center text-ink-soft space-y-2">
                    <p className="text-[11px] font-bold uppercase font-mono">No verified doctor notes attached yet.</p>
                    <p className="text-[10px] font-mono uppercase leading-relaxed max-w-sm mx-auto border-t border-line pt-2">
                      Share this record with an accredited doctor to receive a digital prescription.
                    </p>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      )}

      {/* SHARE MODAL */}
      {shareModalOpen && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-paper/90 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md chart-panel p-6 border-2 border-ink shadow-none">
            
            <h3 className="text-sm font-bold uppercase flex items-center gap-2 mb-4 border-b border-ink pb-2">
              <Share2 className="w-4 h-4" />
              <span>{t.rep_share_title}</span>
            </h3>

            <div className="space-y-2 mb-5">
              <label className="text-[10px] font-mono font-bold uppercase text-ink-soft">{t.rep_select_doctor}:</label>
              <select
                value={shareDoctorId}
                onChange={(e) => setShareDoctorId(e.target.value)}
                className="w-full p-2.5 bg-paper border border-line text-[10px] font-mono uppercase focus:border-ink rounded-none outline-none"
              >
                {doctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name.toUpperCase()} ({doc.specialty.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            {shareError && !shareSuccess && (
              <div className="p-2.5 mb-3 border border-clinical-red bg-paper text-clinical-red text-center text-[10px] font-mono font-bold uppercase">
                {shareError}
              </div>
            )}

            {shareSuccess ? (
              <div className="p-3 border border-clinical-green bg-paper text-clinical-green text-center text-[10px] font-mono font-bold uppercase">
                [✓] Record shared successfully
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => setShareModalOpen(false)}
                  className="flex-1 py-2.5 border border-line bg-paper hover:border-ink hover:bg-paper-raised text-ink text-[10px] font-mono font-bold uppercase transition-colors"
                >
                  {t.common_cancel}
                </button>
                <button
                  onClick={handleShare}
                  className="flex-1 py-2.5 border border-ink bg-ink hover:bg-ink-soft text-paper text-[10px] font-mono font-bold uppercase transition-colors"
                >
                  {t.common_confirm_share}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
