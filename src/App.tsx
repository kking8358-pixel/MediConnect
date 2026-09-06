import React, { useState, lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppDataProvider } from './context/AppDataContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { EmergencyModal } from './components/common/EmergencyModal';
import { OtpVerifyModal } from './components/auth/OtpVerifyModal';
import { AuthModal } from './components/auth/AuthModal';
import { LiveDoseAlertModal } from './components/reminders/LiveDoseAlertModal';
import { GuestDashboard } from './components/dashboards/GuestDashboard';
import { PatientDashboard } from './components/dashboards/PatientDashboard';
import { DoctorDashboard } from './components/dashboards/DoctorDashboard';
// Lazy: pulls in recharts (~560kB) only when an admin actually opens the panel.
const AdminDashboard = lazy(() =>
  import('./components/dashboards/AdminDashboard').then((m) => ({ default: m.AdminDashboard }))
);
import { SymptomWizard } from './components/symptom-checker/SymptomWizard';
import { DoctorDirectory } from './components/discovery/DoctorDirectory';
import { HealthReportsView } from './components/reports/HealthReportsView';
import { MedicineRemindersView } from './components/reminders/MedicineRemindersView';

const MainAppContent: React.FC = () => {
  const { user, currentRole } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isEmergencyOpen, setIsEmergencyOpen] = useState<boolean>(false);
  const [discoveryContext, setDiscoveryContext] = useState<
    | {
        specialty?: string;
        rescheduleAppointmentId?: string;
        rescheduleDoctorId?: string;
      }
    | undefined
  >(undefined);

  const handleNavigateTab = (tab: string, contextData?: any) => {
    if (tab === 'discovery') {
      // Reset when navigating without context so old referral filters
      // and reschedule targets don't stick around.
      setDiscoveryContext(
        contextData
          ? {
              specialty: contextData.specialty,
              rescheduleAppointmentId: contextData.rescheduleAppointmentId,
              rescheduleDoctorId: contextData.rescheduleDoctorId,
            }
          : undefined
      );
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const canViewDoctorPortal = !!user && currentRole === 'doctor';
  const canViewAdminPanel = !!user && currentRole === 'admin';

  const isDoctorPending = !!user && currentRole === 'doctor' && !user.isVerified;

  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink font-sans selection:bg-ink selection:text-paper">

      {/* Top Clean Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenEmergency={() => setIsEmergencyOpen(true)}
      />

      {/* Main App Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isDoctorPending ? (
          <DoctorDashboard />
        ) : (
          <>
            {activeTab === 'dashboard' && (
          <>
            {!user && (
              <GuestDashboard
                onNavigateTab={handleNavigateTab}
                onOpenEmergency={() => setIsEmergencyOpen(true)}
              />
            )}
            {user && currentRole === 'patient' && (
              <PatientDashboard
                onNavigateTab={handleNavigateTab}
                onOpenEmergency={() => setIsEmergencyOpen(true)}
              />
            )}
            {user && currentRole === 'doctor' && <DoctorDashboard />}
            {user && currentRole === 'admin' && (
              <Suspense
                fallback={
                  <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center max-w-md mx-auto my-10 shadow-sm">
                    <p className="text-xs text-slate-500">Loading administration panel…</p>
                  </div>
                }
              >
                <AdminDashboard />
              </Suspense>
            )}
          </>
        )}

        {activeTab === 'symptom-checker' && (
          <SymptomWizard
            onNavigateTab={handleNavigateTab}
            onOpenEmergency={() => setIsEmergencyOpen(true)}
          />
        )}

        {activeTab === 'discovery' && (
          <DoctorDirectory
            initialSpecialty={discoveryContext?.specialty}
            initialReschedule={
              discoveryContext?.rescheduleAppointmentId && discoveryContext?.rescheduleDoctorId
                ? {
                    appointmentId: discoveryContext.rescheduleAppointmentId,
                    doctorId: discoveryContext.rescheduleDoctorId,
                  }
                : undefined
            }
          />
        )}

        {activeTab === 'reports' && <HealthReportsView />}

        {activeTab === 'reminders' && <MedicineRemindersView />}

        {activeTab === 'doctor-portal' && (
          canViewDoctorPortal ? (
            <DoctorDashboard />
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center max-w-md mx-auto my-10 shadow-sm">
              <h2 className="text-base font-bold text-slate-900">Doctor access only</h2>
              <p className="text-xs text-slate-500 mt-1">Please sign in with a verified doctor account to open the clinical workstation.</p>
            </div>
          )
        )}

        {activeTab === 'admin-panel' && (
          canViewAdminPanel ? (
            <Suspense
              fallback={
                <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center max-w-md mx-auto my-10 shadow-sm">
                  <p className="text-xs text-slate-500">Loading administration panel…</p>
                </div>
              }
            >
              <AdminDashboard />
            </Suspense>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center max-w-md mx-auto my-10 shadow-sm">
              <h2 className="text-base font-bold text-slate-900">Admin access only</h2>
              <p className="text-xs text-slate-500 mt-1">Please sign in with an administrator account to open this panel.</p>
            </div>
          )
        )}
          </>
        )}
      </main>

      {/* Clean Minimal Footer */}
      <Footer
        onOpenEmergency={() => setIsEmergencyOpen(true)}
        setActiveTab={setActiveTab}
      />

      {/* Modals */}
      <EmergencyModal
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
      />

      <OtpVerifyModal />
      <AuthModal />
      <LiveDoseAlertModal />

    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <AppDataProvider>
        <MainAppContent />
      </AppDataProvider>
    </AuthProvider>
  );
}

export default App;
