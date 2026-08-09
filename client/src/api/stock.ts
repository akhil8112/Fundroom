import api from './axios';
import { StockMovement, ApiResponse } from '../types';

export const createMovement = async (data: any): Promise<ApiResponse<StockMovement>> => {
  const response = await api.post('/stock/movement', data);
  return response.data;
};

export const getMovements = async (params?: any) => {
  const response = await api.get('/stock/movements', { params });
  const { movements, pagination } = response.data.data;
  return { data: movements, pagination };
};
