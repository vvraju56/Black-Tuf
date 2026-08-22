import api from '@/lib/api';

export interface TicketMessage {
  message: string;
  sender: string;
  senderType: 'customer' | 'seller' | 'admin';
  attachments?: string[];
  createdAt: string;
}

export interface SupportTicket {
  _id: string;
  ticketId: string;
  createdBy: any;
  createdByType: 'customer' | 'seller';
  category: string;
  subject: string;
  description: string;
  attachments?: string[];
  status: 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: any;
  messages: TicketMessage[];
  createdAt: string;
  updatedAt: string;
}

export const fetchTickets = async (): Promise<SupportTicket[]> => {
  const { data } = await api.get('/support');
  return data.data.tickets || [];
};

export const createTicket = async (payload: { subject: string; description: string; category?: string; priority?: string }) => {
  const { data } = await api.post('/support', payload);
  return data.data.ticket;
};

export const fetchTicket = async (ticketId: string): Promise<SupportTicket> => {
  const { data } = await api.get(`/support/${ticketId}`);
  return data.data.ticket;
};

export const respondTicket = async (ticketId: string, message: string) => {
  const { data } = await api.post(`/support/${ticketId}/respond`, { message });
  return data.data.ticket;
};

export const closeTicket = async (ticketId: string) => {
  const { data } = await api.patch(`/support/${ticketId}/close`);
  return data.data.ticket;
};
