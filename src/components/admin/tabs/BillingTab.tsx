import React, { useState } from 'react';
import { useAdminData } from '../../../hooks/useAdminData';
import { DataStateWrapper } from '../shared/DataStateWrapper';
import { StatusBadge } from '../shared/StatusBadge';
import { Pagination } from '../shared/Pagination';
import { NotConnectedBanner } from '../shared/NotConnectedBanner';

interface SubscriptionRow {
  id: string;
  customerEmail: string;
  plan: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: string;
  amount: number | null;
  currency: string | null;
  interval: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}
interface SubscriptionsResponse { rows: SubscriptionRow[]; page: number; pageSize: number; total: number; stripeConnected: boolean; }

export const BillingTab: React.FC = () => {
  const [page, setPage] = useState(1);
  const { data, loading, error } = useAdminData<SubscriptionsResponse>(`/billing/subscriptions?page=${page}&pageSize=20`);

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 space-y-4">
      <div>
        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Subscriptions</h3>
        <p className="text-xs text-slate-500">Mirrors Stripe -- Stripe stays authoritative; this table is written only by verified webhook events.</p>
      </div>

      {data && !data.stripeConnected && (
        <NotConnectedBanner message="Stripe isn't connected on this deployment yet. This view is real and ready, but will stay empty until billing is wired up." />
      )}

      <DataStateWrapper loading={loading} error={error} empty={data?.rows.length === 0} emptyMessage="No subscriptions yet.">
        {data && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#080D1A] text-slate-500 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3">Plan</th>
                    <th className="py-2.5 px-3">Stripe Customer</th>
                    <th className="py-2.5 px-3">Stripe Subscription</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Price</th>
                    <th className="py-2.5 px-3">Period End</th>
                    <th className="py-2.5 px-3">Cancel at Period End</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {data.rows.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 text-slate-500">{s.customerEmail}</td>
                      <td className="py-2.5 px-3 uppercase font-bold">{s.plan}</td>
                      <td className="py-2.5 px-3 font-mono text-[11px]">{s.stripe_customer_id || '—'}</td>
                      <td className="py-2.5 px-3 font-mono text-[11px]">{s.stripe_subscription_id || '—'}</td>
                      <td className="py-2.5 px-3"><StatusBadge status={s.status} /></td>
                      <td className="py-2.5 px-3 font-mono">{s.amount ? `${s.amount} ${s.currency?.toUpperCase()}/${s.interval}` : '—'}</td>
                      <td className="py-2.5 px-3 text-slate-500">{s.current_period_end ? new Date(s.current_period_end).toLocaleDateString() : '—'}</td>
                      <td className="py-2.5 px-3">{s.cancel_at_period_end ? 'Yes' : 'No'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={data.page} pageSize={data.pageSize} total={data.total} onPageChange={setPage} />
          </>
        )}
      </DataStateWrapper>
    </div>
  );
};
