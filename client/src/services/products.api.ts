import api from './api';
import { ProductsResponse, FilterOptions, Product } from '../types/product.types';

export const productsAPI = {
  // Getting all products with filters
  getProducts: async (params?: {
    category_id?: number;
    skin_type?: number;
    target_audience?: number;
    product_type?: number;
    min_price?: number;
    max_price?: number;
    sort_by?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<ProductsResponse> => {
    const response = await api.get<ProductsResponse>('/products', { params });
    return response.data;
  },

  // Receiving a single product
  getProduct: async (id: number): Promise<Product> => {
    const response = await api.get<Product>(`/products/${id}`);
    return response.data;
  },

  // Getting filter options
  getFilterOptions: async (): Promise<FilterOptions> => {
    const response = await api.get<FilterOptions>('/products/filters/options');
    return response.data;
  },
};