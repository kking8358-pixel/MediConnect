import React from 'react';
import { PhoneCall, AlertTriangle, X, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ isOpen, onClose }) => {
  const { language } = useAuth();
  if (!isOpen) return null;

  const hotlines = [
    {
      title: language === 'en' ? 'National Emergency Services' : 'জাতীয় জরুরি সেবা',
      number: '999',
      subtitle: language === 'en' ? 'Police, Fire Service, Govt Ambulance' : 'পুলিশ, ফায়ার সার্ভিস, সরকারি অ্যাম্বুলেন্স',
      badge: '24/7 Toll Free'
    },
    {
      title: language === 'en' ? 'Evercare Emergency Hotline' : 'এভারকেয়ার ইমার্জেন্সি হটলাইন',
      number: '10678',
      subtitle: language === 'en' ? 'Direct ICU & Cardiac Ambulance' : 'তাত্ক্ষণিক আইসিইউ ও অ্যাম্বুলেন্স',
      badge: 'Direct ER'
    },
    {
      title: language === 'en' ? 'Square Hospital Emergency' : 'স্কয়ার হাসপাতাল জরুরি বিভাগ',
      number: '+880 1713-377773',
      subtitle: language === 'en' ? 'Trauma & Cath Lab Hotline' : 'ট্রমা ও ক্যাথ ল্যাব',
      badge: 'Panthapath ER'
    },
    {
      title: language === 'en' ? 'National Heart Institute (NICVD)' : 'জাতীয় হৃদরোগ ইনস্টিটিউট',
      number: '+880 2 9122560',
      subtitle: language === 'en' ? 'Acute Cardiac Emergency Line' : 'হৃদরোগ জরুরি বিভাগ',
      badge: 'Cardiac ER'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-paper/90 backdrop-blur-sm animate-fade-in font-sans text-ink">
      <div className="relative w-full max-w-md chart-panel p-6 border-2 border-clinical-red shadow-none animate-slide-up space-y-4">
        
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 border border-transparent hover:border-clinical-red hover:bg-line transition-colors text-ink"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 border border-clinical-red bg-paper text-clinical-red flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold uppercase tracking-tight">
              {language === 'en' ? 'Emergency Dispatch Directory' : 'জরুরি চিকিৎসা সেবা হটলাইন'}
            </h2>
            <p className="text-[10px] font-mono font-bold uppercase text-clinical-red tracking-wider">
              Immediate triage & ambulance access
            </p>
          </div>
        </div>

        {/* Warning Banner */}
        <div className="p-3 border border-clinical-red bg-paper flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-clinical-red shrink-0 mt-0.5" />
          <p className="text-[10px] font-mono font-bold uppercase text-clinical-red leading-relaxed">
            If you or someone around you is in life-threatening distress, call emergency services immediately.
          </p>
        </div>

        {/* Hotlines */}
        <div className="space-y-2">
          {hotlines.map((hl, idx) => (
            <a
              key={idx}
              href={`tel:${hl.number}`}
              className="p-3 bg-paper border border-line hover:border-clinical-red hover:bg-paper-raised flex items-center justify-between transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 border border-line bg-paper text-clinical-red flex items-center justify-center group-hover:border-clinical-red transition-colors">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase text-ink">{hl.title}</span>
                    <span className="text-[8px] px-1 py-0.5 border border-clinical-red text-clinical-red font-mono font-bold uppercase">
                      {hl.badge}
                    </span>
                  </div>
                  <p className="text-[9px] font-mono text-ink-soft uppercase mt-0.5">{hl.subtitle}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold font-mono group-hover:text-clinical-red transition-colors">
                  {hl.number}
                </span>
                <span className="block text-[8px] font-mono font-bold uppercase text-clinical-red mt-1">Call Now</span>
              </div>
            </a>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 border border-ink bg-paper hover:bg-ink hover:text-paper text-ink font-bold font-mono text-[11px] uppercase transition-colors"
        >
          Close Directory
        </button>

      </div>
    </div>
  );
};
