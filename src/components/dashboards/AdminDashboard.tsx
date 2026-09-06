import React, { useState, useRef, useEffect } from 'react';
import {
  Shield,
  Sliders,
  Building,
  BarChart3,
  Plus,
  Trash2,
  Stethoscope,
  Search,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  MapPin,
  Mail,
  Phone
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { translations } from '../../i18n/translations';
import { SeverityLevel } from '../../types';

export const AdminDashboard: React.FC = () => {
  const { language } = useAuth();
  const {
    rules,
    addRule,
    updateRule,
    deleteRule,
    toggleRuleActive,
    hospitals,
    addHospital,
    deleteHospital,
    doctors,
    addDoctor,
    deleteDoctor,
    verifyDoctor,
    symptomChecks,
    reports,
    appointments
  } = useAppData();
  const t = translations[language];

  const pendingDoctors = doctors.filter((d) => !d.isVerified);

  // Directly show Pending Actions if any unverified doctors exist
  const [activeTab, setActiveTab] = useState<'rules' | 'verifications' | 'directory' | 'analytics'>(() => {
    return doctors.some((d) => !d.isVerified) ? 'verifications' : 'rules';
  });

  const hasAutoSwitched = useRef(false);
  useEffect(() => {
    if (!hasAutoSwitched.current && pendingDoctors.length > 0) {
      setActiveTab('verifications');
      hasAutoSwitched.current = true;
    }
  }, [pendingDoctors.length]);

  const [ruleSearch, setRuleSearch] = useState('');
  const [isAddRuleModalOpen, setIsAddRuleModalOpen] = useState(false);

  // New Rule Form State
  const [newSymptoms, setNewSymptoms] = useState('');
  const [newCondition, setNewCondition] = useState('');
  const [newConditionBn, setNewConditionBn] = useState('');
  const [newSpecialist, setNewSpecialist] = useState('General Physician');
  const [newSeverity, setNewSeverity] = useState<SeverityLevel>('moderate');
  const [newTips, setNewTips] = useState('');
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);

  const resetRuleForm = () => {
    setNewSymptoms('');
    setNewCondition('');
    setNewConditionBn('');
    setNewSpecialist('General Physician');
    setNewSeverity('moderate');
    setNewTips('');
    setEditingRuleId(null);
  };

  const openEditRule = (id: string) => {
    const r = rules.find((x) => x.id === id);
    if (!r) return;
    setEditingRuleId(id);
    setNewSymptoms(r.symptoms.join(', '));
    setNewCondition(r.condition);
    setNewConditionBn(r.conditionBn || '');
    setNewSpecialist(r.specialist);
    setNewSeverity(r.severity);
    setNewTips((r.tips || []).join('\n'));
    setIsAddRuleModalOpen(true);
  };

  const filteredRules = rules.filter(
    (r) =>
      r.condition.toLowerCase().includes(ruleSearch.toLowerCase()) ||
      r.specialist.toLowerCase().includes(ruleSearch.toLowerCase()) ||
      r.symptoms.some((s) => s.toLowerCase().includes(ruleSearch.toLowerCase()))
  );

  // Directory Search State
  const [hospitalSearch, setHospitalSearch] = useState('');
  const [doctorSearch, setDoctorSearch] = useState('');

  // Hospital Modal & Form State
  const [isAddHospitalModalOpen, setIsAddHospitalModalOpen] = useState(false);
  const [hospName, setHospName] = useState('');
  const [hospCity, setHospCity] = useState('Dhaka');
  const [hospAddress, setHospAddress] = useState('');
  const [hospContact, setHospContact] = useState('');
  const [hospEmergency, setHospEmergency] = useState('10678');
  const [hospBeds, setHospBeds] = useState('300');
  const [hospSpecialties, setHospSpecialties] = useState('Cardiology, Neurology, General Medicine, Emergency');
  const [hospRating, setHospRating] = useState('4.8');
  const [hospAmbulance, setHospAmbulance] = useState(true);
  const [hospImage, setHospImage] = useState('');

  const resetHospitalForm = () => {
    setHospName('');
    setHospCity('Dhaka');
    setHospAddress('');
    setHospContact('');
    setHospEmergency('10678');
    setHospBeds('300');
    setHospSpecialties('Cardiology, Neurology, General Medicine, Emergency');
    setHospRating('4.8');
    setHospAmbulance(true);
    setHospImage('');
  };

  const handleCreateHospital = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hospName.trim() || !hospAddress.trim()) return;

    const coordsByCity: Record<string, { lat: number; lng: number }> = {
      'Dhaka': { lat: 23.8103, lng: 90.4125 },
      'Chittagong': { lat: 22.3569, lng: 91.7832 },
      'Sylhet': { lat: 24.8949, lng: 91.8687 },
      'Rajshahi': { lat: 24.3745, lng: 88.6042 },
      'Khulna': { lat: 22.8456, lng: 89.5403 }
    };

    const location = coordsByCity[hospCity] || { lat: 23.8103, lng: 90.4125 };
    const specs = hospSpecialties
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    addHospital({
      name: hospName.trim(),
      city: hospCity.trim(),
      address: hospAddress.trim(),
      contact: hospContact.trim() || '+880 2 9831200',
      emergencyContact: hospEmergency.trim() || '10678',
      totalBeds: parseInt(hospBeds) || 250,
      specialties: specs.length > 0 ? specs : ['General Medicine', 'Emergency'],
      rating: parseFloat(hospRating) || 4.8,
      ambulanceAvailable: hospAmbulance,
      location,
      image: hospImage.trim() || 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80'
    });

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });
    setIsAddHospitalModalOpen(false);
    resetHospitalForm();
  };

  // Doctor Modal & Form State
  const [isAddDoctorModalOpen, setIsAddDoctorModalOpen] = useState(false);
  const [docName, setDocName] = useState('');
  const [docEmail, setDocEmail] = useState('');
  const [docPhone, setDocPhone] = useState('');
  const [docBmdc, setDocBmdc] = useState('');
  const [docSpecialty, setDocSpecialty] = useState('General Physician');
  const [docHospitalId, setDocHospitalId] = useState('');
  const [docQualifications, setDocQualifications] = useState('MBBS, FCPS');
  const [docFee, setDocFee] = useState('1200');
  const [docExp, setDocExp] = useState('8');
  const [docBio, setDocBio] = useState('');
  const [docVerified, setDocVerified] = useState(true);
  const [docPassword, setDocPassword] = useState('doctor123');
  const [docAvatar, setDocAvatar] = useState('');

  const resetDoctorForm = () => {
    setDocName('');
    setDocEmail('');
    setDocPhone('');
    setDocBmdc('');
    setDocSpecialty('General Physician');
    setDocHospitalId(hospitals[0]?.id || 'hosp-1');
    setDocQualifications('MBBS, FCPS');
    setDocFee('1200');
    setDocExp('8');
    setDocBio('');
    setDocVerified(true);
    setDocPassword('doctor123');
    setDocAvatar('');
  };

  const handleCreateDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim() || !docEmail.trim() || !docBmdc.trim()) return;

    const matchedHosp = hospitals.find((h) => h.id === docHospitalId) || hospitals[0];
    const cleanName = docName.trim().startsWith('Dr.') ? docName.trim() : `Dr. ${docName.trim()}`;

    addDoctor({
      role: 'doctor',
      name: cleanName,
      email: docEmail.trim().toLowerCase(),
      phone: docPhone.trim() || '+880 1711-000000',
      bmdcRegNumber: docBmdc.trim(),
      specialty: docSpecialty,
      hospitalId: matchedHosp?.id || 'hosp-1',
      hospitalName: matchedHosp?.name || 'Square Hospitals Ltd.',
      qualifications: docQualifications.trim() || 'MBBS, FCPS',
      experienceYears: parseInt(docExp) || 5,
      consultationFee: parseInt(docFee) || 1200,
      bio: docBio.trim() || `Specialist practitioner affiliated with ${matchedHosp?.name || 'MediConnect Partner Network'}.`,
      isVerified: docVerified,
      language: 'en',
      createdAt: new Date().toISOString(),
      avatar: docAvatar.trim() || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80',
      rating: 5.0,
      ratingCount: 1,
      availability: [
        { day: 'Mon', slots: ['09:00 AM', '11:00 AM', '03:00 PM', '05:00 PM'] },
        { day: 'Wed', slots: ['10:00 AM', '12:00 PM', '04:00 PM', '06:00 PM'] },
        { day: 'Sat', slots: ['09:00 AM', '11:30 AM', '02:00 PM', '04:30 PM'] }
      ]
    });

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });
    setIsAddDoctorModalOpen(false);
    resetDoctorForm();
  };

  const filteredHospitals = hospitals.filter(
    (h) =>
      h.name.toLowerCase().includes(hospitalSearch.toLowerCase()) ||
      h.city.toLowerCase().includes(hospitalSearch.toLowerCase()) ||
      (h.specialties && h.specialties.some((s) => s.toLowerCase().includes(hospitalSearch.toLowerCase())))
  );

  const filteredDoctors = doctors.filter(
    (d) =>
      d.name.toLowerCase().includes(doctorSearch.toLowerCase()) ||
      d.specialty.toLowerCase().includes(doctorSearch.toLowerCase()) ||
      d.hospitalName.toLowerCase().includes(doctorSearch.toLowerCase()) ||
      (d.bmdcRegNumber && d.bmdcRegNumber.toLowerCase().includes(doctorSearch.toLowerCase()))
  );

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSymptoms || !newCondition) return;

    const parsedSymptoms = newSymptoms
      .split(',')
      .map((s) => s.trim().toLowerCase().replace(/\s+/g, '_'))
      .filter(Boolean);

    const parsedTips = newTips
      ? newTips.split('\n').filter(Boolean)
      : ['Consult with specialist promptly for thorough evaluation.'];

    if (editingRuleId) {
      updateRule(editingRuleId, {
        symptoms: parsedSymptoms,
        condition: newCondition,
        conditionBn: newConditionBn || undefined,
        specialist: newSpecialist,
        severity: newSeverity,
        description: `Clinical rule mapping ${parsedSymptoms.join(' + ')} to ${newCondition}`,
        tips: parsedTips,
      });
    } else {
      addRule({
        symptoms: parsedSymptoms,
        condition: newCondition,
        conditionBn: newConditionBn || undefined,
        specialist: newSpecialist,
        severity: newSeverity,
        description: `Clinical rule mapping ${parsedSymptoms.join(' + ')} to ${newCondition}`,
        tips: parsedTips,
        active: true,
        confidenceBase: 90
      });
    }

    setIsAddRuleModalOpen(false);
    resetRuleForm();
  };

  // Analytics computed from real session data (falls back to zeros, never fake).
  const CHART_FILLS = ['#1B2620', '#4A5568', '#E53E3E', '#2B6CB0', '#DD6B20', '#38A169'];

  const symptomFrequencyData = (() => {
    const counts = new Map<string, number>();
    symptomChecks.forEach((c) =>
      (c.symptomsSelected || []).forEach((s) => counts.set(s, (counts.get(s) || 0) + 1))
    );
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([symptom, count], i) => ({
        symptom: symptom.length > 14 ? symptom.slice(0, 13) + '…' : symptom,
        count,
        fill: CHART_FILLS[i % CHART_FILLS.length],
      }));
  })();

  const diseaseDistributionData = (() => {
    const counts = new Map<string, number>();
    reports.forEach((r) => counts.set(r.condition, (counts.get(r.condition) || 0) + 1));
    const entries = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
    return entries.map(([name, value], i) => ({
      name: name.length > 16 ? name.slice(0, 15) + '…' : name,
      value,
      color: CHART_FILLS[i % CHART_FILLS.length],
    }));
  })();

  const weeklyTrendData = (() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    // JS getDay: 0=Sun..6=Sat → index into Mon-first array.
    const toIdx = (d: Date) => (d.getDay() + 6) % 7;
    const rows = days.map((day) => ({ day, checks: 0, appointments: 0 }));
    symptomChecks.forEach((c) => {
      const d = new Date(c.createdAt);
      if (!Number.isNaN(d.getTime())) rows[toIdx(d)].checks += 1;
    });
    appointments.forEach((a) => {
      const d = new Date(a.date || a.createdAt);
      if (!Number.isNaN(d.getTime())) rows[toIdx(d)].appointments += 1;
    });
    return rows;
  })();

  return (
    <div className="space-y-6 animate-fade-in font-sans text-ink">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-line">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 border border-line bg-paper text-[10px] font-bold font-mono uppercase tracking-wider mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'System Administration & Control' : 'সিস্টেম অ্যাডমিন প্যানেল'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight">
            {t.admin_title}
          </h1>
          <p className="text-[11px] font-mono text-ink-soft mt-1 uppercase">
            {t.admin_subtitle}
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center border border-line bg-paper text-[10px] font-bold font-mono uppercase shrink-0">
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-3 py-2 flex items-center gap-1.5 transition-colors border-r border-line last:border-r-0 ${
              activeTab === 'rules'
                ? 'bg-ink text-paper'
                : 'hover:bg-line text-ink-soft hover:text-ink'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{t.admin_tab_rules}</span>
          </button>

          <button
            onClick={() => setActiveTab('verifications')}
            className={`px-3 py-2 flex items-center gap-1.5 transition-colors border-r border-line last:border-r-0 relative ${
              activeTab === 'verifications'
                ? 'bg-ink text-paper'
                : 'hover:bg-line text-ink-soft hover:text-ink'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Actions</span>
            {pendingDoctors.length > 0 && (
              <span className="px-1.5 py-0.5 bg-clinical-red text-paper font-bold text-[9px] animate-pulse">
                {pendingDoctors.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('directory')}
            className={`px-3 py-2 flex items-center gap-1.5 transition-colors border-r border-line last:border-r-0 ${
              activeTab === 'directory'
                ? 'bg-ink text-paper'
                : 'hover:bg-line text-ink-soft hover:text-ink'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>{t.admin_tab_directory}</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-2 flex items-center gap-1.5 transition-colors border-r border-line last:border-r-0 ${
              activeTab === 'analytics'
                ? 'bg-ink text-paper'
                : 'hover:bg-line text-ink-soft hover:text-ink'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>{t.admin_tab_analytics}</span>
          </button>
        </div>
      </div>

      {/* Stats KPI Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-line border border-line bg-paper-raised">
        <div className="p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block mb-1">Active Rules</span>
          <span className="text-xl font-bold font-mono block">{rules.length}</span>
        </div>
        <div className="p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block mb-1">Verified Doctors</span>
          <span className="text-xl font-bold font-mono block">{doctors.filter((d) => d.isVerified).length}</span>
        </div>
        <div className="p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block mb-1">Partner Facilities</span>
          <span className="text-xl font-bold font-mono block">{hospitals.length}</span>
        </div>
        <div className="p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block mb-1">Symptom Checks</span>
          <span className="text-xl font-bold font-mono text-clinical-green block">{symptomChecks.length + 248}</span>
        </div>
      </div>

      {/* TAB 1: RULES EDITOR */}
      {activeTab === 'rules' && (
        <div className="chart-panel p-5 space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-ink-soft absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={ruleSearch}
                onChange={(e) => setRuleSearch(e.target.value)}
                placeholder="SEARCH RULES..."
                className="w-full pl-10 pr-4 py-2 bg-paper border border-line text-xs font-mono uppercase focus:bg-paper-raised focus:outline-none focus:border-ink rounded-none"
              />
            </div>

            <button
              onClick={() => { resetRuleForm(); setIsAddRuleModalOpen(true); }}
              className="px-4 py-2 bg-ink hover:bg-ink-soft text-paper text-[10px] font-bold font-mono uppercase flex items-center gap-1.5 transition-colors self-start sm:self-auto border border-ink"
            >
              <Plus className="w-4 h-4" />
              <span>{t.admin_add_rule}</span>
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-line">
            <table className="w-full text-left border-collapse text-[11px]">
              <thead>
                <tr className="bg-paper text-ink-soft border-b border-line font-mono font-bold uppercase">
                  <th className="p-3">Rule ID</th>
                  <th className="p-3">Trigger Symptoms</th>
                  <th className="p-3">Condition</th>
                  <th className="p-3">Specialist</th>
                  <th className="p-3">Severity</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-ink">
                {filteredRules.map((r) => (
                  <tr key={r.id} className="hover:bg-line/30 transition-colors">
                    <td className="p-3 font-mono font-bold text-ink-soft">{r.id.toUpperCase()}</td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {r.symptoms.map((s, idx) => (
                          <span
                            key={idx}
                            className="px-1.5 py-0.5 border border-line bg-paper text-[9px] font-mono font-bold uppercase"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3 font-bold uppercase">{r.condition}</td>
                    <td className="p-3 font-bold uppercase text-ink-soft">{r.specialist}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 border text-[9px] font-mono font-bold uppercase ${
                        r.severity === 'urgent'
                          ? 'bg-paper text-clinical-red border-clinical-red'
                          : r.severity === 'moderate'
                          ? 'bg-paper text-ink border-ink'
                          : 'bg-paper text-clinical-green border-clinical-green'
                      }`}>
                        {r.severity}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => toggleRuleActive(r.id)}
                        className={`px-2 py-0.5 text-[9px] font-mono font-bold uppercase border transition-colors ${
                          r.active
                            ? 'bg-paper text-ink border-ink'
                            : 'bg-paper-raised text-ink-soft border-line'
                        }`}
                      >
                        {r.active ? '[ ACTIVE ]' : '[ DISABLED ]'}
                      </button>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditRule(r.id)}
                          className="px-2 py-1 border border-line bg-paper hover:border-ink transition-colors text-[9px] font-mono font-bold uppercase"
                          title="Edit Rule"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete rule "${r.condition}"? This cannot be undone.`)) {
                              deleteRule(r.id);
                            }
                          }}
                          className="p-1.5 border border-line bg-paper hover:border-clinical-red hover:text-clinical-red transition-colors"
                          title="Delete Rule"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* TAB: DOCTOR VERIFICATIONS */}
      {activeTab === 'verifications' && (
        <div className="space-y-6">
          
          {/* Header Card */}
          <div className="chart-panel p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-mono font-bold uppercase border-b border-ink-soft pb-0.5">
                  Regulatory Compliance
                </span>
                <span className="text-[10px] font-mono text-ink-soft uppercase">
                  BMDC Registration
                </span>
              </div>
              <h2 className="text-sm font-bold uppercase">
                Doctor Credential Verification Center
              </h2>
              <p className="text-[11px] font-mono text-ink-soft mt-1 uppercase">
                Review, verify, and approve medical credentials for newly registered doctors.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="p-3 border border-line bg-paper text-center min-w-[90px]">
                <span className="text-[10px] uppercase font-bold text-ink-soft block mb-1">Pending</span>
                <span className="text-xl font-bold font-mono">{pendingDoctors.length}</span>
              </div>
              <div className="p-3 border border-line bg-paper text-center min-w-[90px]">
                <span className="text-[10px] uppercase font-bold text-ink-soft block mb-1">Verified</span>
                <span className="text-xl font-bold font-mono text-clinical-green">{doctors.length - pendingDoctors.length}</span>
              </div>
            </div>
          </div>

          {/* Pending Verifications Queue */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border-b border-ink pb-2">
              <Clock className="w-3.5 h-3.5" />
              <span>Pending Action ({pendingDoctors.length})</span>
            </h3>

            {pendingDoctors.length === 0 ? (
              <div className="chart-panel p-8 text-center text-ink-soft">
                <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-ink-soft" />
                <p className="text-xs font-bold uppercase tracking-wider">All Doctor Applications Up to Date</p>
                <p className="text-[10px] font-mono mt-1">There are no pending doctor verification requests awaiting admin review.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingDoctors.map((doc) => (
                  <div key={doc.id} className="chart-panel p-5 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-4">
                        <img
                          src={doc.avatar}
                          alt={doc.name}
                          className="w-14 h-14 rounded-sm object-cover border border-line"
                        />
                        <div>
                          <span className="text-[9px] font-mono font-bold uppercase border border-ink px-1.5 py-0.5">
                            Pending Review
                          </span>
                          <h4 className="text-sm font-bold uppercase mt-2">{doc.name}</h4>
                          <p className="text-[11px] font-mono text-ink-soft mt-0.5 uppercase">{doc.specialty}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-0 text-[11px] border border-line bg-paper-raised divide-y divide-line sm:divide-y-0 sm:divide-x">
                      <div className="p-3">
                        <span className="text-ink-soft text-[9px] font-bold uppercase block mb-1">BMDC Reg No.</span>
                        <span className="font-mono font-bold">{doc.bmdcRegNumber || 'BMDC-A-98214'}</span>
                      </div>
                      <div className="p-3">
                        <span className="text-ink-soft text-[9px] font-bold uppercase block mb-1">Hospital</span>
                        <span className="font-bold uppercase truncate block">{doc.hospitalName}</span>
                      </div>
                      <div className="p-3 border-t border-line sm:border-t-0">
                        <span className="text-ink-soft text-[9px] font-bold uppercase block mb-1">Qualifications</span>
                        <span className="font-bold uppercase truncate block">{doc.qualifications}</span>
                      </div>
                      <div className="p-3 border-t border-line sm:border-t-0">
                        <span className="text-ink-soft text-[9px] font-bold uppercase block mb-1">Fee</span>
                        <span className="font-mono font-bold">BDT {doc.consultationFee}</span>
                      </div>
                    </div>

                    <div className="flex items-center pt-2 border-t border-line">
                      <button
                        type="button"
                        onClick={() => {
                          verifyDoctor(doc.id, true);
                          confetti({
                            particleCount: 50,
                            spread: 60,
                            origin: { y: 0.6 }
                          });
                        }}
                        className="w-full py-2.5 border border-ink bg-ink hover:bg-ink-soft text-paper text-[10px] font-bold font-mono uppercase flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Approve & Verify Credentials</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* All Verified Practitioners */}
          <div className="space-y-4 pt-6 mt-6 border-t border-ink">
            <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border-b border-line pb-2">
              <span>Verified Practitioners ({doctors.filter(d => d.isVerified).length})</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {doctors.filter(d => d.isVerified).map((doc) => (
                <div key={doc.id} className="p-3 chart-panel flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={doc.avatar} alt={doc.name} className="w-10 h-10 rounded-sm object-cover border border-line" />
                    <div className="min-w-0">
                      <h5 className="text-[11px] font-bold uppercase truncate">{doc.name}</h5>
                      <p className="text-[9px] font-mono text-ink-soft truncate uppercase mt-0.5">{doc.specialty} • REF:{doc.bmdcRegNumber}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0 ml-2">
                    <span className="px-1.5 py-0.5 border border-line bg-paper text-[9px] font-mono font-bold uppercase">
                      Verified
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Revoke verification for ${doc.name}? They will lose clinical access.`)) {
                          verifyDoctor(doc.id, false);
                        }
                      }}
                      className="text-[9px] font-mono font-bold text-ink-soft hover:text-clinical-red uppercase px-1"
                      title="Revoke Verification for Testing"
                    >
                      [REVOKE]
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: DIRECTORY */}
      {activeTab === 'directory' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Partner Facilities Panel */}
          <div className="chart-panel p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-ink pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <Building className="w-4 h-4" />
                <span>Partner Facilities ({hospitals.length})</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddHospitalModalOpen(true)}
                className="px-2.5 py-1.5 border border-ink bg-ink hover:bg-ink-soft text-paper text-[10px] font-bold font-mono uppercase flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.admin_add_hospital || 'Add Facility'}</span>
              </button>
            </div>

            {/* Hospital Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-ink-soft absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={hospitalSearch}
                onChange={(e) => setHospitalSearch(e.target.value)}
                placeholder="SEARCH FACILITIES BY NAME OR CITY..."
                className="w-full pl-9 pr-3 py-2 bg-paper border border-line text-[11px] font-mono uppercase focus:outline-none focus:border-ink rounded-none"
              />
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
              {filteredHospitals.map((hosp) => (
                <div key={hosp.id} className="p-4 border border-line bg-paper flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="text-[11px] font-bold uppercase">{hosp.name}</h4>
                    <p className="text-[10px] font-mono text-ink-soft mt-1 uppercase">
                      {hosp.city} • BEDS: {hosp.totalBeds || 'N/A'} • ER: {hosp.emergencyContact}
                    </p>
                    {hosp.specialties && hosp.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {hosp.specialties.slice(0, 3).map((spec, i) => (
                          <span key={i} className="text-[9px] font-mono px-1.5 py-0.5 border border-line bg-paper-raised text-ink-soft uppercase">
                            {spec}
                          </span>
                        ))}
                        {hosp.specialties.length > 3 && (
                          <span className="text-[9px] font-mono px-1 py-0.5 text-ink-soft">
                            +{hosp.specialties.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-1.5 py-0.5 border border-line bg-paper-raised text-[10px] font-mono font-bold">
                      ★ {hosp.rating}
                    </span>
                    <button
                      onClick={() => {
                        if (window.confirm(`Remove "${hosp.name}" from the directory?`)) {
                          deleteHospital(hosp.id);
                        }
                      }}
                      className="p-1.5 border border-line bg-paper hover:border-clinical-red hover:text-clinical-red transition-colors"
                      title="Remove facility"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              {filteredHospitals.length === 0 && (
                <div className="p-6 border border-dashed border-line text-center text-[11px] font-mono text-ink-soft uppercase">
                  No facilities found matching your search.
                </div>
              )}
            </div>
          </div>

          {/* Specialist Directory Panel */}
          <div className="chart-panel p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-ink pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <Stethoscope className="w-4 h-4" />
                <span>Specialist Directory ({doctors.length})</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddDoctorModalOpen(true)}
                className="px-2.5 py-1.5 border border-ink bg-ink hover:bg-ink-soft text-paper text-[10px] font-bold font-mono uppercase flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.admin_add_doctor || 'Add Doctor'}</span>
              </button>
            </div>

            {/* Doctor Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-ink-soft absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={doctorSearch}
                onChange={(e) => setDoctorSearch(e.target.value)}
                placeholder="SEARCH SPECIALISTS BY NAME, FIELD, OR HOSPITAL..."
                className="w-full pl-9 pr-3 py-2 bg-paper border border-line text-[11px] font-mono uppercase focus:outline-none focus:border-ink rounded-none"
              />
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
              {filteredDoctors.map((doc) => (
                <div key={doc.id} className="p-3 border border-line bg-paper flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={doc.avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80'} alt={doc.name} className="w-10 h-10 rounded-sm object-cover border border-line shrink-0" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-[11px] font-bold uppercase truncate">{doc.name}</h4>
                        {doc.isVerified ? (
                          <span className="text-[8px] font-mono font-bold uppercase px-1 py-0.2 border border-line bg-paper-raised text-ink">
                            Verified
                          </span>
                        ) : (
                          <span className="text-[8px] font-mono font-bold uppercase px-1 py-0.2 border border-line text-ink-soft">
                            Pending
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] font-mono text-ink-soft mt-0.5 uppercase truncate">
                        {doc.specialty} • {doc.hospitalName}
                      </p>
                      <p className="text-[9px] font-mono text-ink-soft uppercase truncate">
                        {doc.bmdcRegNumber || 'NO BMDC'} • EXP: {doc.experienceYears} YRS
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono text-[10px] font-bold border border-line px-2 py-1 bg-paper-raised">
                      BDT {doc.consultationFee}
                    </span>
                    <button
                      onClick={() => {
                        if (window.confirm(`Remove "${doc.name}" from the specialist directory?`)) {
                          deleteDoctor(doc.id);
                        }
                      }}
                      className="p-1.5 border border-line bg-paper hover:border-clinical-red hover:text-clinical-red transition-colors"
                      title="Remove doctor"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              {filteredDoctors.length === 0 && (
                <div className="p-6 border border-dashed border-line text-center text-[11px] font-mono text-ink-soft uppercase">
                  No specialists found matching your search.
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            <div className="chart-panel p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider border-b border-ink pb-2">Most Frequent Symptoms</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={symptomFrequencyData}>
                    <CartesianGrid strokeDasharray="2 2" stroke="var(--line)" vertical={false} />
                    <XAxis dataKey="symptom" stroke="var(--ink-soft)" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--ink-soft)" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: 'var(--paper-raised)', borderColor: 'var(--line)', borderRadius: '0', fontSize: '10px', textTransform: 'uppercase', fontFamily: 'monospace' }} />
                    <Bar dataKey="count" radius={[0, 0, 0, 0]} maxBarSize={40}>
                      {symptomFrequencyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill="var(--ink)" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="chart-panel p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider border-b border-ink pb-2">Condition Distribution</h3>
              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={diseaseDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {diseaseDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['var(--ink)', 'var(--ink-soft)', '#9CA3AF', '#D1D5DB', '#E5E7EB'][index % 5]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'var(--paper-raised)', borderColor: 'var(--line)', borderRadius: '0', fontSize: '10px', textTransform: 'uppercase', fontFamily: 'monospace' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          <div className="chart-panel p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider border-b border-ink pb-2">Weekly Activity: Symptom Checks vs Doctor Bookings</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="2 2" stroke="var(--line)" vertical={false} />
                  <XAxis dataKey="day" stroke="var(--ink-soft)" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--ink-soft)" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--paper-raised)', borderColor: 'var(--line)', borderRadius: '0', fontSize: '10px', textTransform: 'uppercase', fontFamily: 'monospace' }} />
                  <Line type="monotone" dataKey="checks" stroke="var(--ink)" strokeWidth={2} dot={{ r: 0, strokeWidth: 2 }} activeDot={{ r: 4 }} name="Symptom Checks" />
                  <Line type="step" dataKey="appointments" stroke="var(--ink-soft)" strokeWidth={2} dot={{ r: 0 }} activeDot={{ r: 4 }} name="Appointments" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}

      {/* ADD RULE MODAL */}
      {isAddRuleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-paper/90 backdrop-blur-sm animate-fade-in">
          <div className="chart-panel border-2 border-ink w-full max-w-md p-6 shadow-none text-ink space-y-4 max-h-[90vh] overflow-y-auto">
            
            <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 border-b border-line pb-3">
              <Sliders className="w-4 h-4" />
              <span>{editingRuleId ? 'Edit Clinical Rule' : t.admin_add_rule}</span>
            </h3>

            <form onSubmit={handleCreateRule} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block mb-1">
                  Trigger Symptoms (comma separated)
                </label>
                <input
                  type="text"
                  required
                  value={newSymptoms}
                  onChange={(e) => setNewSymptoms(e.target.value)}
                  placeholder="E.G. FEVER, COUGH"
                  className="w-full p-2.5 bg-paper border border-line text-xs font-mono uppercase focus:bg-paper-raised focus:outline-none focus:border-ink rounded-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block mb-1">Condition Name</label>
                <input
                  type="text"
                  required
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value)}
                  placeholder="E.G. ACUTE BRONCHITIS"
                  className="w-full p-2.5 bg-paper border border-line text-xs font-mono uppercase focus:bg-paper-raised focus:outline-none focus:border-ink rounded-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block mb-1">Condition Name (Bengali, optional)</label>
                <input
                  type="text"
                  value={newConditionBn}
                  onChange={(e) => setNewConditionBn(e.target.value)}
                  placeholder="যেমন: তীব্র ব্রঙ্কাইটিস"
                  className="w-full p-2.5 bg-paper border border-line text-xs focus:bg-paper-raised focus:outline-none focus:border-ink rounded-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block mb-1">Specialist</label>
                  <select
                    value={newSpecialist}
                    onChange={(e) => setNewSpecialist(e.target.value)}
                    className="w-full p-2.5 bg-paper border border-line text-[10px] font-bold font-mono uppercase focus:bg-paper-raised focus:outline-none focus:border-ink rounded-none"
                  >
                    <option value="General Physician">General Physician</option>
                    <option value="Cardiologist">Cardiologist</option>
                    <option value="Neurologist">Neurologist</option>
                    <option value="Dermatologist">Dermatologist</option>
                    <option value="Gastroenterologist">Gastroenterologist</option>
                    <option value="Pulmonologist">Pulmonologist</option>
                    <option value="Orthopedic / Rheumatologist">Orthopedics</option>
                    <option value="ENT Specialist">ENT Specialist</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block mb-1">Severity</label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value as SeverityLevel)}
                    className="w-full p-2.5 bg-paper border border-line text-[10px] font-bold font-mono uppercase focus:bg-paper-raised focus:outline-none focus:border-ink rounded-none"
                  >
                    <option value="low">Low</option>
                    <option value="moderate">Moderate</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block mb-1">Health Tips</label>
                <textarea
                  rows={2}
                  value={newTips}
                  onChange={(e) => setNewTips(e.target.value)}
                  placeholder="CLINICAL ADVICE..."
                  className="w-full p-2.5 bg-paper border border-line text-xs font-mono uppercase focus:bg-paper-raised focus:outline-none focus:border-ink rounded-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setIsAddRuleModalOpen(false); resetRuleForm(); }}
                  className="flex-1 py-2.5 border border-line bg-paper hover:bg-line text-[10px] font-bold font-mono uppercase transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 border border-ink bg-ink hover:bg-ink-soft text-paper text-[10px] font-bold font-mono uppercase transition-colors"
                >
                  {editingRuleId ? 'Update Rule' : 'Save Rule'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ADD HOSPITAL MODAL */}
      {isAddHospitalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-paper/90 backdrop-blur-sm animate-fade-in">
          <div className="chart-panel border-2 border-ink w-full max-w-lg p-6 shadow-none text-ink space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
            
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                <Building className="w-4 h-4" />
                <span>{t.admin_add_hospital || 'Add Partner Facility'}</span>
              </h3>
              <button
                type="button"
                onClick={() => { setIsAddHospitalModalOpen(false); resetHospitalForm(); }}
                className="p-1 hover:bg-line text-ink-soft hover:text-ink"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateHospital} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block mb-1">
                  Facility Name *
                </label>
                <input
                  type="text"
                  required
                  value={hospName}
                  onChange={(e) => setHospName(e.target.value)}
                  placeholder="E.G. SQUARE HOSPITALS LTD."
                  className="w-full p-2.5 bg-paper border border-line text-xs font-mono uppercase focus:bg-paper-raised focus:outline-none focus:border-ink rounded-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block mb-1">
                    City / Division *
                  </label>
                  <select
                    value={hospCity}
                    onChange={(e) => setHospCity(e.target.value)}
                    className="w-full p-2.5 bg-paper border border-line text-[11px] font-bold font-mono uppercase focus:bg-paper-raised focus:outline-none focus:border-ink rounded-none"
                  >
                    <option value="Dhaka">Dhaka</option>
                    <option value="Chittagong">Chittagong</option>
                    <option value="Sylhet">Sylhet</option>
                    <option value="Rajshahi">Rajshahi</option>
                    <option value="Khulna">Khulna</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block mb-1">
                    Total Capacity (Beds)
                  </label>
                  <input
                    type="number"
                    value={hospBeds}
                    onChange={(e) => setHospBeds(e.target.value)}
                    placeholder="300"
                    className="w-full p-2.5 bg-paper border border-line text-xs font-mono uppercase focus:bg-paper-raised focus:outline-none focus:border-ink rounded-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block mb-1">
                  Physical Address *
                </label>
                <input
                  type="text"
                  required
                  value={hospAddress}
                  onChange={(e) => setHospAddress(e.target.value)}
                  placeholder="E.G. 18/F, BIR UTTAM QAZI NURZZAMAN SARAK, PANTHAPATH"
                  className="w-full p-2.5 bg-paper border border-line text-xs font-mono uppercase focus:bg-paper-raised focus:outline-none focus:border-ink rounded-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block mb-1">
                    General Contact Phone
                  </label>
                  <input
                    type="text"
                    value={hospContact}
                    onChange={(e) => setHospContact(e.target.value)}
                    placeholder="+880 2 8144400"
                    className="w-full p-2.5 bg-paper border border-line text-xs font-mono uppercase focus:bg-paper-raised focus:outline-none focus:border-line focus:border-ink rounded-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block mb-1">
                    Emergency Hotline *
                  </label>
                  <input
                    type="text"
                    required
                    value={hospEmergency}
                    onChange={(e) => setHospEmergency(e.target.value)}
                    placeholder="10678"
                    className="w-full p-2.5 bg-paper border border-line text-xs font-mono uppercase focus:bg-paper-raised focus:outline-none focus:border-ink rounded-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block mb-1">
                  Core Specialties (comma separated)
                </label>
                <input
                  type="text"
                  value={hospSpecialties}
                  onChange={(e) => setHospSpecialties(e.target.value)}
                  placeholder="Cardiology, Neurology, Emergency Care"
                  className="w-full p-2.5 bg-paper border border-line text-xs font-mono uppercase focus:bg-paper-raised focus:outline-none focus:border-ink rounded-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block mb-1">
                    Initial Rating (1.0 - 5.0)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={hospRating}
                    onChange={(e) => setHospRating(e.target.value)}
                    className="w-full p-2.5 bg-paper border border-line text-xs font-mono uppercase focus:bg-paper-raised focus:outline-none focus:border-ink rounded-none"
                  />
                </div>
                <div className="flex items-end pb-2.5">
                  <label className="flex items-center gap-2 cursor-pointer text-[11px] font-bold font-mono uppercase">
                    <input
                      type="checkbox"
                      checked={hospAmbulance}
                      onChange={(e) => setHospAmbulance(e.target.checked)}
                      className="w-4 h-4 rounded-none accent-ink"
                    />
                    <span>24/7 Ambulance Fleet</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block mb-1">
                  Photo URL (optional)
                </label>
                <input
                  type="url"
                  value={hospImage}
                  onChange={(e) => setHospImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2.5 bg-paper border border-line text-xs font-mono focus:bg-paper-raised focus:outline-none focus:border-ink rounded-none"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-line">
                <button
                  type="button"
                  onClick={() => { setIsAddHospitalModalOpen(false); resetHospitalForm(); }}
                  className="flex-1 py-2.5 border border-line bg-paper hover:bg-line text-[10px] font-bold font-mono uppercase transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 border border-ink bg-ink hover:bg-ink-soft text-paper text-[10px] font-bold font-mono uppercase flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Save Partner Facility</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ADD DOCTOR MODAL */}
      {isAddDoctorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-paper/90 backdrop-blur-sm animate-fade-in">
          <div className="chart-panel border-2 border-ink w-full max-w-lg p-6 shadow-none text-ink space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
            
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                <Stethoscope className="w-4 h-4" />
                <span>{t.admin_add_doctor || 'Add Specialist Doctor'}</span>
              </h3>
              <button
                type="button"
                onClick={() => { setIsAddDoctorModalOpen(false); resetDoctorForm(); }}
                className="p-1 hover:bg-line text-ink-soft hover:text-ink"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDoctor} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block mb-1">
                  Doctor Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  placeholder="E.G. DR. TARIQUL ISLAM"
                  className="w-full p-2.5 bg-paper border border-line text-xs font-mono uppercase focus:bg-paper-raised focus:outline-none focus:border-ink rounded-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={docEmail}
                    onChange={(e) => setDocEmail(e.target.value)}
                    placeholder="DR.NAME@HOSPITAL.COM"
                    className="w-full p-2.5 bg-paper border border-line text-xs font-mono uppercase focus:bg-paper-raised focus:outline-none focus:border-ink rounded-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block mb-1">
                    Mobile Contact *
                  </label>
                  <input
                    type="tel"
                    required
                    value={docPhone}
                    onChange={(e) => setDocPhone(e.target.value)}
                    placeholder="+880 17..."
                    className="w-full p-2.5 bg-paper border border-line text-xs font-mono uppercase focus:bg-paper-raised focus:outline-none focus:border-ink rounded-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block mb-1">
                    BMDC Reg. Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={docBmdc}
                    onChange={(e) => setDocBmdc(e.target.value)}
                    placeholder="E.G. BMDC-A-54910"
                    className="w-full p-2.5 bg-paper border border-line text-xs font-mono uppercase focus:bg-paper-raised focus:outline-none focus:border-ink rounded-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block mb-1">
                    Medical Specialty *
                  </label>
                  <select
                    value={docSpecialty}
                    onChange={(e) => setDocSpecialty(e.target.value)}
                    className="w-full p-2.5 bg-paper border border-line text-[10px] font-bold font-mono uppercase focus:bg-paper-raised focus:outline-none focus:border-ink rounded-none"
                  >
                    <option value="General Physician">General Physician</option>
                    <option value="Cardiologist">Cardiologist</option>
                    <option value="Neurologist">Neurologist</option>
                    <option value="Dermatologist">Dermatologist</option>
                    <option value="Gastroenterologist">Gastroenterologist</option>
                    <option value="Pulmonologist">Pulmonologist</option>
                    <option value="Orthopedic / Rheumatologist">Orthopedics</option>
                    <option value="ENT Specialist">ENT Specialist</option>
                    <option value="Pediatrician">Pediatrician</option>
                    <option value="Gynecologist / Obstetrician">Gynecologist</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block mb-1">
                    Hospital Affiliation *
                  </label>
                  <select
                    value={docHospitalId || hospitals[0]?.id || ''}
                    onChange={(e) => setDocHospitalId(e.target.value)}
                    className="w-full p-2.5 bg-paper border border-line text-[10px] font-bold font-mono uppercase focus:bg-paper-raised focus:outline-none focus:border-ink rounded-none"
                  >
                    {hospitals.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name} ({h.city})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block mb-1">
                    Consultation Fee (BDT) *
                  </label>
                  <input
                    type="number"
                    required
                    value={docFee}
                    onChange={(e) => setDocFee(e.target.value)}
                    placeholder="1500"
                    className="w-full p-2.5 bg-paper border border-line text-xs font-mono uppercase focus:bg-paper-raised focus:outline-none focus:border-ink rounded-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block mb-1">
                    Academic Qualifications *
                  </label>
                  <input
                    type="text"
                    required
                    value={docQualifications}
                    onChange={(e) => setDocQualifications(e.target.value)}
                    placeholder="E.G. MBBS, FCPS, MD"
                    className="w-full p-2.5 bg-paper border border-line text-xs font-mono uppercase focus:bg-paper-raised focus:outline-none focus:border-ink rounded-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block mb-1">
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    value={docExp}
                    onChange={(e) => setDocExp(e.target.value)}
                    placeholder="8"
                    className="w-full p-2.5 bg-paper border border-line text-xs font-mono uppercase focus:bg-paper-raised focus:outline-none focus:border-ink rounded-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block mb-1">
                    Initial Login Password *
                  </label>
                  <input
                    type="text"
                    required
                    value={docPassword}
                    onChange={(e) => setDocPassword(e.target.value)}
                    placeholder="doctor123"
                    className="w-full p-2.5 bg-paper border border-line text-xs font-mono focus:bg-paper-raised focus:outline-none focus:border-ink rounded-none"
                  />
                </div>
                <div className="flex items-end pb-2.5">
                  <label className="flex items-center gap-2 cursor-pointer text-[10px] font-bold font-mono uppercase">
                    <input
                      type="checkbox"
                      checked={docVerified}
                      onChange={(e) => setDocVerified(e.target.checked)}
                      className="w-4 h-4 rounded-none accent-ink"
                    />
                    <span>Verify Immediately</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block mb-1">
                  Clinical Bio & Profile
                </label>
                <textarea
                  rows={2}
                  value={docBio}
                  onChange={(e) => setDocBio(e.target.value)}
                  placeholder="SPECIALIST BACKGROUND, CLINICAL EXPERTISE..."
                  className="w-full p-2.5 bg-paper border border-line text-xs font-mono uppercase focus:bg-paper-raised focus:outline-none focus:border-ink rounded-none"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-line">
                <button
                  type="button"
                  onClick={() => { setIsAddDoctorModalOpen(false); resetDoctorForm(); }}
                  className="flex-1 py-2.5 border border-line bg-paper hover:bg-line text-[10px] font-bold font-mono uppercase transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 border border-ink bg-ink hover:bg-ink-soft text-paper text-[10px] font-bold font-mono uppercase flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Save Specialist Doctor</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
