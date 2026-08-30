import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useAdminData } from '../../../hooks/useAdminData';
import { DataStateWrapper } from '../shared/DataStateWrapper';
import { Pagination } from '../shared/Pagination';

interface AuditLogRow {
  id: string;
  adminEmail: string;
  action: string;
  target_type: string;
  target_id: string | null;
  previous_value: unknown;
  new_value: unknown;
  reason: string;
  created_at: string;
}
interface AuditLogResponse { rows: AuditLogRow[]; page: number; pageSize: number; total: number; }

export const AuditLogTab: React.FC = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { data, loading, error } = useAdminData<AuditLogResponse>(`/audit-log?search=${encodeURIComponent(search)}&page=${page}&pageSize=25`);

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Admin Audit Log</h3>
          <p className="text-xs text-slate-500">Append-only record of every sensitive admin action. Cannot be edited or deleted from this UI.</p>
        </div>
        <div className="relative w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search action, target, reason..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#080D1A] text-slate-900 dark:text-white focus:outline-hidden"
          />
        </div>
      </div>

      <DataStateWrapper loading={loading} error={error} empty={data?.rows.length === 0} emptyMessage="No admin actions logged yet.">
        {data && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#080D1A] text-slate-500 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Admin</th>
                    <th className="py-2.5 px-3">Action</th>
                    <th className="py-2.5 px-3">Target</th>
                    <th className="py-2.5 px-3">Reason</th>
                    <th className="py-2.5 px-3">When</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {data.rows.map(a => (
                    <tr key={a.id}>
                      <td className="py-2.5 px-3 text-slate-500">{a.adminEmail}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white font-mono">{a.action}</td>
                      <td className="py-2.5 px-3 font-mono text-[11px]">{a.target_type}{a.target_id ? `:${a.target_id.slice(0, 8)}` : ''}</td>
                      <td className="py-2.5 px-3 max-w-xs truncate" title={a.reason}>{a.reason}</td>
                      <td className="py-2.5 px-3 text-slate-500">{new Date(a.created_at).toLocaleString()}</td>
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
