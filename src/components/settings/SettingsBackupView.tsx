import React, { useState } from 'react';
import { 
  Database, 
  Download, 
  Upload, 
  RotateCcw, 
  Save, 
  CheckCircle2, 
  AlertTriangle,
  HardDrive,
  School,
  FileText
} from 'lucide-react';
import { CollegeSettings, Student, Holiday, AttendanceRecord } from '../../types';
import { StorageService } from '../../services/storage';
import { downloadFile } from '../../utils/exportUtils';

interface SettingsBackupViewProps {
  settings: CollegeSettings;
  students: Student[];
  holidays: Holiday[];
  attendanceRecords: Record<string, AttendanceRecord>;
  onUpdateSettings: (settings: CollegeSettings) => void;
  onRefreshAllData: () => void;
  showToast: (type: 'success' | 'warning' | 'info' | 'error', title: string, message?: string) => void;
}

export const SettingsBackupView: React.FC<SettingsBackupViewProps> = ({
  settings,
  students,
  holidays,
  attendanceRecords,
  onUpdateSettings,
  onRefreshAllData,
  showToast
}) => {
  // Form fields
  const [collegeName, setCollegeName] = useState(settings.collegeName);
  const [department, setDepartment] = useState(settings.department);
  const [semester, setSemester] = useState(settings.semester);
  const [academicStartDate, setAcademicStartDate] = useState(settings.academicStartDate);
  const [academicEndDate, setAcademicEndDate] = useState(settings.academicEndDate);
  const [minPercentage, setMinPercentage] = useState(settings.minAttendancePercentage || 75);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: CollegeSettings = {
      ...settings,
      collegeName: collegeName.trim(),
      department: department.trim(),
      semester: semester.trim(),
      academicStartDate,
      academicEndDate,
      minAttendancePercentage: Number(minPercentage)
    };
    onUpdateSettings(updated);
    showToast('success', 'Settings Saved', 'College calendar and academic details updated.');
  };

  const handleExportJSON = () => {
    const jsonStr = StorageService.exportDatabaseJSON();
    const dateStr = new Date().toISOString().split('T')[0];
    downloadFile(`Apex_Attendance_Backup_${dateStr}.json`, jsonStr, 'application/json');
    showToast('success', 'Backup Exported', 'Full attendance database backup saved as JSON file.');
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const success = StorageService.importDatabaseJSON(content);
        if (success) {
          onRefreshAllData();
          showToast('success', 'Database Restored', 'Attendance database imported successfully.');
        } else {
          showToast('error', 'Import Failed', 'The uploaded file does not contain a valid attendance database.');
        }
      } catch (err) {
        showToast('error', 'Import Error', 'Failed to read backup file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset all attendance data, students (59), and calendar to clean factory state? This cannot be undone.')) {
      StorageService.resetToDefaults();
      onRefreshAllData();
      showToast('info', 'System Reset', 'Restored initial 59 students, holidays, and demo attendance.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Settings & Mobile Storage Management
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure institution information, academic thresholds, and local device backup.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* College & Academic Settings Form */}
        <div className="lg:col-span-2 p-6 rounded-xl bg-white border border-slate-200">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <School className="w-5 h-5 text-blue-700" />
            <h2 className="text-base font-bold text-slate-900">College & Academic Session Settings</h2>
          </div>

          <form onSubmit={handleSaveSettings} className="mt-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  College / Institution Name *
                </label>
                <input
                  type="text"
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Department / Branch *
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Semester / Academic Term *
                </label>
                <input
                  type="text"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Minimum Attendance Threshold (%) *
                </label>
                <input
                  type="number"
                  min="50"
                  max="100"
                  value={minPercentage}
                  onChange={(e) => setMinPercentage(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                  required
                />
                <p className="text-[11px] text-slate-400 mt-0.5">Students below this % are flagged as Defaulters</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Academic Start Date *
                </label>
                <input
                  type="date"
                  value={academicStartDate}
                  onChange={(e) => setAcademicStartDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Academic End Date *
                </label>
                <input
                  type="date"
                  value={academicEndDate}
                  onChange={(e) => setAcademicEndDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                  required
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors flex items-center gap-2 shadow-xs"
              >
                <Save className="w-4 h-4" />
                <span>Save College Settings</span>
              </button>
            </div>
          </form>
        </div>

        {/* Mobile & Local Storage Backup Card */}
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-white border border-slate-200">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Database className="w-5 h-5 text-indigo-700" />
              <h2 className="text-base font-bold text-slate-900">Local Device Storage</h2>
            </div>

            <div className="mt-4 space-y-3 text-xs text-slate-600">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span>Active Enrolled Students:</span>
                <span className="font-bold text-slate-900 tabular-nums">{students.length} (Roll 1-57, 301, 302)</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span>Declared Holidays:</span>
                <span className="font-bold text-slate-900 tabular-nums">{holidays.length} Days</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span>Attendance Sessions Logged:</span>
                <span className="font-bold text-slate-900 tabular-nums">{Object.keys(attendanceRecords).length} Days</span>
              </div>
            </div>

            <div className="mt-5 space-y-2.5">
              <button
                onClick={handleExportJSON}
                className="w-full px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-2xs"
              >
                <Download className="w-4 h-4 text-slate-500" />
                <span>Export Database (.JSON Backup)</span>
              </button>

              <label className="w-full px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs">
                <Upload className="w-4 h-4 text-slate-500" />
                <span>Restore / Import Database (.JSON)</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleImportJSON}
                  className="hidden"
                />
              </label>

              <button
                onClick={handleResetDefaults}
                className="w-full px-4 py-2.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center justify-center gap-2 mt-4"
              >
                <RotateCcw className="w-4 h-4 text-rose-600" />
                <span>Reset to Factory Defaults</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
