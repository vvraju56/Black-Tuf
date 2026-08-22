import { body, param } from 'express-validator';

export const categoryValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('slug').trim().notEmpty().withMessage('Slug is required').isLength({ max: 100 }),
  body('description').optional().trim().isLength({ max: 500 }),
  body('parent').optional().isMongoId().withMessage('Invalid parent id'),
  body('order').optional().isInt({ min: 0 }).withMessage('Order must be a non-negative integer')
];

export const productValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 200 }),
  body('slug').trim().notEmpty().withMessage('Slug is required'),
  body('description').trim().notEmpty().withMessage('Description is required').isLength({ max: 10000 }),
  body('shortDescription').optional().isLength({ max: 500 }),
  body('category').isMongoId().withMessage('Valid category id is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
  body('compareAtPrice').optional().isFloat({ min: 0 }).withMessage('Compare at price must be non-negative'),
  body('tax').optional().isFloat({ min: 0 }).withMessage('Tax must be non-negative'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be non-negative'),
  body('weight').optional().isFloat({ min: 0 }),
  body('minimumOrderQuantity').optional().isInt({ min: 1 }).withMessage('MOQ must be at least 1')
];

export const reviewValidation = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('title').optional().isLength({ max: 200 }),
  body('comment').trim().notEmpty().withMessage('Comment is required').isLength({ max: 2000 })
];

export const couponValidation = [
  body('code').trim().notEmpty().withMessage('Code is required').isLength({ max: 50 }),
  body('type').isIn(['percentage', 'fixed']).withMessage('Type must be percentage or fixed'),
  body('value').isFloat({ min: 0 }).withMessage('Value must be non-negative'),
  body('startDate').isISO8601().withMessage('Valid start date required'),
  body('expiryDate').isISO8601().withMessage('Valid expiry date required'),
  body('minOrderValue').optional().isFloat({ min: 0 }),
  body('maxDiscount').optional().isFloat({ min: 0 }),
  body('usageLimit').optional().isInt({ min: 1 }),
  body('scope').isIn(['global', 'seller', 'product', 'category']).withMessage('Invalid scope')
];

export const mongooseIdValidation = [param('id').isMongoId().withMessage('Invalid id')];


