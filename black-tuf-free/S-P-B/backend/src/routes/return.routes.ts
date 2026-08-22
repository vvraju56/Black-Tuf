import { Router } from 'express';
import { protect, restrictTo } from '../middleware/auth';
import { body, param } from 'express-validator';
import { validationResultHandler } from '../middleware/validationResult';
import {
  createReturnRequest, getCustomerReturns, getSellerReturns, listReturns,
  updateReturnStatus, listRefunds, getCustomerRefunds
} from '../controllers/return.controller';

const router = Router();

router.get('/refunds', protect, getCustomerRefunds);

router.use(protect);

router.get('/my', getCustomerReturns);
router.post(
  '/',
  body('orderId').notEmpty(),
  body('items').isArray({ min: 1 }),
  validationResultHandler,
  createReturnRequest
);

router.get('/seller', restrictTo('seller'), getSellerReturns);

router.get('/admin/list', restrictTo('admin'), listReturns);
router.get('/admin/refunds', restrictTo('admin'), listRefunds);
router.put('/admin/:id/approve', restrictTo('admin'), param('id').isMongoId(), validationResultHandler, updateReturnStatus('approve'));
router.put('/admin/:id/reject', restrictTo('admin'), param('id').isMongoId(), validationResultHandler, updateReturnStatus('reject'));
router.put('/admin/:id/schedule-pickup', restrictTo('admin'), param('id').isMongoId(), validationResultHandler, updateReturnStatus('schedule-pickup'));
router.put('/admin/:id/picked-up', restrictTo('admin'), param('id').isMongoId(), validationResultHandler, updateReturnStatus('picked-up'));
router.put('/admin/:id/receive', restrictTo('admin'), param('id').isMongoId(), validationResultHandler, updateReturnStatus('receive'));
router.put('/admin/:id/process-refund', restrictTo('admin'), param('id').isMongoId(), validationResultHandler, updateReturnStatus('process-refund'));
router.put('/admin/:id/refund', restrictTo('admin'), param('id').isMongoId(), validationResultHandler, updateReturnStatus('refund'));

export default router;
