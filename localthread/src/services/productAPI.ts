import { apiRequest, ApiResponse } from './api';

// Product types
export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  stock: number;
  vendorId: string;
  images: string[];
  sizes?: string[];
  colors?: string[];
  isActive: boolean;
  rating?: {
    average: number;
    count: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductData {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  stock: number;
  images: string[];
  sizes?: string[];
  colors?: string[];
}

export interface UpdateProductData extends Partial<CreateProductData> {
  isActive?: boolean;
}

// Product API
export const productAPI = {
  // Get vendor's products
  getVendorProducts: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
  }): Promise<ApiResponse<{
    products: Product[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalProducts: number;
    };
  }>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.category) queryParams.append('category', params.category);
    if (params?.search) queryParams.append('search', params.search);

    const queryString = queryParams.toString();
    const endpoint = `/products/vendor${queryString ? `?${queryString}` : ''}`;
    
    return apiRequest<{
      products: Product[];
      pagination: {
        currentPage: number;
        totalPages: number;
        totalProducts: number;
      };
    }>(endpoint);
  },

  // Create new product
  createProduct: async (productData: CreateProductData): Promise<ApiResponse<{ product: Product }>> => {
    return apiRequest<{ product: Product }>('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  },

  // Update product
  updateProduct: async (productId: string, productData: UpdateProductData): Promise<ApiResponse<{ product: Product }>> => {
    return apiRequest<{ product: Product }>(`/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  },

  // Get single product
  getProduct: async (productId: string): Promise<ApiResponse<{ product: Product }>> => {
    return apiRequest<{ product: Product }>(`/products/${productId}`);
  },

  // Delete product
  deleteProduct: async (productId: string): Promise<ApiResponse<{ message: string }>> => {
    return apiRequest<{ message: string }>(`/products/${productId}`, {
      method: 'DELETE',
    });
  },

  // Test API connectivity
  testAPIConnection: async (): Promise<ApiResponse<any>> => {
    const token = localStorage.getItem('token');
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    
    console.log('Testing API connection:', {
      apiUrl,
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 20) + '...' : 'none'
    });
    
    try {
      const response = await fetch(`${apiUrl}/products/test-upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Test response:', {
        status: response.status,
        statusText: response.statusText
      });

      const data = await response.json();
      console.log('Test response data:', data);

      return data;
    } catch (error) {
      console.error('Test API connection error:', error);
      throw error;
    }
  },

  // Upload product image
  uploadProductImage: async (file: File): Promise<ApiResponse<{ imageUrl: string }>> => {
    const formData = new FormData();
    formData.append('image', file);

    const token = localStorage.getItem('token');
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    
    console.log('Upload attempt:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      apiUrl: apiUrl,
      hasToken: !!token
    });
    
    // Check if token exists
    if (!token) {
      throw new Error('No authentication token found. Please login again.');
    }
    
    try {
      const response = await fetch(`${apiUrl}/products/upload-image`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type for FormData, let the browser set it with boundary
        },
        body: formData,
      });

      console.log('Upload response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Upload failed:', errorData);
        
        // Handle authentication errors
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          throw new Error('Authentication failed. Please login again.');
        }
        throw new Error(errorData.message || 'Upload failed');
      }

      const data = await response.json();
      console.log('Upload success:', data);
      return data;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  },

  // Get all products (public)
  getAllProducts: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    vendorId?: string;
  }): Promise<ApiResponse<{
    products: Product[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalProducts: number;
    };
  }>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.category) queryParams.append('category', params.category);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.vendorId) queryParams.append('vendorId', params.vendorId);

    const queryString = queryParams.toString();
    const endpoint = `/products${queryString ? `?${queryString}` : ''}`;
    
    return apiRequest<{
      products: Product[];
      pagination: {
        currentPage: number;
        totalPages: number;
        totalProducts: number;
      };
    }>(endpoint);
  },
}; 