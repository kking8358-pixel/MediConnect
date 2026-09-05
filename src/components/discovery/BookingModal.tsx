import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  Building,
  FileText,
  Lock,
  LogIn
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Doctor } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { translations } from '../../i18n/translations';

interface BookingModalProps {
  doctor: Doctor;
  onClose: () => void;
  initialReportId?: string;
  /** When set, confirming books a new slot and marks this appointment rescheduled. */
  rescheduleAppointmentId?: string;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  doctor,
  onClose,
  initialReportId,
  rescheduleAppointmentId
}) => {
  const { language, user, openAuthModal } = useAuth();
  const { reports, appointments, bookAppointment, updateAppointmentStatus, addNotification } = useAppData();
  const t = translations[language];

  // Only offer the current patient's own records for attachment.
  const visibleReports = user
    ? reports.filter((r) => r.patientId === user.id)
    : [];

  const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Generate real upcoming dates so weekday labels never rot.
  const availableDates = (() => {
    const out: { label: string; date: string; day: string }[] = [];
    const now = new Date();
    for (let i = 0; i < 4; i++) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const day = DAY_SHORT[d.getDay()];
      const label =
        i === 0
          ? `Today (${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`
          : `${d.toLocaleDateString('en-US', { weekday: 'long' })} (${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`;
      out.push({ label, date: iso, day });
    }
    return out;
  })();

  const [selectedDate, setSelectedDate] = useState(availableDates[0].date);
  const [selectedSlot, setSelectedSlot] = useState<string>(
    doctor.availability[0]?.slots[0] || '10:00 AM'
  );
  const [selectedReportId, setSelectedReportId] = useState<string>(initialReportId || '');
  const [notes, setNotes] = useState<string>('Follow up on recent symptom assessment.');
  const [isBooked, setIsBooked] = useState(false);

  // Slots follow the weekday of the selected date, not availability[0].
  const selectedDay = availableDates.find((d) => d.date === selectedDate)?.day;
  const slots = (
    doctor.availability.find((a) => a.day === selectedDay)?.slots ||
    doctor.availability[0]?.slots || [
      '10:00 AM',
      '11:00 AM',
      '02:30 PM',
      '04:00 PM',
      '05:30 PM'
    ]
  );

  // Set of already booked time slots for this doctor on the selected date
  const bookedSlots = new Set(
    appointments
      .filter((a) =>
        a.doctorId === doctor.id &&
        a.date === selectedDate &&
        (a.status === 'booked' || a.status === 'rescheduled') &&
        a.id !== rescheduleAppointmentId
      )
      .map((a) => a.timeSlot)
  );

  // If current slot is taken, auto-select the first available slot
  useEffect(() => {
    if (bookedSlots.has(selectedSlot)) {
      const firstAvailable = slots.find((s) => !bookedSlots.has(s));
      if (firstAvailable) {
        setSelectedSlot(firstAvailable);
      }
    }
  }, [selectedDate, appointments, slots]);

  const handleConfirmBooking = () => {
    if (!user) {
      openAuthModal('signin');
      return;
    }

    if (bookedSlots.has(selectedSlot)) {
      alert(language === 'bn' ? 'এই সময়টি ইতিমধ্যেই অন্য একজন বুক করেছেন। অনুগ্রহ করে অন্য সময় বেছে নিন।' : 'This time slot is already booked. Please choose an available time slot.');
      return;
    }

    const newApt = bookAppointment({
      patientId: user.id,
      patientName: user.name,
      patientPhone: user.phone || '+880 1700-000000',
      patientEmail: user.email,
      doctorId: doctor.id,
      doctorName: doctor.name,
      doctorSpecialty: doctor.specialty,
      doctorEmail: doctor.email,
      hospitalName: doctor.hospitalName,
      date: selectedDate,
      timeSlot: selectedSlot,
      reportId: selectedReportId || undefined,
      notes: rescheduleAppointmentId
        ? `${notes} [Reschedules ${rescheduleAppointmentId}]`
        : notes
    });

    if (rescheduleAppointmentId) {
      updateAppointmentStatus(rescheduleAppointmentId, 'rescheduled');
    }

    addNotification({
      userId: user.id,
      type: 'appointment',
      title: rescheduleAppointmentId ? 'Appointment Rescheduled' : 'Appointment Confirmed',
      message: rescheduleAppointmentId
        ? `Moved to ${doctor.name} on ${selectedDate} at ${selectedSlot} (new ref ${newApt.id.toUpperCase()}).`
        : `Consultation with ${doctor.name} on ${selectedDate} at ${selectedSlot}.`
    });

    setIsBooked(true);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-paper/90 backdrop-blur-sm animate-fade-in font-sans text-ink">
      <div className="relative w-full max-w-lg chart-panel border-2 border-ink p-6 sm:p-7 shadow-none max-h-[90vh] overflow-y-auto custom-scrollbar">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 border border-transparent hover:border-ink hover:bg-line transition-colors text-ink"
        >
          <X className="w-5 h-5" />
        </button>

        {!isBooked ? (
          <div className="space-y-5">
            {rescheduleAppointmentId && (
              <div className="p-2.5 border border-ink bg-paper-raised text-[10px] font-mono font-bold uppercase">
                {t.bk_reschedule_note} ({rescheduleAppointmentId.toUpperCase()})
              </div>
            )}

            {/* Doctor Profile Header */}
            <div className="flex items-start gap-4 pb-4 border-b border-ink">
              <img
                src={doctor.avatar}
                alt={doctor.name}
                className="w-14 h-14 rounded-sm object-cover border border-line"
              />
              <div>
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-ink bg-paper px-1.5 py-0.5 border border-line inline-block mb-1.5">
                  {doctor.specialty}
                </span>
                <h3 className="text-sm font-bold uppercase">{doctor.name}</h3>
                <p className="text-[10px] font-mono text-ink-soft flex items-center gap-1 mt-0.5 uppercase">
                  <Building className="w-3 h-3" />
                  <span>{doctor.hospitalName}</span>
                </p>
              </div>
            </div>

            {/* Date Selection */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-ink-soft flex items-center gap-1.5 mb-2">
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>{t.bk_select_date}</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {availableDates.map((item) => (
                  <button
                    key={item.date}
                    onClick={() => {
                      setSelectedDate(item.date);
                      const daySlots =
                        doctor.availability.find((a) => a.day === item.day)?.slots ||
                        doctor.availability[0]?.slots;
                      if (daySlots && daySlots.length > 0) setSelectedSlot(daySlots[0]);
                    }}
                    className={`p-2 border text-center transition-colors text-[10px] font-mono font-bold uppercase ${
                      selectedDate === item.date
                        ? 'bg-ink border-ink text-paper'
                        : 'bg-paper border-line text-ink hover:bg-line'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Slot Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-ink-soft flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{t.bk_time_slots}</span>
                </label>
                {bookedSlots.size > 0 && (
                  <span className="text-[9px] font-mono text-clinical-red uppercase font-bold">
                    {bookedSlots.size} {bookedSlots.size === 1 ? 'Slot Booked' : 'Slots Booked'}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {slots.map((slot) => {
                  const isSlotTaken = bookedSlots.has(slot);
                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={isSlotTaken}
                      onClick={() => !isSlotTaken && setSelectedSlot(slot)}
                      title={isSlotTaken ? (language === 'bn' ? 'এই সময়টি ইতিমধ্যেই বুক করা হয়েছে' : 'This time slot is already booked') : undefined}
                      className={`py-2 px-2 text-[10px] font-mono font-bold uppercase border transition-all flex flex-col items-center justify-center gap-0.5 ${
                        isSlotTaken
                          ? 'bg-line/60 border-line text-ink-soft/40 cursor-not-allowed opacity-60 select-none'
                          : selectedSlot === slot
                          ? 'bg-ink text-paper border-ink'
                          : 'bg-paper border-line text-ink hover:bg-line'
                      }`}
                    >
                      <span className={isSlotTaken ? 'line-through' : ''}>{slot}</span>
                      {isSlotTaken && (
                        <span className="text-[8px] font-mono font-bold text-clinical-red uppercase tracking-tight">
                          {language === 'bn' ? 'বুকড' : 'Unavailable'}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              {slots.every((s) => bookedSlots.has(s)) && (
                <p className="mt-2 text-[10px] font-mono text-clinical-red uppercase text-center border border-clinical-red/30 p-2 bg-clinical-red/5">
                  {language === 'bn' ? 'এই তারিখের সব সময় বুকড হয়ে গেছে। অনুগ্রহ করে অন্য দিন নির্বাচন করুন।' : 'All slots on this date are fully booked. Please select another date.'}
                </p>
              )}
            </div>

            {/* Attach Health Report */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-ink-soft flex items-center gap-1.5 mb-2">
                <FileText className="w-3.5 h-3.5" />
                <span>{t.bk_attach_record}</span>
              </label>
              <select
                value={selectedReportId}
                onChange={(e) => setSelectedReportId(e.target.value)}
                className="w-full p-2.5 bg-paper border border-line text-[10px] font-mono uppercase focus:bg-paper-raised focus:outline-none focus:border-ink rounded-none"
              >
                <option value="">{t.bk_none_record}</option>
                {visibleReports.map((rep) => (
                  <option key={rep.id} value={rep.id}>
                    REPORT #{rep.id.toUpperCase()} • {rep.condition} ({new Date(rep.createdAt).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>

            {/* Consultation Fee */}
            <div className="p-4 border border-line bg-paper-raised flex items-center justify-between">
              <div>
                <span className="text-[9px] font-bold uppercase text-ink-soft block mb-1">
                  {t.bk_fee}
                </span>
                <p className="text-base font-bold font-mono">
                  BDT {doctor.consultationFee}
                </p>
              </div>
              <span className="text-[9px] font-mono font-bold uppercase border border-ink px-1.5 py-0.5">
                {t.bk_pay_hospital}
              </span>
            </div>

            {/* Authentication Required Notice if guest */}
            {!user && (
              <div className="p-3 border-2 border-dashed border-ink bg-line/20 flex items-start gap-3 mt-2">
                <div className="p-1.5 border border-ink bg-ink text-paper shrink-0 mt-0.5">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-mono font-bold uppercase text-ink">
                    {language === 'bn' ? 'সাইন ইন আবশ্যক' : 'Login Required to Book'}
                  </p>
                  <p className="text-[10px] font-mono text-ink-soft leading-tight">
                    {language === 'bn'
                      ? 'অ্যাপয়েন্টমেন্ট নিশ্চিত করতে দয়া করে সাইন ইন বা নিবন্ধন করুন।'
                      : 'You must be signed in to confirm and save your appointment.'}
                  </p>
                </div>
              </div>
            )}

            {/* Submit / Login Button */}
            {user ? (
              <button
                onClick={handleConfirmBooking}
                className="w-full py-3 border border-ink bg-ink hover:bg-ink-soft text-paper text-[11px] font-bold font-mono uppercase flex items-center justify-center gap-2 transition-colors mt-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{rescheduleAppointmentId ? t.bk_confirm_reschedule : t.bk_confirm}</span>
              </button>
            ) : (
              <button
                onClick={() => openAuthModal('signin')}
                className="w-full py-3 border-2 border-ink bg-ink hover:bg-ink-soft text-paper text-[11px] font-bold font-mono uppercase flex items-center justify-center gap-2 transition-colors mt-2"
              >
                <LogIn className="w-4 h-4" />
                <span>{language === 'bn' ? 'সাইন ইন করে বুক করুন' : 'Sign In to Confirm Appointment'}</span>
              </button>
            )}

          </div>
        ) : (
          /* Confirmation */
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 mx-auto border-2 border-clinical-green bg-paper text-clinical-green flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-bold uppercase">
              {rescheduleAppointmentId ? t.bk_rescheduled : t.bk_confirmed}
            </h3>

            <p className="text-[11px] font-mono text-ink-soft max-w-sm mx-auto leading-relaxed uppercase border border-line p-4">
              Your visit with {doctor.name} is scheduled for {selectedDate} at {selectedSlot} at {doctor.hospitalName}.
              {rescheduleAppointmentId && ' Your previous slot was marked rescheduled.'}
            </p>

            <button
              onClick={onClose}
              className="w-full py-2.5 border border-ink bg-ink hover:bg-ink-soft text-paper text-[11px] font-bold font-mono uppercase transition-colors mt-4"
            >
              {t.bk_done}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

// TODO: prevent booking in the past
