import React from 'react';
import { useAdminData } from '../../../hooks/useAdminData';
import { DataStateWrapper } from '../shared/DataStateWrapper';
import { NotConnectedBanner } from '../shared/NotConnectedBanner';

interface FailedPaymentRow {
  id: string;
  customerEmail: string;
  amount: number;
  currency: string;
  failure_reason: string | null;
  created_at: string;
}
interface FailedPaymentsResponse { rows: FailedPaymentRow[]; stripeConnected: boolean; }

export const FailedPaymentsTab: React.FC = () => {
  const { data, loading, error } = useAdminData<FailedPaymentsResponse>('/billing/failed-payments');

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 space-y-4">
      <div>
        <h3 className="font-extrabold text-sm text-red-600 dark:text-red-400">Failed Payments &amp; Churn Risk</h3>
        <p className="text-xs text-slate-500">Customers with a declined or failed charge -- reach out before they churn involuntarily.</p>
      </div>

      {data && !data.stripeConnected && (
        <NotConnectedBanner message="Stripe isn't connected on this deployment yet, so this view will stay empty until billing is wired up." />
      )}

      <DataStateWrapper loading={loading} error={error} empty={data?.rows.length === 0} emptyMessage="No failed payments right now.">
        {data && (
          <div className="space-y-3">
            {data.rows.map(p => (
              <div key={p.id} className="p-4 rounded-xl bg-red-50/60 dark:bg-red-950/20 border border-red-200 dark:border-red-900/60 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-sm text-slate-900 dark:text-white">{p.customerEmail}</p>
                  <p className="text-xs text-slate-500">{p.amount} {p.currency?.toUpperCase()} -- failed {new Date(p.created_at).toLocaleString()}</p>
                  {p.failure_reason && <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">{p.failure_reason}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </DataStateWrapper>
    </div>
  );
};
