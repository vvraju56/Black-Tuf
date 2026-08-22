import type { Request, Response, NextFunction } from 'express';
import Cart from '../models/Cart';
import Product from '../models/Product';
import { NotFoundError, BadRequestError } from '../utils/ApiError';
import mongoose from 'mongoose';

export const getCart = async (req: Request & { user?: any }, res: Response, next: NextFunction): Promise<void> => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate({
      path: 'items.product',
      populate: { path: 'seller', select: 'storeName' }
    }).populate('items.product', 'name price images status seller compareAtPrice discount stock');
    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }
    res.json({ status: 'success', data: { cart } });
  } catch (err) {
    next(err);
  }
};

export const addToCart = async (req: Request & { user?: any }, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { productId, variant, quantity = 1 } = req.body;

    const product = await Product.findById(productId);
    if (!product) throw new NotFoundError('Product not found');
    if (product.status !== 'approved' && product.status !== 'published') {
      throw new BadRequestError('Product not available for purchase');
    }

    const qty = Math.max(1, parseInt(quantity, 10) || 1);
    if (product.minimumOrderQuantity && qty < product.minimumOrderQuantity) {
      throw new BadRequestError(`Minimum order quantity is ${product.minimumOrderQuantity}`);
    }
    if (product.maximumOrderQuantity && qty > product.maximumOrderQuantity) {
      throw new BadRequestError(`Maximum order quantity is ${product.maximumOrderQuantity}`);
    }

    const variantPrice = product.price;
    const existingVariant = product.variantCombinations?.find((v) => {
      return variant && v.optionValue === `${variant.name}:${variant.value}`;
    });
    const price = existingVariant?.price ?? variantPrice;

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }

    const existingItem = cart.items.find(
      (item) =>
        String(item.product) === productId &&
        (!variant || (item.variant?.name === variant.name && item.variant?.value === variant.value))
    );

    if (existingItem) {
      existingItem.quantity += qty;
    } else {
      cart.items.push({
        product: new mongoose.Types.ObjectId(productId),
        variant: variant || undefined,
        quantity: qty,
        price,
        compareAtPrice: product.compareAtPrice,
        addedAt: new Date()
      });
    }

    await cart.save();
    const populated = await Cart.findById(cart._id).populate('items.product', 'name price images seller status compareAtPrice discount stock').populate('items.product', 'name');
    res.json({ status: 'success', data: { cart: populated } });
  } catch (err) {
    next(err);
  }
};

export const updateCartItem = async (req: Request & { user?: any }, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { productId } = req.params;
    const variant = (req.query.variant as string) || (req.body.variant as string) || req.body;
    const { quantity } = req.body;

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) throw new NotFoundError('Cart not found');

    const item = cart.items.find(
      (it) => String(it.product) === productId && (!(variant as any) || (it.variant?.name === (variant as any)))
    );
    if (!item) throw new NotFoundError('Cart item not found');

    if (quantity <= 0) {
      cart.items = cart.items.filter((it) => !(String(it.product) === productId && it.variant?.name === (variant as any)));
    } else {
      item.quantity = quantity;
    }

    await cart.save();
    const populated = await Cart.findById(cart._id).populate('items.product', 'name price images seller');
    res.json({ status: 'success', data: { cart: populated } });
  } catch (err) {
    next(err);
  }
};

export const removeCartItem = async (req: Request & { user?: any }, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { productId } = req.params;
    const variant = (req.query.variant as string) || (req.body.variant as string);
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) throw new NotFoundError('Cart not found');

    cart.items = cart.items.filter(
      (it) => !(String(it.product) === productId && (!variant || it.variant?.name === variant))
    );
    await cart.save();
    const populated = await Cart.findById(cart._id).populate('items.product', 'name price images seller');
    res.json({ status: 'success', data: { cart: populated } });
  } catch (err) {
    next(err);
  }
};

export const clearCart = async (req: Request & { user?: any }, res: Response, next: NextFunction): Promise<void> => {
  try {
    const cart = await Cart.findOneAndUpdate({ user: req.user.id }, { items: [] }, { new: true });
    res.json({ status: 'success', data: { cart } });
  } catch (err) {
    next(err);
  }
};


