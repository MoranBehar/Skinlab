import api from './api';
import { AdminOrder, RevenueData } from '../types/admin.types';
import { OrderTracking } from '../types/order.types';

interface AdminOrderDetail {
  orderResponse: AdminOrder;
  tracking: OrderTracking[];
}

// Products Management
export const adminProductsApi = {
  getAllProducts: async () => {
    const response = await api.get('/products/admin/all');
    return response.data;
  },

  getProductById: async (id: number) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  createProduct: async (formData: FormData) => {
    const response = await api.post('/products/admin/create', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updateProduct: async (id: number, formData: FormData) => {
    const response = await api.put(`/products/admin/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteProduct: async (id: number) => {
    const response = await api.delete(`/products/admin/${id}`);
    return response.data;
  },

  getProductStats: async () => {
    const response = await api.get('/products/admin/stats');
    return response.data;
  },
};

// Orders Management
export const adminOrdersApi = {
  getAllOrders: async (filters?: {
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<AdminOrder[]> => {
    const response = await api.get<AdminOrder[]>('/orders/admin/all', { params: filters });
    return response.data;
  },

  getOrderById: async (id: number): Promise<AdminOrderDetail> => {
    const response = await api.get<AdminOrderDetail>(`/orders/admin/${id}`);
    return response.data;
  },

  updateOrderStatus: async (
    id: number,
    data: { status_id: number; comments?: string }
  ): Promise<AdminOrderDetail> => {
    const response = await api.patch<AdminOrderDetail>(`/orders/admin/${id}/status`, data);
    return response.data;
  },

  getOrderStats: async () => {
    const response = await api.get('/orders/admin/stats');
    return response.data;
  },

  getRevenueStats: async (period: 'day' | 'week' | 'month' | 'year') => {
    const response = await api.get<RevenueData[]>('/orders/admin/revenue', {
      params: { period },
    });
    return response.data;
  },

  getRecentOrders: async (limit: number = 10): Promise<AdminOrder[]> => {
    const response = await api.get<AdminOrder[]>('/orders/admin/recent', {
      params: { limit },
    });
    return response.data;
  },
};

// Combined API object
export const adminApi = {
  ...adminProductsApi,
  ...adminOrdersApi,
};
