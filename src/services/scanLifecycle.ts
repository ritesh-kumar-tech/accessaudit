import { supabaseAdmin } from './supabaseServer';
import type { AuthenticatedUser } from './supabaseServer';
import type { AuditResult } from '../types';

/**
 * Records every scan attempt (anonymous, authenticated, successful, or
 * failed) so admin ops views reflect real totals -- not just successful
 * authenticated scans. Returns null when Supabase isn't configured or the
 * insert fails; callers treat that as "don't bother updating it later."
 */
export async function startScanRecord(user: AuthenticatedUser | null, url: string): Promise<string | null> {
  if (!supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin
    .from('scans')
    .insert({
      user_id: user?.id ?? null,
      url,
      scan_status: 'running',
      plan_used: user?.plan ?? 'anonymous',
      started_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error) {
    console.error('Failed to record scan start:', error.message);
    return null;
  }
  return data.id as string;
}

export async function completeScanRecord(scanRecordId: string | null, result: AuditResult, durationMs: number): Promise<void> {
  if (!supabaseAdmin || !scanRecordId) return;

  await supabaseAdmin
    .from('scans')
    .update({
      scan_status: 'completed',
      result_status: result.status,
      overall_score: result.overallScore,
      grade: result.grade,
      critical_count: result.criticalCount,
      moderate_count: result.moderateCount,
      minor_count: result.minorCount,
      passed_count: result.passedCount,
      result,
      completed_at: new Date().toISOString(),
      duration_ms: durationMs,
    })
    .eq('id', scanRecordId);
}

export async function failScanRecord(
  scanRecordId: string | null,
  errorMessage: string,
  status: 'failed' | 'timed_out',
  durationMs: number
): Promise<void> {
  if (!supabaseAdmin || !scanRecordId) return;

  await supabaseAdmin
    .from('scans')
    .update({
      scan_status: status,
      error_message: errorMessage,
      completed_at: new Date().toISOString(),
      duration_ms: durationMs,
    })
    .eq('id', scanRecordId);
}
