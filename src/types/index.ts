export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface Sweet {
  id: string;
  name: string;
  description: string;
  category: SweetCategory;
  price: number;
  quantity: number;
  image: string;
  createdAt: string;
  updatedAt: string;
}

export type SweetCategory = 
  | 'chocolates'
  | 'candies'
  | 'pastries'
  | 'cookies'
  | 'cakes'
  | 'ice-cream';

export interface CartItem {
  sweet: Sweet;
  quantity: number;
}

export interface Purchase {
  id: string;
  userId: string;
  items: {
    sweetId: string;
    sweetName: string;
    quantity: number;
    priceAtPurchase: number;
  }[];
  totalAmount: number;
  purchasedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface SweetFilters {
  search: string;
  category: SweetCategory | 'all';
  minPrice: number;
  maxPrice: number;
  sortBy: 'name' | 'price-asc' | 'price-desc' | 'newest';
  inStock: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
