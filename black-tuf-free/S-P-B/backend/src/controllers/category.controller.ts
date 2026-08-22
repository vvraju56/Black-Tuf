import type { Request, Response, NextFunction } from 'express';
import Category from '../models/Category';
import Product from '../models/Product';
import { NotFoundError, BadRequestError } from '../utils/ApiError';
import { generateSlug } from '../utils/slug';

export const createCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, parent, description, order } = req.body;
    const slug = generateSlug(name);

    const level = parent ? 1 : 0;
    const category = await Category.create({ name, slug, description, parent: parent || null, level, order: order || 0 });
    res.status(201).json({ status: 'success', data: { category } });
  } catch (err) {
    next(err);
  }
};

export const getCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { includeInactive, parentId, level } = req.query;
    const filter: Record<string, unknown> = {};

    if (includeInactive !== 'true') filter.isActive = true;
    if (parentId) filter.parent = parentId;
    if (level !== undefined) filter.level = Number(level);

    const categories = await Category.find(filter).populate('children').sort({ level: 1, order: 1 });
    res.json({ status: 'success', results: categories.length, data: { categories } });
  } catch (err) {
    next(err);
  }
};

export const getCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const category = await Category.findById(req.params.id).populate('children');
    if (!category) throw new NotFoundError('Category not found');
    res.json({ status: 'success', data: { category } });
  } catch (err) {
    next(err);
  }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, description, order, isActive, parent } = req.body;
    const category = await Category.findById(req.params.id);
    if (!category) throw new NotFoundError('Category not found');

    if (name) {
      category.name = name;
      category.slug = generateSlug(name);
    }
    if (description !== undefined) category.description = description;
    if (order !== undefined) category.order = order;
    if (isActive !== undefined) category.isActive = isActive;
    if (parent !== undefined) {
      category.parent = parent || null;
      category.level = parent ? 1 : 0;
    }

    await category.save();
    res.json({ status: 'success', data: { category } });
  } catch (err) {
    next(err);
  }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) throw new NotFoundError('Category not found');

    const childCount = await Category.countDocuments({ parent: category._id });
    if (childCount > 0) {
      throw new BadRequestError('Cannot delete category with subcategories');
    }

    const productCount = await Product.countDocuments({ category: category._id });
    if (productCount > 0) {
      throw new BadRequestError('Cannot delete category with products');
    }

    await Category.deleteOne({ _id: category._id });
    res.status(204).json({ status: 'success', data: null });
  } catch (err) {
    next(err);
  }
};

export const getCategoryTree = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const buildTree = async (parentId: any = null, level = 0): Promise<any[]> => {
      const cats = await Category.find({ parent: parentId, isActive: true }).sort({ order: 1 });
      const result: any[] = [];
      for (const cat of cats) {
        const children = level < 2 ? await buildTree(cat._id, level + 1) : [];
        result.push({
          _id: cat._id,
          name: cat.name,
          slug: cat.slug,
          image: cat.image,
          icon: cat.icon,
          productCount: cat.productCount,
          children
        });
      }
      return result;
    };
    const tree = await buildTree();
    res.json({ status: 'success', data: { categories: tree } });
  } catch (err) {
    next(err);
  }
};


