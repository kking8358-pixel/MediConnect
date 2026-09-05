import React from 'react';
import {
  PhoneCall,
  ShieldAlert,
  Search,
  User as UserIcon,
  MapPin,
  ClipboardList,
  AlertTriangle,
  Building2,
  FileCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { translations } from '../../i18n/translations';

interface GuestDashboardProps {
  onNavigateTab: (tab: string, contextData?: any) => void;
  onOpenEmergency: () => void;
}

export const GuestDashboard: React.FC<GuestDashboardProps> = ({
  onNavigateTab,
  onOpenEmergency
}) => {
  const { language, openAuthModal } = useAuth();
  const { doctors } = useAppData();
  const t = translations[language];

  const featuredDoctors = doctors.slice(0, 4);

  return (
    <div className="space-y-6 animate-fade-in font-sans text-ink">

      {/* 1. Structural Red-Flag Clinical Alert Bar (High Urgency Safeguard) */}
      <div className="border-2 border-clinical-red bg-paper p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 border border-clinical-red bg-clinical-red text-paper flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-clinical-red">
                  Acute Emergency Protocol
                </span>
                <span className="px-2 py-0.5 bg-clinical-red text-paper text-[9px] font-mono font-bold uppercase hidden sm:inline">
                  24/7 Government Dispatch
                </span>
              </div>
              <p className="text-[11px] font-mono uppercase text-ink-soft mt-2 leading-relaxed max-w-3xl">
                {language === 'en'
                  ? 'If the patient presents severe chest tightness, sudden unconsciousness, breathing collapse, stroke symptoms, or acute trauma, call ambulance dispatch immediately. Online triage is not an emergency service.'
                  : 'বুকে তীব্র চাপ, হঠাৎ অজ্ঞান হওয়া, শ্বাসকষ্ট, স্ট্রোক বা মারাত্মক দুর্ঘটনার ক্ষেত্রে অবিলম্বে জরুরি নম্বরে কল করুন। অনলাইন ট্রায়াজ কোনো জরুরি চিকিৎসা ব্যবস্থা নয়।'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0 pt-3 md:pt-0 border-t border-line md:border-t-0">
            <a
              href="tel:999"
              className="px-4 py-2 bg-clinical-red hover:bg-clinical-red/90 text-paper text-[10px] font-mono font-bold uppercase flex items-center gap-2 transition-colors border border-clinical-red"
              title="Call National Emergency"
            >
              <PhoneCall className="w-4 h-4" />
              <span>999</span>
            </a>
            <a
              href="tel:10678"
              className="px-4 py-2 bg-paper border border-clinical-red text-clinical-red hover:bg-clinical-red hover:text-paper text-[10px] font-mono font-bold uppercase flex items-center gap-2 transition-colors"
              title="DGHS Shastho Batayon"
            >
              <span>10678 (DGHS)</span>
            </a>
            <button
              onClick={onOpenEmergency}
              className="px-4 py-2 border border-ink text-ink bg-paper hover:bg-ink hover:text-paper text-[10px] font-mono font-bold uppercase transition-colors"
            >
              {language === 'en' ? 'Hotline Directory' : 'জরুরি হটলাইন'}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Clinical Intake Masthead & Operational Scope */}
      <div className="chart-panel p-6 sm:p-8">
        <div className="max-w-3xl space-y-4">
          <div className="space-y-3">
            <span className="text-[10px] font-mono font-bold tracking-widest text-ink-soft uppercase block border-b border-line pb-2">
              Clinical Symptom Triage & BMDC Specialist Registry
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold uppercase tracking-tight leading-tight pt-1">
              {language === 'en'
                ? 'Rule-Based Clinical Guidance for Patients in Bangladesh'
                : 'লক্ষণভিত্তিক ক্লিনিকাল ট্রায়াজ এবং বিএমডিসি ডাক্তার ডিরেক্টরি'}
            </h1>
          </div>

          <p className="text-[11px] font-mono uppercase text-ink-soft leading-relaxed max-w-2xl">
            {language === 'en'
              ? 'This system evaluates patient-reported symptoms against standardized clinical decision trees to recommend appropriate medical specialties and urgency categories. It is an algorithmic triage guide, not a medical diagnosis.'
              : 'এই সিস্টেমটি রোগীর লক্ষণসমূহ বিশ্লেষণ করে সুনির্দিষ্ট চিকিৎসা বিভাগ এবং তীব্রতা স্তর নির্ধারণ করে। এটি একটি অ্যালগরিদমিক ট্রায়াজ সহায়িকা, কোনো চূড়ান্ত চিকিৎসা নির্ণয় নয়।'}
          </p>

          <div className="pt-4 mt-4 border-t border-line flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateTab('symptom-checker')}
              className="px-5 py-3 border border-ink bg-ink hover:bg-ink-soft text-paper text-[11px] font-mono font-bold uppercase transition-colors"
            >
              {language === 'en' ? 'Start Symptom Assessment' : 'লক্ষণ মূল্যায়ন শুরু করুন'}
            </button>

            <button
              onClick={() => onNavigateTab('discovery')}
              className="px-5 py-3 border border-line bg-paper hover:border-ink hover:bg-paper-raised text-ink text-[11px] font-mono font-bold uppercase transition-colors"
            >
              {language === 'en' ? 'Search Specialist Directory' : 'ডাক্তার তালিকা খুঁজুন'}
            </button>

            <button
              onClick={() => openAuthModal('signin')}
              className="px-5 py-3 border border-transparent bg-paper hover:border-ink hover:text-ink text-ink-soft text-[11px] font-mono font-bold uppercase transition-colors"
            >
              {language === 'en' ? 'Access Patient Record Locker' : 'রোগীর রেকর্ড লগইন'}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Differentiated Urgency & Service Architecture */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column (8 cols): Core Clinical Workstations */}
        <div className="lg:col-span-8 space-y-6">

          {/* Primary Workstation: Rule-Based Symptom Triage */}
          <div className="chart-panel p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-line pb-4 mb-5">
              <div className="space-y-2 max-w-xl">
                <span className="text-[9px] font-mono font-bold tracking-wider text-ink-soft uppercase block">
                  Primary Clinical Workstation
                </span>
                <h2 className="text-lg sm:text-xl font-bold uppercase tracking-tight">
                  {language === 'en' ? 'Evaluate Symptoms & Triage Urgency' : 'লক্ষণ পরীক্ষা ও ট্রায়াজ ক্যাটাগরি'}
                </h2>
                <p className="text-[10px] font-mono uppercase text-ink-soft leading-relaxed mt-1">
                  {language === 'en'
                    ? 'Evaluates symptom clusters across cardiovascular, respiratory, gastrointestinal, and neurological protocols to suggest the accredited clinical department.'
                    : 'কার্ডিওভাসকুলার, শ্বাসতন্ত্র, পরিপাকতন্ত্র ও স্নায়বিক লক্ষণের তীব্রতা পরিমাপ করে সংশ্লিষ্ট বিশেষজ্ঞ বিভাগ নির্দেশ করে।'}
                </p>
              </div>

              <button
                onClick={() => onNavigateTab('symptom-checker')}
                className="px-4 py-2 border border-ink bg-ink text-paper hover:bg-ink-soft text-[10px] font-mono font-bold uppercase whitespace-nowrap self-start transition-colors"
              >
                {language === 'en' ? 'Open Triage Form' : 'ট্রায়াজ ফর্ম খুলুন'}
              </button>
            </div>

            {/* Structured Symptom Intake Categories */}
            <div>
              <span className="text-[9px] font-mono font-bold text-ink-soft uppercase block mb-3">
                {language === 'en' ? 'Common Acute Symptom Pathways:' : 'সাধারণ জরুরি মূল্যায়ন সমূহ:'}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { name: 'Chest Pressure & Palpitations', dept: 'Cardiology / Acute Care', urgent: true },
                  { name: 'High Fever, Chills & Dengue Indicators', dept: 'Internal Medicine', urgent: false },
                  { name: 'Shortness of Breath & Wheezing', dept: 'Pulmonology', urgent: true },
                  { name: 'Severe Acute Abdominal Pain', dept: 'General Surgery / GI', urgent: false }
                ].map((s, idx) => (
                  <div
                    key={idx}
                    onClick={() => onNavigateTab('symptom-checker')}
                    className="p-3 border border-line bg-paper-raised hover:border-ink hover:bg-paper cursor-pointer transition-all flex items-start justify-between"
                  >
                    <div>
                      <span className="text-[11px] font-bold uppercase block">{s.name}</span>
                      <span className="text-[9px] text-ink-soft font-mono uppercase mt-1 block">{s.dept}</span>
                    </div>
                    {s.urgent && (
                      <span className="text-[9px] font-mono uppercase border-2 border-clinical-red text-clinical-red font-bold px-1.5 py-0.5 ml-2 -rotate-3 stamp-severe">
                        Urgent
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Secondary Workstation: Accredited Directory Lookup */}
          <div className="chart-panel p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[9px] font-mono font-bold tracking-wider text-ink-soft uppercase block mb-2">
                  Accredited Specialist Directory
                </span>
                <h3 className="text-base font-bold uppercase">
                  {language === 'en' ? 'Verified BMDC Practitioners by Hospital' : 'হাসপাতাল ভিত্তিক নিবন্ধিত ডাক্তার তালিকা'}
                </h3>
                <p className="text-[10px] font-mono uppercase text-ink-soft mt-2 max-w-lg">
                  {language === 'en'
                    ? 'Search accredited consultants across Square, DMCH, BSMMU, Evercare, BIRDEM, and NICVD with verifiable BMDC license numbers.'
                    : 'স্কয়ার, ঢাকা মেডিকেল, পিজি হাসপাতাল, এভারকেয়ার এবং বারডেমের বিএমডিসি সনদপ্রাপ্ত চিকিৎসকদের তথ্য।'}
                </p>
              </div>

              <button
                onClick={() => onNavigateTab('discovery')}
                className="px-4 py-2 border border-line bg-paper hover:border-ink hover:bg-paper-raised text-ink text-[10px] font-mono font-bold uppercase transition-colors shrink-0"
              >
                {language === 'en' ? 'Browse Directory' : 'সম্পূর্ণ তালিকা'}
              </button>
            </div>
          </div>

        </div>

        {/* Right Column (4 cols): Acute Dispatch & Patient Health Locker */}
        <div className="lg:col-span-4 space-y-6">

          {/* Critical Emergency Workstation (Red Alert Priority) */}
          <div className="chart-panel p-6 border-2 border-clinical-red">
            <div className="flex items-center gap-2 text-clinical-red mb-3">
              <PhoneCall className="w-5 h-5" />
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider">Emergency Hotlines</span>
            </div>

            <p className="text-[10px] font-mono uppercase text-ink-soft leading-relaxed mb-5 pb-3 border-b border-line">
              Direct emergency calling for ambulance transport and trauma triage across Bangladesh.
            </p>

            <div className="space-y-3 font-mono">
              <div className="p-3 bg-paper border border-clinical-red flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-clinical-red block uppercase font-bold">National Hotline</span>
                  <span className="text-base font-bold text-ink">999</span>
                </div>
                <a
                  href="tel:999"
                  className="px-3 py-1.5 border border-clinical-red bg-clinical-red text-paper text-[10px] font-bold uppercase hover:bg-paper hover:text-clinical-red transition-colors"
                >
                  Call Now
                </a>
              </div>

              <div className="p-3 bg-paper border border-line flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-ink-soft block uppercase font-bold">DGHS Shastho Batayon</span>
                  <span className="text-sm font-bold text-ink">10678</span>
                </div>
                <a
                  href="tel:10678"
                  className="px-3 py-1.5 border border-line bg-paper-raised text-ink text-[10px] font-bold uppercase hover:border-ink transition-colors"
                >
                  Call
                </a>
              </div>

              <div className="p-3 bg-paper border border-line flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-ink-soft block uppercase font-bold">Govt. Ambulance</span>
                  <span className="text-sm font-bold text-ink">16263</span>
                </div>
                <a
                  href="tel:16263"
                  className="px-3 py-1.5 border border-line bg-paper-raised text-ink text-[10px] font-bold uppercase hover:border-ink transition-colors"
                >
                  Call
                </a>
              </div>
            </div>

            <button
              onClick={onOpenEmergency}
              className="w-full mt-4 py-2 border border-line bg-paper text-[10px] font-mono font-bold uppercase text-ink hover:border-ink hover:bg-paper-raised transition-colors"
            >
              View Dhaka Hospital Radar
            </button>
          </div>

          {/* Patient Health Locker (Intake Ledger Base) */}
          <div className="chart-panel p-6">
            <span className="text-[9px] font-mono font-bold tracking-wider text-ink-soft uppercase block mb-2">
              Patient & Doctor Access
            </span>
            <h3 className="text-sm font-bold uppercase mb-2">
              Digital Health Record Locker
            </h3>
            <p className="text-[10px] font-mono uppercase text-ink-soft leading-relaxed mb-4 pb-4 border-b border-line">
              Secure patient vault for digital prescriptions, consultation history, and automated medication timetables.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => openAuthModal('signin')}
                className="w-full py-2.5 border border-ink bg-ink hover:bg-ink-soft text-paper text-[10px] font-mono font-bold uppercase transition-colors"
              >
                Sign In to Health Locker
              </button>
              <button
                onClick={() => openAuthModal('signup')}
                className="w-full py-2.5 border border-line bg-paper hover:border-ink hover:bg-paper-raised text-ink text-[10px] font-mono font-bold uppercase transition-colors"
              >
                Register New Account
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* 4. Accredited Clinical Registry (Hospital Roster Board Format) */}
      <div className="chart-panel p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 mb-5 border-b-2 border-ink gap-3">
          <div>
            <span className="text-[9px] font-mono font-bold tracking-wider text-ink-soft uppercase block mb-1">
              Official Practitioner Roster
            </span>
            <h2 className="text-base sm:text-lg font-bold uppercase">
              {language === 'en' ? 'Accredited Specialist Directory' : 'বিএমডিসি নিবন্ধিত বিশেষজ্ঞ ডাক্তারদের তালিকা'}
            </h2>
          </div>
          <button
            onClick={() => onNavigateTab('discovery')}
            className="text-[10px] font-mono font-bold uppercase text-ink border border-transparent hover:border-ink px-3 py-1.5 transition-colors self-start sm:self-auto"
          >
            {language === 'en' ? 'View Full Chamber Roster' : 'সম্পূর্ণ ডাক্তার তালিকা'}
          </button>
        </div>

        {/* Ledger Table Layout */}
        <div className="divide-y divide-line">
          {featuredDoctors.map((doc) => (
            <div
              key={doc.id}
              className="py-5 flex flex-col md:flex-row md:items-center justify-between gap-5 hover:bg-paper-raised transition-colors px-2"
            >
              <div className="flex items-start gap-4 min-w-0">
                <img
                  src={doc.avatar}
                  alt={doc.name}
                  className="w-12 h-12 object-cover border border-line shrink-0"
                />
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-bold uppercase truncate">{doc.name}</h3>
                    <span className="font-mono text-[9px] font-bold uppercase text-ink border border-ink px-1.5 py-0.5">
                      {doc.bmdcRegNumber || 'BMDC-VERIFIED'}
                    </span>
                  </div>
                  <p className="text-[11px] font-bold uppercase">{doc.specialty}</p>
                  <p className="text-[9px] font-mono uppercase text-ink-soft truncate max-w-lg mt-1">{doc.qualifications}</p>
                  <p className="text-[9px] font-mono uppercase text-ink-soft flex items-center gap-1.5 pt-1">
                    <Building2 className="w-3.5 h-3.5 shrink-0" />
                    <span>{doc.hospitalName}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-6 shrink-0 pt-3 md:pt-0 border-t border-line md:border-t-0">
                <div className="text-left md:text-right">
                  <span className="text-[9px] font-mono font-bold uppercase text-ink-soft block mb-1">Chamber Fee</span>
                  <span className="font-mono text-sm font-bold uppercase">BDT {doc.consultationFee}</span>
                </div>
                <button
                  onClick={() => onNavigateTab('discovery', { specialty: doc.specialty })}
                  className="px-4 py-2 border border-line bg-paper hover:border-ink hover:bg-paper-raised text-ink text-[10px] font-mono font-bold uppercase transition-colors"
                >
                  {language === 'en' ? 'Chamber Schedule' : 'সময়সূচী দেখুন'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Institutional Governance & Regulatory Notice */}
      <div className="p-5 border border-line bg-paper-raised flex items-start gap-4 text-ink">
        <div className="w-8 h-8 border border-ink bg-paper flex items-center justify-center shrink-0 mt-0.5">
          <FileCheck className="w-4 h-4" />
        </div>
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase block border-b border-line pb-2">
            Regulatory Compliance & Clinical Protocol Statement
          </span>
          <p className="text-[9px] font-mono uppercase text-ink-soft leading-relaxed">
            All medical specialists registered on MediConnect hold verifiable licensure with the Bangladesh Medical and Dental Council (BMDC). Clinical triage rules are synthesized from standard Directorate General of Health Services (DGHS) Bangladesh clinical practice algorithms and WHO triage guidelines. This platform does not dispense pharmacological therapy without direct physician oversight.
          </p>
        </div>
      </div>

    </div>
  );
};
