import React from 'react';
import { Lock } from 'lucide-react';

interface LockedSectionProps {
  title: string;
  description: string;
  ctaText?: string;
  onUpgrade?: () => void;
  compact?: boolean;
}

/**
 * Blurred-content + centered lock overlay + upgrade CTA — the shared paywall
 * pattern used both inline per-issue (ScanPage) and at report-preview scale
 * (PdfPreviewModal), so the two don't drift into separate implementations.
 */
export const LockedSection: React.FC<LockedSectionProps> = ({
  title,
  description,
  ctaText = 'Upgrade to Pro Plan ($49/mo)',
  onUpgrade,
  compact = false,
}) => {
  return (
    <div className={`relative rounded-2xl border border-slate-200 dark:border-[#1E293B] bg-slate-50/80 dark:bg-[#0B1120]/80 overflow-hidden text-center ${compact ? 'p-4' : 'p-6'}`}>
      <div className={`filter blur-xs opacity-40 select-none pointer-events-none ${compact ? 'space-y-2' : 'space-y-3'}`}>
        <div className={`bg-slate-300 dark:bg-slate-700 rounded-md w-3/4 mx-auto ${compact ? 'h-4' : 'h-6'}`}></div>
        <div className={`bg-slate-200 dark:bg-slate-800 rounded-md ${compact ? 'h-8' : 'h-12'}`}></div>
        {!compact && <div className="h-6 bg-slate-300 dark:bg-slate-700 rounded-md w-1/2 mx-auto"></div>}
        {!compact && <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-md"></div>}
      </div>

      <div className={`absolute inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs ${compact ? 'p-3' : 'p-6'}`}>
        <div className={`rounded-2xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-md ${compact ? 'w-9 h-9 mb-2' : 'w-12 h-12 mb-3'}`}>
          <Lock className={compact ? 'w-4.5 h-4.5' : 'w-6 h-6'} />
        </div>
        <h4 className={`font-extrabold text-slate-900 dark:text-white ${compact ? 'text-xs' : 'text-base'}`}>
          {title}
        </h4>
        <p className={`text-slate-600 dark:text-slate-300 max-w-md ${compact ? 'text-[11px] mt-0.5' : 'text-xs mt-1'}`}>
          {description}
        </p>
        {onUpgrade && (
          <button
            type="button"
            onClick={onUpgrade}
            className={`rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-colors ${compact ? 'mt-2.5 px-3 py-1.5 text-[11px]' : 'mt-4 px-4 py-2 text-xs'}`}
          >
            {ctaText}
          </button>
        )}
      </div>
    </div>
  );
};
