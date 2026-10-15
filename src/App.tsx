import React, { useState, useEffect, useCallback } from 'react';
import { StorageService } from './services/storage';
import { 
  Student, 
  Holiday, 
  CollegeSettings, 
  AttendanceRecord 
} from './types';

import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { ToastContainer, ToastMessage } from './components/common/Toast';

import { DashboardView } from './components/dashboard/DashboardView';
import { DailyAttendanceView } from './components/attendance/DailyAttendanceView';
import { StudentRosterView } from './components/students/StudentRosterView';
import { MonthlyReportView } from './components/reports/MonthlyReportView';
import { CumulativeReportView } from './components/reports/CumulativeReportView';
import { HolidayManagementView } from './components/holidays/HolidayManagementView';
import { SettingsBackupView } from './components/settings/SettingsBackupView';

export default function App() {
  // Navigation
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [targetDateParam, setTargetDateParam] = useState<string | undefined>(undefined);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  // Core Data State
  const [students, setStudents] = useState<Student[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [settings, setSettings] = useState<CollegeSettings | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, AttendanceRecord>>({});

  // Toast Notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((
    type: 'success' | 'warning' | 'info' | 'error',
    title: string,
    message?: string
  ) => {
    const newToast: ToastMessage = {
      id: `toast_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      type,
      title,
      message
    };
    setToasts(prev => [...prev.slice(-4), newToast]);

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== newToast.id));
    }, 4000);
  }, []);

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Load / Reload all data from local storage
  const loadData = useCallback(() => {
    StorageService.initialize();
    setStudents(StorageService.getStudents());
    setHolidays(StorageService.getHolidays());
    setSettings(StorageService.getSettings());
    setAttendanceRecords(StorageService.getAttendanceRecords());
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handlers for data updates
  const handleSaveAttendance = (record: AttendanceRecord) => {
    const updated = StorageService.saveAttendanceRecord(record);
    setAttendanceRecords(updated);
  };

  const handleUpdateStudentName = (rollNo: number, newName: string) => {
    const updatedStudents = StorageService.updateStudentName(rollNo, newName);
    setStudents(updatedStudents);
  };

  const handleAddHoliday = (holiday: Omit<Holiday, 'id'>) => {
    const updatedHolidays = StorageService.addHoliday(holiday);
    setHolidays(updatedHolidays);
  };

  const handleUpdateHoliday = (holiday: Holiday) => {
    const updatedHolidays = StorageService.updateHoliday(holiday);
    setHolidays(updatedHolidays);
  };

  const handleDeleteHoliday = (id: string) => {
    const updatedHolidays = StorageService.deleteHoliday(id);
    setHolidays(updatedHolidays);
  };

  const handleUpdateSettings = (newSettings: CollegeSettings) => {
    StorageService.saveSettings(newSettings);
    setSettings(newSettings);
  };

  const handleNavigate = (tab: string, dateParam?: string) => {
    setCurrentTab(tab);
    if (dateParam) {
      setTargetDateParam(dateParam);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!settings || students.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium">Initializing College Attendance System...</p>
        </div>
      </div>
    );
  }

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans">
      {/* Top Header */}
      <Header
        currentTab={currentTab}
        onNavigate={handleNavigate}
        onOpenMobileMenu={() => setMobileSidebarOpen(true)}
        todayDateStr={todayStr}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Persistent Desktop / Drawer Mobile Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onNavigate={handleNavigate}
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
          settings={settings}
          totalStudents={students.length}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 min-w-0">
          {currentTab === 'dashboard' && (
            <DashboardView
              students={students}
              holidays={holidays}
              settings={settings}
              attendanceRecords={attendanceRecords}
              onNavigate={handleNavigate}
            />
          )}

          {currentTab === 'daily' && (
            <DailyAttendanceView
              students={students}
              holidays={holidays}
              settings={settings}
              attendanceRecords={attendanceRecords}
              onSaveAttendance={handleSaveAttendance}
              onUpdateStudentName={handleUpdateStudentName}
              initialDate={targetDateParam || todayStr}
              showToast={showToast}
            />
          )}

          {currentTab === 'students' && (
            <StudentRosterView
              students={students}
              settings={settings}
              onUpdateStudentName={handleUpdateStudentName}
              showToast={showToast}
            />
          )}

          {currentTab === 'monthly' && (
            <MonthlyReportView
              students={students}
              holidays={holidays}
              settings={settings}
              attendanceRecords={attendanceRecords}
              showToast={showToast}
            />
          )}

          {currentTab === 'cumulative' && (
            <CumulativeReportView
              students={students}
              holidays={holidays}
              settings={settings}
              attendanceRecords={attendanceRecords}
              showToast={showToast}
            />
          )}

          {currentTab === 'holidays' && (
            <HolidayManagementView
              holidays={holidays}
              settings={settings}
              onAddHoliday={handleAddHoliday}
              onUpdateHoliday={handleUpdateHoliday}
              onDeleteHoliday={handleDeleteHoliday}
              onUpdateSettings={handleUpdateSettings}
              showToast={showToast}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsBackupView
              settings={settings}
              students={students}
              holidays={holidays}
              attendanceRecords={attendanceRecords}
              onUpdateSettings={handleUpdateSettings}
              onRefreshAllData={loadData}
              showToast={showToast}
            />
          )}
        </main>
      </div>

      {/* Floating Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
