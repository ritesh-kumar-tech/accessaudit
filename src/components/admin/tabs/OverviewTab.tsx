import React from 'react';
import { useAdminData } from '../../../hooks/useAdminData';
import { DataStateWrapper } from '../shared/DataStateWrapper';

interface OverviewData {
  totalUsers: number;
  freeUsers: number;
  paidSubscribers: number;
  activeProSubscriptions: number;
  activeMonitoringSubscriptions: number;
  activeAgencySubscriptions: number;
  mrr: number;
  newSignups7d: number;
  totalScans: number;
  failedScans: number;
  activeMonitoredWebsites: number;
  failedMonitoringJobs24h: number;
  failedPayments: number;
  recentCancellations: number;
  schedulerHealth: { lastTickAt: string | null; lastTickError: string | null };
}

const Stat: React.FC<{ label: string; value: React.ReactNode; hint?: string }> = ({ label, value, hint }) => (
  <div className="p-4 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800">
    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
    <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{value}</p>
    {hint && <p className="text-[11px] text-slate-400 mt-0.5">{hint}</p>}
  </div>
);

export const OverviewTab: React.FC = () => {
  const { data, loading, error } = useAdminData<OverviewData>('/overview');

  return (
    <DataStateWrapper loading={loading} error={error} empty={false}>
      {data && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Stat label="Total Users" value={data.totalUsers} />
            <Stat label="Free Users" value={data.freeUsers} />
            <Stat label="Paid Subscribers" value={data.paidSubscribers} />
            <Stat label="MRR" value={`$${data.mrr.toLocaleString()}`} hint={data.mrr === 0 ? 'No active Stripe subscriptions yet' : undefined} />
            <Stat label="Active Pro Subscriptions" value={data.activeProSubscriptions} hint="From Stripe-backed subscriptions" />
            <Stat label="Active Monitoring Users" value={data.activeMonitoringSubscriptions} hint="Users with 1+ enabled monitored site" />
            <Stat label="Active Agency Subscriptions" value={data.activeAgencySubscriptions} />
            <Stat label="New Signups (7d)" value={data.newSignups7d} />
            <Stat label="Total Scans" value={data.totalScans} />
            <Stat label="Failed Scans" value={data.failedScans} />
            <Stat label="Active Monitored Websites" value={data.activeMonitoredWebsites} />
            <Stat label="Failed Monitoring Jobs (24h)" value={data.failedMonitoringJobs24h} />
            <Stat label="Failed Payments" value={data.failedPayments} />
            <Stat label="Recent Cancellations (30d)" value={data.recentCancellations} />
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
            Monitoring scheduler last ran: {data.schedulerHealth.lastTickAt ? new Date(data.schedulerHealth.lastTickAt).toLocaleString() : 'not yet'}
            {data.schedulerHealth.lastTickError && (
              <span className="text-red-600 dark:text-red-400 font-bold"> — last tick error: {data.schedulerHealth.lastTickError}</span>
            )}
          </div>
        </div>
      )}
    </DataStateWrapper>
  );
};
