import api from './axios';
import { Customer, ApiResponse } from '../types';

export const getCustomers = async (params?: any) => {
  const response = await api.get('/customers', { params });
  const { customers, pagination } = response.data.data;
  return { data: customers, pagination };
};

export const getCustomer = async (id: string) => {
  const response = await api.get(`/customers/${id}`);
  return { data: response.data.data };
};

export const createCustomer = async (data: any): Promise<ApiResponse<Customer>> => {
  const response = await api.post('/customers', data);
  return response.data;
};

export const updateCustomer = async (id: string, data: any): Promise<ApiResponse<Customer>> => {
  const response = await api.put(`/customers/${id}`, data);
  return response.data;
};

export const addFollowUp = async (id: string, data: any): Promise<ApiResponse<any>> => {
  const response = await api.post(`/customers/${id}/follow-ups`, data);
  return response.data;
};
