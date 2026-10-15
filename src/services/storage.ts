import { Student, Holiday, CollegeSettings, AttendanceRecord } from '../types';
import { INITIAL_STUDENTS, INITIAL_SETTINGS, INITIAL_HOLIDAYS, generateSeedAttendance } from './seedData';

const KEYS = {
  STUDENTS: 'cams_students_v1',
  SETTINGS: 'cams_settings_v1',
  HOLIDAYS: 'cams_holidays_v1',
  ATTENDANCE: 'cams_attendance_v1',
  VERSION: 'cams_version'
};

export class StorageService {
  /**
   * Initializes storage with default data if empty
   */
  static initialize(): void {
    try {
      if (!localStorage.getItem(KEYS.STUDENTS)) {
        localStorage.setItem(KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
      }
      if (!localStorage.getItem(KEYS.SETTINGS)) {
        localStorage.setItem(KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
      }
      if (!localStorage.getItem(KEYS.HOLIDAYS)) {
        localStorage.setItem(KEYS.HOLIDAYS, JSON.stringify(INITIAL_HOLIDAYS));
      }
      if (!localStorage.getItem(KEYS.ATTENDANCE)) {
        localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(generateSeedAttendance()));
      }
    } catch (e) {
      console.error('Error initializing LocalStorage', e);
    }
  }

  // --- Students ---
  static getStudents(): Student[] {
    try {
      const data = localStorage.getItem(KEYS.STUDENTS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Sort by roll number ascending (1..57, 301, 302)
          return parsed.sort((a: Student, b: Student) => a.rollNo - b.rollNo);
        }
      }
    } catch (e) {
      console.error('Failed to parse students from storage', e);
    }
    return INITIAL_STUDENTS;
  }

  static saveStudents(students: Student[]): void {
    try {
      localStorage.setItem(KEYS.STUDENTS, JSON.stringify(students));
    } catch (e) {
      console.error('Failed to save students to storage', e);
    }
  }

  static updateStudentName(rollNo: number, newName: string): Student[] {
    const students = this.getStudents();
    const updated = students.map(s => s.rollNo === rollNo ? { ...s, name: newName.trim() } : s);
    this.saveStudents(updated);
    return updated;
  }

  // --- Settings ---
  static getSettings(): CollegeSettings {
    try {
      const data = localStorage.getItem(KEYS.SETTINGS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load settings', e);
    }
    return INITIAL_SETTINGS;
  }

  static saveSettings(settings: CollegeSettings): void {
    try {
      localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  }

  // --- Holidays ---
  static getHolidays(): Holiday[] {
    try {
      const data = localStorage.getItem(KEYS.HOLIDAYS);
      if (data) {
        const holidays = JSON.parse(data);
        return holidays.sort((a: Holiday, b: Holiday) => a.date.localeCompare(b.date));
      }
    } catch (e) {
      console.error('Failed to load holidays', e);
    }
    return INITIAL_HOLIDAYS;
  }

  static saveHolidays(holidays: Holiday[]): void {
    try {
      localStorage.setItem(KEYS.HOLIDAYS, JSON.stringify(holidays));
    } catch (e) {
      console.error('Failed to save holidays', e);
    }
  }

  static addHoliday(holiday: Omit<Holiday, 'id'>): Holiday[] {
    const holidays = this.getHolidays();
    const newHoliday: Holiday = {
      ...holiday,
      id: `h_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`
    };
    // Replace if same date already has a holiday, or push
    const filtered = holidays.filter(h => h.date !== holiday.date);
    const updated = [...filtered, newHoliday].sort((a, b) => a.date.localeCompare(b.date));
    this.saveHolidays(updated);
    return updated;
  }

  static deleteHoliday(id: string): Holiday[] {
    const holidays = this.getHolidays();
    const updated = holidays.filter(h => h.id !== id);
    this.saveHolidays(updated);
    return updated;
  }

  static updateHoliday(holiday: Holiday): Holiday[] {
    const holidays = this.getHolidays();
    const updated = holidays.map(h => h.id === holiday.id ? holiday : h);
    this.saveHolidays(updated);
    return updated;
  }

  // --- Attendance ---
  static getAttendanceRecords(): Record<string, AttendanceRecord> {
    try {
      const data = localStorage.getItem(KEYS.ATTENDANCE);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load attendance records', e);
    }
    return {};
  }

  static saveAttendanceRecord(record: AttendanceRecord): Record<string, AttendanceRecord> {
    const all = this.getAttendanceRecords();
    all[record.date] = {
      ...record,
      lastModified: new Date().toISOString()
    };
    try {
      localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(all));
    } catch (e) {
      console.error('Failed to save attendance record', e);
    }
    return all;
  }

  static deleteAttendanceForDate(date: string): Record<string, AttendanceRecord> {
    const all = this.getAttendanceRecords();
    delete all[date];
    try {
      localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(all));
    } catch (e) {
      console.error('Failed to delete attendance record', e);
    }
    return all;
  }

  // --- Backup & Restore ---
  static exportDatabaseJSON(): string {
    const db = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      students: this.getStudents(),
      settings: this.getSettings(),
      holidays: this.getHolidays(),
      attendance: this.getAttendanceRecords()
    };
    return JSON.stringify(db, null, 2);
  }

  static importDatabaseJSON(jsonStr: string): boolean {
    try {
      const db = JSON.parse(jsonStr);
      if (db.students && Array.isArray(db.students)) {
        localStorage.setItem(KEYS.STUDENTS, JSON.stringify(db.students));
      }
      if (db.settings) {
        localStorage.setItem(KEYS.SETTINGS, JSON.stringify(db.settings));
      }
      if (db.holidays && Array.isArray(db.holidays)) {
        localStorage.setItem(KEYS.HOLIDAYS, JSON.stringify(db.holidays));
      }
      if (db.attendance && typeof db.attendance === 'object') {
        localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(db.attendance));
      }
      return true;
    } catch (e) {
      console.error('Error importing backup JSON', e);
      return false;
    }
  }

  static resetToDefaults(): void {
    localStorage.removeItem(KEYS.STUDENTS);
    localStorage.removeItem(KEYS.SETTINGS);
    localStorage.removeItem(KEYS.HOLIDAYS);
    localStorage.removeItem(KEYS.ATTENDANCE);
    this.initialize();
  }
}
