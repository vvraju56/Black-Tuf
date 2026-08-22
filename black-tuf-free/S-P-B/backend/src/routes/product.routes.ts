import { Router } from 'express';
import {
  createProduct, getProducts, getProduct, updateProduct, deleteProduct, searchProducts
} from '../controllers/product.controller';
import { protect, restrictTo } from '../middleware/auth';
import { productValidation, mongooseIdValidation } from '../validators/general.validator';
import { validationResultHandler } from '../middleware/validationResult';
import { uploadMulti } from '../utils/upload';

const router = Router();

router.get('/', getProducts);
router.get('/search', searchProducts);
router.get('/:slug', getProduct);

router.use(protect);

router.post(
  '/',
  restrictTo('seller', 'admin'),
  uploadMulti,
  productValidation,
  validationResultHandler,
  createProduct
);

router.put(
  '/:id',
  restrictTo('seller', 'admin'),
  mongooseIdValidation,
  validationResultHandler,
  uploadMulti,
  updateProduct
);

router.delete('/:id', restrictTo('seller', 'admin'), mongooseIdValidation, validationResultHandler, deleteProduct);

export default router;


