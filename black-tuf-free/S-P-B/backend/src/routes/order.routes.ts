import { Router } from 'express';
import { protect } from '../middleware/auth';
import { createOrder, getOrders, getOrder, cancelOrder, validateOrderTotals, getOrderStatuses } from '../controllers/order.controller';
import { body } from 'express-validator';
import { validationResultHandler } from '../middleware/validationResult';

const shippingAddressValidation = [
  body('shippingAddress').exists().withMessage('Shipping address required'),
  body('shippingAddress.fullName').trim().notEmpty().withMessage('Full name required'),
  body('shippingAddress.phone').trim().notEmpty().withMessage('Phone required'),
  body('shippingAddress.addressLine1').trim().notEmpty().withMessage('Address required'),
  body('shippingAddress.city').trim().notEmpty().withMessage('City required'),
  body('shippingAddress.state').trim().notEmpty().withMessage('State required'),
  body('shippingAddress.postalCode').trim().notEmpty().withMessage('Postal code required'),
  body('shippingAddress.country').trim().notEmpty().withMessage('Country required'),
  body('paymentMethod').isIn(['razorpay', 'cod']).withMessage('Invalid payment method')
];

const router = Router();

router.get('/statuses', getOrderStatuses);

router.use(protect);

router.get('/', getOrders);
router.post('/validate', body('items').isArray(), validationResultHandler, validateOrderTotals);
router.post('/', shippingAddressValidation, validationResultHandler, createOrder);
router.get('/:id', getOrder);
router.put('/:id/cancel', cancelOrder);

export default router;


