import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  trend?: string;
  icon?: React.ReactNode;
  accent?: 'default' | 'emerald' | 'rose' | 'amber' | 'blue';
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  icon,
  accent = 'default'
}) => {
  const accentBorder = {
    default: 'border-slate-200',
    emerald: 'border-emerald-200 bg-emerald-50/20',
    rose: 'border-rose-200 bg-rose-50/20',
    amber: 'border-amber-200 bg-amber-50/20',
    blue: 'border-blue-200 bg-blue-50/20'
  }[accent];

  const valueColor = {
    default: 'text-slate-900',
    emerald: 'text-emerald-700',
    rose: 'text-rose-700',
    amber: 'text-amber-700',
    blue: 'text-blue-700'
  }[accent];

  return (
    <div className={`p-4 rounded-xl border ${accentBorder} bg-white transition-all`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</span>
        {icon && <span className="text-slate-400">{icon}</span>}
      </div>
      <div className={`text-2xl font-bold mt-2 tabular-nums ${valueColor}`}>
        {value}
      </div>
      {subtext && (
        <div className="text-xs text-slate-500 mt-1 font-normal">
          {subtext}
        </div>
      )}
    </div>
  );
};
