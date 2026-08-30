import type { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from './supabaseServer';

export interface AdminUser {
  id: string;
  email: string | undefined;
}

export interface AdminRequest extends Request {
  admin?: AdminUser;
}

/**
 * Server-side admin authorization gate. This is the ONLY place admin-ness
 * is decided -- there is no client-side "isAdmin" check anywhere that
 * grants real access. A request reaches a protected handler only if:
 *   1. it carries a valid, non-expired Supabase access token, AND
 *   2. the corresponding profiles row has role = 'admin', AND
 *   3. that profile isn't suspended.
 * Typing /admin into the browser, editing React state, or hand-crafting an
 * API request cannot bypass this -- there is no code path that trusts the
 * client's claim about its own role.
 */
export async function requireAdmin(req: AdminRequest, res: Response, next: NextFunction) {
  if (!supabaseAdmin) {
    return res.status(503).json({ error: 'Admin features require Supabase to be configured on the server.' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  const token = authHeader.slice('Bearer '.length);
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) {
    return res.status(401).json({ error: 'Your session has expired. Please sign in again.' });
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('role, status')
    .eq('id', data.user.id)
    .single();

  if (profileError || !profile || profile.role !== 'admin') {
    return res.status(403).json({ error: 'You do not have permission to access this resource.' });
  }
  if (profile.status === 'suspended') {
    return res.status(403).json({ error: 'This account has been suspended.' });
  }

  req.admin = { id: data.user.id, email: data.user.email };
  next();
}
