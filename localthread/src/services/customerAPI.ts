import { apiRequest, ApiResponse } from './api';

// Types for customer management
export interface CustomerProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  avatar?: string;
  addresses: Address[];
  wishlist: Product[];
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  _id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

export interface Product {
  _id: string;
  name: string;
  price: number;
  images: string[];
  category: string;
  vendorId?: {
    _id: string;
    storeName: string;
  };
}

export interface Order {
  _id: string;
  customerId: {
    _id: string;
    name: string;
    email: string;
  };
  items: Array<{
    productId: {
      _id: string;
      name: string;
      price: number;
      images: string[];
      vendorId: {
        _id: string;
        storeName: string;
      };
    };
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: 'cod' | 'card' | 'upi' | 'netbanking';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileData {
  name?: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country?: string;
  };
}

export interface CreateAddressData {
  label: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault?: boolean;
}

export interface UpdateAddressData {
  label?: string;
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  isDefault?: boolean;
}

export interface OrdersResponse {
  orders: Order[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalOrders: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export const customerAPI = {
  // 1️⃣ View Profile
  getProfile: async (): Promise<ApiResponse<{ customer: CustomerProfile; orderCount: number }>> => {
    return apiRequest<{ customer: CustomerProfile; orderCount: number }>('/customers/profile');
  },

  // 2️⃣ Edit Personal Details
  updateProfile: async (data: UpdateProfileData): Promise<ApiResponse<{ customer: CustomerProfile }>> => {
    return apiRequest<{ customer: CustomerProfile }>('/customers/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  },

  // 3️⃣ View Order History
  getOrders: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<ApiResponse<OrdersResponse>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);

    const endpoint = `/customers/orders${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiRequest<OrdersResponse>(endpoint);
  },

  // 4️⃣ Save Shipping Addresses
  addAddress: async (data: CreateAddressData): Promise<ApiResponse<{ addresses: Address[] }>> => {
    return apiRequest<{ addresses: Address[] }>('/customers/addresses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  },

  getAddresses: async (): Promise<ApiResponse<{ addresses: Address[] }>> => {
    return apiRequest<{ addresses: Address[] }>('/customers/addresses');
  },

  updateAddress: async (addressId: string, data: UpdateAddressData): Promise<ApiResponse<{ addresses: Address[] }>> => {
    return apiRequest<{ addresses: Address[] }>(`/customers/addresses/${addressId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  },

  deleteAddress: async (addressId: string): Promise<ApiResponse<{ addresses: Address[] }>> => {
    return apiRequest<{ addresses: Address[] }>(`/customers/addresses/${addressId}`, {
      method: 'DELETE',
    });
  },

  // 5️⃣ Wishlist
  addToWishlist: async (productId: string): Promise<ApiResponse<{ wishlist: Product[] }>> => {
    return apiRequest<{ wishlist: Product[] }>('/customers/wishlist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productId }),
    });
  },

  getWishlist: async (): Promise<ApiResponse<{ wishlist: Product[] }>> => {
    return apiRequest<{ wishlist: Product[] }>('/customers/wishlist');
  },

  removeFromWishlist: async (productId: string): Promise<ApiResponse<{ wishlist: Product[] }>> => {
    return apiRequest<{ wishlist: Product[] }>(`/customers/wishlist/${productId}`, {
      method: 'DELETE',
    });
  },

  // Order Management
  getOrder: async (orderId: string): Promise<ApiResponse<{ order: Order }>> => {
    return apiRequest<{ order: Order }>(`/orders/${orderId}`);
  },

  createOrder: async (orderData: {
    items: Array<{ productId: string; quantity: number }>;
    shippingAddress: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country?: string;
    };
    paymentMethod: 'cod' | 'card' | 'upi' | 'netbanking';
    notes?: string;
  }): Promise<ApiResponse<{ order: Order }>> => {
    return apiRequest<{ order: Order }>('/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });
  },

  cancelOrder: async (orderId: string): Promise<ApiResponse<{ order: Order }>> => {
    return apiRequest<{ order: Order }>(`/orders/${orderId}/cancel`, {
      method: 'PATCH',
    });
  },
}; 