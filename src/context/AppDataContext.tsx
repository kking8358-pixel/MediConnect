import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  Rule,
  Hospital,
  Doctor,
  SymptomCheck,
  HealthReport,
  Appointment,
  MedicineReminder,
  NotificationItem,
  DoctorNote
} from '../types';
import {
  INITIAL_RULES,
  INITIAL_HOSPITALS,
  INITIAL_DOCTORS,
  INITIAL_REMINDERS,
  INITIAL_REPORTS
} from '../data/mockData';
import {
  checkApiHealth,
  apiGetDoctors,
  apiGetHospitals,
  apiGetRules,
  apiGetAppointments,
  apiGetReports,
  apiGetReminders,
  apiGetSymptomChecks,
  apiGetNotifications,
  apiCreateRule,
  apiUpdateRule,
  apiDeleteRule,
  apiToggleRule,
  apiCreateHospital,
  apiUpdateHospital,
  apiDeleteHospital,
  apiCreateDoctor,
  apiUpdateDoctor,
  apiDeleteDoctor,
  apiVerifyDoctor,
  apiCreateSymptomCheck,
  apiCreateReport,
  apiShareReport,
  apiAddDoctorNote,
  apiBookAppointment,
  apiUpdateAppointmentStatus,
  apiCreateReminder,
  apiUpdateReminder,
  apiDeleteReminder,
  apiLogReminderDose,
  apiCreateNotification,
  apiMarkNotificationRead
} from '../services/api';

interface AppDataContextType {
  // Rules
  rules: Rule[];
  addRule: (rule: Omit<Rule, 'id'>) => void;
  updateRule: (id: string, updated: Partial<Rule>) => void;
  deleteRule: (id: string) => void;
  toggleRuleActive: (id: string) => void;

  // Directory
  hospitals: Hospital[];
  addHospital: (hosp: Omit<Hospital, 'id'>) => void;
  updateHospital: (id: string, updated: Partial<Hospital>) => void;
  deleteHospital: (id: string) => void;
  doctors: Doctor[];
  addDoctor: (doc: Omit<Doctor, 'id'>) => Doctor;
  updateDoctor: (id: string, updated: Partial<Doctor>) => void;
  deleteDoctor: (id: string) => void;
  verifyDoctor: (doctorId: string, verified: boolean) => void;

  // Symptom Checks & Reports
  symptomChecks: SymptomCheck[];
  addSymptomCheck: (check: Omit<SymptomCheck, 'id' | 'createdAt'>) => SymptomCheck;
  reports: HealthReport[];
  addHealthReport: (report: Omit<HealthReport, 'id' | 'createdAt'>) => HealthReport;
  shareReportWithDoctor: (reportId: string, doctorId: string) => void;
  addDoctorNoteToReport: (reportId: string, note: Omit<DoctorNote, 'id' | 'createdAt'>) => void;

  // Appointments
  appointments: Appointment[];
  bookAppointment: (apt: Omit<Appointment, 'id' | 'createdAt' | 'status'>) => Appointment;
  updateAppointmentStatus: (id: string, status: Appointment['status']) => void;

  // Medicine Reminders
  reminders: MedicineReminder[];
  addReminder: (rem: Omit<MedicineReminder, 'id' | 'logs'>) => void;
  updateReminder: (id: string, updated: Partial<MedicineReminder>) => void;
  deleteReminder: (id: string) => void;
  logReminderDose: (reminderId: string, state: 'taken' | 'skipped' | 'snoozed') => void;

  // Notifications
  notifications: NotificationItem[];
  addNotification: (notif: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  activeDoseAlert: { reminder: MedicineReminder; time: string } | null;
  dismissDoseAlert: () => void;

  // Database Connection Status
  isDbConnected: boolean;
  refreshFromDb: () => Promise<void>;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

/** Local calendar date as YYYY-MM-DD (local tz — never UTC, to avoid day shifts). */
export function toLocalISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** False when the course hasn't started yet or its endDate has passed. */
export function isReminderCourseActive(rem: MedicineReminder, now: Date = new Date()): boolean {
  const today = toLocalISODate(now);
  if (rem.startDate && today < rem.startDate) return false;
  if (rem.endDate && today > rem.endDate) return false;
  return true;
}

/**
 * Whether the scheduler should auto-fire for this reminder today.
 * daily → every day; weekly → only on the startDate weekday;
 * custom ("as needed") → never auto-fires, doses are logged manually.
 */
export function isReminderDueToday(rem: MedicineReminder, now: Date = new Date()): boolean {
  if (rem.frequency === 'custom') return false;
  if (rem.frequency === 'weekly') {
    const start = new Date(`${rem.startDate}T00:00:00`);
    if (Number.isNaN(start.getTime())) return true;
    return start.getDay() === now.getDay();
  }
  return true;
}

export const AppDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDbConnected, setIsDbConnected] = useState<boolean>(false);

