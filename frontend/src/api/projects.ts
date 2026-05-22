import api from './axios';
import type { Project, CreateProjectRequest } from '../types/project';

export const getProjects = async (): Promise<Project[]> => {
  const response = await api.get('/projects');
  return response.data;
};

export const getProject = async (projectId: string): Promise<Project> => {
  const response = await api.get(`/projects/${projectId}`);
  return response.data;
};

export const createProject = async (
  data: CreateProjectRequest
): Promise<Project> => {
  const response = await api.post('/projects', data);
  return response.data;
};

export const addMember = async (
  projectId: string,
  email: string,
  role: string
): Promise<Project> => {
  const response = await api.post(`/projects/${projectId}/members`, {
    email,
    role,
  });
  return response.data;
};
