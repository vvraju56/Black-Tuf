import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { Admin } from './types';

const API_URL = (
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:5000'
).replace(/\/$/, '');

export const ADMIN_COOKIE = 'btt_admin_token';

type Envelope<T> = { success: boolean; data: T; message?: string };

export async function getAdmin(): Promise<Admin | null> {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  if (!token) return null;

  try {
    const response = await fetch(`${API_URL}/api/auth/me`, {
      headers: {
        Accept: 'application/json',
        Cookie: `${ADMIN_COOKIE}=${token}`,
      },
      cache: 'no-store',
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as Envelope<Admin>;
    return payload?.success ? payload.data : null;
  } catch {
    return null;
  }
}

export async function requireAdmin(): Promise<Admin> {
  const admin = await getAdmin();
  if (!admin) redirect('/admin/login');
  return admin;
}

export async function adminGet<T>(path: string): Promise<T | null> {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  if (!token) return null;

  try {
    const response = await fetch(`${API_URL}${path}`, {
      headers: {
        Accept: 'application/json',
        Cookie: `${ADMIN_COOKIE}=${token}`,
      },
      cache: 'no-store',
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as Envelope<T>;
    return payload?.success ? payload.data : null;
  } catch {
    return null;
  }
}
