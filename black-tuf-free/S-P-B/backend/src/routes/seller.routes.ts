import { Router } from 'express';
import { protect, restrictTo } from '../middleware/auth';
import {
  getSellerProfile, updateSellerProfile, submitVerification, getSellerStats,
  getSellerProducts, getSellerOrders, updateOrderItemStatus, getSellerEarnings,
  requestPayout, getProductReviews, addSellerResponse
} from '../controllers/seller.controller';
import { uploadMulti } from '../utils/upload';
import { body, param } from 'express-validator';
import { validationResultHandler } from '../middleware/validationResult';

const router = Router();

router.use(protect);
router.use(restrictTo('seller'));

router.get('/profile', getSellerProfile);
router.put('/profile', updateSellerProfile);
router.post('/verification/submit', uploadMulti, submitVerification);
router.get('/dashboard', getSellerStats);
router.get('/products', getSellerProducts);
router.get('/orders', getSellerOrders);
router.put('/orders/:id/status', body('status').notEmpty(), validationResultHandler, updateOrderItemStatus);
router.get('/earnings', getSellerEarnings);
router.post('/payouts', body('amount').isFloat({ min: 1 }), validationResultHandler, requestPayout);
router.get('/products/:productId/reviews', param('productId').isMongoId(), validationResultHandler, getProductReviews);
router.post('/reviews/:reviewId/response', param('reviewId').isMongoId(), body('text').notEmpty(), validationResultHandler, addSellerResponse);

export default router;


