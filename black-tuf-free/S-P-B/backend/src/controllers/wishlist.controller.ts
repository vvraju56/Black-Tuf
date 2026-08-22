import type { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import Product from '../models/Product';
import Order from '../models/Order';
import Review from '../models/Review';
import { NotFoundError, BadRequestError } from '../utils/ApiError';

type AuthRequest = Request & { user?: any };

export const getWishlist = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.user.id).populate('wishlist', 'name slug price compareAtPrice images ratings reviewCount discount').select('wishlist');
    res.json({ status: 'success', data: { products: user?.wishlist || [] } });
  } catch (err) { next(err); }
};

export const addToWishlist = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) throw new NotFoundError('Product not found');
    const user = await User.findById(req.user.id);
    if (!user) throw new NotFoundError('User not found');
    if (!user.wishlist!.includes(product._id)) {
      user.wishlist!.push(product._id);
      await user.save();
    }
    res.status(201).json({ status: 'success', message: 'Added to wishlist' });
  } catch (err) { next(err); }
};

export const removeFromWishlist = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) throw new NotFoundError('User not found');
    user.wishlist = user.wishlist?.filter((p) => String(p) !== req.params.productId) || [];
    await user.save();
    res.json({ status: 'success', message: 'Removed from wishlist' });
  } catch (err) { next(err); }
};

export const getProductReviews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const product = await Product.findOne({ slug: req.params.productId });
    const targetId = product?._id || req.params.productId;
    if (!targetId) throw new NotFoundError('Product not found');
    const reviews = await Review.find({ product: targetId, status: 'approved' }).populate('customer', 'name avatar').sort({ createdAt: -1 });
    res.json({ status: 'success', results: reviews.length, data: { reviews } });
  } catch (err) { next(err); }
};

export const addReview = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { productId, rating, title, comment, images } = req.body;
    const product = await Product.findById(productId);
    if (!product) throw new NotFoundError('Product not found');

    if (req.user.role !== 'admin') {
      const purchased = await Order.findOne({ customer: req.user.id, 'items.product': productId, status: { $in: ['delivered', 'packed', 'shipped', 'out_for_delivery'] } });
      if (!purchased) throw new BadRequestError('You can only review products you have purchased');
      const already = await Review.findOne({ product: productId, customer: req.user.id });
      if (already) throw new BadRequestError('You have already reviewed this product');
    }

    const review = await Review.create({
      product: productId,
      customer: req.user.id,
      order: null,
      rating,
      title,
      comment,
      images,
      isVerifiedPurchase: true,
      status: 'pending',
    });
    res.status(201).json({ status: 'success', data: { review } });
  } catch (err) { next(err); }
};

export const reportReview = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) throw new NotFoundError('Review not found');
    review.reportedCount += 1;
    await review.save();
    res.json({ status: 'success', message: 'Report recorded' });
  } catch (err) { next(err); }
};
