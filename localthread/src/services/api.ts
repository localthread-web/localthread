// API Base URL - Change this based on your environment
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Debug logging for API configuration
console.log('API Configuration:', {
  REACT_APP_API_URL: process.env.REACT_APP_API_URL,
  API_BASE_URL,
  NODE_ENV: process.env.NODE_ENV
});

// API Response interface
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Array<{ 
    type?: string;
    value?: any;
    msg?: string;
    path?: string;
    location?: string;
    field?: string;
    message?: string;
  }>;
}

// API Error class
export class ApiError extends Error {
  public status: number;
  public errors?: Array<{ field: string; message: string }>;

  constructor(message: string, status: number, errors?: Array<{ field: string; message: string }>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

// Get auth headers
const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Make API request
export const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  console.log('API Request:', { url, method: options.method || 'GET' }); // Debug log
  
  const config: RequestInit = {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  };

  try {
    console.log('Making API request to:', url); // Debug log
    const response = await fetch(url, config);
    console.log('API Response status:', response.status); // Debug log
    
    const data: ApiResponse<T> = await response.json();
    console.log('API Response data:', data); // Debug log

    if (!response.ok) {
      // Handle authentication errors
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/auth';
        throw new ApiError('Authentication failed. Please login again.', 401);
      }

      // Handle validation errors with field-specific messages
      if (response.status === 400 && data.errors && Array.isArray(data.errors)) {
        // Convert validation errors to a more user-friendly format
        const fieldErrors = data.errors.map(error => ({
          field: error.field || error.path || 'general',
          message: error.message || error.msg || 'Validation failed'
        }));
        
        throw new ApiError(
          data.message || 'Validation failed', 
          response.status, 
          fieldErrors
        );
      }

      // Handle other errors
      throw new ApiError(data.message || 'Request failed', response.status);
    }

    return data;
  } catch (error) {
    console.error('API Request error:', error); // Debug log
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Network error. Please check your connection.', 0);
  }
};

// Authentication API
export const authAPI = {
  // Register user
  register: async (userData: {
    name: string;
    email: string;
    password: string;
    confirmPassword?: string;
    role: 'customer' | 'vendor';
    storeName?: string;
    storeLocation?: string;
    storeDescription?: string;
    phone?: string;
  }) => {
    return apiRequest<{ user: any; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Login user
  login: async (credentials: { email: string; password: string }) => {
    return apiRequest<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  // Get current user
  getCurrentUser: async () => {
    return apiRequest<{ user: any }>('/auth/me');
  },

  // Refresh token
  refreshToken: async () => {
    return apiRequest<{ token: string }>('/auth/refresh-token', {
      method: 'POST',
    });
  },

  // Forgot password
  forgotPassword: async (email: string) => {
    return apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  // Reset password
  resetPassword: async (token: string, password: string) => {
    return apiRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  },

  // Verify email
  verifyEmail: async (token: string) => {
    return apiRequest('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  },
};

// User API
export const userAPI = {
  // Get user profile
  getProfile: async () => {
    return apiRequest<{ user: any }>('/users/profile');
  },

  // Update user profile
  updateProfile: async (profileData: {
    name?: string;
    phone?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      zipCode?: string;
    };
    storeName?: string;
    storeLocation?: string;
    storeDescription?: string;
  }) => {
    return apiRequest<{ user: any }>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  // Upload avatar
  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);

    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/users/avatar`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const data = await response.json();
      throw new ApiError(data.message || 'Upload failed', response.status);
    }

    return response.json();
  },

  // Upload store image (vendor only)
  uploadStoreImage: async (file: File) => {
    const formData = new FormData();
    formData.append('storeImage', file);

    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/users/store-image`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const data = await response.json();
      throw new ApiError(data.message || 'Upload failed', response.status);
    }

    return response.json();
  },

  // Change password
  changePassword: async (currentPassword: string, newPassword: string) => {
    return apiRequest('/users/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  // Deactivate account
  deactivateAccount: async (password: string) => {
    return apiRequest('/users/account', {
      method: 'DELETE',
      body: JSON.stringify({ password }),
    });
  },

  // Get all vendors (public)
  getVendors: async (params?: { page?: number; limit?: number; search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);

    const queryString = searchParams.toString();
    const endpoint = `/users/vendors${queryString ? `?${queryString}` : ''}`;
    
    return apiRequest(endpoint);
  },

  // Get vendor profile by ID (public)
  getVendorProfile: async (vendorId: string) => {
    return apiRequest(`/users/vendors/${vendorId}`);
  },
};

// Health check API
export const healthAPI = {
  // Check API health
  checkHealth: async () => {
    return apiRequest('/health');
  },
};