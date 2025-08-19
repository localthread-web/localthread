import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { 
  User, 
  Package, 
  MapPin, 
  Heart, 
  LogOut,
  ShoppingCart,
  Settings
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';

const CustomerDashboardLayout: React.FC = () => {
  const location = useLocation();
  const dispatch = useDispatch();

  const navigationItems = [
    {
      name: 'Profile',
      href: '/customer/profile',
      icon: User,
      description: 'View and edit your profile'
    },
    {
      name: 'Orders',
      href: '/customer/orders',
      icon: Package,
      description: 'View your order history'
    },
    {
      name: 'Addresses',
      href: '/customer/addresses',
      icon: MapPin,
      description: 'Manage shipping addresses'
    },
    {
      name: 'Wishlist',
      href: '/customer/wishlist',
      icon: Heart,
      description: 'Your saved products'
    },
    {
      name: 'Cart',
      href: '/cart',
      icon: ShoppingCart,
      description: 'Shopping cart'
    }
  ];

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Customer Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-blue-100 text-blue-700 border border-blue-200'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-gray-500">{item.description}</div>
                      </div>
                    </Link>
                  );
                })}
                
                <div className="pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboardLayout; 