import React, { useState, useEffect } from 'react';
import { Search, MapPin, Star, Users, Store, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface Shop {
  _id: string;
  name: string;
  description: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  categories: string[];
  rating: {
    average: number;
    count: number;
  };
  followersCount: number;
  logo?: string;
  isVerified: boolean;
  isActive: boolean;
  productsCount?: number;
  reviewsCount?: number;
}

const ShopListPage: React.FC = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCity, setSelectedCity] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const navigate = useNavigate();
  const { user } = useAuth();

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'mens-wear', label: "Men's Wear" },
    { value: 'womens-wear', label: "Women's Wear" },
    { value: 'kids-wear', label: "Kids' Wear" },
    { value: 'accessories', label: 'Accessories' },
    { value: 'footwear', label: 'Footwear' },
    { value: 'jewelry', label: 'Jewelry' },
    { value: 'bags', label: 'Bags & Wallets' }
  ];

  const sortOptions = [
    { value: 'createdAt', label: 'Newest First' },
    { value: 'name', label: 'Name A-Z' },
    { value: 'rating.average', label: 'Highest Rated' },
    { value: 'followersCount', label: 'Most Followed' }
  ];

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied:', error);
        }
      );
    }
  }, []);

  // Fetch shops
  const fetchShops = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        sortBy,
        sortOrder
      });

      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedCity) params.append('city', selectedCity);

      const response = await fetch(`/api/shops?${params}`);
      const data = await response.json();

      if (data.success) {
        setShops(data.data.docs || data.data);
        setTotalPages(data.data.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching shops:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch nearby shops
  const fetchNearbyShops = async () => {
    if (!userLocation) return;

    try {
      setLoading(true);
      const params = new URLSearchParams({
        longitude: userLocation.lng.toString(),
        latitude: userLocation.lat.toString(),
        maxDistance: '10000',
        limit: '12'
      });

      const response = await fetch(`/api/shops/nearby?${params}`);
      const data = await response.json();

      if (data.success) {
        setShops(data.data);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error fetching nearby shops:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch trending shops
  const fetchTrendingShops = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/shops/trending?limit=12');
      const data = await response.json();

      if (data.success) {
        setShops(data.data);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error fetching trending shops:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, [currentPage, sortBy, sortOrder, selectedCategory, selectedCity]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchShops();
  };

  const handleNearbyShops = () => {
    setCurrentPage(1);
    fetchNearbyShops();
  };

  const handleTrendingShops = () => {
    setCurrentPage(1);
    fetchTrendingShops();
  };

  const handleShopClick = (shopId: string) => {
    navigate(`/shops/${shopId}`);
  };

  const formatAddress = (address: Shop['address']) => {
    return `${address.city}, ${address.state}`;
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'mens-wear': 'bg-blue-100 text-blue-800',
      'womens-wear': 'bg-pink-100 text-pink-800',
      'kids-wear': 'bg-green-100 text-green-800',
      'accessories': 'bg-yellow-100 text-yellow-800',
      'footwear': 'bg-red-100 text-red-800',
      'jewelry': 'bg-purple-100 text-purple-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (loading && shops.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Discover Local Shops</h1>
        <p className="text-gray-600">Find amazing local businesses in your area</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search shops by name or location..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              onKeyPress={(e: React.KeyboardEvent) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleSearch}
            className="md:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Search
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:w-auto px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={handleNearbyShops}
            disabled={!userLocation}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MapPin className="w-4 h-4" />
            Nearby Shops
          </button>
          <button
            onClick={handleTrendingShops}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            Trending
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  placeholder="Enter city name"
                  value={selectedCity}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedCity(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Shops Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {shops.map((shop) => (
          <div
            key={shop._id}
            onClick={() => handleShopClick(shop._id)}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                {shop.logo && (
                  <img
                    src={shop.logo}
                    alt={shop.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900">{shop.name}</h3>
                  <div className="flex items-center gap-2">
                    {shop.isVerified && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Verified
                      </span>
                    )}
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <MapPin className="w-3 h-3" />
                      {formatAddress(shop.address)}
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {shop.description}
              </p>

              <div className="flex flex-wrap gap-1 mb-3">
                {shop.categories.slice(0, 3).map((category) => (
                  <span
                    key={category}
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(category)}`}
                  >
                    {category.replace('-', ' ')}
                  </span>
                ))}
                {shop.categories.length > 3 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    +{shop.categories.length - 3}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="font-medium">{shop.rating.average.toFixed(1)}</span>
                  <span className="text-gray-500">({shop.rating.count})</span>
                </div>
                <div className="flex items-center gap-1 text-gray-500">
                  <Users className="w-4 h-4" />
                  <span>{shop.followersCount}</span>
                </div>
              </div>

              {shop.productsCount !== undefined && (
                <div className="flex items-center gap-1 text-sm text-gray-500 mt-2">
                  <Store className="w-4 h-4" />
                  <span>{shop.productsCount} products</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <span className="flex items-center px-4">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && shops.length === 0 && (
        <div className="text-center py-12">
          <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No shops found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search criteria or filters
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setSelectedCity('');
              setCurrentPage(1);
              fetchShops();
            }}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default ShopListPage; 