import React, { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { useAdminData } from '../../../hooks/useAdminData';
import { adminPost } from '../../../lib/adminApi';
import { DataStateWrapper } from '../shared/DataStateWrapper';
import { StatusBadge } from '../shared/StatusBadge';
import { Pagination } from '../shared/Pagination';
import { NotConnectedBanner } from '../shared/NotConnectedBanner';

interface PaymentRow {
  id: string;
  customerEmail: string;
  amount: number;
  currency: string;
  plan: string | null;
  status: string;
  stripe_payment_intent_id: string | null;
  stripe_invoice_id: string | null;
  refund_reason: string | null;
  created_at: string;
}
interface PaymentsResponse { rows: PaymentRow[]; page: number; pageSize: number; total: number; stripeConnected: boolean; }

export const PaymentsTab: React.FC = () => {
  const [page, setPage] = useState(1);
  const [refundTarget, setRefundTarget] = useState<PaymentRow | null>(null);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [refundError, setRefundError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { data, loading, error, refetch } = useAdminData<PaymentsResponse>(`/billing/payments?page=${page}&pageSize=20`);

  const submitRefund = async () => {
    if (!refundTarget) return;
    if (!refundAmount || !refundReason.trim()) { setRefundError('Amount and reason are both required.'); return; }
    setSubmitting(true);
    setRefundError(null);
    try {
      await adminPost(`/billing/payments/${refundTarget.id}/refund`, { amount: Number(refundAmount), reason: refundReason.trim() });
      setRefundTarget(null);
      refetch();
    } catch (err: any) {
      setRefundError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 space-y-4">
      <div>
        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Payments</h3>
        <p className="text-xs text-slate-500">Transaction ledger, reconciled from Stripe.</p>
      </div>

      {data && !data.stripeConnected && (
        <NotConnectedBanner message="Stripe isn't connected on this deployment yet, so refunds are disabled and this ledger will stay empty until billing is wired up." />
      )}

      <DataStateWrapper loading={loading} error={error} empty={data?.rows.length === 0} emptyMessage="No payments yet.">
        {data && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#080D1A] text-slate-500 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Plan</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Stripe Ref</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {data.rows.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 text-slate-500">{new Date(p.created_at).toLocaleDateString()}</td>
                      <td className="py-2.5 px-3">{p.customerEmail}</td>
                      <td className="py-2.5 px-3 font-mono font-bold">{p.amount} {p.currency?.toUpperCase()}</td>
                      <td className="py-2.5 px-3 uppercase">{p.plan || '—'}</td>
                      <td className="py-2.5 px-3">
                        <StatusBadge status={p.status} />
                        {p.refund_reason && <p className="text-[10px] text-slate-400 mt-0.5">{p.refund_reason}</p>}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px]">{p.stripe_payment_intent_id || p.stripe_invoice_id || '—'}</td>
                      <td className="py-2.5 px-3 text-right">
                        {p.status === 'succeeded' && (
                          <button onClick={() => { setRefundTarget(p); setRefundAmount(String(p.amount)); setRefundReason(''); setRefundError(null); }} className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 flex items-center gap-1 ml-auto">
                            <RotateCcw className="w-3 h-3" /> Refund
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

      {refundTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 max-w-md w-full space-y-4">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">Refund payment {refundTarget.id.slice(0, 8)}</h3>
              <p className="text-xs text-slate-500 mt-1">Customer: {refundTarget.customerEmail}</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Refund Amount</label>
              <input type="number" value={refundAmount} onChange={(e) => setRefundAmount(e.target.value)} className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#080D1A] text-slate-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Reason (required, logged)</label>
              <textarea value={refundReason} onChange={(e) => setRefundReason(e.target.value)} rows={3} className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#080D1A] text-slate-900 dark:text-white" />
            </div>
            {refundError && <p className="text-xs text-red-600 dark:text-red-400">{refundError}</p>}
            <div className="flex justify-end gap-2">
              <button onClick={() => setRefundTarget(null)} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300">Cancel</button>
              <button onClick={submitRefund} disabled={submitting} className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50">
                {submitting ? 'Processing...' : 'Confirm Refund'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
