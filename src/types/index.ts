/**
 * Data structures for College Attendance Management System
 */

export type AttendanceStatus = 'P' | 'A' | 'OD';

export interface Student {
  rollNo: number;
  name: string;
  email?: string;
  phone?: string;
  department: string;
  batch: string;
}

export interface AttendanceRecord {
  date: string; // 'YYYY-MM-DD'
  records: Record<number, AttendanceStatus>; // rollNo -> status
  lastModified: string;
  notes?: string;
}

export type HolidayReason = 
  | 'National Holiday'
  | 'State Holiday'
  | 'College Festival'
  | 'Semester Break'
  | 'Exam Holiday'
  | 'Special Declared Holiday'
  | 'Other';

export interface Holiday {
  id: string;
  date: string; // 'YYYY-MM-DD'
  name: string;
  reason: HolidayReason;
  description?: string;
}

export interface CollegeSettings {
  collegeName: string;
  department: string;
  semester: string;
  academicStartDate: string; // 'YYYY-MM-DD'
  academicEndDate: string; // 'YYYY-MM-DD'
  weekendDays: number[]; // 0 = Sunday, 6 = Saturday (e.g. [0] or [0, 6])
  minAttendancePercentage: number; // usually 75%
}

export interface StudentAttendanceStats {
  rollNo: number;
  name: string;
  totalWorkingDays: number;
  presentDays: number;
  absentDays: number;
  onDutyDays: number;
  attendancePercentage: number; // (P + OD) / Total * 100
  isDefaulter: boolean; // < 75%
}

export interface DailySummary {
  date: string;
  isHoliday: boolean;
  holidayName?: string;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  onDutyCount: number;
  unmarkedCount: number;
  attendancePercentage: number;
}
