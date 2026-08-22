import type { Request, Response, NextFunction } from 'express';
import mongoose, { Types } from 'mongoose';
import SupportTicket from '../models/SupportTicket';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/ApiError';

interface AuthRequest extends Request {
  user?: { id: string; role: string; sellerId?: string };
}

const generateTicketId = (): string => `TKT-${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 900 + 100)}`;

const canAccess = (ticket: any, user: any): boolean =>
  String(ticket.createdBy) === String(user.id) && ticket.createdByType === (user.role === 'seller' ? 'seller' : 'customer');

export const createTicket = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { category, subject, description, attachments, priority } = req.body;
    if (!subject || !description) throw new BadRequestError('Subject and description are required');

    const ticket = await SupportTicket.create({
      ticketId: generateTicketId(),
      createdBy: req.user!.id,
      createdByType: req.user!.role === 'seller' ? 'seller' : 'customer',
      category: category || 'general',
      subject,
      description,
      attachments: attachments || [],
      priority: priority || 'medium',
      status: 'open'
    });

    res.status(201).json({ status: 'success', data: { ticket } });
  } catch (err) {
    next(err);
  }
};

export const getMyTickets = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const createdByType = req.user!.role === 'seller' ? 'seller' : 'customer';
    const tickets = await SupportTicket.find({ createdBy: req.user!.id, createdByType })
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ status: 'success', results: tickets.length, data: { tickets } });
  } catch (err) {
    next(err);
  }
};

export const getTicket = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const ticket = await SupportTicket.findOne({ ticketId: req.params.ticketId })
      .populate('assignedTo', 'name')
      .populate('createdBy', 'name email');
    if (!ticket) throw new NotFoundError('Ticket not found');
    if (req.user!.role !== 'admin' && !canAccess(ticket, req.user)) throw new ForbiddenError('Not your ticket');
    res.json({ status: 'success', data: { ticket } });
  } catch (err) {
    next(err);
  }
};

export const respondTicket = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const ticket = await SupportTicket.findOne({ ticketId: req.params.ticketId });
    if (!ticket) throw new NotFoundError('Ticket not found');
    if (!canAccess(ticket, req.user)) throw new ForbiddenError('Not your ticket');
    const { message, attachments } = req.body;
    if (!message) throw new BadRequestError('Message is required');

    ticket.messages.push({
      message,
      sender: new Types.ObjectId(req.user!.id),
      senderType: req.user!.role === 'seller' ? 'seller' : 'customer',
      attachments: attachments || []
    } as any);
    ticket.status = ticket.status === 'closed' ? 'open' : 'open';
    await ticket.save();

    res.json({ status: 'success', data: { ticket } });
  } catch (err) {
    next(err);
  }
};

export const closeTicket = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const ticket = await SupportTicket.findOne({ ticketId: req.params.ticketId });
    if (!ticket) throw new NotFoundError('Ticket not found');
    if (!canAccess(ticket, req.user)) throw new ForbiddenError('Not your ticket');
    ticket.status = 'closed';
    await ticket.save();
    res.json({ status: 'success', data: { ticket } });
  } catch (err) {
    next(err);
  }
};
