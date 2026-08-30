import type { Request } from 'express';
import { supabaseAdmin } from '../../services/supabaseServer';

export function parsePagination(req: Request, defaultPageSize = 20) {
  const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(String(req.query.pageSize ?? String(defaultPageSize)), 10) || defaultPageSize));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  return { page, pageSize, from, to };
}

export function daysAgoIso(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

type QueryModifier = (q: any) => any;

/** Exact row count for a table, optionally filtered. Returns 0 if Supabase isn't configured. */
export async function countRows(table: string, modify?: QueryModifier): Promise<number> {
  if (!supabaseAdmin) return 0;
  let query = supabaseAdmin.from(table).select('id', { count: 'exact', head: true });
  if (modify) query = modify(query);
  const { count } = await query;
  return count || 0;
}

/** Aggregates per-user scan stats (total count, current-month count, last activity) for a bounded set of user IDs. */
export async function aggregateScanStats(userIds: string[]): Promise<Record<string, { totalScans: number; monthlyUsage: number; lastActivity: string | null }>> {
  const result: Record<string, { totalScans: number; monthlyUsage: number; lastActivity: string | null }> = {};
  if (!supabaseAdmin || userIds.length === 0) return result;

  const startOfMonth = new Date();
  startOfMonth.setUTCDate(1);
  startOfMonth.setUTCHours(0, 0, 0, 0);

  const { data } = await supabaseAdmin
    .from('scans')
    .select('user_id, started_at')
    .in('user_id', userIds);

  for (const row of data || []) {
    const uid = row.user_id as string;
    if (!result[uid]) result[uid] = { totalScans: 0, monthlyUsage: 0, lastActivity: null };
    result[uid].totalScans += 1;
    if (new Date(row.started_at) >= startOfMonth) result[uid].monthlyUsage += 1;
    if (!result[uid].lastActivity || new Date(row.started_at) > new Date(result[uid].lastActivity!)) {
      result[uid].lastActivity = row.started_at;
    }
  }
  return result;
}
