import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Stethoscope,
  Hospital as HospitalIcon,
  PhoneCall,
  ShieldCheck,
  Download,
  Info,
  HeartPulse
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { translations } from '../../i18n/translations';
import { SYMPTOM_CATALOG } from '../../data/mockData';
import { matchSymptomRule, MatchResult } from '../../services/ruleEngine';
import { generateHealthReportPDF } from '../../services/pdfGenerator';
import { SeverityLevel } from '../../types';

interface SymptomWizardProps {
  onNavigateTab: (tab: string, contextData?: any) => void;
  onOpenEmergency: () => void;
}

export const SymptomWizard: React.FC<SymptomWizardProps> = ({
  onNavigateTab,
  onOpenEmergency
}) => {
  const { language, user } = useAuth();
  const { rules, addSymptomCheck, addHealthReport, reports } = useAppData();
  const t = translations[language];

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [duration, setDuration] = useState<string>('few_days');
  const [intensity, setIntensity] = useState<string>('moderate');
  const [additionalNotes, setAdditionalNotes] = useState<string>('');

  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [createdReportId, setCreatedReportId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Category tags
  const categories = [
    { id: 'all', label: language === 'en' ? 'All Symptoms' : 'সকল লক্ষণ' },
    { id: 'general', label: language === 'en' ? 'General' : 'সাধারণ' },
    { id: 'respiratory', label: language === 'en' ? 'Respiratory' : 'শ্বাসতন্ত্র' },
    { id: 'cardiovascular', label: language === 'en' ? 'Cardiovascular' : 'হৃদরোগ' },
    { id: 'gastrointestinal', label: language === 'en' ? 'Digestive' : 'পরিপাক' },
    { id: 'neurological', label: language === 'en' ? 'Neurological' : 'স্নায়ুতন্ত্র' },
    { id: 'dermatology', label: language === 'en' ? 'Skin' : 'চর্মরোগ' },
    { id: 'musculoskeletal', label: language === 'en' ? 'Joints & Bones' : 'হাড় ও জোড়া' },
    { id: 'ent', label: language === 'en' ? 'ENT' : 'নাক-কান-গলা' },
  ];

  // Quick Demo Presets
  const demoPresets = [
    { label: 'Flu (Fever + Cough)', symptoms: ['fever', 'cough'] },
    { label: 'Cardiac (Chest Pain)', symptoms: ['chest_pain'] },
    { label: 'Neuro (Headache + Vision)', symptoms: ['headache', 'blurred_vision'] },
    { label: 'Skin (Skin Rash)', symptoms: ['skin_rash'] },
    { label: 'Gastric (Abdominal Pain)', symptoms: ['abdominal_pain', 'nausea'] },
    { label: 'Joints (Pain + Swelling)', symptoms: ['joint_pain', 'joint_swelling'] }
  ];

  const filteredSymptoms = SYMPTOM_CATALOG.filter((s) => {
    const matchesCat = selectedCategory === 'all' || s.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      s.name.toLowerCase().includes(query) ||
      s.nameBn.toLowerCase().includes(query) ||
      s.id.toLowerCase().includes(query);
    return matchesCat && matchesSearch;
  });

  const toggleSymptom = (id: string) => {
    if (selectedSymptoms.includes(id)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== id));
    } else {
      setSelectedSymptoms([...selectedSymptoms, id]);
    }
  };

  const applyPreset = (presetSymptoms: string[]) => {
    setSelectedSymptoms(presetSymptoms);
  };

  const runAnalysis = () => {
    if (selectedSymptoms.length === 0) return;
    setIsAnalyzing(true);

    setTimeout(() => {
      const result = matchSymptomRule(selectedSymptoms, rules);
      setMatchResult(result);
      setIsAnalyzing(false);
      setStep(3);

      // Always store canonical English clinical strings so downstream
      // filters (doctor queue, directory) keep working in both languages.
      const canonicalSymptoms = selectedSymptoms.map(id => {
        const item = SYMPTOM_CATALOG.find(s => s.id === id);
        return item ? item.name : id;
      });
      const patientAge =
        user && 'age' in user && typeof (user as any).age === 'number'
          ? (user as any).age
          : 26;
      const patientGender =
        user && 'gender' in user && (user as any).gender
          ? String((user as any).gender).charAt(0).toUpperCase() +
            String((user as any).gender).slice(1)
          : 'Male';
      // Intensity has no dedicated field — preserve it in the notes line.
      const notesWithIntensity = `Intensity: ${intensity}${additionalNotes ? ` | ${additionalNotes}` : ''}`;

      // Save Symptom Check Session
      const newCheck = addSymptomCheck({
        patientId: user?.id || 'guest',
        patientName: user?.name || 'Guest Patient',
        symptomsSelected: canonicalSymptoms,
        duration,
        additionalNotes: notesWithIntensity,
        matchedRuleId: result.rule?.id || null,
        condition: result.condition,
        specialist: result.specialist,
        severity: result.severity,
        confidence: result.confidence,
        healthTips: result.healthTips
      });

      // Automatically generate Health Report
      const newReport = addHealthReport({
        patientId: user?.id || 'guest',
        patientName: user?.name || 'Guest Patient',
        patientAge,
        patientGender,
        symptomCheckId: newCheck.id,
        symptoms: newCheck.symptomsSelected,
        condition: newCheck.condition,
        specialist: newCheck.specialist,
        severity: newCheck.severity,
        confidence: newCheck.confidence,
        sharedWithDoctorIds: [],
        doctorNotes: []
      });

      setCreatedReportId(newReport.id);

      if (result.severity === 'low') {
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.7 }
        });
      }
    }, 450);
  };

  const resetAll = () => {
    setSelectedSymptoms([]);
    setStep(1);
    setMatchResult(null);
    setCreatedReportId(null);
    setSearchQuery('');
    setDuration('few_days');
    setIntensity('moderate');
    setAdditionalNotes('');
  };

  const handleDownloadPDF = () => {
    if (!matchResult) return;
    // Prefer the real saved report so the PDF matches the record
    // (including any doctor notes added later).
    const saved = createdReportId
      ? reports.find((r) => r.id === createdReportId)
      : undefined;
    if (saved) {
      void generateHealthReportPDF(saved).catch(() => undefined);
      return;
    }
    const item = {
      id: createdReportId || `rep-${Date.now().toString().slice(-4)}`,
      patientId: user?.id || 'guest',
      patientName: user?.name || 'Guest Patient',
      patientAge:
        user && 'age' in user && typeof (user as any).age === 'number'
          ? (user as any).age
          : 26,
      patientGender:
        user && 'gender' in user && (user as any).gender
          ? String((user as any).gender)
          : 'Male',
      symptomCheckId: 'chk-curr',
      symptoms: selectedSymptoms.map(id => {
        const s = SYMPTOM_CATALOG.find(sym => sym.id === id);
        return s ? s.name : id;
      }),
      condition: matchResult.condition,
      specialist: matchResult.specialist,
      severity: matchResult.severity,
      confidence: matchResult.confidence,
      sharedWithDoctorIds: [],
      doctorNotes: [],
      createdAt: new Date().toISOString()
    };
    void generateHealthReportPDF(item).catch(() => undefined);
  };

  const severityBadges: Record<SeverityLevel, { label: string; labelBn: string; color: string; bg: string; border: string }> = {
    low: {
      label: 'Optimal / Low Urgency',
      labelBn: 'মৃদু জরুরিতা',
      color: 'text-clinical-green',
      bg: 'bg-paper',
      border: 'border-clinical-green'
    },
    moderate: {
      label: 'Moderate / Tier-2 Concern',
      labelBn: 'মাঝারি জরুরিতা',
      color: 'text-ink',
      bg: 'bg-paper',
      border: 'border-ink'
    },
    urgent: {
      label: 'Emergency / Code Blue',
      labelBn: 'জরুরি অবস্থা (কোড ব্লু)',
      color: 'text-clinical-red',
      bg: 'bg-paper',
      border: 'border-clinical-red'
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-6 animate-fade-in font-sans text-ink">

      {/* Title Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 border border-ink text-ink bg-paper text-[9px] font-mono font-bold uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{language === 'en' ? 'Clinical Decision Support' : 'ক্লিনিকাল ট্রায়াজ'}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight">
          {t.sc_title}
        </h1>
        <p className="text-[11px] font-mono text-ink-soft uppercase leading-relaxed">
          {t.sc_subtitle}
        </p>
      </div>

      {/* 3-Step Wizard Navigation */}
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-0 max-w-md w-full border-2 border-ink bg-paper">

          <button
            onClick={() => setStep(1)}
            className={`flex-1 py-2 px-3 text-[10px] font-mono font-bold uppercase transition-colors border-r-2 border-ink ${step === 1
                ? 'bg-ink text-paper'
                : 'text-ink-soft hover:bg-paper-raised hover:text-ink'
              }`}
          >
            1. {language === 'en' ? 'Symptoms' : 'লক্ষণ'}
          </button>

          <button
            onClick={() => selectedSymptoms.length > 0 && setStep(2)}
            disabled={selectedSymptoms.length === 0}
            className={`flex-1 py-2 px-3 text-[10px] font-mono font-bold uppercase transition-colors border-r-2 border-ink disabled:opacity-40 disabled:hover:bg-transparent ${step === 2
                ? 'bg-ink text-paper'
                : 'text-ink-soft hover:bg-paper-raised hover:text-ink'
              }`}
          >
            2. {language === 'en' ? 'Details' : 'বিবরণ'}
          </button>

          <button
            disabled={!matchResult}
            className={`flex-1 py-2 px-3 text-[10px] font-mono font-bold uppercase transition-colors disabled:opacity-40 disabled:hover:bg-transparent ${step === 3
                ? 'bg-ink text-paper'
                : 'text-ink-soft hover:bg-paper-raised hover:text-ink'
              }`}
          >
            3. {language === 'en' ? 'Result' : 'ফলাফল'}
          </button>

        </div>
      </div>

      {/* STEP 1: Symptom Selection */}
      {step === 1 && (
        <div className="chart-panel p-6 sm:p-8 space-y-6">

          {/* Presets */}
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-ink-soft block mb-2">
              Common Test Scenarios
            </span>
            <div className="flex flex-wrap gap-2">
              {demoPresets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => applyPreset(preset.symptoms)}
                  className="px-3 py-1.5 border border-line bg-paper text-ink hover:border-ink hover:bg-paper-raised text-[9px] font-mono font-bold uppercase transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-ink-soft absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.sc_search_placeholder}
              className="w-full pl-10 pr-4 py-3 bg-paper border-2 border-line text-ink text-[11px] font-mono uppercase focus:border-ink focus:outline-none transition-colors placeholder:text-ink-soft"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 border text-[10px] font-mono font-bold uppercase whitespace-nowrap transition-colors ${selectedCategory === cat.id
                    ? 'bg-ink text-paper border-ink'
                    : 'bg-paper text-ink-soft border-line hover:border-ink hover:text-ink hover:bg-paper-raised'
                  }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Symptom Tag Grid */}
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-line pb-2">
              <span className="text-[10px] font-mono font-bold uppercase text-ink-soft">
                {language === 'en' ? 'Click symptoms to select:' : 'নির্বাচন করতে ক্লিক করুন:'}
              </span>
              <span className="text-[10px] font-mono font-bold uppercase text-ink">
                {selectedSymptoms.length} {t.sc_selected_count}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
              {filteredSymptoms.map((s) => {
                const isSelected = selectedSymptoms.includes(s.id);
                return (
                  <button
                    key={s.id}
                    onClick={() => toggleSymptom(s.id)}
                    className={`p-3 border text-left flex items-center justify-between transition-colors ${isSelected
                        ? 'bg-paper-raised border-ink'
                        : 'bg-paper border-line text-ink-soft hover:border-ink hover:text-ink hover:bg-paper-raised'
                      }`}
                  >
                    <div className="min-w-0 pr-2">
                      <p className={`text-xs font-bold uppercase truncate ${isSelected ? 'text-ink' : ''}`}>
                        {language === 'bn' ? s.nameBn : s.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] font-mono font-bold uppercase text-ink-soft">
                          {s.category}
                        </span>
                        {s.snomedCode && (
                          <span className="text-[8px] font-mono font-bold uppercase px-1 py-0.5 border border-line text-ink">
                            SNOMED: {s.snomedCode}
                          </span>
                        )}
                      </div>
                    </div>
                    {isSelected ? (
                      <CheckCircle2 className="w-5 h-5 text-ink shrink-0" />
                    ) : (
                      <div className="w-5 h-5 border-2 border-line shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Bottom Bar */}
          <div className="flex items-center justify-between pt-5 border-t border-line">
            <button
              onClick={resetAll}
              disabled={selectedSymptoms.length === 0}
              className="px-4 py-2 text-[10px] font-mono font-bold uppercase text-ink-soft hover:text-ink border border-transparent hover:border-ink disabled:opacity-30 flex items-center gap-2 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.sc_reset_btn}</span>
            </button>

            <button
              onClick={() => setStep(2)}
              disabled={selectedSymptoms.length === 0}
              className="px-6 py-2.5 bg-ink text-paper border border-ink hover:bg-ink-soft text-[11px] font-mono font-bold uppercase disabled:opacity-40 flex items-center gap-2 transition-colors"
            >
              <span>{t.sc_next}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      )}

      {/* STEP 2: Duration & Details */}
      {step === 2 && (
        <div className="chart-panel p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-bold uppercase border-b border-line pb-3">
            {language === 'en' ? 'Symptom Duration & Severity' : 'লক্ষণ স্থায়িত্ব ও তীব্রতা'}
          </h2>

          {/* Duration Radio Cards */}
          <div>
            <label className="text-[10px] font-mono font-bold uppercase text-ink-soft block mb-3">
              {t.sc_duration_label}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: 'today', title: t.sc_duration_today, sub: 'Under 24 hours' },
                { id: 'few_days', title: t.sc_duration_few_days, sub: '2 to 5 days' },
                { id: 'weeks', title: t.sc_duration_weeks, sub: 'Over a week' },
                { id: 'chronic', title: t.sc_duration_chronic, sub: 'Recurring' },
              ].map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => setDuration(opt.id)}
                  className={`p-4 border cursor-pointer transition-colors ${duration === opt.id
                      ? 'bg-paper-raised border-ink border-l-4'
                      : 'bg-paper border-line text-ink-soft hover:border-ink hover:bg-paper-raised'
                    }`}
                >
                  <p className={`text-sm font-bold uppercase ${duration === opt.id ? 'text-ink' : ''}`}>{opt.title}</p>
                  <p className="text-[10px] font-mono uppercase text-ink-soft mt-1">{opt.sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Intensity Radio Cards (Selected score buttons) */}
          <div>
            <label className="text-[10px] font-mono font-bold uppercase text-ink-soft block mb-3">
              {t.sc_intensity_label}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'mild', title: t.sc_intensity_mild },
                { id: 'moderate', title: t.sc_intensity_moderate },
                { id: 'severe', title: t.sc_intensity_severe },
              ].map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => setIntensity(opt.id)}
                  className={`p-3 border cursor-pointer text-center transition-colors ${intensity === opt.id
                      ? 'bg-ink border-ink text-paper'
                      : 'bg-paper border-line text-ink-soft hover:border-ink hover:text-ink'
                    }`}
                >
                  <p className="text-xs font-bold uppercase">{opt.title}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="text-[10px] font-mono font-bold uppercase text-ink-soft block mb-2">
              {language === 'en' ? 'Additional Medical Context (Optional)' : 'অন্য কোনো রোগ বা বিবরণ (ঐচ্ছিক)'}
            </label>
            <textarea
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="E.G. HISTORY OF ASTHMA, BLOOD PRESSURE, MEDICATIONS TAKEN..."
              rows={3}
              className="w-full p-4 bg-paper border-2 border-line text-ink text-[11px] font-mono uppercase focus:border-ink focus:outline-none transition-colors placeholder:text-ink-soft"
            />
          </div>

          {/* Nav */}
          <div className="flex items-center justify-between pt-5 border-t border-line">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 text-[10px] font-mono font-bold uppercase text-ink hover:text-ink border border-transparent hover:border-ink flex items-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t.sc_back}</span>
            </button>

            <button
              onClick={runAnalysis}
              disabled={isAnalyzing}
              className="px-6 py-2.5 bg-ink border border-ink hover:bg-ink-soft text-paper text-[11px] font-mono font-bold uppercase disabled:opacity-40 flex items-center gap-2 transition-colors"
            >
              {isAnalyzing ? (
                <>
                  <HeartPulse className="w-4 h-4 animate-spin text-paper" />
                  <span>Evaluating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{t.sc_analyze_btn}</span>
                </>
              )}
            </button>
          </div>

        </div>
      )}

      {/* STEP 3: Diagnostic Results */}
      {step === 3 && matchResult && (
        <div className="space-y-6">

          {/* Urgent Warning if urgent (Code Blue / Emergency Override) */}
          {matchResult.severity === 'urgent' && (
            <div className="chart-panel border-2 border-clinical-red p-6 flex items-start gap-4">
              <div className="w-12 h-12 border-2 border-clinical-red bg-paper text-clinical-red flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-bold text-clinical-red uppercase tracking-tight">
                    Acute Emergency Protocol (Code Blue)
                  </h3>
                  <span className="text-[9px] bg-clinical-red text-paper px-2 py-0.5 font-mono font-bold uppercase">
                    CRITICAL OVERRIDE
                  </span>
                </div>
                <p className="text-[11px] font-mono text-clinical-red mt-2 leading-relaxed uppercase">
                  {t.res_urgent_warning}
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    onClick={onOpenEmergency}
                    className="px-4 py-2 border border-clinical-red bg-clinical-red hover:bg-clinical-red/90 text-paper text-[10px] font-mono font-bold uppercase flex items-center gap-2 transition-colors"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Call 999 Hotline</span>
                  </button>
                  <button
                    onClick={() => onNavigateTab('discovery')}
                    className="px-4 py-2 border border-clinical-red text-clinical-red bg-paper hover:bg-clinical-red hover:text-paper text-[10px] font-mono font-bold uppercase flex items-center gap-2 transition-colors"
                  >
                    <HospitalIcon className="w-3.5 h-3.5" />
                    <span>Nearest ER Centers</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Result Card */}
          <div className="chart-panel p-6 sm:p-8 space-y-6">

            <div className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b-2 border-ink">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-ink-soft">
                  {t.res_analysis_complete}
                </span>
                <h2 className="text-2xl font-bold uppercase mt-1">
                  {language === 'bn' && matchResult.conditionBn ? matchResult.conditionBn : matchResult.condition}
                </h2>
              </div>

              <div className={`px-2 py-1 border ${severityBadges[matchResult.severity].bg} ${severityBadges[matchResult.severity].border} ${severityBadges[matchResult.severity].color} ${matchResult.severity === 'urgent' ? 'stamp-severe' : ''}`}>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
                  {language === 'bn' ? severityBadges[matchResult.severity].labelBn : severityBadges[matchResult.severity].label}
                </span>
              </div>
            </div>

            {/* Specialist & Confidence */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div className="p-4 border border-line bg-paper-raised flex items-start gap-4">
                <div className="w-10 h-10 border border-ink bg-paper text-ink flex items-center justify-center shrink-0">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-ink-soft block mb-1">
                    {t.res_recommended_specialist}
                  </span>
                  <p className="text-sm font-bold uppercase">
                    {language === 'bn' && matchResult.specialistBn ? matchResult.specialistBn : matchResult.specialist}
                  </p>
                  <p className="text-[10px] font-mono uppercase text-ink-soft mt-1">
                    Accredited specialist for immediate or outpatient clinical intake.
                  </p>
                </div>
              </div>

              <div className="p-4 border border-line bg-paper-raised flex items-start gap-4">
                <div className="w-10 h-10 border border-ink bg-paper text-ink flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-ink-soft">
                      {t.res_confidence}
                    </span>
                    <span className="text-sm font-bold font-mono">
                      {matchResult.confidence}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-line mt-2">
                    <div
                      className="h-full bg-ink"
                      style={{ width: `${matchResult.confidence}%` }}
                    />
                  </div>
                  <p className="text-[10px] font-mono uppercase text-ink-soft mt-2">
                    {matchResult.isFallback ? t.res_general_fallback : 'Rule set match confidence'}
                  </p>
                </div>
              </div>

            </div>

            {/* Health Tips */}
            <div className="p-5 border border-line bg-paper space-y-3">
              <div className="flex items-center gap-2 text-[11px] font-bold font-mono uppercase border-b border-line pb-2">
                <Info className="w-4 h-4" />
                <span>{t.res_health_tips}</span>
              </div>
              <ul className="space-y-1.5 list-none text-[10px] font-mono font-bold uppercase text-ink-soft leading-relaxed">
                {matchResult.healthTips.map((tip, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="text-ink">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Buttons with Primary CTA: Order Specialist Referral */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-line">
              <button
                onClick={() => onNavigateTab('discovery', { specialty: matchResult.specialist })}
                className="py-3 px-4 border border-ink bg-ink hover:bg-ink-soft text-paper text-[10px] font-mono font-bold uppercase flex items-center justify-center gap-2 transition-colors"
              >
                <Stethoscope className="w-4 h-4" />
                <span>Order Referral</span>
              </button>

              <button
                onClick={handleDownloadPDF}
                className="py-3 px-4 border border-line bg-paper hover:border-ink hover:bg-paper-raised text-ink text-[10px] font-mono font-bold uppercase flex items-center justify-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>{t.res_download_pdf}</span>
              </button>

              <button
                onClick={() => onNavigateTab('discovery')}
                className="py-3 px-4 border border-line bg-paper hover:border-ink hover:bg-paper-raised text-ink text-[10px] font-mono font-bold uppercase flex items-center justify-center gap-2 transition-colors"
              >
                <HospitalIcon className="w-4 h-4" />
                <span>{t.res_view_hospitals}</span>
              </button>
            </div>

            <p className="text-[9px] font-mono font-bold uppercase text-ink-soft text-center pt-2">
              {t.disclaimer_short}
            </p>

          </div>

          {/* Reset */}
          <div className="text-center pt-2">
            <button
              onClick={resetAll}
              className="text-[10px] font-mono font-bold uppercase text-ink-soft hover:text-ink inline-flex items-center gap-1.5 border border-transparent hover:border-ink px-3 py-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{language === 'en' ? 'Perform another check' : 'নতুন লক্ষণ পরীক্ষা'}</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
};

// TODO: add smooth transitions between steps

// TODO: handle empty symptom states
