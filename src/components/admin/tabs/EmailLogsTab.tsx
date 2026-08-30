import React, { useState } from 'react';
import { useAdminData } from '../../../hooks/useAdminData';
import { DataStateWrapper } from '../shared/DataStateWrapper';
import { StatusBadge } from '../shared/StatusBadge';
import { Pagination } from '../shared/Pagination';
import { NotConnectedBanner } from '../shared/NotConnectedBanner';

interface EmailLogRow {
  id: string;
  recipient: string;
  email_type: string;
  status: string;
  provider_id: string | null;
  failure_reason: string | null;
  created_at: string;
}
interface EmailLogsResponse { rows: EmailLogRow[]; page: number; pageSize: number; total: number; emailProviderConfigured: boolean; }

export const EmailLogsTab: React.FC = () => {
  const [page, setPage] = useState(1);
  const { data, loading, error } = useAdminData<EmailLogsResponse>(`/email-logs?page=${page}&pageSize=20`);

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 space-y-4">
      <div>
        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Email Logs</h3>
        <p className="text-xs text-slate-500">Delivery status for every transactional email sent.</p>
      </div>

      {data && !data.emailProviderConfigured && (
        <NotConnectedBanner message="No email provider is connected on this deployment yet, so no emails have been sent and this log is empty." />
      )}

      <DataStateWrapper loading={loading} error={error} empty={data?.rows.length === 0} emptyMessage="No emails logged yet.">
        {data && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#080D1A] text-slate-500 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Recipient</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Provider ID</th>
                    <th className="py-2.5 px-3">Sent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {data.rows.map(e => (
                    <tr key={e.id}>
                      <td className="py-2.5 px-3 font-mono">{e.recipient}</td>
                      <td className="py-2.5 px-3 capitalize">{e.email_type.replace(/_/g, ' ')}</td>
                      <td className="py-2.5 px-3">
                        <StatusBadge status={e.status} />
                        {e.failure_reason && <p className="text-[10px] text-red-500 mt-0.5">{e.failure_reason}</p>}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px]">{e.provider_id || '—'}</td>
                      <td className="py-2.5 px-3 text-slate-500">{new Date(e.created_at).toLocaleString()}</td>
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
