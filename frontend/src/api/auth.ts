import api from './axios';
import type { User } from '../types/auth';

export const getMe = async (): Promise<User> => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const refreshToken = async (refreshToken: string) => {
  const response = await api.post('/auth/refresh', { refreshToken });
  return response.data;
};
