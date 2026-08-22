import { Router } from 'express';
import { protect, restrictTo } from '../middleware/auth';
import {
  getDashboardStats, listCustomers, listSellers, approveSeller, rejectSeller, suspendSeller,
  listProducts, approveProduct, rejectProduct, listOrders, updateOrderStatus, listPayouts,
  processPayout, createCoupon, listCoupons, updateCoupon, deleteCoupon, listBanners,
  createBanner, updateBanner, deleteBanner, listReviews, moderateReview,
  getSettings, updateSettings, getAuditLogs, manageSupportTicket, listSupportTickets, getLiveActivity
} from '../controllers/admin.controller';
import { listAdminPayments } from '../controllers/payment.controller';
import { listReportedConversations } from '../controllers/chat.controller';
import { categoryValidation, mongooseIdValidation } from '../validators/general.validator';
import { validationResultHandler } from '../middleware/validationResult';
import { body } from 'express-validator';

const router = Router();

router.use(protect);
router.use(restrictTo('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/live-activity', getLiveActivity);
router.get('/chats/reported', listReportedConversations);

router.get('/customers', listCustomers);
router.get('/sellers', listSellers);
router.put('/sellers/:id/approve', mongooseIdValidation, validationResultHandler, approveSeller);
router.put('/sellers/:id/reject', [...mongooseIdValidation, body('reason').optional()], validationResultHandler, rejectSeller);
router.put('/sellers/:id/suspend', mongooseIdValidation, validationResultHandler, suspendSeller);

router.get('/products', listProducts);
router.put('/products/:id/approve', mongooseIdValidation, validationResultHandler, approveProduct);
router.put('/products/:id/reject', [...mongooseIdValidation, body('reason').optional()], validationResultHandler, rejectProduct);

router.get('/orders', listOrders);
router.put('/orders/:id/status', mongooseIdValidation, body('status').notEmpty(), validationResultHandler, updateOrderStatus);

router.get('/payments', listAdminPayments);

router.get('/payouts', listPayouts);
router.put('/payouts/:id/process', mongooseIdValidation, body('status').notEmpty(), validationResultHandler, processPayout);

router.get('/coupons', listCoupons);
router.post('/coupons', body('code').notEmpty(), body('type').isIn(['percentage', 'fixed']), validationResultHandler, createCoupon);
router.put('/coupons/:id', mongooseIdValidation, validationResultHandler, updateCoupon);
router.delete('/coupons/:id', mongooseIdValidation, validationResultHandler, deleteCoupon);

router.get('/banners', listBanners);
router.post('/banners', body('title').notEmpty(), body('image').notEmpty(), body('alt').notEmpty(), validationResultHandler, createBanner);
router.put('/banners/:id', mongooseIdValidation, validationResultHandler, updateBanner);
router.delete('/banners/:id', mongooseIdValidation, validationResultHandler, deleteBanner);

router.get('/reviews', listReviews);
router.put('/reviews/:id/moderate', mongooseIdValidation, body('status').isIn(['pending', 'approved', 'rejected']), validationResultHandler, moderateReview);

router.get('/settings', getSettings);
router.put('/settings', updateSettings);

router.get('/audit-logs', getAuditLogs);

router.get('/support-tickets', listSupportTickets);
router.put('/support-tickets/:id/assign', mongooseIdValidation, validationResultHandler, manageSupportTicket('assign'));
router.post('/support-tickets/:id/respond', mongooseIdValidation, body('message').notEmpty(), validationResultHandler, manageSupportTicket('respond'));

router.get('/categories', async (_req, res) => {
  const Category = (await import('../models/Category')).default;
  const cats = await Category.find({}).sort({ createdAt: -1 });
  res.json({ status: 'success', results: cats.length, data: { categories: cats } });
});
router.post('/categories', categoryValidation, validationResultHandler, async (req: any, res: any, next: any) => {
  const Category = (await import('../models/Category')).default;
  const { generateSlug } = await import('../utils/slug');
  const { name, slug, description, parent, order, image, icon } = req.body;
  try {
    const cat = await Category.create({ name, slug: slug || generateSlug(name), description, parent: parent || null, level: parent ? 1 : 0, order: order || 0, image, icon });
    res.status(201).json({ status: 'success', data: { category: cat } });
  } catch (err) {
    next(err);
  }
});

export default router;


