import React from 'react';

const COLORS: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400',
  operational: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400',
  completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400',
  ready: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400',
  succeeded: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400',
  processed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400',
  sent: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400',

  suspended: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400',
  failed: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400',
  down: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400',

  timed_out: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400',
  degraded: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400',
  past_due: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400',
  refunded: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400',
  partially_refunded: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400',

  running: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400',
  generating: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400',
  trialing: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400',
  pending: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400',

  queued: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  cancelled: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  incomplete: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  not_configured: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
  unknown: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
};

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const cls = COLORS[status] || 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300';
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${cls}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
};
