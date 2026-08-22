import { Router } from 'express';
import { protect } from '../middleware/auth';
import {
  getAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress
} from '../controllers/address.controller';
import { body } from 'express-validator';
import { validationResultHandler } from '../middleware/validationResult';

const addressValidation = [
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('addressLine1').trim().notEmpty().withMessage('Address line 1 is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('state').trim().notEmpty().withMessage('State is required'),
  body('postalCode').trim().notEmpty().withMessage('Postal code is required'),
  body('country').trim().notEmpty().withMessage('Country is required')
];

const router = Router();

router.use(protect);

router.get('/', getAddresses);
router.post('/', addressValidation, validationResultHandler, addAddress);
router.put('/:id', validationResultHandler, updateAddress);
router.delete('/:id', deleteAddress);
router.patch('/:id/default', setDefaultAddress);

export default router;


