import { ProductCard } from './ProductCard'
import { Product } from '../types/index'

interface ProductGridProps {
  products: Product[]
  onAddToCart?: (id: string) => void
  onToggleWishlist?: (id: string) => void
}

export function ProductGrid({ products, onAddToCart, onToggleWishlist }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          {...product}
          onAddToCart={onAddToCart}
          onToggleWishlist={onToggleWishlist}
        />
      ))}
    </div>
  )
}