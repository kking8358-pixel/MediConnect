import {
  User,
  Doctor,
  Hospital,
  Rule,
  Appointment,
  HealthReport,
  DoctorNote,
  MedicineReminder,
  SymptomCheck,
  NotificationItem,
  Patient
} from '../types';

const API_BASE = '/api';

export async function checkApiHealth(): Promise<{ online: boolean; database: 'connected' | 'disconnected' }> {
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return { online: false, database: 'disconnected' };
    const data = await res.json();
    return {
      online: data.status === 'online',
      database: data.database === 'connected' ? 'connected' : 'disconnected'
    };
  } catch {
    return { online: false, database: 'disconnected' };
  }
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers
    },
    ...options
  });

  if (!res.ok) {
    let errorMsg = `HTTP Error ${res.status}`;
    try {
      const errJson = await res.json();
      if (errJson.error) errorMsg = errJson.error;
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  return res.json();
}

// ---------------- AUTH ----------------
export async function apiLogin(emailOrPhone: string, password?: string): Promise<{ success: boolean; user: User }> {
  return request<{ success: boolean; user: User }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ emailOrPhone, password })
  });
}

export async function apiRegisterPatient(data: any): Promise<Patient> {
  return request<Patient>('/auth/register-patient', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function apiRegisterDoctor(data: any): Promise<Doctor> {
  return request<Doctor>('/auth/register-doctor', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function apiUpdateProfile(id: string, data: any): Promise<User> {
  return request<User>(`/auth/profile/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

// ---------------- DOCTORS ----------------
export async function apiGetDoctors(): Promise<Doctor[]> {
  return request<Doctor[]>('/doctors');
}

export async function apiCreateDoctor(data: Partial<Doctor>): Promise<Doctor> {
  return request<Doctor>('/doctors', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function apiUpdateDoctor(id: string, data: Partial<Doctor>): Promise<Doctor> {
  return request<Doctor>(`/doctors/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

export async function apiVerifyDoctor(id: string, verified: boolean): Promise<Doctor> {
  return request<Doctor>(`/doctors/${encodeURIComponent(id)}/verify`, {
    method: 'PATCH',
    body: JSON.stringify({ verified })
  });
}

// ---------------- HOSPITALS ----------------
export async function apiGetHospitals(): Promise<Hospital[]> {
  return request<Hospital[]>('/hospitals');
}

export async function apiCreateHospital(data: Partial<Hospital>): Promise<Hospital> {
  return request<Hospital>('/hospitals', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function apiUpdateHospital(id: string, data: Partial<Hospital>): Promise<Hospital> {
  return request<Hospital>(`/hospitals/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

export async function apiDeleteHospital(id: string): Promise<void> {
  return request<void>(`/hospitals/${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
}

// ---------------- RULES ----------------
export async function apiGetRules(): Promise<Rule[]> {
  return request<Rule[]>('/rules');
}

export async function apiCreateRule(data: Partial<Rule>): Promise<Rule> {
  return request<Rule>('/rules', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function apiUpdateRule(id: string, data: Partial<Rule>): Promise<Rule> {
  return request<Rule>(`/rules/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

export async function apiDeleteRule(id: string): Promise<void> {
  return request<void>(`/rules/${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
}

export async function apiToggleRule(id: string): Promise<Rule> {
  return request<Rule>(`/rules/${encodeURIComponent(id)}/toggle`, {
    method: 'PATCH'
  });
}

// ---------------- APPOINTMENTS ----------------
export async function apiGetAppointments(params?: { patientId?: string; doctorId?: string }): Promise<Appointment[]> {
  const searchParams = new URLSearchParams();
  if (params?.patientId) searchParams.set('patientId', params.patientId);
  if (params?.doctorId) searchParams.set('doctorId', params.doctorId);
  const qs = searchParams.toString();
  return request<Appointment[]>(`/appointments${qs ? `?${qs}` : ''}`);
}

export async function apiBookAppointment(data: Partial<Appointment>): Promise<Appointment> {
  return request<Appointment>('/appointments', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function apiUpdateAppointmentStatus(id: string, status: string): Promise<Appointment> {
  return request<Appointment>(`/appointments/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  });
}

// ---------------- REPORTS ----------------
export async function apiGetReports(params?: { patientId?: string; doctorId?: string }): Promise<HealthReport[]> {
  const searchParams = new URLSearchParams();
  if (params?.patientId) searchParams.set('patientId', params.patientId);
  if (params?.doctorId) searchParams.set('doctorId', params.doctorId);
  const qs = searchParams.toString();
  return request<HealthReport[]>(`/reports${qs ? `?${qs}` : ''}`);
}

export async function apiCreateReport(data: Partial<HealthReport>): Promise<HealthReport> {
  return request<HealthReport>('/reports', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function apiShareReport(id: string, doctorId: string): Promise<HealthReport> {
  return request<HealthReport>(`/reports/${encodeURIComponent(id)}/share`, {
    method: 'POST',
    body: JSON.stringify({ doctorId })
  });
}

export async function apiAddDoctorNote(id: string, note: Partial<DoctorNote>): Promise<HealthReport> {
  return request<HealthReport>(`/reports/${encodeURIComponent(id)}/notes`, {
    method: 'POST',
    body: JSON.stringify(note)
  });
}

// ---------------- REMINDERS ----------------
export async function apiGetReminders(patientId?: string): Promise<MedicineReminder[]> {
  const qs = patientId ? `?patientId=${encodeURIComponent(patientId)}` : '';
  return request<MedicineReminder[]>(`/reminders${qs}`);
}

export async function apiCreateReminder(data: Partial<MedicineReminder>): Promise<MedicineReminder> {
  return request<MedicineReminder>('/reminders', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function apiUpdateReminder(id: string, data: Partial<MedicineReminder>): Promise<MedicineReminder> {
  return request<MedicineReminder>(`/reminders/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

export async function apiDeleteReminder(id: string): Promise<void> {
  return request<void>(`/reminders/${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
}

export async function apiLogReminderDose(id: string, state: string, scheduledAt?: string): Promise<MedicineReminder> {
  return request<MedicineReminder>(`/reminders/${encodeURIComponent(id)}/log`, {
    method: 'POST',
    body: JSON.stringify({ state, scheduledAt })
  });
}

// ---------------- SYMPTOM CHECKS ----------------
export async function apiGetSymptomChecks(patientId?: string): Promise<SymptomCheck[]> {
  const qs = patientId ? `?patientId=${encodeURIComponent(patientId)}` : '';
  return request<SymptomCheck[]>(`/symptom-checks${qs}`);
}

export async function apiCreateSymptomCheck(data: Partial<SymptomCheck>): Promise<SymptomCheck> {
  return request<SymptomCheck>('/symptom-checks', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

// ---------------- NOTIFICATIONS ----------------
export async function apiGetNotifications(userId?: string): Promise<NotificationItem[]> {
  const qs = userId ? `?userId=${encodeURIComponent(userId)}` : '';
  return request<NotificationItem[]>(`/notifications${qs}`);
}

export async function apiCreateNotification(data: Partial<NotificationItem>): Promise<NotificationItem> {
  return request<NotificationItem>('/notifications', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function apiMarkNotificationRead(id: string): Promise<NotificationItem> {
  return request<NotificationItem>(`/notifications/${encodeURIComponent(id)}/read`, {
    method: 'PATCH'
  });
}
