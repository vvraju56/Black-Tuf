import authRoutes from './auth.routes';
import categoryRoutes from './category.routes';
import productRoutes from './product.routes';
import cartRoutes from './cart.routes';
import addressRoutes from './address.routes';
import orderRoutes from './order.routes';
import paymentRoutes from './payment.routes';
import sellerRoutes from './seller.routes';
import adminRoutes from './admin.routes';
import userRoutes from './user.routes';
import wishlistRoutes from './wishlist.routes';
import returnRoutes from './return.routes';
import notificationRoutes from './notification.routes';
import supportRoutes from './support.routes';
import bannerRoutes from './banner.routes';
import chatRoutes from './chat.routes';

import { Application, Request, Response, NextFunction } from 'express';
import { NotFoundError } from '../utils/ApiError';

export const registerRoutes = (app: Application): void => {
  app.use('/api/auth', authRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/cart', cartRoutes);
  app.use('/api/addresses', addressRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/seller', sellerRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/marketplace', wishlistRoutes);
  app.use('/api/returns', returnRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/support', supportRoutes);
  app.use('/api/banners', bannerRoutes);
  app.use('/api/chat', chatRoutes);

  app.use((_req: Request, _res: Response, next: NextFunction) => {
    next(new NotFoundError('Route not found'));
  });
};


