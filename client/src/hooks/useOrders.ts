import { useState, useEffect } from 'react';
import * as orderApi from '../services/order.api';
import { Order, OrderTracking, CreateOrderRequest } from '../types/order.types';
import { useAuth } from '../contexts/authContext';


export const useOrders = () => {
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

 
  const fetchOrders = async () => {
    if (!isAuthenticated || !user?.user_id) return;

    try {
      setLoading(true);
      setError('');
      const data = await orderApi.getUserOrders();
      setOrders(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  
  const createOrder = async (orderData: CreateOrderRequest): Promise<Order> => {
    if (!isAuthenticated) {
        throw new Error("User is not authenticated to create an order");
    }

    try {
      setError('');
      const newOrder = await orderApi.createOrder(orderData);
      setOrders(prev => [newOrder, ...prev]);
      return newOrder;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to create order';
      setError(errorMsg);
      throw err;
    }
  };

  const clearError = () => {
    setError('');
  };

  useEffect(() => {
    if (isAuthenticated) {
        fetchOrders();
    }
  }, [isAuthenticated]); 

  return {
    orders,
    loading,
    error,
    fetchOrders,
    createOrder,
    clearError,
  };
};


export const useOrderDetails = (orderId: number) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [tracking, setTracking] = useState<OrderTracking[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  
  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const [orderData, trackingData] = await Promise.all([
        orderApi.getOrderById(orderId),
        orderApi.getOrderTracking(orderId),
      ]);
      setOrder(orderData);
      setTracking(trackingData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };

 
  const updateStatus = async (statusId: number, comments?: string) => {
    try {
      setError('');
      const updatedOrder = await orderApi.updateOrderStatus(orderId, {
        status_id: statusId,
        comments,
      });
      setOrder(updatedOrder);
      await fetchOrderDetails(); // Refresh tracking
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to update order status';
      setError(errorMsg);
      throw err;
    }
  };

  
  const clearError = () => {
    setError('');
  };

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  return {
    order,
    tracking,
    loading,
    error,
    fetchOrderDetails,
    updateStatus,
    clearError,
  };
};