export type UserRole = 'customer' | 'vendor' | 'admin';

export interface User {
  _id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Customer extends User {
  role: 'customer';
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  avatar?: string;
  lastLogin?: string;
}

export interface Vendor extends User {
  role: 'vendor';
  storeName?: string;
  storeLocation?: string;
  storeDescription?: string;
  storeImage?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  avatar?: string;
  lastLogin?: string;
}

export interface Admin extends User {
  role: 'admin';
  permissions: string[];
}

export interface AuthState {
  user: Customer | Vendor | Admin | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  role: 'customer' | 'vendor';
  storeName?: string;
  storeLocation?: string;
  storeDescription?: string;
  phone?: string;
}

export interface AuthResponse {
  user: Customer | Vendor | Admin;
  token: string;
} 