import { Heart, ShoppingBag, Star } from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Card, CardContent } from './ui/card'
import { ImageWithFallback } from './figma/ImageWithFallback'
import { Product } from '../types/index'

interface ProductCardProps extends Product {
  onAddToCart?: (id: string) => void
  onToggleWishlist?: (id: string) => void
}

export function ProductCard({
  id,
  name,
  price,
  originalPrice,
  image,
  category,
  isNew = false,
  isSale = false,
  colors = [],
  sizes = [],
  rating,
  onAddToCart,
  onToggleWishlist
}: ProductCardProps) {
  return (
    <Card className="group relative overflow-hidden rounded-lg shadow-md transition-all duration-300 hover:shadow-lg border-0 bg-card">
      <CardContent className="p-0">
        {/* Image Container */}
        <div className="relative aspect-[3/4] overflow-hidden rounded-t-lg bg-slate-50">
          <ImageWithFallback
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {isNew && <Badge className="bg-primary text-primary-foreground">New</Badge>}
            {isSale && <Badge variant="destructive">Sale</Badge>}
          </div>

          {/* Quick Actions */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button 
              size="icon" 
              variant="secondary" 
              className="h-8 w-8 bg-background/80 backdrop-blur"
              onClick={() => onToggleWishlist?.(id)}
            >
              <Heart className="h-4 w-4" />
            </Button>
          </div>

          {/* Add to Cart - Appears on hover */}
          <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button 
              className="w-full gap-2" 
              onClick={() => onAddToCart?.(id)}
            >
              <ShoppingBag className="h-4 w-4" />
              Add to Cart
            </Button>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4 space-y-2">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">{category}</p>
            <h3 className="font-medium leading-tight">{name}</h3>
          </div>

          {/* Sizes */}
          {sizes.length > 0 && (
            <p className="text-sm text-muted-foreground">Sizes: {sizes.join(', ')}</p>
          )}

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg">₹{price}</span>
            {originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                ₹{originalPrice}
              </span>
            )}
          </div>

          {/* Rating */}
          {rating !== undefined && rating > 0 && (
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                />
              ))}
              <span className="text-sm text-muted-foreground">({rating.toFixed(1)})</span>
            </div>
          )}

          {/* Colors */}
          {colors.length > 0 && (
            <div className="flex gap-1">
              {colors.slice(0, 4).map((color, index) => (
                <div
                  key={index}
                  className="w-4 h-4 rounded-full border border-border"
                  style={{ backgroundColor: color }}
                />
              ))}
              {colors.length > 4 && (
                <div className="w-4 h-4 rounded-full border border-border bg-muted flex items-center justify-center">
                  <span className="text-xs">+{colors.length - 4}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}