import './src/loadEnv';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { performScan } from './src/services/scannerEngine';
import { getUserFromAuthHeader, checkScanQuota, recordAnonymousScan } from './src/services/supabaseServer';
import { startScanRecord, completeScanRecord, failScanRecord } from './src/services/scanLifecycle';
import { createAdminRouter } from './src/server/adminRoutes';
import { createReportsRouter } from './src/server/reportRoutes';
import { startMonitoringScheduler } from './src/services/monitoringScheduler';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Needed for req.ip to reflect the real client address behind a reverse proxy
  // (Render, Cloud Run, etc.) instead of the proxy's own address.
  app.set('trust proxy', 1);

  app.use(express.json({ limit: '1mb' }));

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Real accessibility scan: fetches the page in a headless browser and runs axe-core against the live DOM.
  app.post('/api/scan', async (req, res) => {
    const { url, htmlSnippet } = req.body;

    if (!url && !htmlSnippet) {
      return res.status(400).json({ error: 'URL or HTML snippet is required' });
    }

    const user = await getUserFromAuthHeader(req.headers.authorization);

    if (user?.status === 'suspended') {
      return res.status(403).json({ error: 'Your account has been suspended. Contact support if you believe this is a mistake.' });
    }

    const quota = await checkScanQuota(user, req.ip || 'unknown');
    if (!quota.allowed) {
      return res.status(429).json({
        error: user
          ? `You've used your ${quota.limit} scans for today on the ${user.plan} plan. Upgrade for a higher daily limit or try again tomorrow.`
          : 'Free anonymous scans are limited to 1 per day. Sign up for a free account to run more scans.',
      });
    }

    const scanRecordId = await startScanRecord(user, url || 'Custom HTML Snippet');
    const startedAt = Date.now();

    try {
      const result = await performScan(url, htmlSnippet);
      await completeScanRecord(scanRecordId, result, Date.now() - startedAt);

      if (!user) {
        recordAnonymousScan(req.ip || 'unknown');
      }

      res.json(result);
    } catch (err: any) {
      console.error('Scan API error:', err);
      const message = err?.message || 'Internal error scanning website';
      const isClientError = /Invalid URL|Only http|local\/internal|private or internal|Could not resolve/.test(message);
      const isTimeout = /timed out/i.test(message);
      await failScanRecord(scanRecordId, message, isTimeout ? 'timed_out' : 'failed', Date.now() - startedAt);
      res.status(isClientError ? 400 : 502).json({ error: message });
    }
  });

  app.use('/api/reports', createReportsRouter());
  app.use('/api/admin', createAdminRouter());

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  startMonitoringScheduler();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AccessAudit server running on http://localhost:${PORT}`);
  });
}

startServer();
