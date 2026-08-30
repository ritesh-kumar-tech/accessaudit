import React, { useState } from 'react';
import { X, Ban, RotateCcw, Sparkles, RefreshCw } from 'lucide-react';
import { useAdminData } from '../../../hooks/useAdminData';
import { adminPost } from '../../../lib/adminApi';
import { DataStateWrapper } from '../shared/DataStateWrapper';
import { StatusBadge } from '../shared/StatusBadge';
import { ConfirmReasonModal } from '../shared/ConfirmReasonModal';

interface UserDetail {
  profile: {
    id: string; email: string; full_name: string | null; role: string; plan: string; status: string;
    suspended_reason: string | null; created_at: string;
  };
  scans: { id: string; url: string; overall_score: number | null; scan_status: string; critical_count: number; started_at: string }[];
  monitoredSites: { id: string; url: string; name: string | null; interval: string; enabled: boolean; consecutive_failures: number }[];
  reports: { id: string; status: string; created_at: string }[];
  payments: { id: string; amount: number; currency: string; status: string; plan: string; created_at: string }[];
  subscriptions: { id: string; plan: string; status: string; current_period_end: string | null }[];
  adminActions: { id: string; admin_id: string; action: string; reason: string; created_at: string }[];
}

type ActionKind = 'suspend' | 'reactivate' | 'override-plan' | 'reset-usage';

