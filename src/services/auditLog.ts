import { supabaseAdmin } from './supabaseServer';

export interface AuditLogEntry {
  adminId: string;
  action: string;
  targetType: string;
  targetId?: string | null;
  previousValue?: unknown;
  newValue?: unknown;
  reason: string;
}

/**
 * Append-only. There is no update/delete function exported here on
 * purpose -- admin_audit_log has no client-writable RLS policy either, so
 * the only way a row can ever be created is through this function, and
 * nothing in the codebase ever modifies or removes one afterward.
 */
export async function logAdminAction(entry: AuditLogEntry): Promise<void> {
  if (!supabaseAdmin) return;

  const { error } = await supabaseAdmin.from('admin_audit_log').insert({
    admin_id: entry.adminId,
    action: entry.action,
    target_type: entry.targetType,
    target_id: entry.targetId ?? null,
    previous_value: entry.previousValue ?? null,
    new_value: entry.newValue ?? null,
    reason: entry.reason,
  });

  if (error) {
    console.error('Failed to write admin audit log entry:', error.message);
  }
}
