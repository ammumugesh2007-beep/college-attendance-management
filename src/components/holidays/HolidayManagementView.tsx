import React, { useState } from 'react';
import { 
  Palmtree, 
  Plus, 
  Trash2, 
  Edit3, 
  AlertCircle, 
  Calendar as CalendarIcon, 
  ShieldCheck, 
  Check, 
  X,
  Info
} from 'lucide-react';
import { Holiday, HolidayReason, CollegeSettings } from '../../types';

interface HolidayManagementViewProps {
  holidays: Holiday[];
  settings: CollegeSettings;
  onAddHoliday: (holiday: Omit<Holiday, 'id'>) => void;
  onUpdateHoliday: (holiday: Holiday) => void;
  onDeleteHoliday: (id: string) => void;
  onUpdateSettings: (settings: CollegeSettings) => void;
  showToast: (type: 'success' | 'warning' | 'info' | 'error', title: string, message?: string) => void;
}

const REASONS: HolidayReason[] = [
  'National Holiday',
  'State Holiday',
  'College Festival',
  'Semester Break',
  'Exam Holiday',
  'Special Declared Holiday',
  'Other'
];

export const HolidayManagementView: React.FC<HolidayManagementViewProps> = ({
  holidays,
  settings,
  onAddHoliday,
  onUpdateHoliday,
  onDeleteHoliday,
  onUpdateSettings,
  showToast
}) => {
  // Modal / Form state for Add or Edit
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [date, setDate] = useState('');
  const [name, setName] = useState('');
  const [reason, setReason] = useState<HolidayReason>('College Festival');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState('');

  // Weekend toggle state: Sunday only vs Saturday & Sunday
  const isSundayOff = settings.weekendDays.includes(0);
  const isSaturdayOff = settings.weekendDays.includes(6);

  const handleOpenAdd = () => {
    setEditingId(null);
    setDate('');
    setName('');
    setReason('College Festival');
    setDescription('');
    setFormError('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (holiday: Holiday) => {
    setEditingId(holiday.id);
    setDate(holiday.date);
    setName(holiday.name);
    setReason(holiday.reason);
    setDescription(holiday.description || '');
    setFormError('');
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!date) {
      setFormError('Please select a valid holiday date.');
      return;
    }
    if (!name.trim()) {
      setFormError('Please enter a holiday title/name.');
      return;
    }

    if (editingId) {
      onUpdateHoliday({
        id: editingId,
        date,
        name: name.trim(),
        reason,
        description: description.trim()
      });
      showToast('success', 'Holiday Updated', `"${name.trim()}" on ${date} has been updated.`);
    } else {
      onAddHoliday({
        date,
        name: name.trim(),
        reason,
        description: description.trim()
      });
      showToast(
        'success',
        'Holiday Added',
        `"${name.trim()}" on ${date} declared. Excluded from all working day calculations.`
      );
    }

    setIsFormOpen(false);
  };

  const handleDelete = (holiday: Holiday) => {
    if (window.confirm(`Are you sure you want to remove holiday "${holiday.name}" on ${holiday.date}?`)) {
      onDeleteHoliday(holiday.id);
      showToast('info', 'Holiday Removed', `Removed ${holiday.name} from academic calendar.`);
    }
  };

  const handleWeekendToggle = (day: number, checked: boolean) => {
    let nextWeekends = [...settings.weekendDays];
    if (checked) {
      if (!nextWeekends.includes(day)) nextWeekends.push(day);
    } else {
      nextWeekends = nextWeekends.filter(d => d !== day);
    }
    onUpdateSettings({
      ...settings,
      weekendDays: nextWeekends
    });
    showToast('info', 'Calendar Updated', 'Weekend working day rules updated successfully.');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-amber-700 uppercase tracking-wide flex items-center gap-1.5">
              <Palmtree className="w-3.5 h-3.5" />
              <span>Academic Holiday & Calendar Control</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-0.5">
              College Holiday Management
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Holidays are strictly excluded from working days and cannot count as present or absent.
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors flex items-center gap-2 shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Declare New Holiday</span>
          </button>
        </div>
      </div>

      {/* Rules Notice Callout */}
      <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-950 text-xs">
        <div className="flex items-start gap-3">
          <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold">Official College Academic Regulations on Holidays:</div>
            <ul className="list-disc list-inside space-y-0.5 text-amber-900 opacity-90">
              <li>When a date is marked as a college holiday, it is automatically excluded from total working days.</li>
              <li>Holidays are never counted as student present days or absent days.</li>
              <li>Normal attendance marking is disabled on declared holidays.</li>
              <li>If a holiday is declared after attendance was previously entered for that date, the system automatically excludes that date from all monthly and cumulative calculations.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Weekend Settings Configuration */}
      <div className="p-5 rounded-xl bg-white border border-slate-200">
        <h3 className="text-sm font-bold text-slate-900">Weekly Non-Working Days Configuration</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Configured weekly off days are treated as non-working days in the calendar.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-6">
          <label className="flex items-center gap-2.5 cursor-pointer text-sm font-medium text-slate-800">
            <input
              type="checkbox"
              checked={isSundayOff}
              onChange={(e) => handleWeekendToggle(0, e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
            />
            <span>Sundays are Weekly Off (Default)</span>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer text-sm font-medium text-slate-800">
            <input
              type="checkbox"
              checked={isSaturdayOff}
              onChange={(e) => handleWeekendToggle(6, e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
            />
            <span>Saturdays are Weekly Off (Non-working)</span>
          </label>
        </div>
      </div>

      {/* Holidays List */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Declared College Holidays ({holidays.length})</h3>
            <p className="text-xs text-slate-500 mt-0.5">Official list for {settings.semester}</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wide">
              <tr>
                <th className="py-3 px-4 w-32">Date</th>
                <th className="py-3 px-4">Holiday Name</th>
                <th className="py-3 px-4">Category / Reason</th>
                <th className="py-3 px-4 hidden md:table-cell">Description / Notes</th>
                <th className="py-3 px-4 text-center w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {holidays.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 text-sm">
                    No holidays declared yet. Click "Declare New Holiday" to add one.
                  </td>
                </tr>
              ) : (
                holidays.map(holiday => (
                  <tr key={holiday.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900 tabular-nums">
                      {holiday.date}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {holiday.name}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
                        {holiday.reason}
                      </span>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell text-xs text-slate-500">
                      {holiday.description || '—'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(holiday)}
                          className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                          title="Edit Holiday"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(holiday)}
                          className="p-1.5 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors"
                          title="Delete Holiday"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Holiday Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                {editingId ? 'Edit College Holiday' : 'Declare New College Holiday'}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {formError && (
                <div className="p-3 text-xs rounded-lg bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Holiday Date *
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Holiday Name / Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Gandhi Jayanti, Founder's Day..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Category / Reason *
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value as HolidayReason)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                >
                  {REASONS.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Notes / Description (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Additional context or notification circular reference..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors shadow-xs"
                >
                  {editingId ? 'Update Holiday' : 'Save Holiday'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
