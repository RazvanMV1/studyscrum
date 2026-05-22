export type TicketType = 'USER_STORY' | 'TASK' | 'BUG';

export type TicketStatus = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Ticket {
  id: string;
  projectId: string;
  sprintId?: string;
  title: string;
  description?: string;
  type: TicketType;
  status: TicketStatus;
  priority: TicketPriority;
  storyPoints: number;
  assigneeId?: string;
  assigneeName?: string;
  reporterId: string;
  reporterName: string;
  position: number;
  labels: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicketRequest {
  title: string;
  description?: string;
  type?: TicketType;
  priority?: TicketPriority;
  storyPoints?: number;
  assigneeId?: string;
  assigneeName?: string;
  sprintId?: string;
  labels?: string[];
}

export interface MoveTicketRequest {
  status: TicketStatus;
  position: number;
}
