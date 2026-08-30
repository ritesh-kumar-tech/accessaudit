import React, { useState } from 'react';

interface ConfirmReasonModalProps {
  title: string;
  description?: string;
  confirmLabel?: string;
  destructive?: boolean;
  onConfirm: (reason: string) => Promise<void>;
  onClose: () => void;
}

/** Every sensitive admin action (suspend, plan override, refund, usage reset,
 * monitoring pause) routes through this so a reason is always required and
 * always lands in the audit log -- there is no path to skip it. */
export const ConfirmReasonModal: React.FC<ConfirmReasonModalProps> = ({
  title,
  description,
  confirmLabel = 'Confirm',
  destructive = false,
  onConfirm,
  onClose,
}) => {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!reason.trim()) {
      setError('A reason is required.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onConfirm(reason.trim());
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Action failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 max-w-md w-full space-y-4">
        <div>
          <h3 className="text-base font-black text-slate-900 dark:text-white">{title}</h3>
          {description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{description}</p>}
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Reason (required, written to the audit log)
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            autoFocus
            className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#080D1A] text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
        <div className="flex justify-end gap-2 pt-1">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={submitting}
            className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm disabled:opacity-50 ${
              destructive ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {submitting ? 'Working...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
