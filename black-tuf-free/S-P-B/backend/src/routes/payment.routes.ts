import { Router } from 'express';
import { protect } from '../middleware/auth';
import { createRazorpayOrder, verifyRazorpayPayment, getRazorpayKey, refundPayment } from '../controllers/payment.controller';
import { body } from 'express-validator';
import { validationResultHandler } from '../middleware/validationResult';

const router = Router();

router.get('/key', getRazorpayKey);

router.use(protect);

router.post('/create', body('orderId').isMongoId(), body('amount').isFloat({ min: 0 }), validationResultHandler, createRazorpayOrder);
router.post('/verify', body('orderId').isMongoId(), body('paymentId').notEmpty(), body('signature').notEmpty(), body('mode').optional(), validationResultHandler, verifyRazorpayPayment);
router.post('/refund', body('orderId').isMongoId(), body('amount').optional().isFloat({ min: 0.01 }), body('reason').optional(), validationResultHandler, refundPayment);

export default router;


