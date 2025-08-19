import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

interface CustomerRouteProps {
  children: React.ReactNode;
}

const CustomerRoute: React.FC<CustomerRouteProps> = ({ children }) => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  console.log('CustomerRoute - Auth state:', { isAuthenticated, user: user?.role });

  if (!isAuthenticated) {
    console.log('CustomerRoute - Not authenticated, redirecting to login');
    return <Navigate to="/auth" replace />;
  }

  // Allow both customers and vendors to access customer pages
  if (user?.role !== 'customer' && user?.role !== 'vendor') {
    console.log('CustomerRoute - Not a customer or vendor, redirecting to appropriate dashboard');
    // Redirect based on user role
    if (user?.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else {
      return <Navigate to="/customer/profile" replace />;
    }
  }

  console.log('CustomerRoute - Access granted');
  return <>{children}</>;
};

export default CustomerRoute; 