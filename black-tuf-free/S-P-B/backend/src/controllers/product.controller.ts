import type { Request, Response, NextFunction } from 'express';
import Product from '../models/Product';
import Category from '../models/Category';
import Review from '../models/Review';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/ApiError';
import { generateSlug, generateSKU, calculatePagination } from '../utils/slug';
import { uploadToCloudinary } from '../utils/upload';
import { ProductStatus } from '../types/index';
import mongoose from 'mongoose';

interface PaginatedProducts {
  products: any[];
  pagination: any;
}

export const createProduct = async (req: Request & { user?: any }, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user.id;
    let sellerId = req.user.sellerId;
    if (!sellerId) {
      const seller = await import('../models/Seller').then((m) => m.default.findOne({ user: userId }));
      if (!seller || !seller.isApproved) throw new BadRequestError('Seller account not approved');
      sellerId = seller._id.toString();
    }

    const { body: data } = req;
    const files = req.files as any;
    const images: string[] = [];
    if (files?.images) {
      for (const file of files.images) {
        const upload = await uploadToCloudinary(file, 'products');
        images.push(upload.url);
      }
    }
    if (files?.videos) {
      // video handling could extend cloudinary resource_type video
    }

    let imagesArr = data.images || images;
    if (!imagesArr || imagesArr.length === 0) {
      throw new BadRequestError('At least one product image is required');
    }

    const category = await Category.findById(data.category);
    if (!category) throw new NotFoundError('Category not found');

    const productData = {
      ...data,
      images: imagesArr,
      slug: generateSlug(data.name),
      seller: sellerId,
      sku: data.sku || generateSKU(),
      status: 'draft' as ProductStatus,
      approvalStatus: 'pending',
      ...(data.price !== undefined ? { price: data.price } : {}),
      ...(data.stock !== undefined ? { stock: data.stock } : {})
    };

    const product = await Product.create(productData);

    await Category.updateOne({ _id: category._id }, { $inc: { productCount: 1 } });
    res.status(201).json({ status: 'success', data: { product } });
  } catch (err) {
    next(err);
  }
};

export const getProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      page = '1', limit = '12', sort = 'createdAt', order = 'desc',
      category, subcategory, brand, seller, minPrice, maxPrice, rating, inStock, discount, tags, q,
      status, approvalStatus, isFeatured, isFlashSale
    } = req.query;

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    else filter.status = { $in: ['approved', 'published'] };

    if (approvalStatus) filter.approvalStatus = approvalStatus;
    if (category) {
      const isObjectId = mongoose.Types.ObjectId.isValid(category as string);
      if (isObjectId) {
        filter.category = category;
      } else {
        const cat = await Category.findOne({ slug: category as string });
        filter.category = cat ? cat._id : '__none__';
      }
    }
    if (subcategory) {
      const isSubId = mongoose.Types.ObjectId.isValid(subcategory as string);
      if (isSubId) {
        filter.subcategory = subcategory;
      } else {
        const sub = await Category.findOne({ slug: subcategory as string });
        filter.subcategory = sub ? sub._id : '__none__';
      }
    }
    if (brand) filter.brand = new RegExp(brand as string, 'i');
    if (seller) filter.seller = seller;
    if (tags) filter.tags = { $in: (tags as string).split(',') };
    if (isFeatured === 'true') filter.isFeatured = true;
    if (isFlashSale === 'true') filter.isFlashSale = true;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) (filter.price as Record<string, number>).$gte = Number(minPrice);
      if (maxPrice) (filter.price as Record<string, number>).$lte = Number(maxPrice);
    }
    if (rating) (filter.ratings as Record<string, number>) = { $gte: Number(rating) };
    if (inStock === 'true') filter.stock = { $gt: 0 };
    if (discount === 'true') filter.discount = { $gt: 0 };
    if (q) filter.$text = { $search: q as string };

    const sortMap: Record<string, any> = {
      price: { price: 1 },
      '-price': { price: -1 },
      rating: { ratings: -1 },
      '-rating': { ratings: 1 },
      createdAt: { createdAt: -1 },
      '-createdAt': { createdAt: 1 },
      discount: { discount: -1 },
      popularity: { reviewCount: -1 }
    };
    const sortOption = (order === 'asc' ? '' : '-') + String(sort);
    const sortObj = sortMap[sortOption] || { createdAt: -1 };

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.max(1, Math.min(50, parseInt(limit as string, 10)));

    const [products, count] = await Promise.all([
      Product.find(filter).sort(sortObj).skip((pageNum - 1) * limitNum).limit(limitNum).populate('category', 'name slug').populate('seller', 'storeName'),
      Product.countDocuments(filter)
    ]);

    const pagination = calculatePagination(pageNum, limitNum, count);
    res.json({ status: 'success', results: products.length, pagination, data: { products } });
  } catch (err) {
    next(err);
  }
};

export const getProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const product = await Product.findOne({ slug: req.params.slug })
      .populate('category', 'name slug')
      .populate('subcategory', 'name slug')
      .populate('seller', 'storeName rating totalSales reviewCount');

    if (!product) throw new NotFoundError('Product not found');

    const reviews = await Review.find({ product: product._id, status: 'approved' }).populate('customer', 'name avatar').limit(20).sort({ createdAt: -1 });

    res.json({ status: 'success', data: { product, reviews } });
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (req: Request & { user?: any }, res: Response, next: NextFunction): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) throw new NotFoundError('Product not found');

    if (String(product.seller) !== req.user.sellerId && req.user.role !== 'admin') {
      throw new ForbiddenError('Not authorized to edit this product');
    }

    const updates = { ...req.body };
    if (updates.name && updates.name !== product.name) {
      updates.slug = generateSlug(updates.name);
    }
    const files = (req as any).files;
    if (files) {
      const newImages: string[] = [];
      if (files.images) {
        for (const file of files.images) {
          const upload = await uploadToCloudinary(file, 'products');
          newImages.push(upload.url);
        }
      }
      if (newImages.length > 0) {
        updates.images = [...(product.images || []), ...newImages];
      }
    }

    Object.assign(product, updates);
    await product.save();
    res.json({ status: 'success', data: { product } });
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (req: Request & { user?: any }, res: Response, next: NextFunction): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) throw new NotFoundError('Product not found');

    if (String(product.seller) !== req.user.sellerId && req.user.role !== 'admin') {
      throw new ForbiddenError('Not authorized to delete this product');
    }

    await product.deleteOne();
    await Category.updateOne({ _id: product.category }, { $inc: { productCount: -1 } });
    res.status(204).json({ status: 'success', data: null });
  } catch (err) {
    next(err);
  }
};

export const searchProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const q = (req.query.q as string) || '';
    if (!q || q.length < 1) {
      res.json({ status: 'success', results: 0, data: { products: [], suggestions: [] } });
      return;
    }
    const keywords = q.trim().split(/\s+/);
    const queryRegex = keywords.map((k) => new RegExp(k, 'i'));

    const products = await Product.find({
      status: { $in: ['approved', 'published'] },
      $or: [
        { name: { $in: queryRegex } },
        { description: { $in: queryRegex } },
        { brand: { $in: queryRegex } },
        { tags: { $in: queryRegex } }
      ]
    })
      .limit(20)
      .select('name slug price compareAtPrice images ratings reviewCount discount seller')
      .populate('seller', 'storeName');

    const suggestions = Array.from(new Set(products.map((p) => p.name)));
    res.json({ status: 'success', results: products.length, data: { products, suggestions } });
  } catch (err) {
    next(err);
  }
};


