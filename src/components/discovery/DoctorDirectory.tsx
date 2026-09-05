import React, { useState, useEffect } from 'react';
import {
  Search,
  Stethoscope,
  Building2,
  Star,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Bed,
  Ambulance,
  Navigation,
  Award
} from 'lucide-react';
import { Doctor, Hospital } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { translations } from '../../i18n/translations';
import { HospitalMapRadar } from './HospitalMapRadar';
import { BookingModal } from './BookingModal';

interface DoctorDirectoryProps {
  initialSpecialty?: string;
  initialReschedule?: { appointmentId: string; doctorId: string };
}

export const DoctorDirectory: React.FC<DoctorDirectoryProps> = ({ initialSpecialty, initialReschedule }) => {
  const { language } = useAuth();
  const { doctors, hospitals } = useAppData();
  const t = translations[language];

  const [activeSubTab, setActiveSubTab] = useState<'doctors' | 'hospitals' | 'radar'>('doctors');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>(initialSpecialty || 'all');
  const [selectedHospitalForRadar, setSelectedHospitalForRadar] = useState<Hospital | null>(hospitals[0] || null);

  // Keep the specialty filter in sync when a referral passes a new specialty.
  useEffect(() => {
    setSelectedSpecialty(initialSpecialty || 'all');
  }, [initialSpecialty]);

  // Keep the radar selection valid when the hospital list changes.
  useEffect(() => {
    if (hospitals.length === 0) {
      setSelectedHospitalForRadar(null);
    } else if (!hospitals.some((h) => h.id === selectedHospitalForRadar?.id)) {
      setSelectedHospitalForRadar(hospitals[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hospitals]);
  const [bookingDoctor, setBookingDoctor] = useState<Doctor | null>(null);
  const [rescheduleAppointmentId, setRescheduleAppointmentId] = useState<string | undefined>(undefined);

  // Auto-open the booking modal when arriving via a reschedule action.
  useEffect(() => {
    if (initialReschedule) {
      const doc = doctors.find((d) => d.id === initialReschedule.doctorId);
      if (doc) {
        setBookingDoctor(doc);
        setRescheduleAppointmentId(initialReschedule.appointmentId);
      }
    } else {
      setRescheduleAppointmentId(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialReschedule]);

  const specialties = [
    { id: 'all', label: language === 'en' ? 'All Specialties' : 'সকল বিশেষজ্ঞতা' },
    { id: 'Cardiologist', label: language === 'en' ? 'Cardiology' : 'কার্ডিওলজি' },
    { id: 'Neurologist', label: language === 'en' ? 'Neurology' : 'নিউরোমেডিসিন' },
    { id: 'General Physician', label: language === 'en' ? 'General Physician' : 'মেডিসিন বিশেষজ্ঞ' },
    { id: 'Dermatologist', label: language === 'en' ? 'Dermatology' : 'চর্মরোগ' },
    { id: 'Gastroenterologist', label: language === 'en' ? 'Gastroenterology' : 'গ্যাস্ট্রোএন্টারোলজি' },
    { id: 'Pulmonologist', label: language === 'en' ? 'Pulmonology' : 'বক্ষব্যাধি' },
    { id: 'Orthopedic / Rheumatologist', label: language === 'en' ? 'Orthopedics' : 'হাড় ও বাতরোগ' },
    { id: 'ENT Specialist', label: language === 'en' ? 'ENT' : 'নাক-কান-গলা' }
  ];

  // Filter Doctors
  const filteredDoctors = doctors.filter((doc) => {
    const matchesSpec = selectedSpecialty === 'all' || doc.specialty.toLowerCase() === selectedSpecialty.toLowerCase();
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      doc.name.toLowerCase().includes(q) ||
      doc.specialty.toLowerCase().includes(q) ||
      doc.hospitalName.toLowerCase().includes(q) ||
      doc.qualifications.toLowerCase().includes(q);
    return matchesSpec && matchesSearch;
  });

  // Filter Hospitals
  const filteredHospitals = hospitals.filter((hosp) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      hosp.name.toLowerCase().includes(q) ||
      hosp.address.toLowerCase().includes(q) ||
      hosp.city.toLowerCase().includes(q) ||
      hosp.specialties.some((s) => s.toLowerCase().includes(q));
    const matchesSpec =
      selectedSpecialty === 'all' ||
      hosp.specialties.some((s) => s.toLowerCase().includes(selectedSpecialty.toLowerCase()));
    return matchesSearch && matchesSpec;
  });

  return (
    <div className="space-y-6 animate-fade-in font-sans text-ink">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 border border-line bg-paper text-ink text-[9px] font-mono font-bold uppercase mb-2">
            <Stethoscope className="w-3 h-3" />
            <span>{language === 'en' ? 'Verified Healthcare Network' : 'যাচাইকৃত স্বাস্থ্যসেবা'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight">
            {t.disc_title}
          </h1>
          <p className="text-[11px] font-mono text-ink-soft uppercase mt-1">
            {t.disc_subtitle}
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-0 border-2 border-ink bg-paper shrink-0">
          <button
            onClick={() => setActiveSubTab('doctors')}
            className={`px-4 py-2 text-[10px] font-mono font-bold uppercase transition-colors border-r border-ink ${activeSubTab === 'doctors'
                ? 'bg-ink text-paper'
                : 'text-ink-soft hover:bg-paper-raised hover:text-ink'
              }`}
          >
            <span className="flex items-center gap-2">
              <Stethoscope className="w-3.5 h-3.5" />
              <span>{t.disc_tab_doctors}</span>
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('hospitals')}
            className={`px-4 py-2 text-[10px] font-mono font-bold uppercase transition-colors border-r border-ink ${activeSubTab === 'hospitals'
                ? 'bg-ink text-paper'
                : 'text-ink-soft hover:bg-paper-raised hover:text-ink'
              }`}
          >
            <span className="flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5" />
              <span>{t.disc_tab_hospitals}</span>
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('radar')}
            className={`px-4 py-2 text-[10px] font-mono font-bold uppercase transition-colors ${activeSubTab === 'radar'
                ? 'bg-ink text-paper'
                : 'text-ink-soft hover:bg-paper-raised hover:text-ink'
              }`}
          >
            <span className="flex items-center gap-2">
              <Navigation className="w-3.5 h-3.5" />
              <span>{t.disc_view_map}</span>
            </span>
          </button>
        </div>
      </div>

      {/* Search & Specialty Filter Controls */}
      <div className="chart-panel p-5 space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-ink-soft absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeSubTab === 'doctors' ? t.disc_search_doc : t.disc_search_hosp}
            className="w-full pl-10 pr-4 py-3 bg-paper border border-line text-ink text-[11px] font-mono uppercase focus:border-ink focus:outline-none transition-colors placeholder:text-ink-soft"
          />
        </div>

        {/* Specialty Filter Scroll */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {specialties.map((spec) => (
            <button
              key={spec.id}
              onClick={() => setSelectedSpecialty(spec.id)}
              className={`px-3 py-1.5 border text-[10px] font-mono font-bold uppercase whitespace-nowrap transition-colors ${selectedSpecialty === spec.id
                  ? 'bg-ink text-paper border-ink'
                  : 'bg-paper text-ink-soft border-line hover:border-ink hover:text-ink hover:bg-paper-raised'
                }`}
            >
              {spec.label}
            </button>
          ))}
        </div>
      </div>

      {/* RADAR MAP VIEW */}
      {activeSubTab === 'radar' && (
        <HospitalMapRadar
          hospitals={filteredHospitals}
          selectedHospital={selectedHospitalForRadar}
          onSelectHospital={(h) => setSelectedHospitalForRadar(h)}
        />
      )}

      {/* DOCTORS GRID VIEW */}
      {activeSubTab === 'doctors' && (
        <div>
          <div className="flex items-center justify-between mb-4 border-b border-line pb-2">
            <span className="text-[10px] font-mono font-bold uppercase text-ink-soft">
              {filteredDoctors.length} {language === 'en' ? 'Specialists Found' : 'জন চিকিৎসক উপলব্ধ'}
            </span>
          </div>

          {filteredDoctors.length === 0 ? (
            <div className="chart-panel p-12 text-center text-ink-soft">
              <Stethoscope className="w-8 h-8 mx-auto mb-3" />
              <p className="text-[11px] font-mono font-bold uppercase">No doctors found matching this criteria.</p>
              <button
                onClick={() => { setSelectedSpecialty('all'); setSearchQuery(''); }}
                className="mt-4 px-4 py-2 border border-line bg-paper hover:border-ink text-ink-soft hover:text-ink text-[10px] font-mono font-bold uppercase transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDoctors.map((doc) => (
                <div
                  key={doc.id}
                  className="chart-panel p-5 hover:border-ink transition-colors flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-4">

                    {/* Doctor Top Row */}
                    <div className="flex items-start gap-4">
                      <img
                        src={doc.avatar}
                        alt={doc.name}
                        className="w-14 h-14 object-cover border border-line shrink-0 bg-paper-raised"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.onerror = null;
                          target.src = 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-[9px] font-bold font-mono uppercase text-ink border border-line px-1.5 py-0.5 truncate">
                            {doc.specialty}
                          </span>
                          <div className="flex items-center gap-1 text-ink text-[10px] font-mono font-bold">
                            <Star className="w-3 h-3 fill-current" />
                            <span>{doc.rating}</span>
                          </div>
                        </div>
                        <h3 className="text-sm font-bold uppercase text-ink truncate">{doc.name}</h3>
                        <p className="text-[9px] font-mono uppercase text-ink-soft mt-1 truncate">{doc.qualifications}</p>
                      </div>
                    </div>

                    {/* Hospital & Experience */}
                    <div className="space-y-2 text-[10px] font-mono uppercase text-ink-soft pt-3 border-t border-line">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{doc.hospitalName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="w-3.5 h-3.5 shrink-0" />
                        <span>
                          {doc.experienceYears} {t.disc_experience} • {doc.ratingCount} reviews
                        </span>
                      </div>
                    </div>

                    {/* Slots */}
                    <div className="p-3 border border-line bg-paper-raised">
                      <div className="flex items-center justify-between text-[9px] font-mono font-bold uppercase text-ink-soft mb-2">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3" />
                          <span>Next Slot:</span>
                        </span>
                        <span className="text-ink">
                          {doc.availability[0]?.day}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {doc.availability[0]?.slots.slice(0, 3).map((slot, i) => (
                          <span
                            key={i}
                            className="text-[9px] font-mono font-bold uppercase px-2 py-1 bg-paper border border-line text-ink"
                          >
                            {slot}
                          </span>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* Consultation Fee & CTA */}
                  <div className="pt-4 border-t border-line flex items-center justify-between gap-4">
                    <div>
                      <span className="text-[9px] font-mono font-bold uppercase text-ink-soft block mb-1">
                        Fee
                      </span>
                      <span className="text-sm font-bold font-mono text-ink">
                        ৳{doc.consultationFee}
                      </span>
                    </div>
                    <button
                      onClick={() => setBookingDoctor(doc)}
                      className="px-4 py-2 border border-ink bg-ink hover:bg-ink-soft text-paper text-[10px] font-mono font-bold uppercase flex items-center gap-2 transition-colors"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{t.disc_book_btn}</span>
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* HOSPITALS GRID VIEW */}
      {activeSubTab === 'hospitals' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredHospitals.map((hosp) => (
            <div
              key={hosp.id}
              className="chart-panel hover:border-ink transition-colors flex flex-col justify-between overflow-hidden"
            >
              <div>
                <div className="h-40 w-full relative overflow-hidden bg-line border-b-2 border-ink">
                  <img
                    src={hosp.image}
                    alt={hosp.name}
                    className="w-full h-full object-cover grayscale opacity-90"
                  />
                  <div className="absolute top-3 right-3 flex items-center gap-1 text-ink text-[10px] font-mono font-bold bg-paper border border-ink px-2 py-1">
                    <Star className="w-3 h-3 fill-current" />
                    <span>{hosp.rating}</span>
                  </div>
                  {hosp.ambulanceAvailable && (
                    <span className="absolute top-3 left-3 px-2 py-1 bg-clinical-red border border-clinical-red text-paper text-[9px] font-mono font-bold uppercase">
                      Ambulance 24/7
                    </span>
                  )}
                </div>

                <div className="p-5 space-y-4">
                  <div>
                    <h3 className="text-sm font-bold uppercase text-ink">{hosp.name}</h3>
                    <p className="text-[10px] font-mono uppercase text-ink-soft flex items-start gap-2 mt-2">
                      <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>{hosp.address}, {hosp.city}</span>
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2 border-t border-line">
                    {hosp.specialties.slice(0, 3).map((spec, i) => (
                      <span
                        key={i}
                        className="text-[9px] font-mono font-bold uppercase px-2 py-1 bg-paper border border-line text-ink"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0 flex items-center justify-between border-t border-line mt-4">
                <span className="text-[10px] font-mono font-bold uppercase text-ink-soft flex items-center gap-1.5 mt-4">
                  <Bed className="w-4 h-4 text-ink-soft" />
                  <span>{hosp.totalBeds} Beds</span>
                </span>
                <a
                  href={`tel:${hosp.emergencyContact}`}
                  className="mt-4 px-3 py-2 bg-paper border border-clinical-red text-clinical-red hover:bg-clinical-red hover:text-paper text-[10px] font-mono font-bold uppercase flex items-center gap-2 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call ER</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Booking Modal */}
      {bookingDoctor && (
        <BookingModal
          doctor={bookingDoctor}
          rescheduleAppointmentId={rescheduleAppointmentId}
          onClose={() => {
            setBookingDoctor(null);
            setRescheduleAppointmentId(undefined);
          }}
        />
      )}

    </div>
  );
};
