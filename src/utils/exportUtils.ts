import { StudentAttendanceStats, AttendanceRecord, Student, CollegeSettings } from '../types';

/**
 * Downloads a string content as a file in browser
 */
export function downloadFile(filename: string, content: string, mimeType: string = 'text/csv;charset=utf-8;'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export Monthly Attendance Report to CSV / Excel
 */
export function exportMonthlyReportToCSV(
  stats: StudentAttendanceStats[],
  monthName: string,
  year: number,
  settings: CollegeSettings
): void {
  const headers = [
    'Roll Number',
    'Student Name',
    'Total Working Days',
    'Present Days',
    'Absent Days',
    'On-Duty Days',
    'Attendance %',
    'Status (<75%)'
  ];

  const metaRows = [
    `"${settings.collegeName}"`,
    `"${settings.department}"`,
    `"Monthly Attendance Report: ${monthName} ${year}"`,
    `"Minimum Attendance Required: ${settings.minAttendancePercentage}%"`,
    `"Generated On: ${new Date().toLocaleString()}"`,
    ''
  ];

  const dataRows = stats.map(s => [
    s.rollNo,
    `"${s.name.replace(/"/g, '""')}"`,
    s.totalWorkingDays,
    s.presentDays,
    s.absentDays,
    s.onDutyDays,
    `${s.attendancePercentage.toFixed(2)}%`,
    s.isDefaulter ? 'SHORTAGE (<75%)' : 'Eligible'
  ].join(','));

  // Prepend UTF-8 Byte Order Mark (BOM) \uFEFF for seamless Excel compatibility
  const csvContent = '\uFEFF' + metaRows.join('\n') + '\n' + headers.join(',') + '\n' + dataRows.join('\n');
  const filename = `Attendance_Report_${monthName}_${year}.csv`;
  downloadFile(filename, csvContent, 'text/csv;charset=utf-8;');
}

/**
 * Export Cumulative Attendance Report to CSV / Excel
 */
export function exportCumulativeReportToCSV(
  stats: StudentAttendanceStats[],
  startDate: string,
  endDate: string,
  settings: CollegeSettings
): void {
  const headers = [
    'Roll Number',
    'Student Name',
    'Cumulative Working Days',
    'Cumulative Present Days',
    'Cumulative Absent Days',
    'Cumulative On-Duty Days',
    'Cumulative Attendance %',
    'Defaulter Status'
  ];

  const metaRows = [
    `"${settings.collegeName}"`,
    `"${settings.department}"`,
    `"Cumulative Attendance Report: ${startDate} to ${endDate}"`,
    `"Academic Period: ${settings.academicStartDate} to ${settings.academicEndDate}"`,
    `"Minimum Attendance Required: ${settings.minAttendancePercentage}%"`,
    `"Generated On: ${new Date().toLocaleString()}"`,
    ''
  ];

  const dataRows = stats.map(s => [
    s.rollNo,
    `"${s.name.replace(/"/g, '""')}"`,
    s.totalWorkingDays,
    s.presentDays,
    s.absentDays,
    s.onDutyDays,
    `${s.attendancePercentage.toFixed(2)}%`,
    s.isDefaulter ? 'SHORTAGE (<75%)' : 'Eligible'
  ].join(','));

  const csvContent = '\uFEFF' + metaRows.join('\n') + '\n' + headers.join(',') + '\n' + dataRows.join('\n');
  const filename = `Cumulative_Attendance_${startDate}_to_${endDate}.csv`;
  downloadFile(filename, csvContent, 'text/csv;charset=utf-8;');
}

/**
 * Export Single Date Attendance to CSV
 */
export function exportDateAttendanceToCSV(
  dateStr: string,
  students: Student[],
  record: AttendanceRecord | undefined,
  settings: CollegeSettings
): void {
  const headers = ['Roll Number', 'Student Name', 'Status (P/A/OD)', 'Status Label'];
  const statusLabels: Record<string, string> = {
    P: 'Present',
    A: 'Absent',
    OD: 'On Duty'
  };

  const metaRows = [
    `"${settings.collegeName}"`,
    `"${settings.department}"`,
    `"Daily Attendance Sheet: ${dateStr}"`,
    `"Generated On: ${new Date().toLocaleString()}"`,
    ''
  ];

  const dataRows = students.map(s => {
    const status = record?.records?.[s.rollNo] || 'Unmarked';
    return [
      s.rollNo,
      `"${s.name.replace(/"/g, '""')}"`,
      status,
      statusLabels[status] || 'Unmarked'
    ].join(',');
  });

  const csvContent = '\uFEFF' + metaRows.join('\n') + '\n' + headers.join(',') + '\n' + dataRows.join('\n');
  const filename = `Daily_Attendance_${dateStr}.csv`;
  downloadFile(filename, csvContent, 'text/csv;charset=utf-8;');
}
