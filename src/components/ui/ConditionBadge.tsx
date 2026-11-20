import React from 'react';
import { PatientCondition } from '@/types';

const CONDITION_STYLES: Record<PatientCondition, string> = {
  Stable: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  Critical: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  Recovering: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  'Under Observation': 'bg-amber-50 text-amber-700 ring-amber-600/20',
};

export function ConditionBadge({ condition }: { condition: PatientCondition }) {
  const style = CONDITION_STYLES[condition] || 'bg-slate-100 text-slate-700 ring-slate-500/20';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ring-1 ring-inset ${style}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          condition === 'Critical'
            ? 'bg-rose-500'
            : condition === 'Stable'
              ? 'bg-emerald-500'
              : condition === 'Recovering'
                ? 'bg-sky-500'
                : 'bg-amber-500'
        }`}
      />
      {condition}
    </span>
  );
}
