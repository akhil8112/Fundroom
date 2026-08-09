import api from './axios';
import { Challan, ApiResponse } from '../types';

export const getChallans = async (params?: any) => {
  const response = await api.get('/challans', { params });
  const { challans, pagination } = response.data.data;
  return { data: challans, pagination };
};

export const getChallan = async (id: string) => {
  const response = await api.get(`/challans/${id}`);
  return { data: response.data.data };
};

export const createChallan = async (data: any) => {
  const response = await api.post('/challans', data);
  return { data: response.data.data };
};

export const confirmChallan = async (id: string): Promise<ApiResponse<Challan>> => {
  const response = await api.put(`/challans/${id}/confirm`);
  return response.data;
};

export const cancelChallan = async (id: string): Promise<ApiResponse<Challan>> => {
  const response = await api.put(`/challans/${id}/cancel`);
  return response.data;
};
