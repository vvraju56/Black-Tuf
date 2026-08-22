import { Router } from 'express';
import { protect } from '../middleware/auth';
import { param } from 'express-validator';
import { validationResultHandler } from '../middleware/validationResult';
import {
  getMyNotifications, getUnreadCount, markNotificationRead, markAllNotificationsRead
} from '../controllers/notification.controller';

const router = Router();

router.use(protect);

router.get('/', getMyNotifications);
router.get('/unread-count', getUnreadCount);
router.patch('/:id/read', param('id').isMongoId(), validationResultHandler, markNotificationRead);
router.patch('/read-all', markAllNotificationsRead);

export default router;
