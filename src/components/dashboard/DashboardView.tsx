import React from 'react';
import { 
  Users, 
  Calendar, 
  UserCheck, 
  UserX, 
  Award, 
  Palmtree, 
  Percent, 
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { 
  Student, 
  Holiday, 
  CollegeSettings, 
  AttendanceRecord 
} from '../../types';
import { 
  checkDateHolidayStatus, 
  calculateCumulativeStats,
  calculateMonthlyStats
} from '../../utils/attendanceCalculations';
import { StatCard } from '../common/StatCard';

interface DashboardViewProps {
  students: Student[];
  holidays: Holiday[];
  settings: CollegeSettings;
  attendanceRecords: Record<string, AttendanceRecord>;
  onNavigate: (tab: string, dateParam?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  students,
  holidays,
  settings,
  attendanceRecords,
  onNavigate
}) => {
  // Use today's date or the last marked working date for seamless demo
  const todayObj = new Date();
  const todayStr = todayObj.toISOString().split('T')[0];
  
  // Check today's holiday status
  const todayHolidayCheck = checkDateHolidayStatus(todayStr, holidays, settings);

  // Today's attendance record (if taken)
  const todayRecord = attendanceRecords[todayStr];
  let todayP = 0;
  let todayA = 0;
  let todayOD = 0;
  let todayUnmarked = students.length;

  if (todayRecord && todayRecord.records) {
    todayUnmarked = 0;
    students.forEach(s => {
      const status = todayRecord.records[s.rollNo];
      if (status === 'P') todayP++;
      else if (status === 'A') todayA++;
      else if (status === 'OD') todayOD++;
      else todayUnmarked++;
    });
  }

  // Calculate Cumulative Stats for the semester
  const cumulative = calculateCumulativeStats(
    students,
    attendanceRecords,
    holidays,
    settings,
    settings.academicStartDate,
    todayStr
  );

  // Calculate Monthly Stats for current month
  const currentYear = todayObj.getFullYear();
  const currentMonth = todayObj.getMonth() + 1;
  const currentMonthName = todayObj.toLocaleString('default', { month: 'long' });
  const monthly = calculateMonthlyStats(
    students,
    attendanceRecords,
    holidays,
    settings,
    currentYear,
    currentMonth
  );

  // Compute overall class average attendance percentage
  const totalCumWorkingDays = cumulative.totalWorkingDays;
  let totalStudentDays = 0;
  let totalAttendedDays = 0;
  let defaultersCount = 0;

  cumulative.stats.forEach(s => {
    if (s.isDefaulter) defaultersCount++;
    totalStudentDays += s.totalWorkingDays;
    totalAttendedDays += (s.presentDays + s.onDutyDays);
  });

  const overallClassAvg = totalStudentDays > 0 
    ? Number(((totalAttendedDays / totalStudentDays) * 100).toFixed(2)) 
    : 0;

  // Recent attendance dates list
  const pastRecordedDates = Object.keys(attendanceRecords)
    .sort()
    .reverse()
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-blue-200 font-semibold">
              Academic Attendance Console
            </div>
            <h1 className="text-2xl font-bold mt-1 text-white">
              {settings.collegeName}
            </h1>
            <p className="text-sm text-slate-300 mt-1">
              {settings.department} · {settings.semester}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onNavigate('daily', todayStr)}
              className="px-4 py-2 text-sm font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2 shadow-xs shrink-0"
            >
              <span>Take Today's Attendance</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Today's Status Banner */}
      <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg ${
              todayHolidayCheck.isHoliday ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
            }`}>
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">
                Today's Working Status ({new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })})
              </div>
              <div className="text-base font-bold text-slate-900 flex items-center gap-2 mt-0.5">
                {todayHolidayCheck.isHoliday ? (
                  <span className="text-amber-700 flex items-center gap-1.5">
                    <Palmtree className="w-4 h-4" />
                    College Holiday: {todayHolidayCheck.reason}
                  </span>
                ) : (
                  <span className="text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Official Working Academic Day
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {todayRecord ? (
              <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-md border border-emerald-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Attendance Logged ({todayP} Present, {todayA} Absent, {todayOD} OD)
              </span>
            ) : todayHolidayCheck.isHoliday ? (
              <span className="text-xs font-medium text-amber-700 bg-amber-50 px-3 py-1.5 rounded-md border border-amber-200">
                Excluded from Working Days
              </span>
            ) : (
              <button
                onClick={() => onNavigate('daily', todayStr)}
                className="text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md border border-blue-200 transition-colors"
              >
                Pending - Mark Now
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Enrolled"
          value={students.length}
          subtext="Roll 1-57, 301, 302"
          icon={<Users className="w-5 h-5" />}
        />
        <StatCard
          label="Overall Class Attendance"
          value={`${overallClassAvg.toFixed(2)}%`}
          subtext={`Avg across ${totalCumWorkingDays} working days`}
          icon={<Percent className="w-5 h-5" />}
          accent={overallClassAvg >= 75 ? 'emerald' : 'rose'}
        />
        <StatCard
          label="Declared Holidays"
          value={holidays.length}
          subtext="Excluded from working days"
          icon={<Palmtree className="w-5 h-5" />}
          accent="amber"
        />
        <StatCard
          label="Attendance Shortage"
          value={defaultersCount}
          subtext={`Below ${settings.minAttendancePercentage}% threshold`}
          icon={<AlertTriangle className="w-5 h-5" />}
          accent={defaultersCount > 0 ? 'rose' : 'emerald'}
        />
      </div>

      {/* Today's Breakdown + Monthly Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Roll Breakdown */}
        <div className="p-5 rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Today's Attendance Breakdown</h3>
              <p className="text-xs text-slate-500 mt-0.5">{todayStr}</p>
            </div>
            <button
              onClick={() => onNavigate('daily', todayStr)}
              className="text-xs font-semibold text-blue-700 hover:text-blue-900"
            >
              Open Sheet →
            </button>
          </div>

          {todayRecord ? (
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50/60 border border-emerald-100 text-sm">
                <span className="flex items-center gap-2 font-medium text-emerald-900">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  Present Students
                </span>
                <span className="font-bold text-emerald-700 tabular-nums">{todayP}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-rose-50/60 border border-rose-100 text-sm">
                <span className="flex items-center gap-2 font-medium text-rose-900">
                  <UserX className="w-4 h-4 text-rose-600" />
                  Absent Students
                </span>
                <span className="font-bold text-rose-700 tabular-nums">{todayA}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-sky-50/60 border border-sky-100 text-sm">
                <span className="flex items-center gap-2 font-medium text-sky-900">
                  <Award className="w-4 h-4 text-sky-600" />
                  On Duty (OD)
                </span>
                <span className="font-bold text-sky-700 tabular-nums">{todayOD}</span>
              </div>
              {todayUnmarked > 0 && (
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
                  <span>Unmarked</span>
                  <span className="font-bold tabular-nums">{todayUnmarked}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-500">
              <Clock className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-medium">No attendance recorded today yet</p>
              <button
                onClick={() => onNavigate('daily', todayStr)}
                className="mt-3 px-3 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-md transition-colors"
              >
                Mark Attendance Now
              </button>
            </div>
          )}
        </div>

        {/* Current Month Summary */}
        <div className="p-5 rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">{currentMonthName} {currentYear} Summary</h3>
              <p className="text-xs text-slate-500 mt-0.5">Monthly Attendance Analytics</p>
            </div>
            <button
              onClick={() => onNavigate('monthly')}
              className="text-xs font-semibold text-blue-700 hover:text-blue-900"
            >
              Full Report →
            </button>
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between text-sm py-1 border-b border-slate-100">
              <span className="text-slate-600">Total Working Days</span>
              <span className="font-bold text-slate-900 tabular-nums">{monthly.totalWorkingDays} days</span>
            </div>
            <div className="flex items-center justify-between text-sm py-1 border-b border-slate-100">
              <span className="text-slate-600">Holidays in Month</span>
              <span className="font-semibold text-amber-700 tabular-nums">
                {holidays.filter(h => h.date.startsWith(`${currentYear}-${String(currentMonth).padStart(2, '0')}`)).length} days
              </span>
            </div>
            <div className="flex items-center justify-between text-sm py-1 border-b border-slate-100">
              <span className="text-slate-600">Average Student %</span>
              <span className="font-bold text-blue-700 tabular-nums">
                {(
                  monthly.stats.reduce((acc, curr) => acc + curr.attendancePercentage, 0) /
                  (monthly.stats.length || 1)
                ).toFixed(2)}%
              </span>
            </div>
            <div className="flex items-center justify-between text-sm py-1">
              <span className="text-slate-600">Shortage in {currentMonthName}</span>
              <span className={`font-bold tabular-nums ${
                monthly.stats.filter(s => s.isDefaulter).length > 0 ? 'text-rose-600' : 'text-emerald-600'
              }`}>
                {monthly.stats.filter(s => s.isDefaulter).length} Students
              </span>
            </div>
          </div>
        </div>

        {/* Cumulative Semester Summary */}
        <div className="p-5 rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Cumulative Semester Report</h3>
              <p className="text-xs text-slate-500 mt-0.5">From {settings.academicStartDate} to Today</p>
            </div>
            <button
              onClick={() => onNavigate('cumulative')}
              className="text-xs font-semibold text-blue-700 hover:text-blue-900"
            >
              Full Report →
            </button>
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between text-sm py-1 border-b border-slate-100">
              <span className="text-slate-600">Cumulative Valid Days</span>
              <span className="font-bold text-slate-900 tabular-nums">{cumulative.totalWorkingDays} days</span>
            </div>
            <div className="flex items-center justify-between text-sm py-1 border-b border-slate-100">
              <span className="text-slate-600">Attendance Defaulters (&lt;75%)</span>
              <span className="font-bold text-rose-600 tabular-nums">{defaultersCount} students</span>
            </div>
            <div className="flex items-center justify-between text-sm py-1 border-b border-slate-100">
              <span className="text-slate-600">Eligible for Exams</span>
              <span className="font-semibold text-emerald-700 tabular-nums">
                {students.length - defaultersCount} / {students.length}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm py-1">
              <span className="text-slate-600">Strict Attendance Policy</span>
              <span className="text-xs font-semibold text-slate-800">75% Mandatory</span>
            </div>
          </div>
        </div>
      </div>

      {/* Defaulter / Shortage Warning List (if any) */}
      {defaultersCount > 0 && (
        <div className="p-5 rounded-xl border border-rose-200 bg-white">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Attendance Shortage Alert: Students Below 75%
              </h3>
            </div>
            <button
              onClick={() => onNavigate('cumulative')}
              className="text-xs font-medium text-rose-700 hover:text-rose-900"
            >
              View Full Cumulative Analysis →
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {cumulative.stats
              .filter(s => s.isDefaulter)
              .slice(0, 8)
              .map(student => (
                <div
                  key={student.rollNo}
                  className="p-3 rounded-lg border border-rose-200 bg-rose-50/40 flex items-center justify-between"
                >
                  <div className="min-w-0 pr-2">
                    <div className="text-xs text-rose-900 font-semibold truncate">
                      Roll {student.rollNo}: {student.name}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Attended: {student.presentDays + student.onDutyDays} / {student.totalWorkingDays} days
                    </div>
                  </div>
                  <div className="text-sm font-bold text-rose-700 tabular-nums shrink-0">
                    {student.attendancePercentage.toFixed(2)}%
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Quick History Log */}
      <div className="p-5 rounded-xl border border-slate-200 bg-white">
        <h3 className="text-sm font-bold text-slate-900 mb-3">Recently Logged Attendance Days</h3>
        <div className="divide-y divide-slate-100">
          {pastRecordedDates.map(date => {
            const rec = attendanceRecords[date];
            const isHol = checkDateHolidayStatus(date, holidays, settings);
            let p = 0;
            let a = 0;
            let od = 0;
            if (rec && rec.records) {
              Object.values(rec.records).forEach(st => {
                if (st === 'P') p++;
                else if (st === 'A') a++;
                else if (st === 'OD') od++;
              });
            }
            return (
              <div key={date} className="py-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                    <span>{date}</span>
                    {isHol.isHoliday && (
                      <span className="text-xs text-amber-700 font-normal">
                        ({isHol.reason} - Excluded from Working Days)
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {p} Present · {a} Absent · {od} On Duty
                  </div>
                </div>
                <button
                  onClick={() => onNavigate('daily', date)}
                  className="px-3 py-1.5 text-xs font-semibold text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  Edit / View Sheet
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
