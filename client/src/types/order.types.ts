export interface Order {
  order_id: number;
  user_id: number;
  status: Status;
  date_placed: string;
  price: number;
  shipping_type: ShippingType;
  credit_card_brand: string;
  credit_card_last_four_digits: string;
  shipping_address: ShippingAddress | null;
  items: OrderItem[];
}

export interface OrderItem {
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
  image_path?: string;
}

export interface ShippingType {
  shipping_type_id: number
  shipping_type_name: string
}

export interface Status {
  status_id: number
  status_name: string
}

export interface ShippingAddress {
  address_id: number;
  address: string;
  apartment_number: number;
  floor_number: number;
  city: string;
  phone_number: string;
  comments?: string;
}

export interface OrderTracking {
  order_id: number;
  status_id: number;
  status_name: string;
  date: string;
  comments?: string;
}

export interface CreateOrderRequest {
  shipping_type_id: number;
  credit_card_brand: string;
  credit_card_last_four_digits: string;
  shipping_address_id?: number;
}

export interface UpdateOrderStatusRequest {
  status_id: number;
  comments?: string;
}