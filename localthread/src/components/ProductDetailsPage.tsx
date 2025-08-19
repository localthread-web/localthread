import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Heart, ShoppingBag, Star, Minus, Plus } from 'lucide-react'
import { Button } from './ui/button'
import { Product } from '../types'
import { featuredProducts } from '../data/products'
import { ImageWithFallback } from './figma/ImageWithFallback'
import { ProductGrid } from './ProductGrid'
import { Header } from './Header'
import { Footer } from './Footer'
import { toast } from "sonner"
import { useDispatch, useSelector } from 'react-redux'
import { addToCart } from '../store/cartSlice'
import { toggleWishlist } from '../store/wishlistSlice'

interface RootState {
  wishlist: {
    items: string[]
  }
}

export function ProductDetailsPage() {
  // In a real app, you'd fetch product data based on a route parameter (e.g., productId)
  // For now, we'll use a hardcoded product or find one from featuredProducts
  const { productId } = useParams()
  const product: Product | undefined = featuredProducts.find(p => p.id === productId) || featuredProducts[0] // Fallback to first product

  const dispatch = useDispatch()
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items)

  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined)
  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined)
  const [quantity, setQuantity] = useState(1)

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">Product not found.</div>
        <Footer />
      </div>
    )
  }

  const handleAddToCart = () => {
    dispatch(addToCart({ 
      productId: product.id, 
      size: selectedSize, 
      color: selectedColor,
      quantity 
    }))
    toast.success(`${quantity} x ${product.name} added to cart!`)
  }

  const handleToggleWishlist = () => {
    const isCurrentlyInWishlist = wishlistItems.includes(product.id)
    dispatch(toggleWishlist(product.id))
    
    if (isCurrentlyInWishlist) {
      toast.success("Removed from wishlist")
    } else {
      toast.success("Added to wishlist!")
    }
  }

  const handleQuantityChange = (type: 'increment' | 'decrement') => {
    if (type === 'increment') {
      setQuantity(prev => prev + 1)
    } else if (type === 'decrement' && quantity > 1) {
      setQuantity(prev => prev - 1)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Section: Product Image/Carousel */}
          <div className="w-full lg:w-1/2">
            <div className="relative aspect-square overflow-hidden rounded-lg shadow-lg">
              <ImageWithFallback
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              />
              {/* Add image carousel here if multiple images are available */}
            </div>
          </div>

          {/* Right Section: Product Details */}
          <div className="w-full lg:w-1/2 space-y-6">
            <h1 className="text-4xl font-extrabold text-gray-900">{product.name}</h1>

            {/* Price */}
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-gray-900">₹{product.price}</span>
              {product.originalPrice && (
                <span className="text-xl text-muted-foreground line-through">
                  ₹{product.originalPrice}
                </span>
              )}
            </div>

            {/* Rating */}
            {product.rating !== undefined && product.rating > 0 && (
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${i < (product.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
                <span className="text-base text-muted-foreground">({(product.rating || 0).toFixed(1)})</span>
              </div>
            )}

            {/* Size Selector */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Size: {selectedSize || 'Select'}</h3>
                <div className="flex gap-2">
                  {product.sizes.map(size => (
                    <Button
                      key={size}
                      variant={selectedSize === size ? 'default' : 'outline'}
                      onClick={() => setSelectedSize(size)}
                      className="min-w-[40px]"
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selector */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Color:</h3>
                <div className="flex gap-2">
                  {product.colors.map(color => (
                    <div
                      key={color}
                      className={`w-8 h-8 rounded-full border-2 cursor-pointer ${selectedColor === color ? 'border-primary' : 'border-transparent'}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setSelectedColor(color)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Quantity</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleQuantityChange('decrement')}
                    disabled={quantity <= 1}
                    className="h-10 w-10"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="px-4 text-lg font-medium">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleQuantityChange('increment')}
                    className="h-10 w-10"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button 
                onClick={handleAddToCart}
                className="flex-1 bg-primary hover:bg-primary/90"
                size="lg"
              >
                <ShoppingBag className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={handleToggleWishlist}
                className="flex items-center"
              >
                <Heart className={`mr-2 h-5 w-5 ${wishlistItems.includes(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
                Wishlist
              </Button>
            </div>

            {/* Product Description */}
            <div className="pt-6 border-t">
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                Experience the perfect blend of style and comfort with this premium fashion piece. 
                Crafted with attention to detail and made from high-quality materials, this item 
                is designed to elevate your wardrobe and make you feel confident in any setting.
              </p>
            </div>

            {/* Product Features */}
            <div className="pt-6 border-t">
              <h3 className="text-lg font-semibold mb-2">Features</h3>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Premium quality materials</li>
                <li>• Comfortable fit and design</li>
                <li>• Versatile styling options</li>
                <li>• Durable construction</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        <section className="mt-16 pt-8 border-t">
          <h2 className="text-2xl font-bold mb-6">You might also like</h2>
          <ProductGrid 
            products={featuredProducts.filter(p => p.id !== product.id).slice(0, 4)}
            onAddToCart={(productId) => {
              dispatch(addToCart({ productId }))
              toast.success("Added to cart!")
            }}
            onToggleWishlist={(productId) => {
              const isCurrentlyInWishlist = wishlistItems.includes(productId)
              dispatch(toggleWishlist(productId))
              
              if (isCurrentlyInWishlist) {
                toast.success("Removed from wishlist")
              } else {
                toast.success("Added to wishlist!")
              }
            }}
          />
        </section>
      </main>
      
      <Footer />
    </div>
  )
}