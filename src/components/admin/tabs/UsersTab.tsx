import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useAdminData } from '../../../hooks/useAdminData';
import { DataStateWrapper } from '../shared/DataStateWrapper';
import { StatusBadge } from '../shared/StatusBadge';
import { Pagination } from '../shared/Pagination';
import { UserDetailDrawer } from './UserDetailDrawer';

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  plan: string;
  status: string;
  signupDate: string;
  lastActivity: string | null;
  totalScans: number;
  monthlyUsage: number;
}

interface UsersResponse {
  rows: UserRow[];
  page: number;
  pageSize: number;
  total: number;
}

export const UsersTab: React.FC = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const { data, loading, error, refetch } = useAdminData<UsersResponse>(`/users?search=${encodeURIComponent(search)}&page=${page}&pageSize=20`);

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Users</h3>
          <p className="text-xs text-slate-500">Search, inspect, and take action on any account.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search name or email..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#080D1A] text-slate-900 dark:text-white focus:outline-hidden"
          />
        </div>
      </div>

      <DataStateWrapper loading={loading} error={error} empty={data?.rows.length === 0} emptyMessage="No users match your search.">
        {data && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#080D1A] text-slate-500 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Name</th>
                    <th className="py-2.5 px-3">Email</th>
                    <th className="py-2.5 px-3">Plan</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Signed Up</th>
                    <th className="py-2.5 px-3">Last Activity</th>
                    <th className="py-2.5 px-3">Total Scans</th>
                    <th className="py-2.5 px-3">This Month</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {data.rows.map(u => (
                    <tr
                      key={u.id}
                      onClick={() => setSelectedUserId(u.id)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer"
                    >
                      <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">{u.name}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-500">{u.email}</td>
                      <td className="py-2.5 px-3 uppercase font-bold text-slate-700 dark:text-slate-300">{u.plan}</td>
                      <td className="py-2.5 px-3"><StatusBadge status={u.status} /></td>
                      <td className="py-2.5 px-3 text-slate-500">{new Date(u.signupDate).toLocaleDateString()}</td>
                      <td className="py-2.5 px-3 text-slate-500">{u.lastActivity ? new Date(u.lastActivity).toLocaleDateString() : '—'}</td>
                      <td className="py-2.5 px-3 font-mono">{u.totalScans}</td>
                      <td className="py-2.5 px-3 font-mono">{u.monthlyUsage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={data.page} pageSize={data.pageSize} total={data.total} onPageChange={setPage} />
          </>
        )}
      </DataStateWrapper>

      {selectedUserId && (
        <UserDetailDrawer userId={selectedUserId} onClose={() => setSelectedUserId(null)} onChanged={refetch} />
      )}
    </div>
  );
};
