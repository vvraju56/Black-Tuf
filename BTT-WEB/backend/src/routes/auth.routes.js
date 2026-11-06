import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Admin } from '../models/Admin.js';
import { env } from '../config/env.js';
import { asyncHandler, ApiError } from '../utils/ApiError.js';
import { validate } from '../middleware/validate.js';
import { loginSchema, changePasswordSchema } from '../validators/schemas.js';
import { requireAdmin } from '../middleware/auth.js';
import { loginLimiter } from '../middleware/rateLimit.js';
import { setAdminCookie, clearAdminCookie } from '../utils/cookie.js';

const router = Router();

function publicAdmin(admin) {
  return {
    id: String(admin._id),
    name: admin.name,
    email: admin.email,
    role: admin.role,
    lastLoginAt: admin.lastLoginAt || null,
  };
}

router.post(
  '/login',
  loginLimiter,
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email: email.toLowerCase(), active: true }).select(
      '+passwordHash'
    );

    // Compare even when the account is missing to keep response timing similar.
    const hash = admin?.passwordHash || '$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvali';
    const ok = await bcrypt.compare(password, hash);
    if (!admin || !ok) throw new ApiError(401, 'Invalid email or password.');

    admin.lastLoginAt = new Date();
    await admin.save();

    const token = jwt.sign({ sub: String(admin._id), role: admin.role }, env.jwtSecret, {
      expiresIn: env.jwtExpiresIn,
    });
    setAdminCookie(res, token);
    res.json({ success: true, data: publicAdmin(admin) });
  })
);

router.post(
  '/logout',
  asyncHandler(async (_req, res) => {
    clearAdminCookie(res);
    res.json({ success: true, message: 'Signed out.' });
  })
);

router.get(
  '/me',
  requireAdmin,
  asyncHandler(async (req, res) => {
    res.json({ success: true, data: publicAdmin(req.admin) });
  })
);

router.post(
  '/change-password',
  requireAdmin,
  validate(changePasswordSchema),
  asyncHandler(async (req, res) => {
    const admin = await Admin.findById(req.admin._id).select('+passwordHash');
    if (!admin) throw new ApiError(404, 'Admin account not found.');

    const ok = await bcrypt.compare(req.body.currentPassword, admin.passwordHash);
    if (!ok) throw new ApiError(400, 'Your current password is incorrect.');

    admin.passwordHash = await bcrypt.hash(req.body.newPassword, 12);
    await admin.save();
    res.json({ success: true, message: 'Password updated.' });
  })
);

export default router;
