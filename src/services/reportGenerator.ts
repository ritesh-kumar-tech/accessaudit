import { generateAuditPdf } from './pdfGenerator';
import { supabaseAdmin } from './supabaseServer';
import type { AuditResult, AgencyBranding, PlanTier } from '../types';

/**
 * Renders the PDF server-side (reusing the same generateAuditPdf used for
 * the in-browser preview) and uploads it to the private "reports" Storage
 * bucket, then marks the report row ready/failed. Runs synchronously in the
 * request handler since generation takes well under a second -- no queue
 * needed at this scale.
 */
export async function generateAndStoreReport(
  reportId: string,
  userId: string,
  audit: AuditResult,
  agencyBranding: AgencyBranding | undefined,
  planTier: PlanTier
): Promise<void> {
  if (!supabaseAdmin) return;

  try {
    const doc = generateAuditPdf(audit, agencyBranding, planTier);
    const buffer = Buffer.from(doc.output('arraybuffer') as ArrayBuffer);
    const storagePath = `${userId}/${reportId}.pdf`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from('reports')
      .upload(storagePath, buffer, { contentType: 'application/pdf', upsert: true });
    if (uploadError) throw uploadError;

    await supabaseAdmin.from('reports').update({ status: 'ready', storage_path: storagePath }).eq('id', reportId);
  } catch (err: any) {
    console.error('Report generation failed:', err);
    await supabaseAdmin
      .from('reports')
      .update({ status: 'failed', error_message: err?.message || 'PDF generation failed' })
      .eq('id', reportId);
  }
}

/** Looks up the branding to apply for a user's report: their own agency's
 * branding if they own one and are on the agency plan, otherwise undefined
 * (plain AccessAudit branding). Never trusts client-submitted branding for
 * report generation -- an agency plan is required and the agency row must
 * actually belong to the requesting user. */
export async function resolveAgencyBrandingForUser(userId: string, plan: PlanTier): Promise<AgencyBranding | undefined> {
  if (!supabaseAdmin || plan !== 'agency') return undefined;

  const { data } = await supabaseAdmin
    .from('agencies')
    .select('name, tagline, primary_color, accent_color, logo_url, contact_email, website')
    .eq('owner_id', userId)
    .limit(1)
    .maybeSingle();

  if (!data) return undefined;

  return {
    enabled: true,
    agencyName: data.name,
    tagline: data.tagline || '',
    primaryColor: data.primary_color,
    accentColor: data.accent_color,
    contactEmail: data.contact_email || '',
    website: data.website || '',
    logoUrl: data.logo_url || '',
    disclaimer: 'This audit report is generated using automated WCAG 2.2 testing and does not constitute legal advice or a guarantee of compliance.',
  };
}
