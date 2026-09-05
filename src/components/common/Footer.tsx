import React from 'react';
import { Activity, ShieldCheck, Heart, PhoneCall, Globe, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { translations } from '../../i18n/translations';

interface FooterProps {
  onOpenEmergency: () => void;
  setActiveTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenEmergency, setActiveTab }) => {
  const { language } = useAuth();
  const t = translations[language];

  return (
    <footer className="mt-16 border-t-2 border-ink bg-paper text-ink font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">

          {/* Col 1: About */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border-2 border-ink bg-ink text-paper flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
              <span className="text-base font-bold uppercase text-ink">MediConnect</span>
            </div>
            <p className="text-ink-soft text-[10px] font-mono uppercase leading-relaxed">
              {language === 'en'
                ? 'AI-style rule-based healthcare triage, specialist recommendation, and clinical medicine reminder platform.'
                : 'এআই-স্টাইল রুল-ভিত্তিক স্বাস্থ্য ট্রায়াজ, বিশেষজ্ঞ পরামর্শ ও ওষুধ রিমাইন্ডার প্ল্যাটফর্ম।'}
            </p>
            <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase text-ink">
              <ShieldCheck className="w-4 h-4" />
              <span>Compliant with HIPAA/GDPR</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-ink-soft border-b border-line pb-2">System Modules</h4>
            <ul className="space-y-3 text-[11px] font-bold uppercase">
              <li>
                <button onClick={() => setActiveTab('symptom-checker')} className="text-ink hover:text-ink-soft transition-colors">
                  AI Symptom Checker
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('discovery')} className="text-ink hover:text-ink-soft transition-colors">
                  Doctor & Hospital Finder
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('reports')} className="text-ink hover:text-ink-soft transition-colors">
                  Health Reports & Records
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('reminders')} className="text-ink hover:text-ink-soft transition-colors">
                  Medicine Reminders & Logs
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Emergency Lines */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-ink-soft border-b border-line pb-2">Emergency Dispatch</h4>
            <div className="space-y-2 text-[10px] font-mono font-bold uppercase">
              <p className="text-clinical-red flex items-center gap-2">
                <PhoneCall className="w-3.5 h-3.5" /> National Hotline: 999
              </p>
              <p className="text-ink">Evercare ER: 10678</p>
              <p className="text-ink">Square ER: +880 1713-377773</p>
              <button
                onClick={onOpenEmergency}
                className="mt-3 py-1.5 px-3 border border-clinical-red bg-paper hover:bg-clinical-red text-clinical-red hover:text-paper transition-colors"
              >
                Open Emergency Directory
              </button>
            </div>
          </div>

          {/* Col 4: Project Contributors */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-ink-soft border-b border-line pb-2">Project Information</h4>
            <p className="text-ink text-[11px] font-bold uppercase">
              MediConnect SRS Version 1.0 (July 2026)
            </p>
            <div className="text-[10px] font-mono uppercase text-ink-soft space-y-1.5 pt-2">
              <p>• Sajidul Islam (23301390)</p>
              <p>• Tahsin Ahmed (22299107)</p>
              <p>• Siam Khan Milky (22201023)</p>
              <p>• Samin Mohammad Tashir Mahi (22201855)</p>
            </div>
          </div>

        </div>

        {/* Disclaimer Bottom Banner */}
        <div className="pt-6 border-t border-line text-center space-y-3">
          <p className="text-[9px] font-mono uppercase text-ink-soft max-w-3xl mx-auto">
            {t.disclaimer_short}
          </p>
          <p className="text-[9px] font-mono uppercase font-bold text-ink-soft">
            © 2026 MediConnect Healthcare System. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
