export interface ShippingAddressForm {
  address: string;
  apartment_number: number;
  floor_number: number;
  city: string;
  phone_number: string;
  comments?: string;
}