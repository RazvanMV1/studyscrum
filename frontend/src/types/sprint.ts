export type SprintStatus = 'PLANNED' | 'ACTIVE' | 'COMPLETED';

export interface BurndownSnapshot {
  date: string;
  remainingStoryPoints: number;
  remainingTasks: number;
}

export interface Sprint {
  id: string;
  projectId: string;
  name: string;
  goal?: string;
  startDate: string;
  endDate: string;
  status: SprintStatus;
  totalStoryPoints: number;
  completedStoryPoints: number;
  totalTasks: number;
  completedTasks: number;
  burndownSnapshots: BurndownSnapshot[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateSprintRequest {
  name: string;
  goal?: string;
  startDate: string;
  endDate: string;
  totalStoryPoints: number;
  totalTasks: number;
}

export interface VelocityResponse {
  projectId: string;
  averageVelocity: number;
  completedSprintsCount: number;
}
