import React from 'react';
import { ProtectedRoute } from './ProtectedRoute';

interface AdminRouteProps {
  children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  return (
    <ProtectedRoute allowedRoles={['admin']} redirectTo="/auth">
      {children}
    </ProtectedRoute>
  );
} 