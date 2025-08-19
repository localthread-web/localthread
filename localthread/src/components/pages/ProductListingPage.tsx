import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { setLoading, clearFilters } from '../../store/filterSlice';
import { ProductGrid } from '../ProductGrid';
import { FilterSidebar } from '../filters/FilterSidebar';
import { SortDropdown } from '../filters/SortDropdown';
import { SearchBar } from '../filters/SearchBar';
import { Pagination } from '../filters/Pagination';
import { ProductGridSkeleton } from '../ui/product-skeleton';
import { EmptyState } from '../ui/empty-state';
import { Button } from '../ui/button';
import { Filter, X } from 'lucide-react';
import { products } from '../../data/products';
import { addToCart } from '../../store/cartSlice';
import { toggleWishlist } from '../../store/wishlistSlice';
import { toast } from 'sonner';

export function ProductListingPage() {
  const dispatch = useDispatch();
  const filterState = useSelector((state: RootState) => state.filter);
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 12;

  // Simulate loading
  useEffect(() => {
    dispatch(setLoading(true));
    const timer = setTimeout(() => {
      dispatch(setLoading(false));
    }, 1000);
    return () => clearTimeout(timer);
  }, [dispatch]);

  // Filter and sort products
  useEffect(() => {
    let filtered = [...products];

    // Search filter
    if (filterState.searchQuery) {
      const query = filterState.searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (filterState.category.length > 0) {
      filtered = filtered.filter(product =>
        filterState.category.includes(product.category)
      );
    }

    // Size filter
    if (filterState.size.length > 0) {
      filtered = filtered.filter(product =>
        product.sizes.some((size: string) => filterState.size.includes(size))
      );
    }

    // Price range filter
    filtered = filtered.filter(product =>
      product.price >= filterState.priceRange[0] &&
      product.price <= filterState.priceRange[1]
    );

    // Color filter
    if (filterState.colors.length > 0) {
      filtered = filtered.filter(product =>
        product.colors.some((color: string) => filterState.colors.includes(color))
      );
    }

    // Vendor filter
    if (filterState.vendors.length > 0) {
      filtered = filtered.filter(product =>
        filterState.vendors.includes(product.vendorId)
      );
    }

    // Sort products
    switch (filterState.sortBy) {
      case 'price-low-high':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high-low':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'newest-first':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'popularity':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'discount':
        filtered.sort((a, b) => {
          const aDiscount = a.originalPrice ? a.originalPrice - a.price : 0;
          const bDiscount = b.originalPrice ? b.originalPrice - b.price : 0;
          return bDiscount - aDiscount;
        });
        break;
    }

    setFilteredProducts(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
  }, [filterState]);

  // Get current page products
  const getCurrentPageProducts = () => {
    const startIndex = (filterState.page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredProducts.slice(startIndex, endIndex);
  };

  const handleAddToCart = (productId: string) => {
    dispatch(addToCart({ productId }));
    toast.success("Added to cart!");
  };

  const handleToggleWishlist = (productId: string) => {
    const isCurrentlyInWishlist = wishlistItems.includes(productId);
    dispatch(toggleWishlist(productId));
    
    if (isCurrentlyInWishlist) {
      toast.success("Removed from wishlist");
    } else {
      toast.success("Added to wishlist!");
    }
  };

  const handlePageChange = (page: number) => {
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentProducts = getCurrentPageProducts();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur border-b">
        <div className="container px-4 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <SearchBar className="flex-1 max-w-md" />
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsFilterOpen(true)}
                  className="lg:hidden"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
                
                <SortDropdown />
              </div>
            </div>

            {/* Results count */}
            <div className="text-sm text-muted-foreground">
              {filteredProducts.length} products found
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container px-4 py-8">
        <div className="flex gap-8">
          {/* Filter Sidebar - Desktop */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <FilterSidebar isOpen={true} onClose={() => {}} />
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {filterState.isLoading ? (
              <ProductGridSkeleton count={12} />
            ) : currentProducts.length > 0 ? (
              <>
                <ProductGrid
                  products={currentProducts}
                  onAddToCart={handleAddToCart}
                  onToggleWishlist={handleToggleWishlist}
                />
                
                {/* Pagination */}
                <div className="mt-8">
                  <Pagination
                    totalPages={totalPages}
                    currentPage={filterState.page}
                    onPageChange={handlePageChange}
                  />
                </div>
              </>
            ) : (
              <EmptyState
                variant={filterState.searchQuery ? 'search' : 'filter'}
                action={{
                  label: 'Clear Filters',
                  onClick: () => {
                    dispatch(clearFilters());
                  }
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Sidebar */}
      <FilterSidebar isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />
      
      {/* Mobile Overlay */}
      {isFilterOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsFilterOpen(false)}
        />
      )}
    </div>
  );
} 