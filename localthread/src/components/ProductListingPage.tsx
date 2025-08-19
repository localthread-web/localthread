import React, { useState, useMemo } from 'react'
import { ProductGrid } from './ProductGrid'
import { featuredProducts } from '../data/products'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Checkbox } from './ui/checkbox'
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

export function ProductListingPage() {
  const dispatch = useDispatch()
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items)

  const [filters, setFilters] = useState({
    priceMin: '',
    priceMax: '',
    sizes: [] as string[],
    colors: [] as string[],
    categories: [] as string[],
  })
  const [sortBy, setSortBy] = useState('newest')
  const [displayCount, setDisplayCount] = useState(12) // Number of products to display initially

  const allCategories = useMemo(() => Array.from(new Set(featuredProducts.map(p => p.category))), [])
  const allSizes = useMemo(() => Array.from(new Set(featuredProducts.flatMap(p => p.sizes || []))), [])
  const allColors = useMemo(() => Array.from(new Set(featuredProducts.flatMap(p => p.colors || []))), [])

  const handleFilterChange = (key: string, value: string | boolean, type: 'text' | 'checkbox') => {
    if (type === 'text') {
      setFilters(prev => ({ ...prev, [key]: value }))
    } else if (type === 'checkbox') {
      setFilters(prev => {
        const currentArray = prev[key as keyof typeof prev] as string[]
        if (value) {
          return { ...prev, [key]: [...currentArray, value] }
        } else {
          return { ...prev, [key]: currentArray.filter(item => item !== value) }
        }
      })
    }
  }

  const handleSortChange = (value: string) => {
    setSortBy(value)
  }

  const filteredAndSortedProducts = useMemo(() => {
    let products = [...featuredProducts]

    // Apply filters
    if (filters.priceMin) {
      products = products.filter(p => p.price >= parseFloat(filters.priceMin))
    }
    if (filters.priceMax) {
      products = products.filter(p => p.price <= parseFloat(filters.priceMax))
    }
    if (filters.sizes.length > 0) {
      products = products.filter(p => p.sizes?.some(s => filters.sizes.includes(s)))
    }
    if (filters.colors.length > 0) {
      products = products.filter(p => p.colors?.some(c => filters.colors.includes(c)))
    }
    if (filters.categories.length > 0) {
      products = products.filter(p => filters.categories.includes(p.category))
    }

    // Apply sorting
    products.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price
        case 'price-desc':
          return b.price - a.price
        case 'newest':
          // Assuming products are already sorted by newest or have a 'createdAt' field
          return 0 // Placeholder for now
        case 'popularity':
          // Placeholder for now
          return 0
        default:
          return 0
      }
    })

    return products
  }, [filters, sortBy])

  const productsToDisplay = useMemo(() => {
    return filteredAndSortedProducts.slice(0, displayCount)
  }, [filteredAndSortedProducts, displayCount])

  const handleLoadMore = () => {
    setDisplayCount(prev => prev + 12)
  }

  const handleAddToCart = (productId: string) => {
    dispatch(addToCart({ productId }))
    toast.success("Added to cart!")
  }

  const handleToggleWishlist = (productId: string) => {
    const isCurrentlyInWishlist = wishlistItems.includes(productId)
    dispatch(toggleWishlist(productId))
    
    if (isCurrentlyInWishlist) {
      toast.success("Removed from wishlist")
    } else {
      toast.success("Added to wishlist!")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Search Results Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">All Products — {filteredAndSortedProducts.length} items</h1>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="w-full md:w-64 sticky top-20 h-fit bg-card p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Filters</h2>

            {/* Price Range */}
            <div className="mb-6">
              <Label htmlFor="price-range" className="mb-2 block">Price Range</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.priceMin}
                  onChange={(e) => handleFilterChange('priceMin', e.target.value, 'text')}
                  className="w-1/2"
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.priceMax}
                  onChange={(e) => handleFilterChange('priceMax', e.target.value, 'text')}
                  className="w-1/2"
                />
              </div>
            </div>

            {/* Categories */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">Categories</h3>
              {allCategories.map(category => (
                <div key={category} className="flex items-center space-x-2 mb-1">
                  <Checkbox
                    id={`category-${category}`}
                    checked={filters.categories.includes(category)}
                    onCheckedChange={(checked) => handleFilterChange('categories', category, 'checkbox')}
                  />
                  <Label htmlFor={`category-${category}`}>{category}</Label>
                </div>
              ))}
            </div>

            {/* Sizes */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">Sizes</h3>
              {allSizes.map(size => (
                <div key={size} className="flex items-center space-x-2 mb-1">
                  <Checkbox
                    id={`size-${size}`}
                    checked={filters.sizes.includes(size)}
                    onCheckedChange={(checked) => handleFilterChange('sizes', size, 'checkbox')}
                  />
                  <Label htmlFor={`size-${size}`}>{size}</Label>
                </div>
              ))}
            </div>

            {/* Colors */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">Colors</h3>
              {allColors.map(color => (
                <div key={color} className="flex items-center space-x-2 mb-1">
                  <Checkbox
                    id={`color-${color}`}
                    checked={filters.colors.includes(color)}
                    onCheckedChange={(checked) => handleFilterChange('colors', color, 'checkbox')}
                  />
                  <Label htmlFor={`color-${color}`}>{color}</Label>
                </div>
              ))}
            </div>
          </aside>

          {/* Product Grid and Sorting */}
          <main className="flex-1">
            <div className="flex justify-end mb-6">
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="popularity">Popularity</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <ProductGrid
              products={productsToDisplay}
              onAddToCart={handleAddToCart}
              onToggleWishlist={handleToggleWishlist}
            />

            {/* Load More Button */}
            {productsToDisplay.length < filteredAndSortedProducts.length && (
              <div className="text-center mt-8">
                <Button onClick={handleLoadMore} variant="outline">
                  Load More Products
                </Button>
              </div>
            )}
          </main>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}