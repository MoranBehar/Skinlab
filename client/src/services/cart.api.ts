import api from './api';
import { CartResponse } from '../types/cart.types';
import { count } from 'console';

export const cartAPI = {
  getCart: async (): Promise<CartResponse> => {
    const response = await api.get<CartResponse>('/cart');
    return response.data;
  },

  getCartCount: async (): Promise<number> => {
    const response = await api.get<{count:number}>('/cart/count');
    return response.data.count;
  },

  addToCart: async (productId: number, quantity: number = 1): Promise<CartResponse> => {
    const response = await api.post<CartResponse>('/cart', {
      product_id: productId,
      quantity,
    });
    return response.data;
  },

  updateCartItem: async (productId: number, quantity: number): Promise<CartResponse> => {
    const response = await api.put<CartResponse>(`/cart/${productId}`, { quantity });
    return response.data;
  },

  removeFromCart: async (productId: number): Promise<CartResponse> => {
    const response = await api.delete<CartResponse>(`/cart/${productId}`);
    return response.data;
  },

  clearCart: async (): Promise<void> => {
    await api.delete('/cart');
  },
};