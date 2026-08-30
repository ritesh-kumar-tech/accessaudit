import React from 'react';
import { AlertCircle } from 'lucide-react';

export const NotConnectedBanner: React.FC<{ message: string }> = ({ message }) => (
  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
    <span>{message}</span>
  </div>
);
