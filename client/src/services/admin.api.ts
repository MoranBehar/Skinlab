import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// Create axios instance with auth token
const createAuthInstance = () => {
  const token = localStorage.getItem('access_token');
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
};

// Products Management
export const adminProductsApi = {
  getAllProducts: async () => {
    const api = createAuthInstance();
    const response = await api.get('/products/admin/all');
    return response.data;
  },

  getProductById: async (id: number) => {
    const api = createAuthInstance();
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  createProduct: async (formData: FormData) => {
    const token = localStorage.getItem('access_token');
    const response = await axios.post(
      `${API_BASE_URL}/products/admin/create`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  updateProduct: async (id: number, formData: FormData) => {
    const token = localStorage.getItem('access_token');
    const response = await axios.put(
      `${API_BASE_URL}/products/admin/${id}`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  deleteProduct: async (id: number) => {
    const api = createAuthInstance();
    const response = await api.delete(`/products/admin/${id}`);
    return response.data;
  },

  getProductStats: async () => {
    const api = createAuthInstance();
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
  }) => {
    const api = createAuthInstance();
    const response = await api.get('/orders/admin/all', { params: filters });
    return response.data;
  },

  getOrderById: async (id: number) => {
    const api = createAuthInstance();
    const response = await api.get(`/orders/admin/${id}`);
    return response.data;
  },

  updateOrderStatus: async (
    id: number,
    data: { status_id: number; comments?: string }
  ) => {
    const api = createAuthInstance();
    const response = await api.put(`/orders/admin/${id}/status`, data);
    return response.data;
  },

  getOrderStats: async () => {
    const api = createAuthInstance();
    const response = await api.get('/orders/admin/stats');
    return response.data;
  },

  getRevenueStats: async (period: 'day' | 'week' | 'month' | 'year') => {
    const api = createAuthInstance();
    const response = await api.get('/orders/admin/revenue', {
      params: { period },
    });
    return response.data;
  },

  getRecentOrders: async (limit: number = 10) => {
    const api = createAuthInstance();
    const response = await api.get('/orders/admin/recent', {
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