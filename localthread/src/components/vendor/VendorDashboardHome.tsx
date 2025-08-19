import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { vendorAPI, VendorStats } from '../../services/vendorAPI';
import { productAPI } from '../../services/productAPI';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Loader2, 
  TrendingUp, 
  Package, 
  DollarSign, 
  ShoppingBag,
  BarChart3,
  Calendar,
  Star,
  Store
} from 'lucide-react';
import { Button } from '../ui/button';

export function VendorDashboardHome() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [stats, setStats] = useState<VendorStats | null>(null);
  const [productCount, setProductCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debug logging
  console.log('VendorDashboardHome - User:', user);
  console.log('VendorDashboardHome - User ID:', user?._id);

  const loadDashboardData = useCallback(async () => {
    if (!user?._id) {
      console.log('VendorDashboardHome - No user ID, skipping data load');
      setIsLoading(false);
      return;
    }
    
    try {
      console.log('VendorDashboardHome - Loading dashboard data for user:', user._id);
      setIsLoading(true);
      setError(null);
      
      // Load vendor stats
      console.log('VendorDashboardHome - Loading vendor stats...');
      const statsResponse = await vendorAPI.getStats(user._id);
      console.log('VendorDashboardHome - Stats response:', statsResponse);
      
      // Load product count
      console.log('VendorDashboardHome - Loading product count...');
      const productsResponse = await productAPI.getVendorProducts({ limit: 1 });
      console.log('VendorDashboardHome - Products response:', productsResponse);
      
      if (statsResponse.success && statsResponse.data) {
        console.log('VendorDashboardHome - Setting stats:', statsResponse.data);
        setStats(statsResponse.data);
      } else {
        console.log('VendorDashboardHome - Stats request failed:', statsResponse);
      }
      
      if (productsResponse.success && productsResponse.data) {
        console.log('VendorDashboardHome - Setting product count:', productsResponse.data.pagination.totalProducts);
        setProductCount(productsResponse.data.pagination.totalProducts);
      } else {
        console.log('VendorDashboardHome - Products request failed:', productsResponse);
      }
    } catch (error) {
      console.error('VendorDashboardHome - Load dashboard data error:', error);
      setError('Failed to load dashboard data. Please try refreshing the page.');
    } finally {
      setIsLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    console.log('VendorDashboardHome - useEffect triggered, user:', user);
    if (user?._id) {
      loadDashboardData();
    } else {
      console.log('VendorDashboardHome - No user ID available');
      setIsLoading(false);
    }
  }, [user, loadDashboardData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <Alert variant="destructive">
          <AlertDescription>User information not available. Please log in again.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user.name}! Here's your store overview</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Debug Info - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-500">Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs space-y-2">
              <div><strong>User ID:</strong> {user._id || 'Not available'}</div>
              <div><strong>User Role:</strong> {user.role || 'Not available'}</div>
              <div><strong>Store Name:</strong> {(user as any).storeName || 'Not set'}</div>
              <div><strong>Token:</strong> {localStorage.getItem('token') ? 'Present' : 'Missing'}</div>
              <div><strong>Stats:</strong> {stats ? 'Loaded' : 'Not loaded'}</div>
              <div><strong>Product Count:</strong> {productCount}</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Shop Setup Notice */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Shop Setup
          </CardTitle>
          <CardDescription>
            Enhance your store's visibility and features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <Store className="h-5 w-5 text-blue-600 mt-0.5" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-blue-900 mb-1">
                  Create Your Shop Profile
                </h4>
                <p className="text-sm text-blue-700 mb-3">
                  While you can create products without a shop, setting up a shop profile will:
                </p>
                <ul className="text-sm text-blue-700 space-y-1 mb-3">
                  <li>• Increase your store's visibility in search results</li>
                  <li>• Allow customers to follow your shop</li>
                  <li>• Provide detailed shop information and location</li>
                  <li>• Enable shop-specific analytics and insights</li>
                </ul>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-blue-700 border-blue-300 hover:bg-blue-100"
                  onClick={() => window.open('/vendor/profile', '_blank')}
                >
                  Set Up Shop Profile
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalOrders || 0}</div>
            <p className="text-xs text-muted-foreground">
              All time orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats?.totalRevenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              All time earnings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              Active products
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats && stats.totalOrders > 0 
                ? formatCurrency(stats.totalRevenue / stats.totalOrders)
                : formatCurrency(0)
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Per order average
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Sales Chart */}
      {stats?.monthlyStats && stats.monthlyStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Monthly Sales Trend
            </CardTitle>
            <CardDescription>
              Your sales performance over the last 6 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.monthlyStats.map((month, index) => (
                <div key={month.month} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">
                      {new Date(month.month + '-01').toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-medium">{month.orders} orders</div>
                      <div className="text-xs text-gray-500">
                        {formatCurrency(month.revenue)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Selling Products */}
      {stats?.topSellingProducts && stats.topSellingProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Top Selling Products
            </CardTitle>
            <CardDescription>
              Your best performing products
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topSellingProducts.map((item, index) => (
                <div key={item.product._id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{item.product.name}</div>
                      <div className="text-sm text-gray-500">
                        {formatCurrency(item.product.price)} each
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{item.quantity} sold</div>
                    <div className="text-sm text-gray-500">
                      {formatCurrency(item.revenue)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {(!stats || (stats.totalOrders === 0 && stats.totalProducts === 0)) && (
        <Card>
          <CardHeader>
            <CardTitle>Welcome to Your Dashboard!</CardTitle>
            <CardDescription>
              Start by adding products to see your sales statistics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No data yet
              </h3>
              <p className="text-gray-500 mb-4">
                Your dashboard will show statistics once you add products and receive orders.
              </p>
              <div className="space-x-2">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                  Add Your First Product
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 