import api from './axios';
import { User } from '../types';

export const login = async (email: string, password: string): Promise<{ token: string; user: User }> => {
  const response = await api.post('/auth/login', { email, password });
  return response.data.data;
};

export const getMe = async (): Promise<User> => {
  const response = await api.get('/auth/me');
  return response.data.data;
};
