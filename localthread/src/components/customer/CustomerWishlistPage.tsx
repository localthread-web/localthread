import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Heart, Trash2, ShoppingCart, Eye } from 'lucide-react';
import { customerAPI, Product } from '../../services/customerAPI';
import { toast } from 'sonner';

const CustomerWishlistPage: React.FC = () => {
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    try {
      setLoading(true);
      const response = await customerAPI.getWishlist();
      if (response.success && response.data) {
        setWishlist(response.data.wishlist);
      } else {
        toast.error('Failed to load wishlist');
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      const response = await customerAPI.removeFromWishlist(productId);
      if (response.success && response.data) {
        setWishlist(response.data.wishlist);
        toast.success('Product removed from wishlist');
      } else {
        toast.error(response.message || 'Failed to remove from wishlist');
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove from wishlist');
    }
  };

  const handleAddToCart = (product: Product) => {
    // TODO: Implement add to cart functionality
    toast.info('Add to cart functionality coming soon!');
  };

  const handleViewProduct = (product: Product) => {
    // TODO: Navigate to product details page
    toast.info('Product details page coming soon!');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Wishlist</h1>
          <p className="text-gray-600">Your saved products</p>
        </div>
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500" />
          <span className="text-sm text-gray-600">
            {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'}
          </span>
        </div>
      </div>

      {/* Wishlist Items */}
      {wishlist.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Your wishlist is empty</h3>
            <p className="text-gray-600 mb-4">
              Start browsing products and save your favorites for later.
            </p>
            <Button onClick={() => window.history.back()}>
              Continue Shopping
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((product) => (
            <Card key={product._id} className="group hover:shadow-lg transition-shadow">
              <div className="relative">
                {/* Product Image */}
                <div className="aspect-square overflow-hidden rounded-t-lg">
                  <img
                    src={product.images[0] || '/placeholder-product.jpg'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                
                {/* Remove from Wishlist Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveFromWishlist(product._id)}
                  className="absolute top-2 right-2 bg-white/80 hover:bg-white text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>

                {/* Category Badge */}
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary" className="bg-white/80 text-gray-700">
                    {product.category}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-4">
                {/* Product Info */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900 line-clamp-2">
                    {product.name}
                  </h3>
                  
                  {product.vendorId && (
                    <p className="text-sm text-gray-600">
                      by {product.vendorId.storeName}
                    </p>
                  )}
                  
                  <p className="text-lg font-bold text-gray-900">
                    {formatPrice(product.price)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewProduct(product)}
                    className="flex-1 flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    View Details
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleAddToCart(product)}
                    className="flex-1 flex items-center gap-2"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Add to Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      {wishlist.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button
                variant="outline"
                onClick={() => {
                  // TODO: Add all items to cart
                  toast.info('Add all to cart functionality coming soon!');
                }}
                className="flex items-center gap-2"
              >
                <ShoppingCart className="h-4 w-4" />
                Add All to Cart
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  // TODO: Clear wishlist
                  if (window.confirm('Are you sure you want to clear your wishlist?')) {
                    toast.info('Clear wishlist functionality coming soon!');
                  }
                }}
                className="flex items-center gap-2 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
                Clear Wishlist
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CustomerWishlistPage; 