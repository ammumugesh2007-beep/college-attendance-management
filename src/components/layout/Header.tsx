import React from 'react';
import { Menu, Calendar, CheckSquare } from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  onOpenMobileMenu: () => void;
  todayDateStr: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onNavigate,
  onOpenMobileMenu,
  todayDateStr
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 md:px-8 py-3.5 no-print">
      <div className="flex items-center justify-between gap-8 max-w-7xl mx-auto">
        {/* Zone 1: Single text element brand wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <a
            href="#dashboard"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('dashboard');
            }}
            className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 hover:text-blue-900 transition-colors"
          >
            Apex College Attendance
          </a>
        </div>

        {/* Zone 2: 4-5 concise navigation links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600 shrink-0">
          <button
            onClick={() => onNavigate('dashboard')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 ${
              currentTab === 'dashboard' ? 'text-blue-700 font-semibold' : ''
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => onNavigate('daily')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 ${
              currentTab === 'daily' ? 'text-blue-700 font-semibold' : ''
            }`}
          >
            Daily Marking
          </button>
          <button
            onClick={() => onNavigate('students')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 ${
              currentTab === 'students' ? 'text-blue-700 font-semibold' : ''
            }`}
          >
            Students (59)
          </button>
          <button
            onClick={() => onNavigate('monthly')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 ${
              currentTab === 'monthly' ? 'text-blue-700 font-semibold' : ''
            }`}
          >
            Monthly Reports
          </button>
          <button
            onClick={() => onNavigate('cumulative')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 ${
              currentTab === 'cumulative' ? 'text-blue-700 font-semibold' : ''
            }`}
          >
            Cumulative Reports
          </button>
          <button
            onClick={() => onNavigate('holidays')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 ${
              currentTab === 'holidays' ? 'text-blue-700 font-semibold' : ''
            }`}
          >
            Holidays
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('daily')}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors whitespace-nowrap shrink-0 shadow-sm"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Mark Daily Attendance</span>
          </button>
        </div>
      </div>
    </header>
  );
};
