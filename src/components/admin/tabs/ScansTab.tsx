import React, { useState } from 'react';
import { Search, RefreshCw } from 'lucide-react';
import { useAdminData } from '../../../hooks/useAdminData';
import { adminPost } from '../../../lib/adminApi';
import { DataStateWrapper } from '../shared/DataStateWrapper';
import { StatusBadge } from '../shared/StatusBadge';
import { Pagination } from '../shared/Pagination';

interface ScanRow {
  id: string;
  url: string;
  userEmail: string;
  plan_used: string | null;
  overall_score: number | null;
  scan_status: string;
  critical_count: number | null;
  started_at: string;
  completed_at: string | null;
  duration_ms: number | null;
  error_message: string | null;
}

interface ScansResponse {
  rows: ScanRow[];
  page: number;
  pageSize: number;
  total: number;
}

const STATUS_OPTIONS = ['', 'queued', 'running', 'completed', 'failed', 'timed_out'];

export const ScansTab: React.FC = () => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [retryError, setRetryError] = useState<string | null>(null);

  const { data, loading, error, refetch } = useAdminData<ScansResponse>(
    `/scans?search=${encodeURIComponent(search)}&status=${status}&page=${page}&pageSize=20`
  );

  const handleRetry = async (id: string) => {
    setRetryingId(id);
    setRetryError(null);
    try {
      await adminPost(`/scans/${id}/retry`);
      refetch();
    } catch (err: any) {
      setRetryError(err.message);
    } finally {
      setRetryingId(null);
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Scans</h3>
          <p className="text-xs text-slate-500">Every scan attempt across the platform, including anonymous and failed ones.</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#080D1A] px-2.5 py-2">
            <option value="">All statuses</option>
            {STATUS_OPTIONS.slice(1).map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
          <div className="relative w-56">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by URL..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#080D1A] text-slate-900 dark:text-white focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {retryError && <p className="text-xs text-red-600 dark:text-red-400">{retryError}</p>}

      <DataStateWrapper loading={loading} error={error} empty={data?.rows.length === 0} emptyMessage="No scans match your filters.">
        {data && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#080D1A] text-slate-500 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Website</th>
                    <th className="py-2.5 px-3">User</th>
                    <th className="py-2.5 px-3">Plan</th>
                    <th className="py-2.5 px-3">Score</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Duration</th>
                    <th className="py-2.5 px-3">Started</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {data.rows.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-mono truncate max-w-[220px]">{s.url}</td>
                      <td className="py-2.5 px-3 text-slate-500">{s.userEmail}</td>
                      <td className="py-2.5 px-3 uppercase">{s.plan_used || '—'}</td>
                      <td className="py-2.5 px-3 font-mono">{s.overall_score ?? '—'}</td>
                      <td className="py-2.5 px-3">
                        <StatusBadge status={s.scan_status} />
                        {s.error_message && <p className="text-[10px] text-red-500 mt-0.5 max-w-[200px] truncate" title={s.error_message}>{s.error_message}</p>}
                      </td>
                      <td className="py-2.5 px-3 font-mono">{s.duration_ms ? `${(s.duration_ms / 1000).toFixed(1)}s` : '—'}</td>
                      <td className="py-2.5 px-3 text-slate-500">{new Date(s.started_at).toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-right">
                        {(s.scan_status === 'failed' || s.scan_status === 'timed_out') && (
                          <button
                            onClick={() => handleRetry(s.id)}
                            disabled={retryingId === s.id}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-1 ml-auto disabled:opacity-50"
                          >
                            <RefreshCw className={`w-3 h-3 ${retryingId === s.id ? 'animate-spin' : ''}`} />
                            <span>Retry</span>
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
