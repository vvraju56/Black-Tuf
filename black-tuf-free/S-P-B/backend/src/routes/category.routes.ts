import { Router } from 'express';
import {
  createCategory, getCategories, getCategory, updateCategory, deleteCategory, getCategoryTree
} from '../controllers/category.controller';
import { protect, restrictTo } from '../middleware/auth';
import { categoryValidation, mongooseIdValidation } from '../validators/general.validator';
import { validationResultHandler } from '../middleware/validationResult';

const router = Router();

router.get('/', getCategories);
router.get('/tree', getCategoryTree);
router.get('/:id', mongooseIdValidation, validationResultHandler, getCategory);

router.use(protect);
router.use(restrictTo('admin'));

router.post('/', categoryValidation, validationResultHandler, createCategory);
router.put('/:id', [...mongooseIdValidation, ...categoryValidation], validationResultHandler, updateCategory);
router.delete('/:id', mongooseIdValidation, validationResultHandler, deleteCategory);

export default router;


