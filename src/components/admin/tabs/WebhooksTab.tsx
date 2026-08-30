import React, { useState } from 'react';
import { useAdminData } from '../../../hooks/useAdminData';
import { DataStateWrapper } from '../shared/DataStateWrapper';
import { StatusBadge } from '../shared/StatusBadge';
import { Pagination } from '../shared/Pagination';
import { NotConnectedBanner } from '../shared/NotConnectedBanner';

interface WebhookRow {
  id: string;
  stripe_event_id: string;
  event_type: string;
  received_at: string;
  processed_status: string;
  processing_error: string | null;
}
interface WebhooksResponse { rows: WebhookRow[]; page: number; pageSize: number; total: number; stripeConfigured: boolean; }

export const WebhooksTab: React.FC = () => {
  const [page, setPage] = useState(1);
  const { data, loading, error } = useAdminData<WebhooksResponse>(`/billing/webhooks?page=${page}&pageSize=20`);

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 space-y-4">
      <div>
        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Stripe Webhook Events</h3>
        <p className="text-xs text-slate-500">Every event Stripe has sent us, keyed by Stripe's own event ID so duplicate deliveries can't double-process.</p>
      </div>

      {data && !data.stripeConfigured && (
        <NotConnectedBanner message="No Stripe webhook secret is configured on this deployment yet, so no events have been received." />
      )}

      <DataStateWrapper loading={loading} error={error} empty={data?.rows.length === 0} emptyMessage="No webhook events received yet.">
        {data && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#080D1A] text-slate-500 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Event ID</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Received</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {data.rows.map(w => (
                    <tr key={w.id}>
                      <td className="py-2.5 px-3 font-mono text-[11px]">{w.stripe_event_id}</td>
                      <td className="py-2.5 px-3">{w.event_type}</td>
                      <td className="py-2.5 px-3 text-slate-500">{new Date(w.received_at).toLocaleString()}</td>
                      <td className="py-2.5 px-3">
                        <StatusBadge status={w.processed_status} />
                        {w.processing_error && <p className="text-[10px] text-red-500 mt-0.5">{w.processing_error}</p>}
                      </td>
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
