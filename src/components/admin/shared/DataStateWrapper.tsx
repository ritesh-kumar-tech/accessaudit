import React from 'react';

interface DataStateWrapperProps {
  loading: boolean;
  error: string | null;
  empty?: boolean;
  emptyMessage?: string;
  children: React.ReactNode;
}

export const DataStateWrapper: React.FC<DataStateWrapperProps> = ({ loading, error, empty, emptyMessage, children }) => {
  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
        ))}
      </div>
    );
  }
  if (error) {
    return (
      <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300">
        {error}
      </div>
    );
  }
  if (empty) {
    return (
      <div className="p-8 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-sm text-slate-500 dark:text-slate-400">
        {emptyMessage || 'Nothing here yet.'}
      </div>
    );
  }
  return <>{children}</>;
};
