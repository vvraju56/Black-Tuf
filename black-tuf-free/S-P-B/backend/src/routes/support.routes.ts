import { Router } from 'express';
import { protect } from '../middleware/auth';
import { body, param } from 'express-validator';
import { validationResultHandler } from '../middleware/validationResult';
import {
  createTicket, getMyTickets, getTicket, respondTicket, closeTicket
} from '../controllers/support.controller';

const router = Router();

router.use(protect);

router.get('/', getMyTickets);
router.post(
  '/',
  body('subject').trim().notEmpty().withMessage('Subject is required').isLength({ max: 200 }),
  body('description').trim().notEmpty().withMessage('Description is required').isLength({ max: 5000 }),
  body('category').optional().isIn(['general', 'order', 'payment', 'product', 'account', 'technical']),
  validationResultHandler,
  createTicket
);
router.get('/:ticketId', param('ticketId').notEmpty(), validationResultHandler, getTicket);
router.post('/:ticketId/respond', param('ticketId').notEmpty(), body('message').notEmpty(), validationResultHandler, respondTicket);
router.patch('/:ticketId/close', param('ticketId').notEmpty(), validationResultHandler, closeTicket);

export default router;
