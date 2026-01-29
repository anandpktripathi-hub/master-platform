import api from './client';

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface Ticket {
  _id: string;
  subject: string;
  message: string;
  status: TicketStatus;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  userId?: string;
  tenantId?: string;
}

export async function createTicket(subject: string, message: string) {
  return api.post<Ticket>('/support/tickets', { subject, message });
}

export async function getMyTickets() {
  return api.get<Ticket[]>('/support/tickets');
}

export async function getAllTickets() {
  return api.get<Ticket[]>('/support/admin/tickets');
}

export async function updateTicketStatus(id: string, status: TicketStatus) {
  return api.patch<Ticket>(`/support/admin/tickets/${id}/status`, { status });
}
