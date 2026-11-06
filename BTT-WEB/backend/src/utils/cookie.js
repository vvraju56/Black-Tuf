import { env } from '../config/env.js';

export function adminCookieOptions() {
  return {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

export function setAdminCookie(res, token) {
  res.cookie(env.cookieName, token, adminCookieOptions());
}

export function clearAdminCookie(res) {
  res.clearCookie(env.cookieName, { ...adminCookieOptions(), maxAge: undefined });
}
