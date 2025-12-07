import api from './api';
import {
  Order,
  OrderTracking,
  CreateOrderRequest,
  UpdateOrderStatusRequest,
} from '../types/order.types';


export const createOrder = async (orderData: CreateOrderRequest): Promise<Order> => {
  const response = await api.post<Order>('/orders', orderData);
  return response.data;
};


export const getUserOrders = async (): Promise<Order[]> => {
  const response = await api.get<Order[]>('/orders');
  return response.data;
};


export const getOrderById = async (orderId: number): Promise<Order> => {
  const response = await api.get<Order>(`/orders/${orderId}`);
  return response.data;
};


export const getOrderTracking = async (orderId: number): Promise<OrderTracking[]> => {
  const response = await api.get<OrderTracking[]>(`/orders/${orderId}/tracking`);
  return response.data;
};


export const updateOrderStatus = async (
  orderId: number,
  statusData: UpdateOrderStatusRequest
): Promise<Order> => {
  const response = await api.patch<Order>(`/orders/${orderId}/status`, statusData);
  return response.data;
};