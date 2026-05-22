export interface NotificationMessage {
  type: string;
  projectId: string;
  sprintId?: string;
  ticketId?: string;
  triggeredByUserId: string;
  triggeredByUserName: string;
  payload?: Record<string, unknown>;
  timestamp: string;
}
