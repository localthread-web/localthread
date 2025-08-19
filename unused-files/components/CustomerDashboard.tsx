import React from 'react';
import CustomerRoute from '../auth/CustomerRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { ShoppingBag, Heart, Package, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function CustomerDashboard() {
  const navigate = useNavigate();

  return (
    <CustomerRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Customer Dashboard</h1>
          <p className="text-muted-foreground">Welcome to your LocalThread dashboard</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                My Orders
              </CardTitle>
              <CardDescription>Track your recent orders</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">3</p>
              <p className="text-sm text-muted-foreground">Active orders</p>
              <Button 
                variant="outline" 
                className="mt-4 w-full"
                onClick={() => navigate('/orders')}
              >
                View Orders
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Wishlist
              </CardTitle>
              <CardDescription>Your saved items</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">12</p>
              <p className="text-sm text-muted-foreground">Saved items</p>
              <Button 
                variant="outline" 
                className="mt-4 w-full"
                onClick={() => navigate('/wishlist')}
              >
                View Wishlist
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Recent Purchases
              </CardTitle>
              <CardDescription>Your shopping history</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">8</p>
              <p className="text-sm text-muted-foreground">Total purchases</p>
              <Button 
                variant="outline" 
                className="mt-4 w-full"
                onClick={() => navigate('/purchases')}
              >
                View History
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile
              </CardTitle>
              <CardDescription>Manage your account</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">-</p>
              <p className="text-sm text-muted-foreground">Account settings</p>
              <Button 
                variant="outline" 
                className="mt-4 w-full"
                onClick={() => navigate('/profile')}
              >
                Edit Profile
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </CustomerRoute>
  );
} 