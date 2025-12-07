export interface Order {
  order_id: number;
  user: { full_name: string; email: string };
  status: { status_id: number; status_name: string };
  date_placed: string;
  price: number;
  shoppingCart: {
    items: Array<{
      product: { name: string };
      quantity: number;
    }>;
  };
}


export interface OrderDetail {
  order_id: number;
  user: { full_name: string; email: string; phone?: string };
  status: { status_id: number; status_name: string };
  date_placed: string;
  price: number;
  shoppingCart: {
    items: Array<{
      product: {
        product_id: number;
        name: string;
        price: number;
        images: Array<{ image_path: string }>;
      };
      quantity: number;
    }>;
  };
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