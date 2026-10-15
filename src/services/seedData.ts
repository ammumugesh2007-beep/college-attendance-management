import { Student, Holiday, CollegeSettings, AttendanceRecord, AttendanceStatus } from '../types';

// Exactly 59 students: Roll 1 to 57, 301, and 302
export const INITIAL_STUDENTS: Student[] = [
  { rollNo: 1, name: "Aarav Sharma", department: "Computer Science & Engineering", batch: "2024-2028" },
  { rollNo: 2, name: "Aaditya Varma", department: "Computer Science & Engineering", batch: "2024-2028" },
  { rollNo: 3, name: "Abhishek Kumar", department: "Computer Science & Engineering", batch: "2024-2028" },
  { rollNo: 4, name: "Aditi Rao", department: "Computer Science & Engineering", batch: "2024-2028" },
  { rollNo: 5, name: "Aishwarya Pillai", department: "Computer Science & Engineering", batch: "2024-2028" },
  { rollNo: 6, name: "Akash Patel", department: "Computer Science & Engineering", batch: "2024-2028" },
  { rollNo: 7, name: "Ananya Iyer", department: "Computer Science & Engineering", batch: "2024-2028" },
  { rollNo: 8, name: "Anirudh Menon", department: "Computer Science & Engineering", batch: "2024-2028" },
  { rollNo: 9, name: "Anjali Gupta", department: "Computer Science & Engineering", batch: "2024-2028" },
  { rollNo: 10, name: "Arjun Reddy", department: "Computer Science & Engineering", batch: "2024-2028" },
  { rollNo: 11, name: "Ashwin Balaji", department: "Computer Science & Engineering", batch: "2024-2028" },
  { rollNo: 12, name: "Ayush Saxena", department: "Computer Science & Engineering", batch: "2024-2028" },
  { rollNo: 13, name: "Bhavana Joshi", department: "Computer Science & Engineering", batch: "2024-2028" },
  { rollNo: 14, name: "Chetan Deshmukh", department: "Computer Science & Engineering", batch: "2024-2028" },
  { rollNo: 15, name: "Deepak Choudhury", department: "Computer Science & Engineering", batch: "2024-2028" },
  { rollNo: 16, name: "Devika Nambiar", department: "Computer Science & Engineering", batch: "2024-2028" },
  { rollNo: 17, name: "Dhruv Kapoor", department: "Computer Science & Engineering", batch: "2024-2028" },
  { rollNo: 18, name: "Divya Sundaram", department: "Computer Science & Engineering", batch: "2024-2028" },
  { rollNo: 19, name: "Gautam Nair", department: "Computer Science & Engineering", batch: "2024-2028" },
  { rollNo: 20, name: "Harini Krishnan", department: "Computer Science & Engineering", batch: "2024-2028" },
  { rollNo: 21, name: "Harsh Vardhan", department: "Computer Science & Engineering", batch: "2024-2028" },
  { rollNo: 22, name: "Isha Mukherjee", department: "Computer Science & Engineering", batch: "2024-2028" },
  { rollNo: 23, name: "Ishaan Sengupta", department: "Computer Science & Engineering", batch: "2024-2028" },
  { rollNo: 24, name: "Karthik Subramanian", department: "Computer Science & Engineering", batch: "2024-2028" },
  { rollNo: 25, name: "Kavya Venkatesh", department: "Computer Science & Engineering", batch: "2024-2028" },
  { rollNo: 26, name: "Kiran Mazumdar", department: "Computer Science & Engineering", batch: "2024-2028" },
  { rollNo: 27, name: "Lakshmi Narayanan", department: "Computer Science & Engineering", batch: "2024-2028" },
  { rollNo: 28, name: "Madhav Kulkarni", department: "Computer Science & Engineering", batch: "2024-2028" },
  { rollNo: 29, name: "Manish Tiwari", department: "Computer Science & Engineering", batch: "2024-2028" },
  { rollNo: 30, name: "Meera Bhat", department: "Computer Science & Engineering", batch: "2024-2028" },
  { rollNo: 31, name: "Naveen Prasad", department: "Computer Science & Engineering", batch: "2024-2028" },
  { rollNo: 32, name: "Neha Singhania", department: "Computer Science & Engineering", batch: "2024-2028" },
  { rollNo: 33, name: "Nikhil Mathur", department: "Computer Science & Engineering", batch: "2024-2028" },
  { rollNo: 34, name: "Nisha Agarwal", department: "Computer Science & Engineering", batch: "2024-2028" },
  { rollNo: 35, name: "Pooja Hegde", department: "Computer Science & Engineering", batch: "2024-2028" },
  { rollNo: 36, name: "Pranav Dixit", department: "Computer Science & Engineering", batch: "2024-2028" },
  { rollNo: 37, name: "Preeti Mishra", department: "Computer Science & Engineering", batch: "2024-2028" },
  { rollNo: 38, name: "Rahul Soman", department: "Computer Science & Engineering", batch: "2024-2028" },
  { rollNo: 39, name: "Rajesh Kannan", department: "Computer Science & Engineering", batch: "2024-2028" },
  { rollNo: 40, name: "Rakesh Shekhawat", department: "Computer Science & Engineering", batch: "2024-2028" },
  { rollNo: 41, name: "Rhea Chawla", department: "Computer Science & Engineering", batch: "2024-2028" },
  { rollNo: 42, name: "Rohan Bhattacharya", department: "Computer Science & Engineering", batch: "2024-2028" },
  { rollNo: 43, name: "Rohit Malhotra", department: "Computer Science & Engineering", batch: "2024-2028" },
  { rollNo: 44, name: "Sahil Khandelwal", department: "Computer Science & Engineering", batch: "2024-2028" },
  { rollNo: 45, name: "Sakshi Grover", department: "Computer Science & Engineering", batch: "2024-2028" },
  { rollNo: 46, name: "Sanjay Dutta", department: "Computer Science & Engineering", batch: "2024-2028" },
  { rollNo: 47, name: "Sarita Rathi", department: "Computer Science & Engineering", batch: "2024-2028" },
  { rollNo: 48, name: "Siddharth Jain", department: "Computer Science & Engineering", batch: "2024-2028" },
  { rollNo: 49, name: "Simran Kaur", department: "Computer Science & Engineering", batch: "2024-2028" },
  { rollNo: 50, name: "Sneha Swaminathan", department: "Computer Science & Engineering", batch: "2024-2028" },
  { rollNo: 51, name: "Sohan Lal", department: "Computer Science & Engineering", batch: "2024-2028" },
  { rollNo: 52, name: "Sreya Banerji", department: "Computer Science & Engineering", batch: "2024-2028" },
  { rollNo: 53, name: "Tanvi Parikh", department: "Computer Science & Engineering", batch: "2024-2028" },
  { rollNo: 54, name: "Tarun Goswami", department: "Computer Science & Engineering", batch: "2024-2028" },
  { rollNo: 55, name: "Varun Rangarajan", department: "Computer Science & Engineering", batch: "2024-2028" },
  { rollNo: 56, name: "Vidya Sridhar", department: "Computer Science & Engineering", batch: "2024-2028" },
  { rollNo: 57, name: "Vikas Kaushik", department: "Computer Science & Engineering", batch: "2024-2028" },
  { rollNo: 301, name: "Kiranmai Cherukuri", department: "Computer Science & Engineering", batch: "2024-2028 (Lateral Entry)" },
  { rollNo: 302, name: "Yashwant Singhal", department: "Computer Science & Engineering", batch: "2024-2028 (Lateral Entry)" }
];

