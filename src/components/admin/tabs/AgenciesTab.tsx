import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAdminData } from '../../../hooks/useAdminData';
import { DataStateWrapper } from '../shared/DataStateWrapper';
import { Pagination } from '../shared/Pagination';

interface AgencyRow {
  id: string;
  name: string;
  ownerEmail: string;
  ownerName: string;
  clientCount: number;
  monitoredSiteCount: number;
  website: string | null;
  created_at: string;
}
interface AgenciesResponse { rows: AgencyRow[]; page: number; pageSize: number; total: number; }

interface AgencyDetail {
  agency: { id: string; name: string; tagline: string | null; primary_color: string; contact_email: string | null; website: string | null };
  clients: { id: string; name: string; sites: { id: string; url: string }[] }[];
}

export const AgenciesTab: React.FC = () => {
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data, loading, error } = useAdminData<AgenciesResponse>(`/agencies?page=${page}&pageSize=20`);

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 space-y-4">
      <div>
        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Agency Accounts</h3>
        <p className="text-xs text-slate-500">Each agency's clients and sites are isolated -- selecting one only ever shows its own hierarchy.</p>
      </div>

      <DataStateWrapper loading={loading} error={error} empty={data?.rows.length === 0} emptyMessage="No agency accounts yet.">
        {data && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#080D1A] text-slate-500 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Agency</th>
                    <th className="py-2.5 px-3">Owner</th>
                    <th className="py-2.5 px-3">Clients</th>
                    <th className="py-2.5 px-3">Monitored Sites</th>
                    <th className="py-2.5 px-3">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {data.rows.map(a => (
                    <tr key={a.id} onClick={() => setSelectedId(a.id)} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer">
                      <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">{a.name}</td>
                      <td className="py-2.5 px-3 text-slate-500">{a.ownerEmail}</td>
                      <td className="py-2.5 px-3 font-mono">{a.clientCount}</td>
                      <td className="py-2.5 px-3 font-mono">{a.monitoredSiteCount}</td>
                      <td className="py-2.5 px-3 text-slate-500">{new Date(a.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={data.page} pageSize={data.pageSize} total={data.total} onPageChange={setPage} />
          </>
        )}
      </DataStateWrapper>

      {selectedId && <AgencyDetailModal agencyId={selectedId} onClose={() => setSelectedId(null)} />}
    </div>
  );
};

const AgencyDetailModal: React.FC<{ agencyId: string; onClose: () => void }> = ({ agencyId, onClose }) => {
  const { data, loading, error } = useAdminData<AgencyDetail>(`/agencies/${agencyId}`);
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-[#0B1120] border-b border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between">
          <h3 className="font-black text-sm text-slate-900 dark:text-white">Agency Hierarchy</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5">
          <DataStateWrapper loading={loading} error={error} empty={false}>
            {data && (
              <div className="space-y-4">
                <div>
                  <p className="font-black text-base text-slate-900 dark:text-white">{data.agency.name}</p>
                  {data.agency.tagline && <p className="text-xs text-slate-500">{data.agency.tagline}</p>}
                </div>
                {data.clients.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No clients added yet.</p>
                ) : (
                  data.clients.map(c => (
                    <div key={c.id} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                      <p className="font-bold text-xs text-slate-900 dark:text-white">{c.name}</p>
                      <ul className="mt-1.5 space-y-1">
                        {c.sites.map(s => <li key={s.id} className="text-[11px] font-mono text-slate-500">{s.url}</li>)}
                        {c.sites.length === 0 && <li className="text-[11px] text-slate-400 italic">No sites yet.</li>}
                      </ul>
                    </div>
                  ))
                )}
              </div>
            )}
          </DataStateWrapper>
        </div>
      </div>
    </div>
  );
};
