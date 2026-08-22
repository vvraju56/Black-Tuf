import { body } from 'express-validator';

export const registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 100 })
    .withMessage('Name must be 100 characters or less'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .isString()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('phone').optional().trim().isString().isLength({ max: 20 })
];

export const loginValidation = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').exists().withMessage('Password is required')
];

export const forgotPasswordValidation = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail()
];

export const resetPasswordValidation = [
  body('token').notEmpty().withMessage('Token is required'),
  body('password')
    .isString()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
];

export const updateProfileValidation = [
  body('name').optional().trim().isLength({ max: 100 }).withMessage('Name must be 100 characters or less'),
  body('phone').optional().trim().isString().isLength({ max: 20 })
];

export const changePasswordValidation = [
  body('currentPassword').exists().withMessage('Current password is required'),
  body('newPassword')
    .isString()
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters')
];

export const verifyEmailValidation = [body('token').notEmpty().withMessage('Token is required')];


