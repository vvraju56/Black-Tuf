import { Router } from 'express';
import { protect, restrictTo } from '../middleware/auth';
import { param } from 'express-validator';
import { validationResultHandler } from '../middleware/validationResult';
import {
  createConversation, getMyConversations, getConversationMessages, sendMessage, reportConversation
} from '../controllers/chat.controller';

const router = Router();

router.use(protect);

router.post('/conversations', createConversation);
router.get('/conversations', getMyConversations);
router.get('/conversations/:id/messages', param('id').isMongoId(), validationResultHandler, getConversationMessages);
router.post('/conversations/:id/messages', param('id').isMongoId(), validationResultHandler, sendMessage);
router.post('/conversations/:id/report', param('id').isMongoId(), validationResultHandler, reportConversation);

export default router;
