import api from './axios';
import { Product, ApiResponse } from '../types';

export const getProducts = async (params?: any) => {
  const response = await api.get('/products', { params });
  const { products, pagination } = response.data.data;
  return { data: products, pagination };
};

export const getProduct = async (id: string) => {
  const response = await api.get(`/products/${id}`);
  return { data: response.data.data };
};

export const createProduct = async (data: any): Promise<ApiResponse<Product>> => {
  const response = await api.post('/products', data);
  return response.data;
};

export const updateProduct = async (id: string, data: any): Promise<ApiResponse<Product>> => {
  const response = await api.put(`/products/${id}`, data);
  return response.data;
};

export const getLowStockProducts = async () => {
  const response = await api.get('/products/low-stock');
  return { data: response.data.data };
};
