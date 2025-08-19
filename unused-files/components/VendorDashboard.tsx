import React from 'react';
import { VendorRoute } from '../auth/VendorRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Package, TrendingUp, DollarSign, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function VendorDashboard() {
  const navigate = useNavigate();

  return (
    <VendorRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Vendor Dashboard</h1>
          <p className="text-muted-foreground">Manage your products and sales</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                My Products
              </CardTitle>
              <CardDescription>Manage your inventory</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">24</p>
              <p className="text-sm text-muted-foreground">Active products</p>
              <Button 
                variant="outline" 
                className="mt-4 w-full"
                onClick={() => navigate('/vendor/products')}
              >
                Manage Products
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Sales
              </CardTitle>
              <CardDescription>Track your performance</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">156</p>
              <p className="text-sm text-muted-foreground">Orders this month</p>
              <Button 
                variant="outline" 
                className="mt-4 w-full"
                onClick={() => navigate('/vendor/sales')}
              >
                View Analytics
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Revenue
              </CardTitle>
              <CardDescription>Your earnings</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">$2,450</p>
              <p className="text-sm text-muted-foreground">This month</p>
              <Button 
                variant="outline" 
                className="mt-4 w-full"
                onClick={() => navigate('/vendor/earnings')}
              >
                View Details
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Customers
              </CardTitle>
              <CardDescription>Your customer base</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">89</p>
              <p className="text-sm text-muted-foreground">Total customers</p>
              <Button 
                variant="outline" 
                className="mt-4 w-full"
                onClick={() => navigate('/vendor/customers')}
              >
                View Customers
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button onClick={() => navigate('/vendor/products/add')}>
                  Add New Product
                </Button>
                <Button variant="outline" onClick={() => navigate('/vendor/orders')}>
                  View Orders
                </Button>
                <Button variant="outline" onClick={() => navigate('/vendor/settings')}>
                  Store Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </VendorRoute>
  );
} 