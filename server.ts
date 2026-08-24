import express from 'express';
import path from 'path';
import dns from 'node:dns/promises';
import net from 'node:net';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import puppeteer, { Browser } from 'puppeteer';
import { AxePuppeteer } from '@axe-core/puppeteer';
import { buildAuditResult } from './src/services/axeMapping';

dotenv.config();

const SCAN_NAV_TIMEOUT_MS = 25000;

// Blocks scanning of localhost/private/link-local network ranges (SSRF guard),
// since this endpoint lets any visitor make our server fetch an arbitrary URL.
function isPrivateOrLoopbackIp(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split('.').map(Number);
    if (a === 127 || a === 10 || a === 0) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    return false;
  }
  if (net.isIPv6(ip)) {
    const normalized = ip.toLowerCase();
    return normalized === '::1' || normalized.startsWith('fe80:') || normalized.startsWith('fc') || normalized.startsWith('fd');
  }
  return false;
}

async function assertUrlIsScannable(rawUrl: string): Promise<URL> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error('Invalid URL format. Please provide a full URL like https://example.com');
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error('Only http:// and https:// URLs can be scanned.');
  }

  const hostname = parsed.hostname;
  if (hostname === 'localhost' || hostname.endsWith('.local')) {
    throw new Error('Scanning local/internal hostnames is not allowed.');
  }

  let addresses: string[];
  try {
    const lookups = await dns.lookup(hostname, { all: true });
    addresses = lookups.map(l => l.address);
  } catch {
    throw new Error(`Could not resolve hostname: ${hostname}`);
  }

  if (addresses.length === 0 || addresses.some(isPrivateOrLoopbackIp)) {
    throw new Error('This URL resolves to a private or internal network address and cannot be scanned.');
  }

  return parsed;
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '10mb' }));

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

    let browser: Browser | null = null;
    try {
      let scannedUrl: URL | null = null;
      if (url) {
        scannedUrl = await assertUrlIsScannable(url);
      }

      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      const page = await browser.newPage();
      await page.setViewport({ width: 1366, height: 900 });
      page.setDefaultNavigationTimeout(SCAN_NAV_TIMEOUT_MS);

      if (scannedUrl) {
        await page.goto(scannedUrl.toString(), { waitUntil: 'networkidle2', timeout: SCAN_NAV_TIMEOUT_MS });
      } else {
        await page.setContent(
          `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"></head><body>${htmlSnippet}</body></html>`,
          { waitUntil: 'load', timeout: SCAN_NAV_TIMEOUT_MS }
        );
      }

      const axeResults = await new AxePuppeteer(page).analyze();
      const scannedElementsCount = await page.evaluate(() => document.querySelectorAll('*').length);

      const targetLabel = scannedUrl ? scannedUrl.toString() : 'Custom HTML Snippet';
      const result = buildAuditResult(targetLabel, axeResults as any, scannedElementsCount);

      res.json(result);
    } catch (err: any) {
      console.error('Scan API error:', err);
      const message = err?.message || 'Internal error scanning website';
      const isClientError = /Invalid URL|Only http|local\/internal|private or internal|Could not resolve/.test(message);
      res.status(isClientError ? 400 : 502).json({ error: message });
    } finally {
      if (browser) await browser.close();
    }
  });

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

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AccessAudit server running on http://localhost:${PORT}`);
  });
}

startServer();
