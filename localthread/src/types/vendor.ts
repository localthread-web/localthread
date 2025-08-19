export interface Vendor {
  id: string;
  name: string;
  email: string;
  storeDescription?: string;
  contactDetails?: {
    phone?: string;
    address?: string;
    website?: string;
  };
  logo?: string;
  createdAt: string;
  isActive: boolean;
}

export interface VendorProduct {
  id: string;
  vendorId: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  sizes: string[];
  colors: string[];
  stockCount: number;
  images: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VendorOrder {
  id: string;
  vendorId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  products: {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: string;
  deliveryAddress: string;
  trackingNumber?: string;
}

export interface VendorStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  lowStockProducts: number;
  recentOrders: VendorOrder[];
}

export interface VendorAuthState {
  vendor: Vendor | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
} 