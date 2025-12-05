import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { cartAPI } from '../services/cart.api';
import { CartResponse } from '../types/cart.types';
import { useAuth } from './authContext';

interface CartContextType {
  cart: CartResponse | null;
  loading: boolean;
  cartCount: number;
  addToCart: (productId: number, quantity?: number, category?: string) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const { isAuthenticated } = useAuth();

  //  Loading cart on start
  useEffect(() => {
    if (isAuthenticated) {
      refreshCart();
    } else {
      setCart(null);
      setCartCount(0);
    }
  }, [isAuthenticated]);

  const refreshCart = async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    try {
      const [cartData, count] = await Promise.all([
        cartAPI.getCart(),
        cartAPI.getCartCount(),
      ]);
      setCart(cartData);
      setCartCount(count);
    } catch (error) {
      console.error('Failed to load cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: number, quantity: number = 1) => {
    try {
      const updatedCart = await cartAPI.addToCart(productId, quantity);
      setCart(updatedCart);
      setCartCount(updatedCart.summary.totalItems);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      throw error;
    }
  };

  const updateQuantity = async (productId: number, quantity: number) => {
    try {
      const updatedCart = await cartAPI.updateCartItem(productId, quantity);
      setCart(updatedCart);
      setCartCount(updatedCart.summary.totalItems);
    } catch (error) {
      console.error('Failed to update quantity:', error);
      throw error;
    }
  };

  const removeItem = async (productId: number) => {
    try {
      const updatedCart = await cartAPI.removeFromCart(productId);
      setCart(updatedCart);
      setCartCount(updatedCart.summary.totalItems);
    } catch (error) {
      console.error('Failed to remove item:', error);
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      await cartAPI.clearCart();
      setCart(null);
      setCartCount(0);
      await refreshCart();
    } catch (error) {
      console.error('Failed to clear cart:', error);
      throw error;
    }
  };

  const value: CartContextType = {
    cart,
    loading,
    cartCount,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    refreshCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};