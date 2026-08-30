import React from 'react';
import { useAdminData } from '../../../hooks/useAdminData';
import { DataStateWrapper } from '../shared/DataStateWrapper';
import { StatusBadge } from '../shared/StatusBadge';

interface SystemHealthData {
  database: { status: string; latencyMs: number; error: string | null };
  scanner: { status: string; queued: number; running: number; completedLastHour: number; failedLastHour: number; stuckRunning: number };
  monitoringScheduler: { lastTickAt: string | null; lastTickError: string | null; tickInProgress: boolean; failedRunsLast24h: number };
  webhooks: { status: string; lastReceivedAt?: string | null; recentFailures?: number };
  email: { status: string; recentFailures?: number };
}

const Card: React.FC<{ title: string; status: string; children: React.ReactNode }> = ({ title, status, children }) => (
  <div className="p-4 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 space-y-2">
    <div className="flex items-center justify-between">
      <h4 className="text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">{title}</h4>
      <StatusBadge status={status} />
    </div>
    <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">{children}</div>
  </div>
);

export const SystemHealthTab: React.FC = () => {
  const { data, loading, error } = useAdminData<SystemHealthData>('/system-health');

  return (
    <DataStateWrapper loading={loading} error={error} empty={false}>
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card title="Database" status={data.database.status}>
            <p>Latency: {data.database.latencyMs}ms</p>
            {data.database.error && <p className="text-red-600 dark:text-red-400">{data.database.error}</p>}
          </Card>

          <Card title="Scanner" status={data.scanner.status}>
            <p>Queued: {data.scanner.queued} · Running: {data.scanner.running}</p>
            <p>Completed (1h): {data.scanner.completedLastHour} · Failed (1h): {data.scanner.failedLastHour}</p>
            {data.scanner.stuckRunning > 0 && (
              <p className="text-amber-600 dark:text-amber-400 font-bold">{data.scanner.stuckRunning} scan(s) appear stuck in "running"</p>
            )}
          </Card>

          <Card title="Monitoring Scheduler" status={data.monitoringScheduler.lastTickError ? 'degraded' : 'operational'}>
            <p>Last tick: {data.monitoringScheduler.lastTickAt ? new Date(data.monitoringScheduler.lastTickAt).toLocaleString() : 'not yet run'}</p>
            <p>Failed runs (24h): {data.monitoringScheduler.failedRunsLast24h}</p>
            {data.monitoringScheduler.lastTickError && <p className="text-red-600 dark:text-red-400">{data.monitoringScheduler.lastTickError}</p>}
          </Card>

          <Card title="Stripe Webhooks" status={data.webhooks.status}>
            {data.webhooks.status === 'not_configured' ? (
              <p>Not connected on this deployment yet.</p>
            ) : (
              <>
                <p>Last received: {data.webhooks.lastReceivedAt ? new Date(data.webhooks.lastReceivedAt).toLocaleString() : 'never'}</p>
                <p>Recent failures: {data.webhooks.recentFailures}</p>
              </>
            )}
          </Card>

          <Card title="Email Service" status={data.email.status}>
            {data.email.status === 'not_configured' ? (
              <p>No provider connected on this deployment yet.</p>
            ) : (
              <p>Recent failures (24h): {data.email.recentFailures}</p>
            )}
          </Card>
        </div>
      )}
    </DataStateWrapper>
  );
};
