import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Save, 
  CheckCircle, 
  XCircle, 
  Award, 
  RotateCcw, 
  Check, 
  Search, 
  Download, 
  Printer, 
  AlertTriangle,
  Palmtree,
  Edit2
} from 'lucide-react';
import { 
  Student, 
  Holiday, 
  CollegeSettings, 
  AttendanceRecord, 
  AttendanceStatus 
} from '../../types';
import { checkDateHolidayStatus } from '../../utils/attendanceCalculations';
import { exportDateAttendanceToCSV } from '../../utils/exportUtils';

interface DailyAttendanceViewProps {
  students: Student[];
  holidays: Holiday[];
  settings: CollegeSettings;
  attendanceRecords: Record<string, AttendanceRecord>;
  onSaveAttendance: (record: AttendanceRecord) => void;
  onUpdateStudentName: (rollNo: number, newName: string) => void;
  initialDate?: string;
  showToast: (type: 'success' | 'warning' | 'info' | 'error', title: string, message?: string) => void;
}

export const DailyAttendanceView: React.FC<DailyAttendanceViewProps> = ({
  students,
  holidays,
  settings,
  attendanceRecords,
  onSaveAttendance,
  onUpdateStudentName,
  initialDate,
  showToast
}) => {
  // Current selected date string 'YYYY-MM-DD'
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(initialDate || todayStr);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'P' | 'A' | 'OD' | 'UNMARKED'>('ALL');

  // In-progress attendance state: rollNo -> status
  const [currentMap, setCurrentMap] = useState<Record<number, AttendanceStatus>>({});
  const [isDirty, setIsDirty] = useState(false);

  // Inline editing of student name
  const [editingRoll, setEditingRoll] = useState<number | null>(null);
  const [editNameText, setEditNameText] = useState('');

  // Check if current date is holiday or weekend
  const holidayCheck = checkDateHolidayStatus(selectedDate, holidays, settings);

  // Load existing records for the selected date whenever date changes or records update
  useEffect(() => {
    const existing = attendanceRecords[selectedDate];
    if (existing && existing.records) {
      setCurrentMap({ ...existing.records });
      setIsDirty(false);
    } else {
      // Default initial state: all blank/unmarked
      setCurrentMap({});
      setIsDirty(false);
    }
    setEditingRoll(null);
  }, [selectedDate, attendanceRecords]);

  // Handle single student attendance change
  const handleSetStatus = (rollNo: number, status: AttendanceStatus) => {
    if (holidayCheck.isHoliday) {
      showToast('warning', 'Holiday Declared', 'Attendance cannot be marked on declared holidays or non-working days.');
      return;
    }
    setCurrentMap(prev => ({
      ...prev,
      [rollNo]: status
    }));
    setIsDirty(true);
  };

  // Bulk actions
  const handleMarkAll = (status: AttendanceStatus) => {
    if (holidayCheck.isHoliday) return;
    const next: Record<number, AttendanceStatus> = {};
    students.forEach(s => {
      next[s.rollNo] = status;
    });
    setCurrentMap(next);
    setIsDirty(true);
  };

  const handleMarkRemainingPresent = () => {
    if (holidayCheck.isHoliday) return;
    const next = { ...currentMap };
    students.forEach(s => {
      if (!next[s.rollNo]) {
        next[s.rollNo] = 'P';
      }
    });
    setCurrentMap(next);
    setIsDirty(true);
  };

  const handleClearAll = () => {
    if (holidayCheck.isHoliday) return;
    setCurrentMap({});
    setIsDirty(true);
  };

  // Save Attendance
  const handleSave = () => {
    if (holidayCheck.isHoliday) {
      showToast('error', 'Cannot Save Attendance', 'Selected date is marked as a holiday. Exclude this date from attendance.');
      return;
    }

    const record: AttendanceRecord = {
      date: selectedDate,
      records: currentMap,
      lastModified: new Date().toISOString()
    };

    onSaveAttendance(record);
    setIsDirty(false);
    showToast(
      'success',
      'Attendance Saved Successfully',
      `Attendance for ${selectedDate} (${Object.keys(currentMap).length} students recorded) has been stored persistently.`
    );
  };

  // Start editing student name
  const startEditName = (student: Student) => {
    setEditingRoll(student.rollNo);
    setEditNameText(student.name);
  };

  const saveStudentName = (rollNo: number) => {
    if (editNameText.trim().length > 0) {
      onUpdateStudentName(rollNo, editNameText.trim());
      showToast('success', 'Student Updated', `Roll ${rollNo} renamed to "${editNameText.trim()}".`);
    }
    setEditingRoll(null);
  };

  // Statistics for currently selected date
  let pCount = 0;
  let aCount = 0;
  let odCount = 0;
  let unmarkedCount = 0;

  students.forEach(s => {
    const st = currentMap[s.rollNo];
    if (st === 'P') pCount++;
    else if (st === 'A') aCount++;
    else if (st === 'OD') odCount++;
    else unmarkedCount++;
  });

  const markedTotal = pCount + aCount + odCount;
  const attendancePct = markedTotal > 0
    ? (((pCount + odCount) / markedTotal) * 100).toFixed(2)
    : '0.00';

  // Filter students by search and status
  const filteredStudents = students.filter(s => {
    const matchesSearch = 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(s.rollNo).includes(searchQuery);
    
    if (!matchesSearch) return false;

    const st = currentMap[s.rollNo];
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'P') return st === 'P';
    if (statusFilter === 'A') return st === 'A';
    if (statusFilter === 'OD') return st === 'OD';
    if (statusFilter === 'UNMARKED') return !st;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Date Header & Action Bar */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs no-print">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label htmlFor="attendance-date" className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                Select Attendance Date
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="attendance-date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3.5 py-2 text-sm font-semibold rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setSelectedDate(todayStr)}
                  className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Today
                </button>
              </div>
            </div>

            {holidayCheck.isHoliday ? (
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium">
                <Palmtree className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Declared College Holiday: <strong className="font-semibold">{holidayCheck.reason}</strong>
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Working Academic Day</span>
              </div>
            )}
          </div>

          {/* Right actions: Export, Print, Save Attendance */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => exportDateAttendanceToCSV(selectedDate, students, attendanceRecords[selectedDate], settings)}
              className="px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => window.print()}
              className="px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Sheet</span>
            </button>
            <button
              onClick={handleSave}
              disabled={holidayCheck.isHoliday}
              className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 shadow-xs transition-all ${
                holidayCheck.isHoliday
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : isDirty
                  ? 'bg-blue-600 hover:bg-blue-700 text-white ring-2 ring-blue-300'
                  : 'bg-blue-700 hover:bg-blue-800 text-white'
              }`}
            >
              <Save className="w-4 h-4" />
              <span>{isDirty ? 'Save Changes *' : 'Save Attendance'}</span>
            </button>
          </div>
        </div>

        {/* Holiday Notification Callout */}
        {holidayCheck.isHoliday && (
          <div className="mt-4 p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">Attendance Marking Disabled for College Holiday</div>
              <p className="mt-0.5 text-amber-800">
                According to college regulations, <strong>{selectedDate}</strong> is designated as <strong>{holidayCheck.reason}</strong>. 
                Holidays are automatically excluded from the total working days and cannot be counted as present or absent days.
              </p>
            </div>
          </div>
        )}

        {/* Live Counters & Summary Strip */}
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
            <div className="text-[11px] font-medium text-slate-500 uppercase">Total Students</div>
            <div className="text-xl font-bold text-slate-900 tabular-nums mt-0.5">{students.length}</div>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-100">
            <div className="text-[11px] font-medium text-emerald-700 uppercase">Present (P)</div>
            <div className="text-xl font-bold text-emerald-700 tabular-nums mt-0.5">{pCount}</div>
          </div>
          <div className="p-2.5 rounded-lg bg-rose-50/70 border border-rose-100">
            <div className="text-[11px] font-medium text-rose-700 uppercase">Absent (A)</div>
            <div className="text-xl font-bold text-rose-700 tabular-nums mt-0.5">{aCount}</div>
          </div>
          <div className="p-2.5 rounded-lg bg-sky-50/70 border border-sky-100">
            <div className="text-[11px] font-medium text-sky-700 uppercase">On Duty (OD)</div>
            <div className="text-xl font-bold text-sky-700 tabular-nums mt-0.5">{odCount}</div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
            <div className="text-[11px] font-medium text-slate-500 uppercase">Unmarked</div>
            <div className="text-xl font-bold text-slate-600 tabular-nums mt-0.5">{unmarkedCount}</div>
          </div>
        </div>
      </div>

      {/* Printable Header (Visible only when printing) */}
      <div className="print-only mb-6 border-b pb-4">
        <h1 className="text-xl font-bold text-black">{settings.collegeName}</h1>
        <p className="text-sm text-slate-700">{settings.department} · {settings.semester}</p>
        <p className="text-sm font-semibold mt-1">Daily Attendance Sheet — Date: {selectedDate}</p>
        <p className="text-xs text-slate-500">Present: {pCount} | Absent: {aCount} | OD: {odCount} | Total: {students.length}</p>
      </div>

      {/* Control Bar: Bulk Actions & Filter Bar */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 no-print flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Bulk Action Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-slate-500 font-medium mr-1">Quick Mark:</span>
          <button
            onClick={() => handleMarkAll('P')}
            disabled={holidayCheck.isHoliday}
            className="px-2.5 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors disabled:opacity-50"
          >
            All Present (P)
          </button>
          <button
            onClick={() => handleMarkAll('A')}
            disabled={holidayCheck.isHoliday}
            className="px-2.5 py-1.5 text-xs font-semibold text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md transition-colors disabled:opacity-50"
          >
            All Absent (A)
          </button>
          <button
            onClick={handleMarkRemainingPresent}
            disabled={holidayCheck.isHoliday}
            className="px-2.5 py-1.5 text-xs font-medium text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors disabled:opacity-50"
          >
            Fill Remaining as Present
          </button>
          <button
            onClick={handleClearAll}
            disabled={holidayCheck.isHoliday}
            className="px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors disabled:opacity-50 flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear</span>
          </button>
        </div>

        {/* Search & Status Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search roll or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-600 w-44"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            {(['ALL', 'P', 'A', 'OD', 'UNMARKED'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                  statusFilter === tab
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab === 'ALL' ? 'All (59)' : tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 59 Students Attendance Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wide">
              <tr>
                <th className="py-3 px-4 w-20 text-center">Roll No</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4 hidden sm:table-cell">Admission / Category</th>
                <th className="py-3 px-4 text-center w-64">Attendance Status</th>
                <th className="py-3 px-4 text-center w-24">Current</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 text-sm">
                    No students matching search filter "{searchQuery}".
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const currentStatus = currentMap[student.rollNo];
                  const isLateral = student.rollNo === 301 || student.rollNo === 302;
                  const isEditingThis = editingRoll === student.rollNo;

                  return (
                    <tr 
                      key={student.rollNo}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      {/* Roll Number */}
                      <td className="py-2.5 px-4 text-center font-bold text-slate-800 font-mono tabular-nums">
                        {student.rollNo}
                      </td>

                      {/* Student Name (Editable) */}
                      <td className="py-2.5 px-4">
                        {isEditingThis ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editNameText}
                              onChange={(e) => setEditNameText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveStudentName(student.rollNo);
                                if (e.key === 'Escape') setEditingRoll(null);
                              }}
                              autoFocus
                              className="px-2 py-1 text-sm border border-blue-500 rounded bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                            />
                            <button
                              onClick={() => saveStudentName(student.rollNo)}
                              className="px-2 py-1 text-xs bg-emerald-600 text-white rounded hover:bg-emerald-700 font-medium"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingRoll(null)}
                              className="px-2 py-1 text-xs bg-slate-200 text-slate-700 rounded hover:bg-slate-300 font-medium"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 group">
                            <span className="font-semibold text-slate-900">{student.name}</span>
                            <button
                              onClick={() => startEditName(student)}
                              className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-blue-600 p-1 rounded transition-opacity no-print"
                              title="Edit student name"
                              aria-label="Edit student name"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Admission Type / Category */}
                      <td className="py-2.5 px-4 hidden sm:table-cell text-xs text-slate-500">
                        {isLateral ? (
                          <span className="font-medium text-indigo-700">Lateral Entry</span>
                        ) : (
                          <span className="text-slate-500">Regular</span>
                        )}
                      </td>

                      {/* Status Selector: P, A, OD */}
                      <td className="py-2.5 px-4">
                        <div className="flex items-center justify-center gap-1.5 no-print">
                          {/* Present (P) */}
                          <button
                            type="button"
                            onClick={() => handleSetStatus(student.rollNo, 'P')}
                            disabled={holidayCheck.isHoliday}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                              currentStatus === 'P'
                                ? 'bg-emerald-600 text-white shadow-xs scale-102 ring-2 ring-emerald-300'
                                : 'bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700'
                            } disabled:opacity-40 disabled:cursor-not-allowed`}
                            title="Mark Present"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>P</span>
                          </button>

                          {/* Absent (A) */}
                          <button
                            type="button"
                            onClick={() => handleSetStatus(student.rollNo, 'A')}
                            disabled={holidayCheck.isHoliday}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                              currentStatus === 'A'
                                ? 'bg-rose-600 text-white shadow-xs scale-102 ring-2 ring-rose-300'
                                : 'bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700'
                            } disabled:opacity-40 disabled:cursor-not-allowed`}
                            title="Mark Absent"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>A</span>
                          </button>

                          {/* On Duty (OD) */}
                          <button
                            type="button"
                            onClick={() => handleSetStatus(student.rollNo, 'OD')}
                            disabled={holidayCheck.isHoliday}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                              currentStatus === 'OD'
                                ? 'bg-sky-600 text-white shadow-xs scale-102 ring-2 ring-sky-300'
                                : 'bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-700'
                            } disabled:opacity-40 disabled:cursor-not-allowed`}
                            title="Mark On Duty"
                          >
                            <Award className="w-3.5 h-3.5" />
                            <span>OD</span>
                          </button>
                        </div>

                        {/* Print representation */}
                        <div className="print-only text-center font-bold font-mono">
                          {currentStatus || '—'}
                        </div>
                      </td>

                      {/* Current Status Label Badge */}
                      <td className="py-2.5 px-4 text-center">
                        {currentStatus === 'P' && (
                          <span className="inline-block text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            Present
                          </span>
                        )}
                        {currentStatus === 'A' && (
                          <span className="inline-block text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            Absent
                          </span>
                        )}
                        {currentStatus === 'OD' && (
                          <span className="inline-block text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                            On Duty
                          </span>
                        )}
                        {!currentStatus && (
                          <span className="inline-block text-xs text-slate-400 font-medium">
                            Unmarked
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom Save Bar (Sticky on mobile) */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
          <div className="text-xs text-slate-500">
            Showing {filteredStudents.length} of {students.length} students (Roll 1-57, 301, 302).
          </div>
          <button
            onClick={handleSave}
            disabled={holidayCheck.isHoliday}
            className={`px-5 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 shadow-xs transition-all ${
              holidayCheck.isHoliday
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <Save className="w-4 h-4" />
            <span>Save All 59 Student Records</span>
          </button>
        </div>
      </div>
    </div>
  );
};
