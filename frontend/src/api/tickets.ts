import api from './axios';
import type {
  Ticket,
  CreateTicketRequest,
  MoveTicketRequest,
} from '../types/ticket';

export const getTickets = async (projectId: string): Promise<Ticket[]> => {
  const response = await api.get(`/tickets/${projectId}`);
  return response.data;
};

export const getSprintTickets = async (
  projectId: string,
  sprintId: string
): Promise<Ticket[]> => {
  const response = await api.get(`/tickets/${projectId}/sprint/${sprintId}`);
  return response.data;
};

export const createTicket = async (
  projectId: string,
  data: CreateTicketRequest
): Promise<Ticket> => {
  const response = await api.post(`/tickets/${projectId}`, data);
  return response.data;
};

export const updateTicket = async (
  projectId: string,
  ticketId: string,
  data: Partial<CreateTicketRequest>
): Promise<Ticket> => {
  const response = await api.patch(`/tickets/${projectId}/${ticketId}`, data);
  return response.data;
};

export const moveTicket = async (
  projectId: string,
  ticketId: string,
  data: MoveTicketRequest
): Promise<Ticket> => {
  const response = await api.patch(
    `/tickets/${projectId}/${ticketId}/move`,
    data
  );
  return response.data;
};

export const assignToSprint = async (
  projectId: string,
  ticketId: string,
  sprintId: string
): Promise<Ticket> => {
  const response = await api.patch(
    `/tickets/${projectId}/${ticketId}/assign-sprint?sprintId=${sprintId}`
  );
  return response.data;
};

export const deleteTicket = async (
  projectId: string,
  ticketId: string
): Promise<void> => {
  await api.delete(`/tickets/${projectId}/${ticketId}`);
};
