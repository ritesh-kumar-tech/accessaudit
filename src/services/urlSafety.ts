import dns from 'node:dns/promises';
import net from 'node:net';

// Blocks scanning of localhost/private/link-local network ranges (SSRF guard),
// since the scan endpoint lets any visitor make our server fetch an arbitrary URL.
export function isPrivateOrLoopbackIp(ip: string): boolean {
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

export async function assertUrlIsScannable(rawUrl: string): Promise<URL> {
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