export const UserDetailDrawer: React.FC<{ userId: string; onClose: () => void; onChanged: () => void }> = ({ userId, onClose, onChanged }) => {
  const { data, loading, error, refetch } = useAdminData<UserDetail>(`/users/${userId}`);
  const [pendingAction, setPendingAction] = useState<ActionKind | null>(null);
  const [overridePlan, setOverridePlan] = useState<'free' | 'pro' | 'agency'>('free');

  const runAction = async (kind: ActionKind, reason: string) => {
    if (kind === 'suspend') await adminPost(`/users/${userId}/suspend`, { reason });
    else if (kind === 'reactivate') await adminPost(`/users/${userId}/reactivate`, { reason });
    else if (kind === 'override-plan') await adminPost(`/users/${userId}/override-plan`, { plan: overridePlan, reason });
    else if (kind === 'reset-usage') await adminPost(`/users/${userId}/reset-usage`, { reason });
    refetch();
    onChanged();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 flex items-stretch justify-end">
      <div className="w-full max-w-2xl bg-white dark:bg-[#0B1120] h-full overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white dark:bg-[#0B1120] border-b border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between z-10">
          <h3 className="font-black text-sm text-slate-900 dark:text-white">User Details</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <DataStateWrapper loading={loading} error={error} empty={false}>
            {data && (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-black text-base text-slate-900 dark:text-white">{data.profile.full_name || data.profile.email}</p>
                    <p className="text-xs font-mono text-slate-500">{data.profile.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">{data.profile.plan}</span>
                      <StatusBadge status={data.profile.status} />
                      <span className="text-[11px] text-slate-400">Joined {new Date(data.profile.created_at).toLocaleDateString()}</span>
                    </div>
                    {data.profile.status === 'suspended' && data.profile.suspended_reason && (
                      <p className="text-[11px] text-red-600 dark:text-red-400 mt-1">Suspended: {data.profile.suspended_reason}</p>
                    )}
                  </div>
                </div>

                {/* Admin actions */}
                <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
                  {data.profile.status === 'active' ? (
                    <button onClick={() => setPendingAction('suspend')} className="px-3 py-1.5 rounded-lg text-xs font-bold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 flex items-center gap-1.5">
                      <Ban className="w-3.5 h-3.5" /> Suspend Account
                    </button>
                  ) : (
                    <button onClick={() => setPendingAction('reactivate')} className="px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 flex items-center gap-1.5">
                      <RotateCcw className="w-3.5 h-3.5" /> Reactivate Account
                    </button>
                  )}
                  <div className="flex items-center gap-1.5">
                    <select
                      value={overridePlan}
                      onChange={(e) => setOverridePlan(e.target.value as any)}
                      className="text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1.5"
                    >
                      <option value="free">Free</option>
                      <option value="pro">Pro</option>
                      <option value="agency">Agency</option>
                    </select>
                    <button onClick={() => setPendingAction('override-plan')} className="px-3 py-1.5 rounded-lg text-xs font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> Override Plan
                    </button>
                  </div>
                  <button onClick={() => setPendingAction('reset-usage')} className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5" /> Reset Usage Limits
                  </button>
                </div>

                <Section title={`Scan History (${data.scans.length})`}>
                  {data.scans.length === 0 ? <Empty text="No scans yet." /> : (
                    <Table
                      head={['Website', 'Score', 'Status', 'Critical', 'Started']}
                      rows={data.scans.map(s => [
                        <span className="font-mono truncate block max-w-[220px]">{s.url}</span>,
                        s.overall_score ?? '—',
                        <StatusBadge status={s.scan_status} />,
                        s.critical_count,
                        new Date(s.started_at).toLocaleString(),
                      ])}
                    />
                  )}
                </Section>

                <Section title={`Monitored Sites (${data.monitoredSites.length})`}>
                  {data.monitoredSites.length === 0 ? <Empty text="No monitored sites." /> : (
                    <Table
                      head={['Site', 'Interval', 'Status', 'Failures']}
                      rows={data.monitoredSites.map(s => [
                        <span className="font-mono truncate block max-w-[220px]">{s.name || s.url}</span>,
                        s.interval,
                        <StatusBadge status={s.enabled ? 'active' : 'suspended'} />,
                        s.consecutive_failures,
                      ])}
                    />
                  )}
                </Section>

                <Section title={`Reports (${data.reports.length})`}>
                  {data.reports.length === 0 ? <Empty text="No reports generated." /> : (
                    <Table head={['Report', 'Status', 'Created']} rows={data.reports.map(r => [r.id.slice(0, 8), <StatusBadge status={r.status} />, new Date(r.created_at).toLocaleString()])} />
                  )}
                </Section>

                <Section title={`Subscription History (${data.subscriptions.length})`}>
                  {data.subscriptions.length === 0 ? <Empty text="No Stripe subscription on record yet." /> : (
                    <Table head={['Plan', 'Status', 'Renews']} rows={data.subscriptions.map(s => [s.plan, <StatusBadge status={s.status} />, s.current_period_end ? new Date(s.current_period_end).toLocaleDateString() : '—'])} />
                  )}
                </Section>

                <Section title={`Payments (${data.payments.length})`}>
                  {data.payments.length === 0 ? <Empty text="No payments on record yet." /> : (
                    <Table head={['Amount', 'Plan', 'Status', 'Date']} rows={data.payments.map(p => [`${p.amount} ${p.currency?.toUpperCase()}`, p.plan, <StatusBadge status={p.status} />, new Date(p.created_at).toLocaleDateString()])} />
                  )}
                </Section>

                <Section title={`Admin Action History (${data.adminActions.length})`}>
                  {data.adminActions.length === 0 ? <Empty text="No admin actions taken on this account." /> : (
                    <Table head={['Action', 'Reason', 'When']} rows={data.adminActions.map(a => [a.action, a.reason, new Date(a.created_at).toLocaleString()])} />
                  )}
                </Section>
              </>
            )}
          </DataStateWrapper>
        </div>
      </div>

      {pendingAction === 'suspend' && (
        <ConfirmReasonModal title="Suspend this account?" description="The user will be blocked from running scans until reactivated." destructive confirmLabel="Suspend" onConfirm={(r) => runAction('suspend', r)} onClose={() => setPendingAction(null)} />
      )}
      {pendingAction === 'reactivate' && (
        <ConfirmReasonModal title="Reactivate this account?" confirmLabel="Reactivate" onConfirm={(r) => runAction('reactivate', r)} onClose={() => setPendingAction(null)} />
      )}
      {pendingAction === 'override-plan' && (
        <ConfirmReasonModal title={`Change plan to ${overridePlan}?`} description="This directly sets the account's plan without going through checkout -- use for comps, trials, or support fixes." confirmLabel="Change Plan" onConfirm={(r) => runAction('override-plan', r)} onClose={() => setPendingAction(null)} />
      )}
      {pendingAction === 'reset-usage' && (
        <ConfirmReasonModal title="Reset usage limits?" description="Lets the user scan again immediately, ignoring today's usage." confirmLabel="Reset Usage" onConfirm={(r) => runAction('reset-usage', r)} onClose={() => setPendingAction(null)} />
      )}
    </div>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div>
    <h4 className="text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">{title}</h4>
    {children}
  </div>
);

const Empty: React.FC<{ text: string }> = ({ text }) => <p className="text-xs text-slate-400 italic">{text}</p>;

const Table: React.FC<{ head: string[]; rows: React.ReactNode[][] }> = ({ head, rows }) => (
  <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
    <table className="w-full text-left text-xs border-collapse">
      <thead>
        <tr className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 font-bold uppercase text-[10px]">
          {head.map(h => <th key={h} className="py-2 px-3">{h}</th>)}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
        {rows.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => <td key={j} className="py-2 px-3">{cell}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
