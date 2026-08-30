import puppeteer, { Browser } from 'puppeteer';
import { AxePuppeteer } from '@axe-core/puppeteer';
import { buildAuditResult } from './axeMapping';
import { assertUrlIsScannable } from './urlSafety';
import type { AuditResult } from '../types';

export const SCAN_NAV_TIMEOUT_MS = 25000;

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`${label} timed out`)), ms)),
  ]);
}

/**
 * Runs one accessibility scan end-to-end: SSRF-checks the URL, launches a
 * throwaway headless browser, runs axe-core, and always closes the browser.
 * Shared by the /api/scan route and the monitoring scheduler so both paths
 * get the same SSRF guard, timeout, and result-shaping behavior.
 */
export async function performScan(url?: string, htmlSnippet?: string): Promise<AuditResult> {
  if (!url && !htmlSnippet) {
    throw new Error('URL or HTML snippet is required');
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

    const axeResults = await withTimeout(new AxePuppeteer(page).analyze(), SCAN_NAV_TIMEOUT_MS, 'Accessibility analysis');
    const scannedElementsCount = await page.evaluate(() => document.querySelectorAll('*').length);

    const targetLabel = scannedUrl ? scannedUrl.toString() : 'Custom HTML Snippet';
    return buildAuditResult(targetLabel, axeResults as any, scannedElementsCount);
  } finally {
    if (browser) await browser.close();
  }
}
