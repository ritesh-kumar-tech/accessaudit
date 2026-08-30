import React, { useState } from 'react';
import { RefreshCw, Pause, Play, Zap } from 'lucide-react';
import { useAdminData } from '../../../hooks/useAdminData';
import { adminPost } from '../../../lib/adminApi';
import { DataStateWrapper } from '../shared/DataStateWrapper';
import { StatusBadge } from '../shared/StatusBadge';
import { Pagination } from '../shared/Pagination';
import { ConfirmReasonModal } from '../shared/ConfirmReasonModal';

interface MonitoringRow {
  id: string;
  url: string;
  name: string | null;
  interval: string;
  enabled: boolean;
  customerEmail: string;
  consecutive_failures: number;
  next_run_at: string;
  last_run_at: string | null;
  latestRun: { status: string; score: number | null; previous_score: number | null; error_message: string | null } | null;
}

interface MonitoringResponse {
  rows: MonitoringRow[];
  page: number;
  pageSize: number;
  total: number;
}

export const MonitoringTab: React.FC = () => {
  const [page, setPage] = useState(1);
  const [pendingAction, setPendingAction] = useState<{ id: string; kind: 'pause' | 'resume' } | null>(null);
  const [runningId, setRunningId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data, loading, error, refetch } = useAdminData<MonitoringResponse>(`/monitoring?page=${page}&pageSize=20`);

  const triggerNow = async (id: string, action: 'retry' | 'run-now') => {
    setRunningId(id);
    setActionError(null);
    try {
      await adminPost(`/monitoring/${id}/${action}`);
      refetch();
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setRunningId(null);
    }
  };

  const handlePauseResume = async (reason: string) => {
    if (!pendingAction) return;
    await adminPost(`/monitoring/${pendingAction.id}/${pendingAction.kind}`, { reason });
    refetch();
  };

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 space-y-4">
      <div>
        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Monitoring Operations</h3>
        <p className="text-xs text-slate-500">Recurring scans across every customer's monitored sites.</p>
      </div>

      {actionError && <p className="text-xs text-red-600 dark:text-red-400">{actionError}</p>}

      <DataStateWrapper loading={loading} error={error} empty={data?.rows.length === 0} emptyMessage="No monitored sites yet.">
        {data && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#080D1A] text-slate-500 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Website</th>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3">Schedule</th>
                    <th className="py-2.5 px-3">Prev → Current</th>
                    <th className="py-2.5 px-3">Last Run</th>
                    <th className="py-2.5 px-3">Next Run</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Failures</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {data.rows.map(m => (
                    <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-mono truncate max-w-[200px]">{m.name || m.url}</td>
                      <td className="py-2.5 px-3 text-slate-500">{m.customerEmail}</td>
                      <td className="py-2.5 px-3 capitalize">{m.interval}</td>
                      <td className="py-2.5 px-3 font-mono">{m.latestRun?.previous_score ?? '—'} → {m.latestRun?.score ?? '—'}</td>
                      <td className="py-2.5 px-3 text-slate-500">{m.last_run_at ? new Date(m.last_run_at).toLocaleString() : 'never'}</td>
                      <td className="py-2.5 px-3 text-slate-500">{new Date(m.next_run_at).toLocaleString()}</td>
                      <td className="py-2.5 px-3">
                        <StatusBadge status={m.enabled ? (m.latestRun?.status || 'queued') : 'suspended'} />
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={m.consecutive_failures > 0 ? 'text-red-600 font-bold' : ''}>{m.consecutive_failures}</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center justify-end gap-1.5">
                          {m.enabled ? (
                            <button onClick={() => setPendingAction({ id: m.id, kind: 'pause' })} title="Pause monitoring" className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700">
                              <Pause className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button onClick={() => setPendingAction({ id: m.id, kind: 'resume' })} title="Resume monitoring" className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700">
                              <Play className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button onClick={() => triggerNow(m.id, 'run-now')} disabled={runningId === m.id} title="Run now" className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 disabled:opacity-50">
                            <Zap className={`w-3.5 h-3.5 ${runningId === m.id ? 'animate-pulse' : ''}`} />
                          </button>
                          {m.latestRun?.status === 'failed' && (
                            <button onClick={() => triggerNow(m.id, 'retry')} disabled={runningId === m.id} title="Retry failed run" className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 disabled:opacity-50">
                              <RefreshCw className={`w-3.5 h-3.5 ${runningId === m.id ? 'animate-spin' : ''}`} />
                            </button>
                          )}
                        </div>
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

      {pendingAction && (
        <ConfirmReasonModal
          title={pendingAction.kind === 'pause' ? 'Pause monitoring for this site?' : 'Resume monitoring for this site?'}
          confirmLabel={pendingAction.kind === 'pause' ? 'Pause' : 'Resume'}
          destructive={pendingAction.kind === 'pause'}
          onConfirm={handlePauseResume}
          onClose={() => setPendingAction(null)}
        />
      )}
    </div>
  );
};
