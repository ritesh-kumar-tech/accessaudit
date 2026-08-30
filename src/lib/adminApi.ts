import { supabase } from './supabaseClient';

async function authHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handle<T>(res: Response): Promise<T> {
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error || `Request failed (${res.status})`);
  return json as T;
}

export async function adminGet<T>(path: string): Promise<T> {
  const headers = await authHeaders();
  const res = await fetch(`/api/admin${path}`, { headers });
  return handle<T>(res);
}

export async function adminPost<T>(path: string, body?: Record<string, unknown>): Promise<T> {
  const headers = await authHeaders();
  const res = await fetch(`/api/admin${path}`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {}),
  });
  return handle<T>(res);
}
