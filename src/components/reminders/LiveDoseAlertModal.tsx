import React from 'react';
import { Pill, Clock, CheckCircle2, XCircle, BellRing, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAppData } from '../../context/AppDataContext';
import { useAuth } from '../../context/AuthContext';

export const LiveDoseAlertModal: React.FC = () => {
  const { activeDoseAlert, dismissDoseAlert, logReminderDose } = useAppData();
  const { language } = useAuth();

  if (!activeDoseAlert) return null;

  const { reminder, time } = activeDoseAlert;

  const handleAction = (state: 'taken' | 'skipped' | 'snoozed') => {
    logReminderDose(reminder.id, state);
    if (state === 'taken') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
    }
    dismissDoseAlert();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-paper/90 backdrop-blur-sm animate-fade-in font-sans text-ink">
      <div className="relative w-full max-w-md chart-panel p-6 sm:p-8 animate-slide-up space-y-6 shadow-none">
        
        {/* Close */}
        <button
          onClick={dismissDoseAlert}
          className="absolute top-4 right-4 p-2 border border-transparent hover:border-ink hover:bg-paper-raised text-ink transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with ringing bell */}
        <div className="flex items-center gap-4 pb-4 border-b border-line">
          <div className="w-12 h-12 border-2 border-ink bg-paper text-ink flex items-center justify-center shrink-0">
            <BellRing className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-ink-soft block mb-1">
              {language === 'en' ? 'Medication Time Alert' : 'ওষুধ গ্রহণের অ্যালার্ম'}
            </span>
            <h3 className="text-sm font-bold uppercase text-ink">
              {language === 'en' ? 'Time for your Scheduled Dose' : 'নির্ধারিত ওষুধ গ্রহণের সময় হয়েছে'}
            </h3>
          </div>
        </div>

        {/* Medicine Detail Card */}
        <div className="p-5 border border-line bg-paper-raised space-y-4">
          <div className="flex items-center justify-between border-b border-line pb-2">
            <h4 className="text-base font-bold uppercase text-ink">{reminder.medicineName}</h4>
            <span className="px-2.5 py-1 border border-ink bg-paper text-ink font-mono font-bold text-xs">
              {time}
            </span>
          </div>
          <p className="text-[11px] font-bold uppercase text-ink">{reminder.dosage}</p>
          <p className="text-[10px] font-mono uppercase text-ink-soft">
            [INSTRUCTION] {reminder.instruction}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          <button
            onClick={() => handleAction('taken')}
            className="py-3 px-2 border border-ink bg-ink hover:bg-ink-soft text-paper text-[10px] font-mono font-bold uppercase flex items-center justify-center gap-2 transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{language === 'en' ? 'Taken' : 'খেয়েছি'}</span>
          </button>

          <button
            onClick={() => handleAction('snoozed')}
            className="py-3 px-2 border border-ink bg-paper hover:bg-paper-raised text-ink text-[10px] font-mono font-bold uppercase flex items-center justify-center gap-2 transition-colors"
          >
            <Clock className="w-4 h-4" />
            <span>{language === 'en' ? 'Snooze 15m' : '১৫ মি. পর'}</span>
          </button>

          <button
            onClick={() => handleAction('skipped')}
            className="py-3 px-2 border border-line bg-paper hover:border-ink hover:text-ink text-ink-soft text-[10px] font-mono font-bold uppercase flex items-center justify-center gap-2 transition-colors"
          >
            <XCircle className="w-4 h-4" />
            <span>{language === 'en' ? 'Skip' : 'বাদ দিন'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
