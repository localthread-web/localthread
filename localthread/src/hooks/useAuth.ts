import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Customer, Vendor, Admin } from '../types/auth';

export function useAuth() {
  const { user, isAuthenticated, isLoading, error } = useSelector((state: RootState) => state.auth);

  const isCustomer = user?.role === 'customer';
  const isVendor = user?.role === 'vendor';
  const isAdmin = user?.role === 'admin';

  // Check if user can access customer functionality (both customers and vendors)
  const canAccessCustomerFeatures = user?.role === 'customer' || user?.role === 'vendor';

  const hasRole = (role: 'customer' | 'vendor' | 'admin') => {
    return user?.role === role;
  };

  const getCustomer = (): Customer | null => {
    return isCustomer ? (user as Customer) : null;
  };

  const getVendor = (): Vendor | null => {
    return isVendor ? (user as Vendor) : null;
  };

  const getAdmin = (): Admin | null => {
    return isAdmin ? (user as Admin) : null;
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    isCustomer,
    isVendor,
    isAdmin,
    canAccessCustomerFeatures,
    hasRole,
    getCustomer,
    getVendor,
    getAdmin,
  };
} 