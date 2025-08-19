import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { RootState } from '../../store';
import { VendorDashboardLayout } from '../vendor/VendorDashboardLayout';

interface VendorRouteProps {
  children: React.ReactNode;
}

export function VendorRoute({ children }: VendorRouteProps) {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  // Debug logging
  console.log('VendorRoute - isAuthenticated:', isAuthenticated);
  console.log('VendorRoute - user:', user);
  console.log('VendorRoute - user role:', user?.role);
  
  // Check localStorage directly
  const storedUser = localStorage.getItem('user');
  const storedToken = localStorage.getItem('token');
  console.log('VendorRoute - storedUser:', storedUser);
  console.log('VendorRoute - storedToken:', storedToken);
  
  if (storedUser) {
    try {
      const parsedUser = JSON.parse(storedUser);
      console.log('VendorRoute - parsed stored user:', parsedUser);
      console.log('VendorRoute - parsed user role:', parsedUser?.role);
    } catch (error) {
      console.error('VendorRoute - error parsing stored user:', error);
    }
  }

  if (!isAuthenticated || !user || user.role !== 'vendor') {
    console.log('VendorRoute - Access denied, redirecting to auth');
    console.log('VendorRoute - Reason:', {
      isAuthenticated,
      hasUser: !!user,
      userRole: user?.role,
      expectedRole: 'vendor'
    });
    // Redirect to auth page with return URL
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  console.log('VendorRoute - Access granted, rendering vendor dashboard');
  return (
    <VendorDashboardLayout>
      {children}
    </VendorDashboardLayout>
  );
} 