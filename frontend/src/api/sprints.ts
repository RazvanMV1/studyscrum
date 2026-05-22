import api from './axios';
import type {
  Sprint,
  CreateSprintRequest,
  VelocityResponse,
} from '../types/sprint';

export const getSprints = async (projectId: string): Promise<Sprint[]> => {
  const response = await api.get(`/sprints/${projectId}`);
  return response.data;
};

export const getSprint = async (
  projectId: string,
  sprintId: string
): Promise<Sprint> => {
  const response = await api.get(`/sprints/${projectId}/${sprintId}`);
  return response.data;
};

export const createSprint = async (
  projectId: string,
  data: CreateSprintRequest
): Promise<Sprint> => {
  const response = await api.post(`/sprints/${projectId}`, data);
  return response.data;
};

export const activateSprint = async (
  projectId: string,
  sprintId: string
): Promise<Sprint> => {
  const response = await api.patch(
    `/sprints/${projectId}/${sprintId}/activate`
  );
  return response.data;
};

export const completeSprint = async (
  projectId: string,
  sprintId: string
): Promise<Sprint> => {
  const response = await api.patch(
    `/sprints/${projectId}/${sprintId}/complete`
  );
  return response.data;
};

export const getVelocity = async (
  projectId: string
): Promise<VelocityResponse> => {
  const response = await api.get(`/sprints/${projectId}/velocity`);
  return response.data;
};
