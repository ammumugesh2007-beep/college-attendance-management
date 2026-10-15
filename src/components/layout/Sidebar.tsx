import React from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Users, 
  CalendarDays, 
  TrendingUp, 
  Palmtree, 
  Database,
  X,
  School
} from 'lucide-react';
import { CollegeSettings } from '../../types';

interface SidebarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  settings: CollegeSettings;
  totalStudents: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onNavigate,
  mobileOpen,
  onCloseMobile,
  settings,
  totalStudents
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'daily', label: 'Daily Attendance', icon: CheckSquare },
    { id: 'students', label: `Student Roster (${totalStudents})`, icon: Users },
    { id: 'monthly', label: 'Monthly Reports', icon: CalendarDays },
    { id: 'cumulative', label: 'Cumulative Reports', icon: TrendingUp },
    { id: 'holidays', label: 'Holidays & Calendar', icon: Palmtree },
    { id: 'settings', label: 'Backup & Settings', icon: Database },
  ];

  const handleNav = (id: string) => {
    onNavigate(id);
    onCloseMobile();
  };

  const navContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      {/* College Info Box */}
      <div className="p-4 border-b border-slate-100 flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 shrink-0">
          <School className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-bold text-slate-900 truncate leading-snug">
            {settings.collegeName}
          </h2>
          <p className="text-xs text-slate-500 truncate mt-0.5">
            {settings.department}
          </p>
          <div className="text-[11px] text-blue-700 font-medium mt-1 truncate">
            {settings.semester}
          </div>
        </div>
        {mobileOpen && (
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1 text-slate-400 hover:text-slate-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav List */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${
                isActive
                  ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-700' : 'text-slate-400'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Persistence Note Footer */}
      <div className="p-3.5 border-t border-slate-100 bg-slate-50/60">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Active Students</span>
          <span className="font-semibold text-slate-800 tabular-nums">{totalStudents}</span>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
          <span>Min. Required</span>
          <span className="font-semibold text-slate-800 tabular-nums">{settings.minAttendancePercentage}%</span>
        </div>
        <div className="text-[11px] text-slate-400 mt-2 leading-tight">
          Offline Local Storage Active
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:block w-64 shrink-0 h-[calc(100vh-61px)] sticky top-[61px] no-print">
        {navContent}
      </aside>

      {/* Mobile Slide-over Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex no-print">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-full h-full z-10 shadow-xl">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};
