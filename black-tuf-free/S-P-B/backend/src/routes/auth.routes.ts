import { Router } from 'express';
import {
  register, login, logout, verifyEmail, forgotPassword, resetPassword, refreshToken, getMe, updateProfile, changePassword
} from '../controllers/auth.controller';
import {
  registerValidation, loginValidation, forgotPasswordValidation, resetPasswordValidation, verifyEmailValidation,
  updateProfileValidation, changePasswordValidation
} from '../validators/auth.validator';
import { protect } from '../middleware/auth';
import { validationResultHandler } from '../middleware/validationResult';

const router = Router();

router.post('/register', registerValidation, validationResultHandler, register);
router.post('/login', loginValidation, validationResultHandler, login);
router.post('/logout', logout);
router.post('/verify-email', verifyEmailValidation, validationResultHandler, verifyEmail);
router.post('/forgot-password', forgotPasswordValidation, validationResultHandler, forgotPassword);
router.post('/reset-password', resetPasswordValidation, validationResultHandler, resetPassword);
router.post('/refresh-token', refreshToken);

router.use(protect);

router.get('/me', getMe);
router.put('/profile', updateProfileValidation, validationResultHandler, updateProfile);
router.put('/change-password', changePasswordValidation, validationResultHandler, changePassword);

export default router;


