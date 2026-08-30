import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useAdminData } from '../../../hooks/useAdminData';
import { adminPost } from '../../../lib/adminApi';
import { DataStateWrapper } from '../shared/DataStateWrapper';
import { StatusBadge } from '../shared/StatusBadge';
import { Pagination } from '../shared/Pagination';

interface ReportRow {
  id: string;
  site: string;
  customerEmail: string;
  plan_used: string;
  status: string;
  error_message: string | null;
  created_at: string;
}
interface ReportsResponse { rows: ReportRow[]; page: number; pageSize: number; total: number; }

export const ReportsTab: React.FC = () => {
  const [page, setPage] = useState(1);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const { data, loading, error, refetch } = useAdminData<ReportsResponse>(`/reports?page=${page}&pageSize=20`);

  const retry = async (id: string) => {
    setRetryingId(id);
    try {
      await adminPost(`/reports/${id}/retry`);
      refetch();
    } finally {
      setRetryingId(null);
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 space-y-4">
      <div>
        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Reports</h3>
        <p className="text-xs text-slate-500">Server-generated PDF reports, stored privately per-user with signed-URL downloads.</p>
      </div>

      <DataStateWrapper loading={loading} error={error} empty={data?.rows.length === 0} emptyMessage="No reports generated yet.">
        {data && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#080D1A] text-slate-500 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Report</th>
                    <th className="py-2.5 px-3">Site</th>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3">Plan</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Created</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {data.rows.map(r => (
                    <tr key={r.id}>
                      <td className="py-2.5 px-3 font-mono">{r.id.slice(0, 8)}</td>
                      <td className="py-2.5 px-3 font-mono truncate max-w-[180px]">{r.site}</td>
                      <td className="py-2.5 px-3 text-slate-500">{r.customerEmail}</td>
                      <td className="py-2.5 px-3 uppercase">{r.plan_used}</td>
                      <td className="py-2.5 px-3">
                        <StatusBadge status={r.status} />
                        {r.error_message && <p className="text-[10px] text-red-500 mt-0.5 max-w-[180px] truncate" title={r.error_message}>{r.error_message}</p>}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">{new Date(r.created_at).toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-right">
                        {r.status === 'failed' && (
                          <button onClick={() => retry(r.id)} disabled={retryingId === r.id} className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-1 ml-auto disabled:opacity-50">
                            <RefreshCw className={`w-3 h-3 ${retryingId === r.id ? 'animate-spin' : ''}`} /> Retry
                          </button>
                        )}
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
