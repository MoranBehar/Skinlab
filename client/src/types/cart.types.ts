import { Product } from './product.types';

export interface CartItem {
  shopping_cart_id: number;
  product_id: number;
  quantity: number;
  product: Product;
}

export interface Cart {
  shopping_cart_id: number;
  user_id: number;
  items: CartItem[];
}

export interface CartSummary {
  totalItems: number;
  subtotal: number;
  tax: number;
  total: number;
}

export interface CartResponse {
  cart: Cart;
  summary: CartSummary;
}