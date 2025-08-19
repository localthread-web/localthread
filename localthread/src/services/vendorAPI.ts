import { apiRequest, ApiResponse } from './api';

// Vendor API types
export interface VendorProfile {
  _id: string;
  name: string;
  email: string;
  role: 'vendor';
  storeName?: string;
  storeLocation?: string;
  storeDescription?: string;
  storeImage?: string;
  isVerified: boolean;
  verificationDate?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VendorStats {
  totalOrders: number;
  totalRevenue: number;
  monthlyStats: Array<{
    month: string;
    orders: number;
    revenue: number;
  }>;
  topSellingProducts: Array<{
    product: {
      _id: string;
      name: string;
      price: number;
    };
    quantity: number;
    revenue: number;
  }>;
  totalProducts: number;
}

export interface UpdateVendorProfileData {
  storeName?: string;
  storeLocation?: string;
  storeDescription?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
}

// Vendor API
export const vendorAPI = {
  // Get vendor profile
  getProfile: async (): Promise<ApiResponse<{ vendor: VendorProfile }>> => {
    return apiRequest<{ vendor: VendorProfile }>('/vendors/profile');
  },

  // Update vendor profile
  updateProfile: async (data: UpdateVendorProfileData): Promise<ApiResponse<{ vendor: VendorProfile }>> => {
    return apiRequest<{ vendor: VendorProfile }>('/vendors/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Get vendor statistics
  getStats: async (vendorId: string): Promise<ApiResponse<VendorStats>> => {
    return apiRequest<VendorStats>(`/vendors/${vendorId}/stats`);
  },

  // Get all vendors (Admin only)
  getAllVendors: async (params?: {
    page?: number;
    limit?: number;
    verified?: boolean;
    search?: string;
  }): Promise<ApiResponse<{
    vendors: VendorProfile[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalVendors: number;
    };
  }>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.verified !== undefined) queryParams.append('verified', params.verified.toString());
    if (params?.search) queryParams.append('search', params.search);

    const queryString = queryParams.toString();
    const endpoint = `/vendors${queryString ? `?${queryString}` : ''}`;
    
    return apiRequest<{
      vendors: VendorProfile[];
      pagination: {
        currentPage: number;
        totalPages: number;
        totalVendors: number;
      };
    }>(endpoint);
  },

  // Verify vendor (Admin only)
  verifyVendor: async (vendorId: string): Promise<ApiResponse<{ vendor: VendorProfile }>> => {
    return apiRequest<{ vendor: VendorProfile }>(`/vendors/${vendorId}/verify`, {
      method: 'PATCH',
    });
  },
}; 