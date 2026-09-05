import React, { useState } from 'react';
import {
  Pill,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Trash2,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ReminderFrequency } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useAppData, isReminderCourseActive, isReminderDueToday, toLocalISODate } from '../../context/AppDataContext';
import { translations } from '../../i18n/translations';

export const MedicineRemindersView: React.FC = () => {
  const { language, user, openAuthModal } = useAuth();
  const { reminders, addReminder, deleteReminder, logReminderDose } = useAppData();
  const t = translations[language];

  if (!user) {
    return (
      <div className="chart-panel p-8 sm:p-12 text-center max-w-lg mx-auto my-12 animate-fade-in font-sans text-ink">
        <div className="w-12 h-12 border-2 border-ink bg-paper text-ink flex items-center justify-center mx-auto mb-4">
          <Pill className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold uppercase tracking-tight">
          {language === 'en' ? 'Sign In for Medicine Reminders' : 'ওষুধের সময়সূচী দেখতে সাইন ইন করুন'}
        </h2>
        <p className="text-[11px] font-mono text-ink-soft uppercase leading-relaxed mt-2">
          {language === 'en'
            ? 'Your personalized dose timetable, pill alarms, and adherence history are saved in your account. Sign in to view and manage your medication routine.'
            : 'আপনার প্রেসক্রিপশনের ওষুধের সময়সূচী ও রিমাইন্ডার দেখতে অনুগ্রহ করে অ্যাকাউন্টে সাইন ইন করুন।'}
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

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formDosage, setFormDosage] = useState('');
  const [formInstruction, setFormInstruction] = useState('Take after meals with water');
  const [formTimes, setFormTimes] = useState<string[]>(['08:00', '20:00']);
  const [formFreq, setFormFreq] = useState<ReminderFrequency>('daily');
  const [formStartDate, setFormStartDate] = useState('2026-09-05');
  const [formEndDate, setFormEndDate] = useState('2026-09-20');
  const [timeInput, setTimeInput] = useState('14:00');

  // Scope to the signed-in patient's own reminders.
  const myReminders = user ? reminders.filter((r) => r.patientId === user.id) : [];

  const totalLogs = myReminders.flatMap((r) => r.logs || []);
  const takenLogs = totalLogs.filter((l) => l.state === 'taken');
  const adherenceRate = totalLogs.length > 0 ? Math.round((takenLogs.length / totalLogs.length) * 100) : 0;
  const complianceLabel =
    totalLogs.length === 0
      ? 'No doses logged yet'
      : adherenceRate >= 80
        ? 'High medication compliance'
        : adherenceRate >= 50
          ? 'Moderate compliance — room to improve'
          : 'Low compliance — consider daily alarms';

  const todayStr = toLocalISODate(new Date());
  const courseStateOf = (rem: (typeof myReminders)[number]) => {
    if (rem.status !== 'active') return 'paused' as const;
    if (rem.startDate && todayStr < rem.startDate) return 'scheduled' as const;
    if (rem.endDate && todayStr > rem.endDate) return 'expired' as const;
    return 'active' as const;
  };
  const schedulable = myReminders.filter(
    (r) => r.status === 'active' && isReminderCourseActive(r)
  );

  // Next upcoming dose: a live snooze wake-up wins, otherwise the next
  // auto-scheduled time due today (weekly/custom rules respected).
  const nextDose = (() => {
    const now = new Date();
    const snoozed = schedulable
      .filter((r) => r.snoozedUntil && new Date(r.snoozedUntil) > now)
      .sort((a, b) => +new Date(a.snoozedUntil as string) - +new Date(b.snoozedUntil as string))[0];
    if (snoozed) {
      const t = new Date(snoozed.snoozedUntil as string);
      const hh = String(t.getHours()).padStart(2, '0');
      const mm = String(t.getMinutes()).padStart(2, '0');
      return { time: `${hh}:${mm}`, name: `${snoozed.medicineName} (snoozed)` };
    }
    const nowMin = now.getHours() * 60 + now.getMinutes();
    let best: { time: string; name: string } | null = null;
    let bestDelta = Infinity;
    for (const rem of schedulable) {
      if (!isReminderDueToday(rem, now)) continue;
      for (const tm of rem.times) {
        const [h, m] = tm.split(':').map(Number);
        if (Number.isNaN(h) || Number.isNaN(m)) continue;
        let delta = h * 60 + m - nowMin;
        if (delta < 0) delta += 24 * 60;
        if (delta < bestDelta) {
          bestDelta = delta;
          best = { time: tm, name: rem.medicineName };
        }
      }
    }
    return best;
  })();

  const handleAddTimeToForm = () => {
    if (timeInput && !formTimes.includes(timeInput)) {
      setFormTimes([...formTimes, timeInput].sort());
    }
  };

  const handleRemoveTime = (time: string) => {
    setFormTimes(formTimes.filter((t) => t !== time));
  };

  const handleSaveReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formDosage) return;

    addReminder({
      patientId: user?.id || 'guest',
      medicineName: formName,
      dosage: formDosage,
      instruction: formInstruction,
      times: formTimes.length > 0 ? formTimes : ['08:00'],
      frequency: formFreq,
      startDate: formStartDate,
      endDate: formEndDate,
      status: 'active',
      color: '#0D6E6E'
    });

    setIsAddModalOpen(false);
    setFormName('');
    setFormDosage('');
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 }
    });
  };

  const handleLog = (reminderId: string, state: 'taken' | 'skipped' | 'snoozed') => {
    logReminderDose(reminderId, state);
    if (state === 'taken') {
      confetti({
        particleCount: 30,
        spread: 45,
        origin: { y: 0.7 }
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans text-ink">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 border border-line bg-paper text-ink text-[9px] font-mono font-bold uppercase mb-2">
            <Pill className="w-3 h-3" />
            <span>{language === 'en' ? 'Medication Adherence' : 'ওষুধ ট্র্যাকার'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight">
            {t.rem_title}
          </h1>
          <p className="text-[11px] font-mono text-ink-soft uppercase mt-1">
            {t.rem_subtitle}
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 border border-ink bg-ink hover:bg-ink-soft text-paper text-[10px] font-mono font-bold uppercase flex items-center gap-2 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t.rem_add_btn}</span>
        </button>
      </div>

      {/* Adherence Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="chart-panel p-5 flex items-center justify-between">
          <div>
            <span className="text-[9px] font-mono font-bold uppercase text-ink-soft">
              {t.rem_adherence_score}
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-bold font-mono">{adherenceRate}%</span>
              {totalLogs.length > 0 && (
                <span className="text-[10px] font-mono text-clinical-green font-bold flex items-center">
                  <TrendingUp className="w-3 h-3 inline" /> {takenLogs.length}/{totalLogs.length}
                </span>
              )}
            </div>
            <p className="text-[9px] font-mono uppercase text-ink-soft mt-1 border-t border-line pt-1">{complianceLabel}</p>
          </div>
          <div className="w-12 h-12 border-2 border-line bg-paper text-ink flex items-center justify-center font-bold font-mono text-xs">
            {adherenceRate}%
          </div>
        </div>

        <div className="chart-panel p-5 flex items-center justify-between">
          <div>
            <span className="text-[9px] font-mono font-bold uppercase text-ink-soft">
              Active Courses
            </span>
            <p className="text-2xl font-bold font-mono mt-1">
              {schedulable.length}
            </p>
            <p className="text-[9px] font-mono uppercase text-ink-soft mt-1 border-t border-line pt-1">Prescription medications</p>
          </div>
          <div className="w-10 h-10 border border-ink bg-paper text-ink flex items-center justify-center">
            <Pill className="w-5 h-5" />
          </div>
        </div>

        <div className="chart-panel p-5 flex items-center justify-between">
          <div>
            <span className="text-[9px] font-mono font-bold uppercase text-ink-soft">
              Next Dose Due
            </span>
            <p className="text-2xl font-bold font-mono mt-1">
              {nextDose ? nextDose.time : '—'}
            </p>
            <p className="text-[9px] font-mono uppercase text-ink-soft mt-1 border-t border-line pt-1">{nextDose ? nextDose.name : 'No active doses'}</p>
          </div>
          <div className="w-10 h-10 border border-line bg-paper text-ink-soft flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Today's Schedule Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-line pb-2">
          <h2 className="text-sm font-bold uppercase flex items-center gap-2">
            <Clock className="w-4 h-4 text-ink-soft" />
            <span>{t.rem_today_schedule}</span>
          </h2>
          <span className="text-[9px] font-mono font-bold uppercase text-ink-soft">Auto-synced</span>
        </div>

        {myReminders.length === 0 ? (
          <div className="chart-panel p-12 text-center text-ink-soft">
            <Pill className="w-8 h-8 mx-auto mb-3" />
            <p className="text-[11px] font-mono font-bold uppercase">{t.rem_no_reminders}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myReminders.map((rem) => {
              const lastLog = rem.logs?.[0];
              const isTaken = lastLog?.state === 'taken';
              const courseState = courseStateOf(rem);
              const snoozeWake = rem.snoozedUntil ? new Date(rem.snoozedUntil) : null;
              const isSnoozed =
                !!snoozeWake && !Number.isNaN(snoozeWake.getTime()) && snoozeWake > new Date();

              return (
                <div
                  key={rem.id}
                  className="chart-panel p-4 hover:border-ink transition-colors flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    
                    <div className="flex items-start justify-between gap-2 border-b border-line pb-2">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 border border-ink bg-paper text-ink flex items-center justify-center shrink-0">
                          <Pill className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold uppercase">{rem.medicineName}</h3>
                          <span className="text-[10px] font-mono font-bold uppercase text-ink-soft">{rem.dosage}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (window.confirm(`Delete "${rem.medicineName}" and its dose history?`)) {
                            deleteReminder(rem.id);
                          }
                        }}
                        className="p-1 border border-transparent hover:border-clinical-red text-ink-soft hover:text-clinical-red hover:bg-paper-raised transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="p-2 border-l-2 border-ink text-[10px] font-mono uppercase text-ink leading-relaxed">
                      [INSTRUCTION] {rem.instruction}
                    </div>

                    <div>
                      <span className="text-[9px] font-mono font-bold uppercase text-ink-soft block mb-2">
                        Dose Times
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {rem.times.map((tm, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-paper border border-line text-ink text-[10px] font-mono font-bold flex items-center gap-1.5"
                          >
                            <Clock className="w-3 h-3 text-ink-soft" />
                            {tm}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[9px] font-mono uppercase text-ink-soft pt-2">
                      <span>Course: {rem.startDate} → {rem.endDate}</span>
                      <span className={`px-1.5 py-0.5 border font-bold ${
                        courseState === 'expired'
                          ? 'border-clinical-red text-clinical-red'
                          : courseState === 'scheduled'
                            ? 'border-ink text-ink'
                            : courseState === 'paused'
                              ? 'border-line text-ink-soft'
                              : 'border-clinical-green text-clinical-green'
                      }`}>
                        {courseState === 'active' ? rem.status : courseState}
                      </span>
                    </div>
                    {courseState === 'expired' && (
                      <p className="text-[9px] font-mono uppercase text-clinical-red">
                        Course ended — auto alerts stopped. Delete it or add a new course.
                      </p>
                    )}
                    {courseState === 'scheduled' && (
                      <p className="text-[9px] font-mono uppercase text-ink-soft">
                        Starts {rem.startDate} — auto alerts begin then.
                      </p>
                    )}
                    {rem.frequency === 'custom' && (
                      <p className="text-[9px] font-mono uppercase text-ink-soft">
                        As-needed course — no auto alerts; log doses manually.
                      </p>
                    )}
                    {rem.frequency === 'weekly' && (
                      <p className="text-[9px] font-mono uppercase text-ink-soft">
                        Weekly course — auto alerts fire on the start weekday only.
                      </p>
                    )}
                    {isSnoozed && (
                      <p className="text-[9px] font-mono uppercase text-ink font-bold">
                        Snoozed until {String(snoozeWake!.getHours()).padStart(2, '0')}:{String(snoozeWake!.getMinutes()).padStart(2, '0')} — alert will re-fire.
                      </p>
                    )}

                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-line">
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => handleLog(rem.id, 'taken')}
                        className={`py-2 px-2 text-[9px] font-mono font-bold uppercase flex items-center justify-center gap-1.5 transition-colors border ${
                          isTaken
                            ? 'bg-clinical-green border-clinical-green text-paper'
                            : 'bg-paper hover:bg-paper-raised text-clinical-green border-clinical-green'
                        }`}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{t.rem_taken}</span>
                      </button>

                      <button
                        onClick={() => handleLog(rem.id, 'snoozed')}
                        className="py-2 px-2 text-[9px] font-mono font-bold uppercase flex items-center justify-center gap-1.5 transition-colors border border-ink bg-paper hover:bg-paper-raised text-ink"
                      >
                        <Clock className="w-3 h-3" />
                        <span>{t.rem_snooze}</span>
                      </button>

                      <button
                        onClick={() => handleLog(rem.id, 'skipped')}
                        className="py-2 px-2 text-[9px] font-mono font-bold uppercase flex items-center justify-center gap-1.5 transition-colors border border-line bg-paper hover:border-ink hover:text-ink text-ink-soft"
                      >
                        <XCircle className="w-3 h-3" />
                        <span>{t.rem_skip}</span>
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ADD MEDICATION MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-paper/90 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md chart-panel p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto custom-scrollbar shadow-none">
            
            <h3 className="text-sm font-bold uppercase flex items-center gap-2 border-b border-ink pb-3 mb-4">
              <Pill className="w-4 h-4" />
              <span>{t.rem_add_btn}</span>
            </h3>

            <form onSubmit={handleSaveReminder} className="space-y-4">
              <div>
                <label className="text-[10px] font-mono font-bold uppercase text-ink-soft block mb-2">{t.rem_form_name}</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="E.G. PARACETAMOL, OMEPRAZOLE"
                  className="w-full p-3 bg-paper border border-line text-ink text-[11px] font-mono uppercase focus:border-ink focus:outline-none transition-colors placeholder:text-ink-soft"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono font-bold uppercase text-ink-soft block mb-2">{t.rem_form_dosage}</label>
                  <input
                    type="text"
                    required
                    value={formDosage}
                    onChange={(e) => setFormDosage(e.target.value)}
                    placeholder="E.G. 500 MG, 1 TAB"
                    className="w-full p-3 bg-paper border border-line text-ink text-[11px] font-mono uppercase focus:border-ink focus:outline-none transition-colors placeholder:text-ink-soft"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono font-bold uppercase text-ink-soft block mb-2">{t.rem_form_freq}</label>
                  <select
                    value={formFreq}
                    onChange={(e) => setFormFreq(e.target.value as ReminderFrequency)}
                    className="w-full p-3 bg-paper border border-line text-ink text-[11px] font-mono uppercase focus:border-ink focus:outline-none transition-colors"
                  >
                    <option value="daily">DAILY</option>
                    <option value="weekly">WEEKLY</option>
                    <option value="custom">AS NEEDED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono font-bold uppercase text-ink-soft block mb-2">{t.rem_form_instruction}</label>
                <input
                  type="text"
                  value={formInstruction}
                  onChange={(e) => setFormInstruction(e.target.value)}
                  placeholder="E.G. AFTER MEALS"
                  className="w-full p-3 bg-paper border border-line text-ink text-[11px] font-mono uppercase focus:border-ink focus:outline-none transition-colors placeholder:text-ink-soft"
                />
              </div>

              {/* Times */}
              <div className="p-4 border border-line bg-paper-raised space-y-3">
                <label className="text-[10px] font-mono font-bold uppercase text-ink-soft block">{t.rem_form_times}</label>
                <div className="flex gap-2">
                  <input
                    type="time"
                    value={timeInput}
                    onChange={(e) => setTimeInput(e.target.value)}
                    className="p-2.5 bg-paper border border-line text-ink text-[11px] font-mono focus:border-ink focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddTimeToForm}
                    className="px-4 py-2.5 border border-ink bg-paper hover:bg-ink hover:text-paper text-ink text-[10px] font-mono font-bold uppercase transition-colors"
                  >
                    + Add Time
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 pt-2 border-t border-line">
                  {formTimes.map((tm) => (
                    <span
                      key={tm}
                      className="px-2 py-1 bg-paper border border-line text-ink text-[10px] font-mono font-bold flex items-center gap-2"
                    >
                      {tm}
                      <button
                        type="button"
                        onClick={() => handleRemoveTime(tm)}
                        className="text-ink-soft hover:text-clinical-red transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono font-bold uppercase text-ink-soft block mb-2">{t.rem_form_start}</label>
                  <input
                    type="date"
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full p-3 bg-paper border border-line text-ink text-[11px] font-mono focus:border-ink focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono font-bold uppercase text-ink-soft block mb-2">{t.rem_form_end}</label>
                  <input
                    type="date"
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="w-full p-3 bg-paper border border-line text-ink text-[11px] font-mono focus:border-ink focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-line">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-3 border border-line bg-paper hover:border-ink hover:bg-paper-raised text-ink text-[10px] font-mono font-bold uppercase transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 border border-ink bg-ink hover:bg-ink-soft text-paper text-[10px] font-mono font-bold uppercase transition-colors"
                >
                  {t.rem_save_btn}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
