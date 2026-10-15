import { 
  Student, 
  Holiday, 
  CollegeSettings, 
  AttendanceRecord, 
  StudentAttendanceStats, 
  DailySummary 
} from '../types';

/**
 * Checks if a specific date string (YYYY-MM-DD) is a college holiday or configured weekend.
 */
export function checkDateHolidayStatus(
  dateStr: string,
  holidays: Holiday[],
  settings?: CollegeSettings
): { isHoliday: boolean; holiday?: Holiday; isWeekend: boolean; reason?: string } {
  // 1. Direct college holiday match
  const holiday = holidays.find(h => h.date === dateStr);
  if (holiday) {
    return {
      isHoliday: true,
      holiday,
      isWeekend: false,
      reason: `${holiday.name} (${holiday.reason})`
    };
  }

  // 2. Weekend match according to settings
  if (settings && settings.weekendDays) {
    const parts = dateStr.split('-').map(Number);
    const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
    const dayOfWeek = dateObj.getDay(); // 0 is Sunday, 6 is Saturday
    if (settings.weekendDays.includes(dayOfWeek)) {
      const dayName = dayOfWeek === 0 ? 'Sunday' : dayOfWeek === 6 ? 'Saturday' : 'Weekend';
      return {
        isHoliday: true,
        isWeekend: true,
        reason: `${dayName} (Weekly Off)`
      };
    }
  }

  return { isHoliday: false, isWeekend: false };
}

/**
 * Filters out any dates that are declared holidays or configured non-working weekends.
 * Ensures if a holiday is declared after attendance was entered, that date is excluded.
 */
export function getNonHolidayDates(
  dates: string[],
  holidays: Holiday[],
  settings?: CollegeSettings
): string[] {
  return dates.filter(date => {
    const status = checkDateHolidayStatus(date, holidays, settings);
    return !status.isHoliday;
  });
}

/**
 * Computes monthly attendance statistics for each student.
 * Excludes all college holidays from the working-day count.
 * Formula: Attendance Percentage = (Present Days + On-Duty Days) / Total Working Days * 100
 */
export function calculateMonthlyStats(
  students: Student[],
  allRecords: Record<string, AttendanceRecord>,
  holidays: Holiday[],
  settings: CollegeSettings,
  year: number,
  month: number // 1-indexed (1 to 12)
): { stats: StudentAttendanceStats[]; workingDates: string[]; totalWorkingDays: number } {
  // Find all attendance records falling in this month/year
  const monthPrefix = `${year}-${String(month).padStart(2, '0')}`;
  
  // All recorded dates in this month
  const recordedMonthDates = Object.keys(allRecords).filter(d => d.startsWith(monthPrefix));
  
  // Filter out any date that is declared a holiday or weekend
  const validWorkingDates = getNonHolidayDates(recordedMonthDates, holidays, settings).sort();
  const totalWorkingDays = validWorkingDates.length;

  const stats: StudentAttendanceStats[] = students.map(student => {
    let presentDays = 0;
    let absentDays = 0;
    let onDutyDays = 0;

    validWorkingDates.forEach(date => {
      const dayRecord = allRecords[date];
      if (dayRecord && dayRecord.records) {
        const status = dayRecord.records[student.rollNo];
        if (status === 'P') presentDays++;
        else if (status === 'A') absentDays++;
        else if (status === 'OD') onDutyDays++;
      }
    });

    // Attendance % = (P + OD) / Total Working Days * 100
    let attendancePercentage = 0;
    if (totalWorkingDays > 0) {
      attendancePercentage = Number((((presentDays + onDutyDays) / totalWorkingDays) * 100).toFixed(2));
    }

    return {
      rollNo: student.rollNo,
      name: student.name,
      totalWorkingDays,
      presentDays,
      absentDays,
      onDutyDays,
      attendancePercentage,
      isDefaulter: totalWorkingDays > 0 && attendancePercentage < (settings.minAttendancePercentage || 75)
    };
  });

  return { stats, workingDates: validWorkingDates, totalWorkingDays };
}

/**
 * Computes cumulative attendance statistics from an academic start date to a specified end date.
 * Excludes holidays and dates outside the academic period.
 */
export function calculateCumulativeStats(
  students: Student[],
  allRecords: Record<string, AttendanceRecord>,
  holidays: Holiday[],
  settings: CollegeSettings,
  startDateStr: string,
  endDateStr: string
): { stats: StudentAttendanceStats[]; cumulativeWorkingDates: string[]; totalWorkingDays: number } {
  // Find all recorded dates within [startDateStr, endDateStr]
  const recordedDates = Object.keys(allRecords).filter(date => {
    return date >= startDateStr && date <= endDateStr;
  });

  // Filter out any date that is a holiday or weekend
  const validWorkingDates = getNonHolidayDates(recordedDates, holidays, settings).sort();
  const totalWorkingDays = validWorkingDates.length;

  const stats: StudentAttendanceStats[] = students.map(student => {
    let presentDays = 0;
    let absentDays = 0;
    let onDutyDays = 0;

    validWorkingDates.forEach(date => {
      const dayRecord = allRecords[date];
      if (dayRecord && dayRecord.records) {
        const status = dayRecord.records[student.rollNo];
        if (status === 'P') presentDays++;
        else if (status === 'A') absentDays++;
        else if (status === 'OD') onDutyDays++;
      }
    });

    let attendancePercentage = 0;
    if (totalWorkingDays > 0) {
      attendancePercentage = Number((((presentDays + onDutyDays) / totalWorkingDays) * 100).toFixed(2));
    }

    return {
      rollNo: student.rollNo,
      name: student.name,
      totalWorkingDays,
      presentDays,
      absentDays,
      onDutyDays,
      attendancePercentage,
      isDefaulter: totalWorkingDays > 0 && attendancePercentage < (settings.minAttendancePercentage || 75)
    };
  });

  return { stats, cumulativeWorkingDates: validWorkingDates, totalWorkingDays };
}

/**
 * Calculates summary for a single selected date
 */
export function calculateDailySummary(
  dateStr: string,
  students: Student[],
  allRecords: Record<string, AttendanceRecord>,
  holidays: Holiday[],
  settings: CollegeSettings
): DailySummary {
  const holidayCheck = checkDateHolidayStatus(dateStr, holidays, settings);
  const totalStudents = students.length;

  if (holidayCheck.isHoliday) {
    return {
      date: dateStr,
      isHoliday: true,
      holidayName: holidayCheck.reason || 'Declared Holiday',
      totalStudents,
      presentCount: 0,
      absentCount: 0,
      onDutyCount: 0,
      unmarkedCount: 0,
      attendancePercentage: 0
    };
  }

  const dayRecord = allRecords[dateStr];
  let presentCount = 0;
  let absentCount = 0;
  let onDutyCount = 0;
  let unmarkedCount = totalStudents;

  if (dayRecord && dayRecord.records) {
    unmarkedCount = 0;
    students.forEach(s => {
      const status = dayRecord.records[s.rollNo];
      if (status === 'P') presentCount++;
      else if (status === 'A') absentCount++;
      else if (status === 'OD') onDutyCount++;
      else unmarkedCount++;
    });
  }

  const markedTotal = presentCount + absentCount + onDutyCount;
  const attendancePercentage = markedTotal > 0
    ? Number((((presentCount + onDutyCount) / markedTotal) * 100).toFixed(2))
    : 0;

  return {
    date: dateStr,
    isHoliday: false,
    totalStudents,
    presentCount,
    absentCount,
    onDutyCount,
    unmarkedCount,
    attendancePercentage
  };
}
