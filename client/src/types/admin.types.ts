import { OrderItem, OrderTracking, ShippingAddress } from "./order.types";

// export interface AdminOrder {
//   order_id: number;
//   user_id: number;
//   status_id: number;
//   status_name: string;
//   date_placed: string;
//   price: number;
//   shipping_type_id: number;
//   shipping_type_name: string;
//   credit_card_brand?: string;
//   credit_card_last_four_digits?: string;
//   shipping_address?: {
//     address_id: number;
//     address: string;
//     apartment_number?: string;
//     floor_number?: string;
//     city: string;
//     phone_number: string;
//     comments?: string;
//   } | null;
//   items: {
//     product_id: number;
//     product_name: string;
//     quantity: number;
//     price: number;
//     image_path?: string | null;
//   }[];
// }

// export type AdminOrderItem = OrderItem;

export interface OrderDetail {
  order_id: number;
  user: { full_name: string; email: string; phone?: string };
  status: { status_id: number; status_name: string };
  date_placed: string;
  price: number;
  items: Array<{
    product: {
      product_id: number;
      name: string;
      price: number;
      images: Array<{ image_path: string }>;
    };
    quantity: number;
  }>;
  shippingAddress: {
    address: string;
    apartment_number: number;
    floor_number: number;
    city: string;
    phone_number: string;
    comments?: string;
  };
  shippingType: { type_name: string };
  credit_card_brand: string;
  credit_card_last_four_digits: string;
  tracking: Array<{
    status: { status_name: string };
    date: string;
    comments?: string;
  }>;
}

export interface AdminOrderDetailApiResponse {
    orderResponse: OrderDetail;
    tracking: OrderTracking[];
}

export interface OrderStats {
    totalOrders: number;
    totalRevenue: number;
    todayOrders: number;
    todayRevenue: number;
    ordersByStatus: Array<{ status: string; count: number }>;
}

export interface ProductStats {
    totalProducts: number;
    unavailableProducts: number;
    productsByCategory: Array<{ category: string; count: number }>;
}

export interface DashboardStats extends OrderStats, ProductStats {}

export interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
}

export interface ProductFormData {
  name: string;
  description: string;
  category_id: number;
  price: number;
  target_audience: number;
  skin_type: number;
  product_type: number;
  how_to_use: string;
  discount_percentage?: number;
  is_available: boolean;
}


//------------------------------

export interface AdminOrderItem {
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
  image_path: string | null;
}

// Shipping address
export interface AdminOrderShippingAddress {
  address_id: number;
  address: string;
  apartment_number?: string | null;
  floor_number?: string | null;
  city: string;
  phone_number: string;
  comments?: string | null;
}

// Shipping type
export interface AdminOrderShippingType {
  shipping_type_id: number;
  shipping_type_name: string;
}

// Order status
export interface AdminOrderStatus {
  status_id: number;
  status_name: string;
}

// User info
export interface AdminOrderUser {
  user_id: number;
  full_name: string;
  email: string;
  role_id: number;
}

// Tracking entry
export interface AdminOrderTracking {
  order_id: number;
  status_id: number;
  status_name: string;
  date: string | Date;
  comments?: string;
}

// Main order type
export interface AdminOrder {
  order_id: number;
  user: AdminOrderUser | null;
  status: AdminOrderStatus | null;
  date_placed: string | Date;
  price: number;
  shipping_type: AdminOrderShippingType | null;
  credit_card_brand: string;
  credit_card_last_four_digits: string;
  shipping_address: AdminOrderShippingAddress | null;
  items: AdminOrderItem[];
  tracking?: AdminOrderTracking[]; 
}