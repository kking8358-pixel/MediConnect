import React from 'react';
import {
  Sparkles,
  Stethoscope,
  Pill,
  FileText,
  Calendar,
  Clock,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  MapPin,
  PhoneCall,
  Download
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAppData, isReminderCourseActive } from '../../context/AppDataContext';
import { translations } from '../../i18n/translations';
import { generateHealthReportPDF } from '../../services/pdfGenerator';

interface PatientDashboardProps {
  onNavigateTab: (tab: string, contextData?: any) => void;
  onOpenEmergency: () => void;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({
  onNavigateTab,
  onOpenEmergency
}) => {
  const { language, user } = useAuth();
  const { appointments, reminders, reports, logReminderDose, updateAppointmentStatus } = useAppData();
  const t = translations[language];

  // Scope everything to the signed-in patient so different logins
  // never see each other's appointments, medicines, or reports.
  const myAppointments = user
    ? appointments.filter((a) => a.patientId === user.id)
    : [];
  const myReminders = user
    ? reminders.filter((r) => r.patientId === user.id)
    : [];
  const myReports = user
    ? reports.filter((r) => r.patientId === user.id)
    : [];
  const upcomingApt = myAppointments.find((a) => a.status === 'booked');
  // Expired / not-yet-started courses are hidden from today's list and counts.
  const activeReminders = myReminders.filter(
    (r) => r.status === 'active' && isReminderCourseActive(r)
  );
  const latestReport = myReports[0];

  // Real adherence from dose logs — 0 when nothing is logged yet.
  const allLogs = myReminders.flatMap((r) => r.logs || []);
  const takenCount = allLogs.filter((l) => l.state === 'taken').length;
  const adherenceRate =
    allLogs.length > 0 ? Math.round((takenCount / allLogs.length) * 100) : 0;



  return (
    <div className="space-y-6 animate-fade-in font-sans text-ink">
      
      {/* Clean Minimal Hero Card */}
      <div className="chart-panel chart-panel-hero p-6 sm:p-8">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 text-ink-soft text-[11px] font-mono font-medium tracking-wide">
            <span className="w-1.5 h-1.5 bg-clinical-green"></span>
            <span>{language === 'en' ? 'SMART CLINICAL TRIAGE' : 'ক্লিনিকাল ট্রায়াজ'}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {language === 'en' ? `Patient: ${user?.name || 'Unknown'}` : `রোগী: ${user?.name || 'অজ্ঞাত'}`}
          </h1>

          <p className="text-sm text-ink-soft leading-relaxed max-w-xl">
            {language === 'en'
              ? 'Our rule-based triage system analyzes your symptoms to suggest probable conditions and recommend accredited specialists nearby.'
              : 'আমাদের রুল-ভিত্তিক ট্রায়াজ ব্যবস্থা আপনার লক্ষণ বিশ্লেষণ করে সম্ভাব্য কারণ এবং উপযুক্ত বিশেষজ্ঞ ডাক্তারের পরামর্শ প্রদান করে।'}
          </p>

          <div className="flex flex-wrap items-center gap-2.5 pt-4 border-t border-line mt-4">
            <button
              onClick={() => onNavigateTab('symptom-checker')}
              className="px-4 py-2 bg-clinical-green hover:bg-clinical-green/90 text-paper text-xs font-semibold flex items-center gap-2 transition-colors rounded-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'Start Symptom Check' : 'লক্ষণ পরীক্ষা শুরু করুন'}</span>
            </button>

            <button
              onClick={() => onNavigateTab('discovery')}
              className="px-4 py-2 bg-paper-raised hover:bg-line border border-line text-ink text-xs font-semibold flex items-center gap-2 transition-colors rounded-sm"
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'Browse Directory' : 'ডাক্তার ও হাসপাতাল তালিকা'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Patient Telemetry & Recorded Vitals (Monospace Accents) */}
      <div className="chart-panel">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border-b border-line bg-paper">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider">
              Clinical Telemetry & Vitals
            </h3>
            <span className="text-[9px] font-mono uppercase text-ink-soft border border-line px-1.5 py-0.5">
              Sample data — no live sensor
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-2 sm:mt-0">
            <span className="w-2 h-2 bg-clinical-green animate-pulse"></span>
            <span className="text-[11px] font-mono font-semibold text-clinical-green uppercase">
              Normal Rhythm
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-line bg-paper-raised">
          <div className="p-4">
            <span className="text-[10px] uppercase text-ink-soft block mb-1">Blood Pressure</span>
            <span className="text-lg font-mono font-bold block">
              138 / 88 <span className="text-[10px] font-sans text-ink-soft font-normal">mmHg</span>
            </span>
            <span className="text-[10px] text-ink-soft font-medium uppercase mt-1 block">Stage 1 Pre-HTN</span>
          </div>

          <div className="p-4">
            <span className="text-[10px] uppercase text-ink-soft block mb-1">Resting Heart Rate</span>
            <span className="text-lg font-mono font-bold block">
              84 <span className="text-[10px] font-sans text-ink-soft font-normal">BPM</span>
            </span>
            <span className="text-[10px] text-clinical-green font-medium uppercase mt-1 block">Optimal Sinus</span>
          </div>

          <div className="p-4">
            <span className="text-[10px] uppercase text-ink-soft block mb-1">Blood Oxygen</span>
            <span className="text-lg font-mono font-bold block">
              98% <span className="text-[10px] font-sans text-ink-soft font-normal">SpO2</span>
            </span>
            <span className="text-[10px] text-clinical-green font-medium uppercase mt-1 block">Normal Saturation</span>
          </div>

          <div className="p-4">
            <span className="text-[10px] uppercase text-ink-soft block mb-1">Core Temperature</span>
            <span className="text-lg font-mono font-bold block">
              98.6 <span className="text-[10px] font-sans text-ink-soft font-normal">°F</span>
            </span>
            <span className="text-[10px] text-ink-soft font-medium uppercase mt-1 block">Afebrile (Norm)</span>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="chart-panel p-4 flex items-center gap-3.5">
          <div>
            <span className="text-[10px] uppercase font-bold text-ink-soft block">Active Medications</span>
            <span className="text-xl font-bold font-mono">{activeReminders.length}</span>
          </div>
        </div>

        <div className="chart-panel p-4 flex items-center gap-3.5">
          <div>
            <span className="text-[10px] uppercase font-bold text-ink-soft block">Upcoming Visits</span>
            <span className="text-xl font-bold font-mono">{upcomingApt ? '1' : '0'}</span>
          </div>
        </div>

        <div className="chart-panel p-4 flex items-center gap-3.5">
          <div>
            <span className="text-[10px] uppercase font-bold text-ink-soft block">Health Reports</span>
            <span className="text-xl font-bold font-mono">{myReports.length}</span>
          </div>
        </div>

        <div className="chart-panel p-4 flex items-center gap-3.5">
          <div>
            <span className="text-[10px] uppercase font-bold text-ink-soft block">7-Day Adherence</span>
            <span className="text-xl font-bold font-mono text-clinical-green">{adherenceRate}%</span>
          </div>
        </div>

      </div>

      {/* Main Grid: Upcoming Visits + Today's Medicine */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Upcoming Appointment */}
          {upcomingApt && (
            <div className="chart-panel">
              <div className="p-3 border-b border-line bg-paper">
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  Confirmed Appointment
                </span>
              </div>
              <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold mt-1">{upcomingApt.doctorName}</h3>
                  <p className="text-xs text-ink-soft">
                    {upcomingApt.doctorSpecialty} • {upcomingApt.hospitalName}
                  </p>
                  <p className="text-[11px] text-ink-soft font-mono mt-2 flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    <span>{upcomingApt.date} @ {upcomingApt.timeSlot}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    onClick={() => {
                      if (window.confirm(`Cancel your appointment with ${upcomingApt.doctorName}? You can rebook anytime from the directory.`)) {
                        updateAppointmentStatus(upcomingApt.id, 'cancelled');
                      }
                    }}
                    className="px-3.5 py-1.5 bg-paper hover:bg-paper-raised border border-line hover:border-clinical-red hover:text-clinical-red text-ink-soft text-xs font-medium transition-colors rounded-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => onNavigateTab('discovery', {
                      specialty: upcomingApt.doctorSpecialty,
                      rescheduleAppointmentId: upcomingApt.id,
                      rescheduleDoctorId: upcomingApt.doctorId
                    })}
                    className="px-3.5 py-1.5 bg-paper hover:bg-line border border-ink text-xs font-medium transition-colors rounded-sm"
                  >
                    Reschedule
                  </button>
                  <button
                    onClick={() => onNavigateTab('discovery')}
                    className="px-3.5 py-1.5 bg-paper hover:bg-line border border-line text-xs font-medium transition-colors rounded-sm"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Today's Medications List */}
          <div className="chart-panel">
            <div className="flex items-center justify-between p-3 border-b border-line bg-paper">
              <div className="flex items-center gap-2">
                <h3 className="text-[10px] font-bold uppercase tracking-wider">{t.rem_today_schedule}</h3>
              </div>
              <button
                onClick={() => onNavigateTab('reminders')}
                className="text-[10px] font-mono uppercase text-ink-soft hover:text-ink"
              >
                Manage Schedule
              </button>
            </div>

            <div className="divide-y divide-line">
              {activeReminders.map((rem) => {
                const lastLog = rem.logs?.[0];
                const isTaken = lastLog?.state === 'taken';

                return (
                  <div
                    key={rem.id}
                    className="p-4 bg-paper-raised flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <h4 className="text-xs font-bold uppercase">{rem.medicineName}</h4>
                      <p className="text-[11px] text-ink-soft font-mono mt-1">{rem.dosage} • {rem.instruction}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        {rem.times.map((tm, idx) => (
                          <span
                            key={idx}
                            className="px-1.5 py-0.5 bg-paper border border-line text-[10px] font-mono font-medium"
                          >
                            {tm}
                          </span>
                        ))}
                      </div>

                      <button
                        onClick={() => logReminderDose(rem.id, 'taken')}
                        className={`px-3 py-1 text-[10px] font-bold uppercase font-mono border transition-colors rounded-sm ${
                          isTaken
                            ? 'bg-ink text-paper border-ink'
                            : 'bg-paper border-line text-ink hover:bg-line'
                        }`}
                      >
                        {isTaken ? 'Taken' : 'Log Taken'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Latest Health Report Card */}
          {latestReport && (
            <div className="chart-panel">
              <div className="flex items-center justify-between p-3 border-b border-line bg-paper">
                <h3 className="text-[10px] font-bold uppercase tracking-wider">Latest Health Record</h3>
                <button
                  onClick={() => onNavigateTab('reports')}
                  className="text-[10px] font-mono uppercase text-ink-soft hover:text-ink"
                >
                  All Records
                </button>
              </div>

              <div className="p-4 bg-paper-raised flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-medium uppercase border-b border-ink pb-0.5">
                      REF:{latestReport.id.toUpperCase()}
                    </span>
                    <span className="text-[10px] font-mono text-ink-soft">
                      {new Date(latestReport.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold mt-2 uppercase">{latestReport.condition}</h4>
                  <p className="text-[10px] font-mono text-ink-soft mt-1">Specialist: {latestReport.specialist}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      void generateHealthReportPDF(latestReport).catch(() => undefined);
                    }}
                    className="px-3 py-1.5 bg-paper hover:bg-line border border-line text-[10px] font-bold uppercase font-mono flex items-center gap-1.5 transition-colors rounded-sm"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Quick Care Tools & Emergency Hotline */}
        <div className="space-y-6">
          
          {/* Emergency Card */}
          <div className="chart-panel border-clinical-red">
            <div className="p-3 border-b border-clinical-red bg-paper flex justify-between items-center">
               <h3 className="text-[10px] font-bold uppercase tracking-wider text-clinical-red">Immediate Care</h3>
               <span className="stamp-urgent">URGENT</span>
            </div>
            <div className="p-4 bg-paper-raised space-y-3">
              <p className="text-xs font-mono text-clinical-red font-bold">National Hotline: 999</p>
              <p className="text-[11px] text-ink-soft leading-relaxed uppercase">
                If experiencing sudden severe chest pain, breathing collapse, or head trauma, contact ambulance dispatch immediately.
              </p>

              <button
                onClick={onOpenEmergency}
                className="w-full py-2 bg-clinical-red hover:bg-clinical-red/90 text-white text-[10px] font-bold uppercase font-mono transition-colors rounded-sm mt-2"
              >
                Open Emergency Contacts
              </button>
            </div>
          </div>

          {/* Quick Tools */}
          <div className="chart-panel">
            <div className="p-3 border-b border-line bg-paper">
              <h3 className="text-[10px] font-bold uppercase tracking-wider">
                Quick Shortcuts
              </h3>
            </div>

            <div className="divide-y divide-line">
              <div
                onClick={() => onNavigateTab('symptom-checker')}
                className="p-3 bg-paper-raised hover:bg-paper cursor-pointer flex items-center justify-between transition-colors group"
              >
                <div>
                  <h4 className="text-xs font-bold uppercase">Symptom Checker</h4>
                  <p className="text-[10px] text-ink-soft font-mono">3-step clinical triage</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-ink-soft group-hover:text-ink transition-all" />
              </div>

              <div
                onClick={() => onNavigateTab('discovery')}
                className="p-3 bg-paper-raised hover:bg-paper cursor-pointer flex items-center justify-between transition-colors group"
              >
                <div>
                  <h4 className="text-xs font-bold uppercase">Hospital Radar</h4>
                  <p className="text-[10px] text-ink-soft font-mono">Nearby facility distances</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-ink-soft group-hover:text-ink transition-all" />
              </div>

              <div
                onClick={() => onNavigateTab('reminders')}
                className="p-3 bg-paper-raised hover:bg-paper cursor-pointer flex items-center justify-between transition-colors group"
              >
                <div>
                  <h4 className="text-xs font-bold uppercase">Medicine Reminders</h4>
                  <p className="text-[10px] text-ink-soft font-mono">Track doses & courses</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-ink-soft group-hover:text-ink transition-all" />
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

