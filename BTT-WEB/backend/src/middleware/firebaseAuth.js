import { getFirebaseAdmin } from '../config/firebase.js';
import admin from 'firebase-admin';
import { Admin } from '../models/Admin.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/ApiError.js';

/**
 * Verifies a Firebase ID token (from Authorization: Bearer <token>) and
 * resolves the admin record from MongoDB (roles are stored in MongoDB).
 */
export const requireFirebaseAdmin = asyncHandler(async (req, _res, next) => {
  const header = req.get('authorization') || '';
  if (!header.toLowerCase().startsWith('bearer ')) {
    throw new ApiError(401, 'Authentication required.');
  }
  const idToken = header.slice(7).trim();

  const app = getFirebaseAdmin();
  if (!app) throw new ApiError(503, 'Firebase authentication is not configured.');

  let decoded;
  try {
    decoded = await admin.auth().verifyIdToken(idToken);
  } catch {
    throw new ApiError(401, 'Your session has expired. Please sign in again.');
  }

  const adminDoc = await Admin.findOne({ firebaseUid: decoded.uid });
  if (!adminDoc || !adminDoc.active) {
    throw new ApiError(401, 'This admin account is unavailable.');
  }

  req.admin = adminDoc;
  req.firebaseUser = decoded;
  next();
});

export const optionalFirebaseAdmin = asyncHandler(async (req, _res, next) => {
  const header = req.get('authorization') || '';
  if (!header.toLowerCase().startsWith('bearer ')) return next();
  const idToken = header.slice(7).trim();
  const app = getFirebaseAdmin();
  if (!app) return next();
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    const adminDoc = await Admin.findOne({ firebaseUid: decoded.uid });
    if (adminDoc?.active) {
      req.admin = adminDoc;
      req.firebaseUser = decoded;
    }
  } catch {
    // Ignore invalid optional tokens.
  }
  next();
});