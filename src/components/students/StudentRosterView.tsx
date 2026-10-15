import React, { useState } from 'react';
import { Users, Search, Edit2, Check, X, GraduationCap, ShieldCheck, Download, Printer } from 'lucide-react';
import { Student, CollegeSettings } from '../../types';
import { downloadFile } from '../../utils/exportUtils';

interface StudentRosterViewProps {
  students: Student[];
  settings: CollegeSettings;
  onUpdateStudentName: (rollNo: number, newName: string) => void;
  showToast: (type: 'success' | 'warning' | 'info' | 'error', title: string, message?: string) => void;
}

export const StudentRosterView: React.FC<StudentRosterViewProps> = ({
  students,
  settings,
  onUpdateStudentName,
  showToast
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingRoll, setEditingRoll] = useState<number | null>(null);
  const [nameValue, setNameValue] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'REGULAR' | 'LATERAL'>('ALL');

  const handleStartEdit = (student: Student) => {
    setEditingRoll(student.rollNo);
    setNameValue(student.name);
  };

  const handleSaveEdit = (rollNo: number) => {
    if (!nameValue.trim()) {
      showToast('warning', 'Name cannot be empty', 'Please provide a valid student name.');
      return;
    }
    onUpdateStudentName(rollNo, nameValue.trim());
    setEditingRoll(null);
    showToast('success', 'Student Name Updated', `Roll No ${rollNo} updated to "${nameValue.trim()}".`);
  };

  const handleCancelEdit = () => {
    setEditingRoll(null);
    setNameValue('');
  };

  const handleExportRoster = () => {
    const headers = ['Roll Number', 'Student Name', 'Department', 'Admission Category', 'Batch'];
    const rows = students.map(s => {
      const isLateral = s.rollNo === 301 || s.rollNo === 302;
      return [
        s.rollNo,
        `"${s.name.replace(/"/g, '""')}"`,
        `"${s.department}"`,
        isLateral ? 'Lateral Entry' : 'Regular Admission',
        `"${s.batch}"`
      ].join(',');
    });

    const csv = '\uFEFF' + headers.join(',') + '\n' + rows.join('\n');
    downloadFile('Apex_College_Student_Roster_59.csv', csv, 'text/csv;charset=utf-8;');
    showToast('info', 'Roster Exported', 'Downloaded complete 59-student roster CSV.');
  };

  const filtered = students.filter(s => {
    const isLateral = s.rollNo === 301 || s.rollNo === 302;
    if (categoryFilter === 'REGULAR' && isLateral) return false;
    if (categoryFilter === 'LATERAL' && !isLateral) return false;

    return (
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(s.rollNo).includes(searchQuery)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
              Official Class Registry
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-0.5">
              Enrolled Students Directory (59 Total)
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Roll Numbers 1 to 57 (Regular) and 301, 302 (Lateral Entry Admissions).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportRoster}
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
              <span>Print Roster</span>
            </button>
          </div>
        </div>
      </div>

      {/* Control & Search Bar */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name or roll number (e.g. 15, 301, Sharma)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setCategoryFilter('ALL')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              categoryFilter === 'ALL'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Students (59)
          </button>
          <button
            onClick={() => setCategoryFilter('REGULAR')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              categoryFilter === 'REGULAR'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Regular (1–57)
          </button>
          <button
            onClick={() => setCategoryFilter('LATERAL')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              categoryFilter === 'LATERAL'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Lateral (301, 302)
          </button>
        </div>
      </div>

      {/* Students Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wide">
              <tr>
                <th className="py-3 px-4 w-20 text-center">Roll No</th>
                <th className="py-3 px-4">Student Name (Editable)</th>
                <th className="py-3 px-4 hidden md:table-cell">Admission Type</th>
                <th className="py-3 px-4 hidden lg:table-cell">Department & Academic Year</th>
                <th className="py-3 px-4 text-center w-28 no-print">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(student => {
                const isEditing = editingRoll === student.rollNo;
                const isLateral = student.rollNo === 301 || student.rollNo === 302;

                return (
                  <tr key={student.rollNo} className="hover:bg-slate-50/70 transition-colors">
                    {/* Roll */}
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-900 tabular-nums">
                      {student.rollNo}
                    </td>

                    {/* Name */}
                    <td className="py-3 px-4">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={nameValue}
                            onChange={(e) => setNameValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveEdit(student.rollNo);
                              if (e.key === 'Escape') handleCancelEdit();
                            }}
                            autoFocus
                            className="px-2.5 py-1 text-sm border border-blue-500 rounded bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                          />
                          <button
                            onClick={() => handleSaveEdit(student.rollNo)}
                            className="p-1.5 text-xs bg-emerald-600 text-white rounded hover:bg-emerald-700"
                            title="Save Name"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-1.5 text-xs bg-slate-200 text-slate-700 rounded hover:bg-slate-300"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 group">
                          <span className="font-semibold text-slate-900">{student.name}</span>
                          <button
                            onClick={() => handleStartEdit(student)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-blue-600 rounded transition-opacity no-print"
                            title="Edit student name"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>

                    {/* Admission Type */}
                    <td className="py-3 px-4 hidden md:table-cell text-xs">
                      {isLateral ? (
                        <span className="font-semibold text-indigo-700">Lateral Entry</span>
                      ) : (
                        <span className="text-slate-600">Regular Entry</span>
                      )}
                    </td>

                    {/* Department */}
                    <td className="py-3 px-4 hidden lg:table-cell text-xs text-slate-500">
                      {student.department} · {student.batch}
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-center no-print">
                      <button
                        onClick={() => handleStartEdit(student)}
                        className="px-2.5 py-1 text-xs font-semibold text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-colors"
                      >
                        Edit Name
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
