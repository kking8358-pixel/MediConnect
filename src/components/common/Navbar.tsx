import React, { useState } from 'react';
import {
  Activity,
  PhoneCall,
  Globe,
  Bell,
  User as UserIcon,
  Shield,
  Stethoscope,
  ChevronDown,
  Sparkles,
  Heart,
  CheckCircle2,
  FileText,
  Pill,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { translations } from '../../i18n/translations';
import { UserRole } from '../../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenEmergency: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenEmergency
}) => {
  const { user, currentRole, language, setLanguage, openAuthModal, logout } = useAuth();
  const { notifications, markNotificationRead, isDbConnected } = useAppData();
  const t = translations[language];

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  // Only show the signed-in user's own notifications — never leak
  // other users' appointment/reminder alerts across sessions.
  const visibleNotifications = user
    ? notifications.filter((n) => n.userId === user.id)
    : [];
  const unreadCount = visibleNotifications.filter(n => !n.read).length;
  const isDoctorPending = currentRole === 'doctor' && user && !user.isVerified;

  const navItems = [
    { id: 'dashboard', label: user ? t.dashboard : (language === 'en' ? 'Overview' : 'হোম') },
    { id: 'symptom-checker', label: t.symptom_checker, icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'discovery', label: t.find_care },
    ...(user && currentRole === 'patient' ? [
      { id: 'reports', label: t.my_reports, icon: <FileText className="w-3.5 h-3.5" /> },
      { id: 'reminders', label: t.medicine_reminders, icon: <Pill className="w-3.5 h-3.5" /> },
    ] : [])
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-paper border-b-2 border-ink text-ink font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="w-8 h-8 border-2 border-ink bg-ink text-paper flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold tracking-tight uppercase">
                MediConnect
              </span>
              <span className="hidden sm:inline-block text-[9px] uppercase font-mono font-bold tracking-wider text-ink bg-paper border border-ink px-1.5 py-0.5">
                CLINICAL
              </span>
              <span
                title={isDbConnected ? 'Connected to MongoDB Atlas' : 'Running in offline/local storage fallback'}
                className={`hidden md:inline-flex items-center gap-1.5 text-[9px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 border ${
                  isDbConnected
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                    : 'border-slate-300 bg-slate-100 text-slate-600'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isDbConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                {isDbConnected ? 'Atlas DB' : 'Local'}
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-2">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-4 py-2 text-[10px] font-mono font-bold uppercase transition-colors flex items-center gap-2 border ${isActive
                      ? 'bg-ink text-paper border-ink'
                      : 'bg-paper text-ink-soft border-transparent hover:border-ink hover:text-ink'
                    }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}

            {currentRole === 'doctor' && (
              <button
                onClick={() => setActiveTab('doctor-portal')}
                className={`px-4 py-2 text-[10px] font-mono font-bold uppercase transition-colors flex items-center gap-2 border ${activeTab === 'doctor-portal'
                    ? 'bg-ink text-paper border-ink'
                    : 'bg-paper text-ink border-ink hover:bg-ink-soft hover:text-paper'
                  }`}
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>{t.doctor_portal}</span>
              </button>
            )}

            {currentRole === 'admin' && (
              <button
                onClick={() => setActiveTab('admin-panel')}
                className={`px-4 py-2 text-[10px] font-mono font-bold uppercase transition-colors flex items-center gap-2 border ${activeTab === 'admin-panel'
                    ? 'bg-ink text-paper border-ink'
                    : 'bg-paper text-ink border-ink hover:bg-ink-soft hover:text-paper'
                  }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>{t.admin_panel}</span>
              </button>
            )}
          </nav>

          {/* Right Action Tools */}
          <div className="flex items-center gap-3">

            {/* Minimal Emergency Button */}
            <button
              onClick={onOpenEmergency}
              className="px-3 py-1.5 bg-paper border border-clinical-red text-clinical-red hover:bg-clinical-red hover:text-paper text-[10px] font-mono font-bold uppercase flex items-center gap-2 transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Emergency 999</span>
              <span className="sm:hidden">999</span>
            </button>

            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
              className="px-3 py-1.5 border border-line bg-paper text-ink hover:border-ink text-[10px] font-mono font-bold flex items-center gap-2 transition-colors"
              title="Toggle Language"
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="uppercase">{language}</span>
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="relative p-2 border border-line bg-paper text-ink hover:border-ink transition-colors"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-ink border border-paper" />
                )}
              </button>

              {notifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-paper border-2 border-ink p-4 z-50 animate-slide-up">
                  <div className="flex items-center justify-between pb-3 border-b border-line mb-3">
                    <span className="text-[10px] font-mono font-bold uppercase text-ink">Notifications</span>
                    <span className="text-[9px] font-mono font-bold uppercase text-paper bg-ink px-2 py-0.5">{unreadCount} new</span>
                  </div>
                  <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
                    {visibleNotifications.length === 0 ? (
                      <p className="text-[10px] font-mono uppercase text-ink-soft text-center py-4">No notifications</p>
                    ) : (
                      visibleNotifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => markNotificationRead(n.id)}
                          className={`p-3 border transition-colors cursor-pointer ${n.read ? 'bg-paper-raised border-line text-ink-soft' : 'bg-paper border-ink text-ink'
                            }`}
                        >
                          <div className="flex items-center justify-between font-bold uppercase mb-1">
                            <span className="text-xs">{n.title}</span>
                            <span className="text-[9px] font-mono">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[10px] font-mono uppercase leading-relaxed">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile or Sign In CTA */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                  className="flex items-center gap-3 pl-2 pr-3 py-1 border border-line bg-paper hover:border-ink transition-colors"
                >
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                    alt={user.name}
                    className="w-7 h-7 object-cover border border-ink"
                  />
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-[10px] font-bold uppercase text-ink truncate max-w-[120px]">
                      {user.name}
                    </span>
                    <span className="text-[9px] font-mono font-bold uppercase text-ink-soft">
                      {isDoctorPending ? 'Doctor (Pending)' : user.role}
                    </span>
                  </div>
                  <ChevronDown className="w-3 h-3 text-ink-soft" />
                </button>

                {roleDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-paper border-2 border-ink p-3 z-50 animate-slide-up">
                    <div className="px-2 py-2 border-b border-line mb-2">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-bold uppercase text-ink truncate">{user.name}</span>
                        <span className="text-[9px] font-mono font-bold uppercase text-paper bg-ink px-1.5 py-0.5 border border-ink">
                          {isDoctorPending ? 'Pending' : user.role}
                        </span>
                      </div>
                      <p className="text-[10px] font-mono uppercase text-ink-soft truncate">{user.email || user.phone}</p>
                    </div>

                    <div className="pt-1 text-[10px] font-mono font-bold uppercase">
                      <button
                        onClick={() => {
                          logout();
                          setActiveTab('dashboard');
                          setRoleDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 border border-transparent hover:border-clinical-red text-clinical-red transition-colors flex items-center gap-3"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => openAuthModal('signin')}
                className="px-4 py-2 border border-ink bg-ink hover:bg-ink-soft text-paper text-[10px] font-mono font-bold uppercase flex items-center gap-2 transition-colors shrink-0"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Sign In / Register</span>
              </button>
            )}

          </div>
        </div>

        {/* Mobile Navigation Scrollbar */}
        <div className="lg:hidden flex items-center gap-2 py-3 border-t border-line overflow-x-auto scrollbar-none">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-4 py-2 text-[10px] font-mono font-bold uppercase whitespace-nowrap transition-colors border ${activeTab === item.id
                  ? 'bg-ink text-paper border-ink'
                  : 'text-ink-soft bg-paper border-line hover:border-ink hover:text-ink'
                }`}
            >
              {item.label}
            </button>
          ))}
          {currentRole === 'doctor' && (
            <button
              onClick={() => setActiveTab('doctor-portal')}
              className={`px-4 py-2 text-[10px] font-mono font-bold uppercase whitespace-nowrap border ${activeTab === 'doctor-portal' ? 'bg-ink text-paper border-ink' : 'text-ink bg-paper border-ink'
                }`}
            >
              {t.doctor_portal}
            </button>
          )}
          {currentRole === 'admin' && (
            <button
              onClick={() => setActiveTab('admin-panel')}
              className={`px-4 py-2 text-[10px] font-mono font-bold uppercase whitespace-nowrap border ${activeTab === 'admin-panel' ? 'bg-ink text-paper border-ink' : 'text-ink bg-paper border-ink'
                }`}
            >
              {t.admin_panel}
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
