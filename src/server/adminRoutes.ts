import { Router } from 'express';
import { requireAdmin } from '../services/adminAuth';
import { createOverviewRouter } from './admin/overview';
import { createUsersRouter } from './admin/users';
import { createScansRouter } from './admin/scans';
import { createMonitoringRouter } from './admin/monitoring';
import { createAgenciesRouter } from './admin/agencies';
import { createBillingRouter } from './admin/billing';
import { createAdminReportsRouter } from './admin/reports';
import { createEmailLogsRouter } from './admin/emailLogs';
import { createSystemHealthRouter } from './admin/systemHealth';
import { createAuditLogRouter } from './admin/auditLogRoutes';

/**
 * Every route mounted here requires a verified admin session
 * (src/services/adminAuth.ts) -- checked on the server for every single
 * request, never inferred from anything the client sends about itself.
 */
export function createAdminRouter(): Router {
  const router = Router();
  router.use(requireAdmin);

  router.use('/overview', createOverviewRouter());
  router.use('/users', createUsersRouter());
  router.use('/scans', createScansRouter());
  router.use('/monitoring', createMonitoringRouter());
  router.use('/agencies', createAgenciesRouter());
  router.use('/billing', createBillingRouter());
  router.use('/reports', createAdminReportsRouter());
  router.use('/email-logs', createEmailLogsRouter());
  router.use('/system-health', createSystemHealthRouter());
  router.use('/audit-log', createAuditLogRouter());

  return router;
}
