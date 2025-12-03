export interface Product {
  product_id: number;
  name: string;
  description: string;
  how_to_use: string;
  price: number;
  rating?: number;
  discount_percentage?: number;
  is_available: boolean;
  category: {
    category_id: number;
    category_name: string;
  };
  skin_type_rel: {
    skin_type_id: number;
    skin_type_name: string;
  };
  target_audience_rel: {
    audience_id: number;
    audience_name: string;
  };
  product_type_rel: {
    product_type_id: number;
    product_type_name: string;
  };
  images: {
    image_id: number;
    image_path: string;
  }[];
}

export interface ProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface FilterOption {
  id: number;
  name: string;
}

export interface FilterOptions {
  categories: FilterOption[];
  skinTypes: FilterOption[];
  targetAudiences: FilterOption[];
  productTypes: FilterOption[];
}

export enum SortBy {
  PRICE_ASC = 'price_asc',
  PRICE_DESC = 'price_desc',
  RATING_DESC = 'rating_desc',
  NEWEST = 'newest',
  NAME_ASC = 'name_asc',
}