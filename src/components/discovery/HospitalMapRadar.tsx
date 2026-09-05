import React, { useState } from 'react';
import { MapPin, Navigation, Phone, Star, Bed, Ambulance, LocateFixed } from 'lucide-react';
import { Hospital } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface HospitalMapRadarProps {
  hospitals: Hospital[];
  selectedHospital: Hospital | null;
  onSelectHospital: (hospital: Hospital) => void;
}

export const HospitalMapRadar: React.FC<HospitalMapRadarProps> = ({
  hospitals,
  selectedHospital,
  onSelectHospital
}) => {
  const { language } = useAuth();
  const [userLocation] = useState({ lat: 23.7508, lng: 90.3938, label: 'Dhanmondi, Dhaka' });

  const calculateDistance = (lat: number, lng: number): string => {
    // Haversine formula — corrects longitude scaling by latitude.
    const R = 6371; // km
    const toRad = (d: number) => (d * Math.PI) / 180;
    const dLat = toRad(lat - userLocation.lat);
    const dLng = toRad(lng - userLocation.lng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(userLocation.lat)) *
        Math.cos(toRad(lat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const dist = 2 * R * Math.asin(Math.sqrt(a));
    return dist.toFixed(1);
  };

  return (
    <div className="chart-panel p-6 space-y-5 text-ink">
      
      {/* Radar Map Header */}
      <div className="flex items-center justify-between border-b border-line pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 border border-ink bg-paper text-ink flex items-center justify-center">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase">
              {language === 'en' ? 'Live Nearby Facility Radar' : 'হাসপাতাল রাডার ম্যাপ'}
            </h3>
            <p className="text-[10px] font-mono font-bold uppercase text-ink-soft flex items-center gap-1.5 mt-1">
              <LocateFixed className="w-3.5 h-3.5" />
              <span>{userLocation.label}</span>
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono font-bold uppercase px-3 py-1 bg-paper border border-line text-ink">
          {hospitals.length} {language === 'en' ? 'Facilities in Range' : 'টি হাসপাতাল'}
        </span>
      </div>

      {/* Radar Canvas - Minimal Architectural Map */}
      <div className="relative w-full h-72 sm:h-80 bg-paper-raised border-2 border-ink overflow-hidden flex items-center justify-center">
        
        {/* Radar concentric rings */}
        <div className="absolute w-64 h-64 rounded-full border border-line" />
        <div className="absolute w-44 h-44 rounded-full border border-line" />
        <div className="absolute w-24 h-24 rounded-full border border-line" />
        <div className="absolute w-64 h-64 rounded-full border border-clinical-green/50 animate-radar" />

        {/* Grid lines */}
        <div className="absolute w-full h-px bg-line" />
        <div className="absolute h-full w-px bg-line" />

        {/* User Marker */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-4 h-4 bg-ink border border-paper animate-pulse" />
          <span className="mt-2 px-2 py-0.5 bg-paper border border-ink text-[9px] font-mono font-bold uppercase text-ink">
            Current Location
          </span>
        </div>

        {/* Hospital Markers */}
        {hospitals.map((hosp, idx) => {
          const dist = calculateDistance(hosp.location.lat, hosp.location.lng);
          const isSelected = selectedHospital?.id === hosp.id;

          const angle = (idx * (360 / hospitals.length) + 30) * (Math.PI / 180);
          const radius = 40 + (idx % 3) * 35;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          return (
            <div
              key={hosp.id}
              onClick={() => onSelectHospital(hosp)}
              style={{
                transform: `translate(${x}px, ${y}px)`
              }}
              className={`absolute z-20 cursor-pointer group transition-all duration-300 ${
                isSelected ? 'scale-125 z-30' : 'hover:scale-110'
              }`}
            >
              <div className={`p-2 border transition-colors ${
                isSelected
                  ? 'bg-ink text-paper border-ink ring-2 ring-line'
                  : 'bg-paper text-ink border-ink hover:bg-ink hover:text-paper'
              }`}>
                <MapPin className="w-4 h-4" />
              </div>

              <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-1 bg-ink border border-line text-[9px] font-mono font-bold uppercase text-paper whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {hosp.name.split(' ')[0]} ({dist} km)
              </div>
            </div>
          );
        })}

        <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-paper border border-ink text-[9px] font-mono font-bold uppercase text-ink flex items-center gap-3">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-clinical-green" /> GPS Active</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 border border-ink" /> Facilities</span>
        </div>

      </div>

      {/* Selected Facility Details Card */}
      {selectedHospital && (
        <div className="p-5 bg-paper-raised border border-line space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-sm font-bold uppercase text-ink">{selectedHospital.name}</h4>
              <p className="text-[10px] font-mono uppercase text-ink-soft mt-1">{selectedHospital.address}, {selectedHospital.city}</p>
            </div>
            <div className="flex items-center gap-1.5 text-ink text-[10px] font-mono font-bold bg-paper px-2.5 py-1 border border-ink">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{selectedHospital.rating}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[10px] font-mono font-bold uppercase">
            <div className="p-2.5 bg-paper border border-line flex items-center gap-2 text-ink">
              <Navigation className="w-4 h-4" />
              <span>{calculateDistance(selectedHospital.location.lat, selectedHospital.location.lng)} km away</span>
            </div>
            <div className="p-2.5 bg-paper border border-line flex items-center gap-2 text-ink">
              <Bed className="w-4 h-4 text-ink-soft" />
              <span>{selectedHospital.totalBeds || 350} Beds</span>
            </div>
            <div className="p-2.5 bg-paper border border-line flex items-center gap-2 text-ink">
              <Ambulance className="w-4 h-4 text-clinical-red" />
              <span>{selectedHospital.ambulanceAvailable ? 'Ambulance 24/7' : 'On Request'}</span>
            </div>
            <a
              href={`tel:${selectedHospital.emergencyContact}`}
              className="p-2.5 bg-paper hover:bg-clinical-red hover:text-paper border border-clinical-red flex items-center justify-center gap-2 text-clinical-red transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>{selectedHospital.emergencyContact}</span>
            </a>
          </div>
        </div>
      )}

    </div>
  );
};

// TODO: fix map zoom level on load
