import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Heart, ShoppingBag, Trash2 } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { ImageWithFallback } from './figma/ImageWithFallback'
import { RootState } from '../App'
import { addToCart } from '../store/cartSlice'
import { toggleWishlist } from '../store/wishlistSlice'
import { featuredProducts } from '../data/products'
import { toast } from "sonner"

export function WishlistPage() {
  const dispatch = useDispatch()
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items)

  // Get detailed product information for wishlist items
  const wishlistProducts = featuredProducts.filter(product => 
    wishlistItems.includes(product.id)
  )

  const handleAddToCart = (productId: string) => {
    dispatch(addToCart({ productId }))
    toast.success("Added to cart!")
  }

  const handleRemoveFromWishlist = (productId: string) => {
    dispatch(toggleWishlist(productId))
    toast.success("Removed from wishlist")
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">My Wishlist</h1>
        <p className="text-gray-600">
          {wishlistProducts.length} {wishlistProducts.length === 1 ? 'item' : 'items'} in your wishlist
        </p>
      </div>

      {wishlistProducts.length === 0 ? (
        <div className="text-center py-20">
          <Heart className="mx-auto h-24 w-24 text-gray-400 mb-6" />
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">Your wishlist is empty</h2>
          <p className="text-gray-500 mb-6">
            Start adding items to your wishlist to see them here
          </p>
          <Button onClick={() => window.history.back()} size="lg" className="bg-gray-900 text-white hover:bg-black">
            Continue Shopping
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistProducts.map((product) => (
            <Card key={product.id} className="group hover:shadow-lg transition-shadow border border-gray-200">
              <div className="relative">
                <div className="aspect-square overflow-hidden rounded-t-lg">
                  <ImageWithFallback
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                
                {/* Remove from wishlist button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 bg-white/80 hover:bg-white text-red-500 hover:text-red-600"
                  onClick={() => handleRemoveFromWishlist(product.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-gray-900">{product.name}</h3>
                
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg font-bold text-gray-900">₹{product.price}</span>
                  {product.originalPrice && (
                    <span className="text-sm text-gray-500 line-through">
                      ₹{product.originalPrice}
                    </span>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleAddToCart(product.id)}
                    className="flex-1 bg-gray-900 text-white hover:bg-black"
                    size="sm"
                  >
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  )
} 