import jwt from 'jsonwebtoken';
import { Admin } from '../models/Admin.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/ApiError.js';

function extractToken(req) {
  if (req.cookies?.[env.cookieName]) return req.cookies[env.cookieName];
  const header = req.get('authorization') || '';
  if (header.toLowerCase().startsWith('bearer ')) return header.slice(7).trim();
  return null;
}

export const requireAdmin = asyncHandler(async (req, _res, next) => {
  const token = extractToken(req);
  if (!token) throw new ApiError(401, 'Authentication required.');

  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch {
    throw new ApiError(401, 'Your session has expired. Please sign in again.');
  }

  const admin = await Admin.findById(payload.sub);
  if (!admin || !admin.active) {
    throw new ApiError(401, 'This admin account is unavailable.');
  }

  req.admin = admin;
  next();
});

export function optionalAdmin(req, _res, next) {
  const token = extractToken(req);
  if (!token) return next();
  try {
    req.authPayload = jwt.verify(token, env.jwtSecret);
  } catch {
    // Ignore invalid optional tokens.
  }
  next();
}
