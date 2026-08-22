import { Router } from 'express';
import { protect } from '../middleware/auth';
import { body } from 'express-validator';
import { validationResultHandler } from '../middleware/validationResult';
import { getWishlist, addToWishlist, removeFromWishlist, getProductReviews, addReview, reportReview } from '../controllers/wishlist.controller';

const router = Router();

router.get('/reviews/:productId', getProductReviews);

router.use(protect);

router.get('/wishlist', getWishlist);
router.post('/wishlist/:productId', addToWishlist);
router.delete('/wishlist/:productId', removeFromWishlist);

router.post(
  '/reviews',
  body('productId').notEmpty(),
  body('rating').isInt({ min: 1, max: 5 }),
  body('comment').notEmpty(),
  body('title').optional(),
  body('images').optional().isArray(),
  validationResultHandler,
  addReview
);

router.post('/reviews/:id/report', reportReview);

export default router;
