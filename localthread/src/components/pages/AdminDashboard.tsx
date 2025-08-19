import React from 'react';
import { AdminRoute } from '../auth/AdminRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Users, Package, DollarSign, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <AdminRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage LocalThread platform</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Users
              </CardTitle>
              <CardDescription>Manage platform users</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">1,247</p>
              <p className="text-sm text-muted-foreground">Total users</p>
              <Button 
                variant="outline" 
                className="mt-4 w-full"
                onClick={() => navigate('/admin/users')}
              >
                Manage Users
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Products
              </CardTitle>
              <CardDescription>Platform inventory</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">3,456</p>
              <p className="text-sm text-muted-foreground">Total products</p>
              <Button 
                variant="outline" 
                className="mt-4 w-full"
                onClick={() => navigate('/admin/products')}
              >
                View Products
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Revenue
              </CardTitle>
              <CardDescription>Platform earnings</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">$45,230</p>
              <p className="text-sm text-muted-foreground">This month</p>
              <Button 
                variant="outline" 
                className="mt-4 w-full"
                onClick={() => navigate('/admin/revenue')}
              >
                View Analytics
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security
              </CardTitle>
              <CardDescription>Platform security</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">99.9%</p>
              <p className="text-sm text-muted-foreground">Uptime</p>
              <Button 
                variant="outline" 
                className="mt-4 w-full"
                onClick={() => navigate('/admin/security')}
              >
                Security Settings
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Vendors
              </CardTitle>
              <CardDescription>Manage vendor accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">24</p>
              <p className="text-sm text-muted-foreground">Active vendors</p>
              <Button 
                variant="outline" 
                className="mt-4 w-full"
                onClick={() => navigate('/admin/vendors')}
              >
                Manage Vendors
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">New vendor registered</p>
                    <p className="text-sm text-muted-foreground">2 minutes ago</p>
                  </div>
                  <Button variant="outline" size="sm">Review</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Product reported</p>
                    <p className="text-sm text-muted-foreground">15 minutes ago</p>
                  </div>
                  <Button variant="outline" size="sm">Investigate</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">System backup completed</p>
                    <p className="text-sm text-muted-foreground">1 hour ago</p>
                  </div>
                  <Button variant="outline" size="sm">View Logs</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button className="w-full" onClick={() => navigate('/admin/users/add')}>
                  Add New User
                </Button>
                <Button variant="outline" className="w-full" onClick={() => navigate('/admin/reports')}>
                  View Reports
                </Button>
                <Button variant="outline" className="w-full" onClick={() => navigate('/admin/settings')}>
                  Platform Settings
                </Button>
                <Button variant="outline" className="w-full" onClick={() => navigate('/admin/backups')}>
                  System Backup
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminRoute>
  );
} 