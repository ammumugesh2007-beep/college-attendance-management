import React, { useState } from 'react';
import { 
  CalendarDays, 
  Download, 
  Printer, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Palmtree,
  Filter
} from 'lucide-react';
import { Student, Holiday, CollegeSettings, AttendanceRecord } from '../../types';
import { calculateMonthlyStats } from '../../utils/attendanceCalculations';
import { exportMonthlyReportToCSV } from '../../utils/exportUtils';

interface MonthlyReportViewProps {
  students: Student[];
  holidays: Holiday[];
  settings: CollegeSettings;
  attendanceRecords: Record<string, AttendanceRecord>;
  showToast: (type: 'success' | 'warning' | 'info' | 'error', title: string, message?: string) => void;
}

export const MonthlyReportView: React.FC<MonthlyReportViewProps> = ({
  students,
  holidays,
  settings,
  attendanceRecords,
  showToast
}) => {
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1);
  const [searchQuery, setSearchQuery] = useState('');
  const [defaulterFilter, setDefaulterFilter] = useState<'ALL' | 'DEFAULTERS' | 'ELIGIBLE'>('ALL');

  // Month names
  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  const monthLabel = months.find(m => m.value === selectedMonth)?.label || 'Month';

  // Calculate monthly stats
  const { stats, workingDates, totalWorkingDays } = calculateMonthlyStats(
    students,
    attendanceRecords,
    holidays,
    settings,
    selectedYear,
    selectedMonth
  );

  // Holidays in selected month
  const monthPrefix = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
  const holidaysInMonth = holidays.filter(h => h.date.startsWith(monthPrefix));

  // Shortage / Defaulter count
  const defaultersCount = stats.filter(s => s.isDefaulter).length;

  // Filter list
  const filteredStats = stats.filter(s => {
    const matchesSearch = 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(s.rollNo).includes(searchQuery);
    
    if (!matchesSearch) return false;

    if (defaulterFilter === 'DEFAULTERS') return s.isDefaulter;
    if (defaulterFilter === 'ELIGIBLE') return !s.isDefaulter;
    return true;
  });

  const handleExportCSV = () => {
    exportMonthlyReportToCSV(stats, monthLabel, selectedYear, settings);
    showToast('success', 'Export Complete', `Downloaded monthly report for ${monthLabel} ${selectedYear}.`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Selectors */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs no-print">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
              Official Monthly Register
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-0.5">
              Monthly Attendance Report — {monthLabel} {selectedYear}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Automated holiday exclusions applied. Minimum required attendance: {settings.minAttendancePercentage}%.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Month & Year Pickers */}
            <div className="flex items-center gap-2">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {months.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>

              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {[2025, 2026, 2027, 2028].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Report</span>
            </button>
          </div>
        </div>

        {/* Working Days & Holidays Indicator */}
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
            <div className="text-[11px] font-medium text-slate-500 uppercase">Total Working Days</div>
            <div className="text-xl font-bold text-slate-900 tabular-nums mt-0.5">
              {totalWorkingDays} <span className="text-xs font-normal text-slate-500">Days</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Holidays fully excluded</div>
          </div>

          <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-100">
            <div className="text-[11px] font-medium text-amber-700 uppercase">College Holidays</div>
            <div className="text-xl font-bold text-amber-700 tabular-nums mt-0.5">
              {holidaysInMonth.length} <span className="text-xs font-normal text-amber-600">Days</span>
            </div>
            <div className="text-[10px] text-amber-600 mt-0.5">Excluded from calculations</div>
          </div>

          <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-100">
            <div className="text-[11px] font-medium text-emerald-700 uppercase">Eligible (&ge;75%)</div>
            <div className="text-xl font-bold text-emerald-700 tabular-nums mt-0.5">
              {students.length - defaultersCount} <span className="text-xs font-normal text-emerald-600">Students</span>
            </div>
            <div className="text-[10px] text-emerald-600 mt-0.5">Qualified for examinations</div>
          </div>

          <div className="p-2.5 rounded-lg bg-rose-50/70 border border-rose-100">
            <div className="text-[11px] font-medium text-rose-700 uppercase">Shortage (&lt;75%)</div>
            <div className="text-xl font-bold text-rose-700 tabular-nums mt-0.5">
              {defaultersCount} <span className="text-xs font-normal text-rose-600">Students</span>
            </div>
            <div className="text-[10px] text-rose-600 mt-0.5">Requires condonation review</div>
          </div>
        </div>

        {/* Holidays list chip view */}
        {holidaysInMonth.length > 0 && (
          <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 flex flex-wrap items-center gap-2">
            <span className="font-semibold text-slate-700 flex items-center gap-1">
              <Palmtree className="w-3.5 h-3.5 text-amber-600" />
              Holidays in {monthLabel}:
            </span>
            {holidaysInMonth.map(h => (
              <span key={h.id} className="text-slate-600">
                {h.date.split('-')[2]} {monthLabel.slice(0, 3)}: {h.name} ({h.reason}) ·
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Printable Report Header */}
      <div className="print-only mb-6 border-b pb-4">
        <h1 className="text-2xl font-bold text-black">{settings.collegeName}</h1>
        <p className="text-sm text-slate-700">{settings.department} · {settings.semester}</p>
        <p className="text-base font-semibold mt-2">
          Monthly Attendance Register — {monthLabel} {selectedYear}
        </p>
        <p className="text-xs text-slate-500">
          Total Working Days: {totalWorkingDays} | Minimum Attendance Requirement: {settings.minAttendancePercentage}% | Total Students: {students.length}
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name or roll number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setDefaulterFilter('ALL')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              defaulterFilter === 'ALL'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Students (59)
          </button>
          <button
            onClick={() => setDefaulterFilter('DEFAULTERS')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              defaulterFilter === 'DEFAULTERS'
                ? 'bg-rose-50 text-rose-800 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-rose-700'
            }`}
          >
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            <span>Shortage &lt;75% ({defaultersCount})</span>
          </button>
          <button
            onClick={() => setDefaulterFilter('ELIGIBLE')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              defaulterFilter === 'ELIGIBLE'
                ? 'bg-emerald-50 text-emerald-800 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-emerald-700'
            }`}
          >
            Eligible &ge;75%
          </button>
        </div>
      </div>

      {/* Monthly Attendance Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wide">
              <tr>
                <th className="py-3 px-4 w-20 text-center">Roll No</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4 text-center">Total Working Days</th>
                <th className="py-3 px-4 text-center text-emerald-700">Present Days</th>
                <th className="py-3 px-4 text-center text-rose-700">Absent Days</th>
                <th className="py-3 px-4 text-center text-sky-700">On-Duty Days</th>
                <th className="py-3 px-4 text-center">Attendance %</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {totalWorkingDays === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <CalendarDays className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="text-sm font-semibold text-slate-700">
                      No working days recorded for {monthLabel} {selectedYear}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Attendance percentage displays 0.00% or N/A when there are no valid working days.
                    </p>
                  </td>
                </tr>
              ) : filteredStats.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 text-sm">
                    No students match the current filters.
                  </td>
                </tr>
              ) : (
                filteredStats.map(student => {
                  const isShortage = student.isDefaulter;

                  return (
                    <tr 
                      key={student.rollNo}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isShortage ? 'bg-rose-50/20' : ''
                      }`}
                    >
                      {/* Roll No */}
                      <td className="py-3 px-4 text-center font-mono font-bold text-slate-900 tabular-nums">
                        {student.rollNo}
                      </td>

                      {/* Student Name */}
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {student.name}
                      </td>

                      {/* Total Working Days */}
                      <td className="py-3 px-4 text-center font-medium text-slate-700 tabular-nums">
                        {student.totalWorkingDays}
                      </td>

                      {/* Present Days */}
                      <td className="py-3 px-4 text-center font-bold text-emerald-700 tabular-nums">
                        {student.presentDays}
                      </td>

                      {/* Absent Days */}
                      <td className="py-3 px-4 text-center font-bold text-rose-700 tabular-nums">
                        {student.absentDays}
                      </td>

                      {/* On-Duty Days */}
                      <td className="py-3 px-4 text-center font-bold text-sky-700 tabular-nums">
                        {student.onDutyDays}
                      </td>

                      {/* Attendance Percentage */}
                      <td className="py-3 px-4 text-center tabular-nums">
                        <span className={`font-bold text-base ${
                          isShortage ? 'text-rose-700' : 'text-slate-900'
                        }`}>
                          {student.totalWorkingDays > 0 ? `${student.attendancePercentage.toFixed(2)}%` : '0.00%'}
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 px-4 text-center">
                        {isShortage ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Shortage (&lt;75%)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Eligible</span>
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

        {/* Footer Notes */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span>Formula: Attendance % = (Present Days + On-Duty Days) / Total Working Days × 100</span>
          <span>College holidays are strictly excluded from total working days.</span>
        </div>
      </div>
    </div>
  );
};