  // Load or initialize Rules
  const [rules, setRules] = useState<Rule[]>(() => {
    const saved = localStorage.getItem('mc_rules');
    return saved ? JSON.parse(saved) : INITIAL_RULES;
  });

  // Hospitals
  const [hospitals, setHospitals] = useState<Hospital[]>(() => {
    const saved = localStorage.getItem('mc_hospitals');
    return saved ? JSON.parse(saved) : INITIAL_HOSPITALS;
  });

  // Doctors
  const [doctors, setDoctors] = useState<Doctor[]>(() => {
    const saved = localStorage.getItem('mc_doctors');
    return saved ? JSON.parse(saved) : INITIAL_DOCTORS;
  });

  // Symptom Checks
  const [symptomChecks, setSymptomChecks] = useState<SymptomCheck[]>(() => {
    const saved = localStorage.getItem('mc_symptom_checks');
    return saved ? JSON.parse(saved) : [];
  });

  // Health Reports
  const [reports, setReports] = useState<HealthReport[]>(() => {
    const saved = localStorage.getItem('mc_reports');
    return saved ? JSON.parse(saved) : INITIAL_REPORTS;
  });

  // Appointments
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('mc_appointments');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'apt-1',
        patientId: 'pat-1',
        patientName: 'Sajidul Islam',
        patientPhone: '+880 1798-123456',
        doctorId: 'doc-1',
        doctorName: 'Prof. Dr. Mohammad Shamsuzzaman',
        doctorSpecialty: 'Cardiologist',
        hospitalName: 'Square Hospitals Ltd.',
        date: '2026-09-08',
        timeSlot: '10:00 AM',
        status: 'booked',
        notes: 'Follow up on chest discomfort assessment.',
        createdAt: '2026-09-03T10:00:00.000Z'
      }
    ];
  });

  // Medicine Reminders
  const [reminders, setReminders] = useState<MedicineReminder[]>(() => {
    const saved = localStorage.getItem('mc_reminders');
    return saved ? JSON.parse(saved) : INITIAL_REMINDERS;
  });

  // Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      userId: 'pat-1',
      type: 'reminder',
      title: 'Medication Due: Amoxicillin 625mg',
      message: 'Time to take your evening dose with water.',
      read: false,
      createdAt: new Date().toISOString()
    }
  ]);

  const [activeDoseAlert, setActiveDoseAlert] = useState<{ reminder: MedicineReminder; time: string } | null>(null);

  // Initial fetch from MongoDB Atlas if server is running
  const refreshFromDb = async () => {
    try {
      const health = await checkApiHealth();
      const connected = health.online && health.database === 'connected';
      setIsDbConnected(connected);

      if (connected) {
        const [
          dbDocs,
          dbHosps,
          dbRules,
          dbApts,
          dbReps,
          dbRems,
          dbChecks,
          dbNotifs
        ] = await Promise.allSettled([
          apiGetDoctors(),
          apiGetHospitals(),
          apiGetRules(),
          apiGetAppointments(),
          apiGetReports(),
          apiGetReminders(),
          apiGetSymptomChecks(),
          apiGetNotifications()
        ]);

        if (dbDocs.status === 'fulfilled' && dbDocs.value.length > 0) setDoctors(dbDocs.value);
        if (dbHosps.status === 'fulfilled' && dbHosps.value.length > 0) setHospitals(dbHosps.value);
        if (dbRules.status === 'fulfilled' && dbRules.value.length > 0) setRules(dbRules.value);
        if (dbApts.status === 'fulfilled' && dbApts.value.length > 0) setAppointments(dbApts.value);
        if (dbReps.status === 'fulfilled' && dbReps.value.length > 0) setReports(dbReps.value);
        if (dbRems.status === 'fulfilled' && dbRems.value.length > 0) setReminders(dbRems.value);
        if (dbChecks.status === 'fulfilled' && dbChecks.value.length > 0) setSymptomChecks(dbChecks.value);
        if (dbNotifs.status === 'fulfilled' && dbNotifs.value.length > 0) setNotifications(dbNotifs.value);
      }
    } catch {
      setIsDbConnected(false);
    }
  };

  useEffect(() => {
    refreshFromDb();
  }, []);

  // Sync to LocalStorage (fallback persistence)
  useEffect(() => {
    localStorage.setItem('mc_rules', JSON.stringify(rules));
  }, [rules]);

  useEffect(() => {
    localStorage.setItem('mc_hospitals', JSON.stringify(hospitals));
  }, [hospitals]);

  useEffect(() => {
    localStorage.setItem('mc_doctors', JSON.stringify(doctors));
  }, [doctors]);

  // Listen to new doctor registrations from AuthContext
  useEffect(() => {
    const handleNewDoctor = (e: any) => {
      const newDoc = e.detail as Doctor;
      if (newDoc && newDoc.id) {
        setDoctors((prev) => {
          if (prev.some((d) => d.id === newDoc.id)) return prev;
          const updated = [newDoc, ...prev];
          localStorage.setItem('mc_doctors', JSON.stringify(updated));
          return updated;
        });
      }
    };

    window.addEventListener('mediconnect_new_doctor_registered', handleNewDoctor);
    return () => window.removeEventListener('mediconnect_new_doctor_registered', handleNewDoctor);
  }, []);

  useEffect(() => {
    localStorage.setItem('mc_symptom_checks', JSON.stringify(symptomChecks));
  }, [symptomChecks]);

  useEffect(() => {
    localStorage.setItem('mc_reports', JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    localStorage.setItem('mc_appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('mc_reminders', JSON.stringify(reminders));
  }, [reminders]);

  // Keys of (reminder, minute) already fired so the 45s poll doesn't
  // re-trigger repeatedly within the same minute.
  const firedAlertsRef = useRef<Map<string, number>>(new Map());

  // Mirror of the open alert so the poller can avoid clobbering it
  // without side effects inside a state updater.
  const alertRef = useRef(activeDoseAlert);
  alertRef.current = activeDoseAlert;

  // Periodic Reminder Checker simulation (NFR-7)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentHourMin = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      // Drop fired keys older than 5 minutes to bound memory.
      const cutoff = Date.now() - 5 * 60 * 1000;
      firedAlertsRef.current.forEach((ts, key) => {
        if (ts < cutoff) firedAlertsRef.current.delete(key);
      });

      type Candidate = { rem: MedicineReminder; key: string; clearSnooze: boolean };
      const cands: Candidate[] = [];
      for (const rem of reminders) {
        if (rem.status !== 'active' || !isReminderCourseActive(rem, now)) continue;
        // Scheduled dose due today at this minute.
        if (isReminderDueToday(rem, now) && rem.times.includes(currentHourMin)) {
          const key = `${rem.id}@${currentHourMin}`;
          if (!firedAlertsRef.current.has(key)) {
            cands.push({ rem, key, clearSnooze: false });
          }
        }
        // Snooze wake-up: the 15-minute snooze has elapsed.
        if (rem.snoozedUntil) {
          const wake = new Date(rem.snoozedUntil);
          if (!Number.isNaN(wake.getTime()) && wake <= now) {
            const key = `${rem.id}@snooze:${rem.snoozedUntil}`;
            if (!firedAlertsRef.current.has(key)) {
              cands.push({ rem, key, clearSnooze: true });
            }
          }
        }
      }
      if (cands.length === 0) return;
      // Don't clobber an alert the user hasn't dismissed yet.
      if (alertRef.current) {
        cands.forEach((c) => firedAlertsRef.current.set(c.key, Date.now()));
        return;
      }
      const first = cands[0];
      cands.forEach((c) => firedAlertsRef.current.set(c.key, Date.now()));
      if (first.clearSnooze) {
        setReminders((prev) =>
          prev.map((r) => (r.id === first.rem.id ? { ...r, snoozedUntil: undefined } : r))
        );
      }
      setActiveDoseAlert({ reminder: first.rem, time: currentHourMin });
    }, 45000); // Check every 45s

    return () => clearInterval(interval);
  }, [reminders]);

  // Rules CRUD
  const addRule = (newRule: Omit<Rule, 'id'>) => {
    const id = `rule-${Date.now()}`;
    const item = { ...newRule, id };
    setRules(prev => [item, ...prev]);
    apiCreateRule(item).catch(() => {});
  };

  const updateRule = (id: string, updated: Partial<Rule>) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, ...updated } : r));
    apiUpdateRule(id, updated).catch(() => {});
  };

  const deleteRule = (id: string) => {
    setRules(prev => prev.filter(r => r.id !== id));
    apiDeleteRule(id).catch(() => {});
  };

  const toggleRuleActive = (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r));
    apiToggleRule(id).catch(() => {});
  };

  // Directory CRUD
  const addHospital = (hosp: Omit<Hospital, 'id'>) => {
    const id = `hosp-${Date.now()}`;
    const item: Hospital = { ...hosp, id };
    setHospitals(prev => {
      const updated = [item, ...prev];
      try {
        localStorage.setItem('mc_hospitals', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    apiCreateHospital(item).catch(() => {});
  };

  const updateHospital = (id: string, updated: Partial<Hospital>) => {
    setHospitals(prev => {
      const list = prev.map(h => h.id === id ? { ...h, ...updated } : h);
      try {
        localStorage.setItem('mc_hospitals', JSON.stringify(list));
      } catch (e) {}
      return list;
    });
    apiUpdateHospital(id, updated).catch(() => {});
  };

  const deleteHospital = (id: string) => {
    setHospitals(prev => {
      const list = prev.filter(h => h.id !== id);
      try {
        localStorage.setItem('mc_hospitals', JSON.stringify(list));
      } catch (e) {}
      return list;
    });
    apiDeleteHospital(id).catch(() => {});
  };

  const addDoctor = (doc: Omit<Doctor, 'id'>): Doctor => {
    const id = `doc-${Date.now()}`;
    const defaultAvailability = [
      { day: 'Mon', slots: ['09:00 AM', '11:00 AM', '03:00 PM', '05:00 PM'] },
      { day: 'Wed', slots: ['10:00 AM', '12:00 PM', '04:00 PM', '06:00 PM'] },
      { day: 'Sat', slots: ['09:00 AM', '11:30 AM', '02:00 PM', '04:30 PM'] }
    ];
    const newDoc: Doctor = {
      role: 'doctor',
      availability: defaultAvailability,
      rating: 5.0,
      ratingCount: 0,
      experienceYears: 5,
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80',
      ...doc,
      id
    };
    setDoctors(prev => {
      const updated = [newDoc, ...prev];
      try {
        localStorage.setItem('mc_doctors', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    apiCreateDoctor(newDoc).catch(() => {});
    return newDoc;
  };

  const updateDoctor = (id: string, updated: Partial<Doctor>) => {
    setDoctors(prev => {
      const list = prev.map(d => d.id === id ? { ...d, ...updated } : d);
      try {
        localStorage.setItem('mc_doctors', JSON.stringify(list));
      } catch (e) {}
      return list;
    });
    apiUpdateDoctor(id, updated).catch(() => {});
  };

  const deleteDoctor = (id: string) => {
    setDoctors(prev => {
      const list = prev.filter(d => d.id !== id);
      try {
        localStorage.setItem('mc_doctors', JSON.stringify(list));
      } catch (e) {}
      return list;
    });
    apiDeleteDoctor(id).catch(() => {});
  };

  const verifyDoctor = (doctorId: string, verified: boolean) => {
    setDoctors(prev => {
      const updated = prev.map(d => d.id === doctorId ? { ...d, isVerified: verified } : d);
      localStorage.setItem('mc_doctors', JSON.stringify(updated));
      return updated;
    });

    apiVerifyDoctor(doctorId, verified).catch(() => {});

    // Custom event to update active user in AuthContext if this doctor is logged in
    window.dispatchEvent(new CustomEvent('mediconnect_doctor_verified', {
      detail: { doctorId, verified }
    }));

    addNotification({
      userId: doctorId,
      title: verified ? 'Doctor Credentials Verified' : 'Doctor Verification Revoked',
      message: verified 
        ? `Medical credentials and license have been approved by Medical Administration.`
        : `Doctor credentials verification was revoked.`,
      type: 'system'
    });
  };

  // Symptom Checks & Reports
  const addSymptomCheck = (check: Omit<SymptomCheck, 'id' | 'createdAt'>): SymptomCheck => {
    const id = `chk-${Date.now()}`;
    const newCheck: SymptomCheck = {
      ...check,
      id,
      createdAt: new Date().toISOString()
    };
    setSymptomChecks(prev => [newCheck, ...prev]);
    apiCreateSymptomCheck(newCheck).catch(() => {});
    return newCheck;
  };

  const addHealthReport = (report: Omit<HealthReport, 'id' | 'createdAt'>): HealthReport => {
    const id = `rep-${Date.now().toString().slice(-4)}`;
    const newReport: HealthReport = {
      ...report,
      id,
      createdAt: new Date().toISOString()
    };
    setReports(prev => [newReport, ...prev]);
    apiCreateReport(newReport).catch(() => {});
    return newReport;
  };

  const shareReportWithDoctor = (reportId: string, doctorId: string) => {
    setReports(prev => prev.map(r => {
      if (r.id === reportId) {
        const shared = r.sharedWithDoctorIds.includes(doctorId)
          ? r.sharedWithDoctorIds
          : [...r.sharedWithDoctorIds, doctorId];
        return { ...r, sharedWithDoctorIds: shared };
      }
      return r;
    }));
    apiShareReport(reportId, doctorId).catch(() => {});
  };

  const addDoctorNoteToReport = (reportId: string, note: Omit<DoctorNote, 'id' | 'createdAt'>) => {
    const newNote: DoctorNote = {
      ...note,
      id: `note-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setReports(prev => prev.map(r => {
      if (r.id === reportId) {
        return {
          ...r,
          doctorNotes: [newNote, ...(r.doctorNotes || [])]
        };
      }
      return r;
    }));
    apiAddDoctorNote(reportId, newNote).catch(() => {});
  };

  // Appointments
  const bookAppointment = (apt: Omit<Appointment, 'id' | 'createdAt' | 'status'>): Appointment => {
    const id = `apt-${Date.now().toString().slice(-4)}`;
    const newApt: Appointment = {
      ...apt,
      id,
      status: 'booked',
      createdAt: new Date().toISOString()
    };
    setAppointments(prev => [newApt, ...prev]);
    apiBookAppointment(newApt).catch(() => {});
    return newApt;
  };

  const updateAppointmentStatus = (id: string, status: Appointment['status']) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    apiUpdateAppointmentStatus(id, status).catch(() => {});
  };

  // Medicine Reminders
  const addReminder = (rem: Omit<MedicineReminder, 'id' | 'logs'>) => {
    const id = `rem-${Date.now()}`;
    const newRem: MedicineReminder = {
      ...rem,
      id,
      logs: []
    };
    setReminders(prev => [newRem, ...prev]);
    apiCreateReminder(newRem).catch(() => {});
  };

  const updateReminder = (id: string, updated: Partial<MedicineReminder>) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, ...updated } : r));
    apiUpdateReminder(id, updated).catch(() => {});
  };

  const deleteReminder = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
    apiDeleteReminder(id).catch(() => {});
  };

  const logReminderDose = (reminderId: string, state: 'taken' | 'skipped' | 'snoozed') => {
    const now = new Date();
    const logItem = {
      id: `log-${Date.now()}`,
      scheduledAt: now.toISOString(),
      state,
      actedAt: now.toISOString()
    };
    setReminders(prev => prev.map(r => {
      if (r.id === reminderId) {
        const next: MedicineReminder = {
          ...r,
          logs: [logItem, ...(r.logs || [])]
        };
        if (state === 'snoozed') {
          next.snoozedUntil = new Date(now.getTime() + 15 * 60 * 1000).toISOString();
        } else {
          next.snoozedUntil = undefined;
        }
        return next;
      }
      return r;
    }));
    apiLogReminderDose(reminderId, state, logItem.scheduledAt).catch(() => {});
  };

  // Notifications
  const addNotification = (notif: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>) => {
    const item: NotificationItem = {
      ...notif,
      id: `notif-${Date.now()}`,
      read: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [item, ...prev]);
    apiCreateNotification(item).catch(() => {});
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    apiMarkNotificationRead(id).catch(() => {});
  };

  const dismissDoseAlert = () => {
    setActiveDoseAlert(null);
  };

  return (
    <AppDataContext.Provider
      value={{
        rules,
        addRule,
        updateRule,
        deleteRule,
        toggleRuleActive,
        hospitals,
        addHospital,
        updateHospital,
        deleteHospital,
        doctors,
        addDoctor,
        updateDoctor,
        deleteDoctor,
        verifyDoctor,
        symptomChecks,
        addSymptomCheck,
        reports,
        addHealthReport,
        shareReportWithDoctor,
        addDoctorNoteToReport,
        appointments,
        bookAppointment,
        updateAppointmentStatus,
        reminders,
        addReminder,
        updateReminder,
        deleteReminder,
        logReminderDose,
        notifications,
        addNotification,
        markNotificationRead,
        activeDoseAlert,
        dismissDoseAlert,
        isDbConnected,
        refreshFromDb
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
};