export const INITIAL_SETTINGS: CollegeSettings = {
  collegeName: "Apex Institute of Technology & Engineering",
  department: "Department of Computer Science & Engineering",
  semester: "V Semester (Odd Sem 2026)",
  academicStartDate: "2026-09-01",
  academicEndDate: "2026-12-20",
  weekendDays: [0], // Sunday is weekend holiday by default
  minAttendancePercentage: 75
};

export const INITIAL_HOLIDAYS: Holiday[] = [
  {
    id: "h-1",
    date: "2026-09-05",
    name: "Teacher's Day Special Holiday",
    reason: "College Festival",
    description: "Annual faculty felicitation ceremony"
  },
  {
    id: "h-2",
    date: "2026-10-02",
    name: "Gandhi Jayanti",
    reason: "National Holiday",
    description: "National public holiday"
  },
  {
    id: "h-3",
    date: "2026-10-12",
    name: "College Annual Tech Symposium",
    reason: "College Festival",
    description: "Inter-college technical festival"
  },
  {
    id: "h-4",
    date: "2026-10-24",
    name: "Dussehra / Vijayadashami",
    reason: "National Holiday",
    description: "Autumn festive break"
  },
  {
    id: "h-5",
    date: "2026-11-12",
    name: "Diwali Holidays",
    reason: "National Holiday",
    description: "Festival of Lights"
  }
];

// Helper to generate seed attendance records for realistic demo
export function generateSeedAttendance(): Record<string, AttendanceRecord> {
  const records: Record<string, AttendanceRecord> = {};
  
  // Working days in October 2026 up to Oct 14
  const sampleDates = [
    "2026-10-01",
    // 2026-10-02 is Gandhi Jayanti (holiday)
    "2026-10-05",
    "2026-10-06",
    "2026-10-07",
    "2026-10-08",
    "2026-10-09",
    // 2026-10-12 is Tech Symposium (holiday)
    "2026-10-13",
    "2026-10-14"
  ];

  sampleDates.forEach((date, dateIndex) => {
    const studentRecords: Record<number, AttendanceStatus> = {};
    INITIAL_STUDENTS.forEach((student) => {
      // Create realistic attendance distribution:
      // Most students have ~85-95% attendance, a few on duty, 4-5 students below 75%
      const r = student.rollNo;
      const seedVal = (r * 17 + dateIndex * 31) % 100;

      if (r === 9 || r === 15 || r === 38 || r === 51) {
        // High absenteeism (defaulters < 75%)
        studentRecords[r] = seedVal < 50 ? 'A' : 'P';
      } else if (r === 24 || r === 301) {
        // Sports / Tech On-Duty students
        if (seedVal < 30) {
          studentRecords[r] = 'OD';
        } else if (seedVal < 90) {
          studentRecords[r] = 'P';
        } else {
          studentRecords[r] = 'A';
        }
      } else {
        // General students (mostly present)
        if (seedVal < 88) {
          studentRecords[r] = 'P';
        } else if (seedVal < 94) {
          studentRecords[r] = 'OD';
        } else {
          studentRecords[r] = 'A';
        }
      }
    });

    records[date] = {
      date,
      records: studentRecords,
      lastModified: new Date(`2026-10-15T01:00:00Z`).toISOString(),
      notes: `Regular academic session lecture and lab hours`
    };
  });

  return records;
}
