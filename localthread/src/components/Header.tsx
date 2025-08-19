import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, User, Menu, X, Search, ChevronDown, Store, Settings } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { logout } from '../store/authSlice';
import { LocalThreadLogo } from './LocalThreadLogo';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useAuth } from '../hooks/useAuth';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { items: cartItems } = useSelector((state: RootState) => state.cart);
  const { items: wishlistItems } = useSelector((state: RootState) => state.wishlist);
  const { user, isAuthenticated, canAccessCustomerFeatures } = useAuth();
  const dispatch = useDispatch();
  const userMenuRef = useRef<HTMLDivElement>(null);

  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const wishlistItemCount = wishlistItems.length;

  // Handle clicking outside the user menu to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleUserClick = () => {
    if (isAuthenticated) {
      dispatch(logout());
    } else {
      // Navigate to auth page
      window.location.href = '/auth';
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  return (
    <header className="w-full bg-white/10 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center group">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 group-hover:bg-white/30 transition-all duration-300 border border-white/20">
                <LocalThreadLogo size="lg" />
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1">
            <Link 
              to="/" 
              className="text-gray-800 hover:text-blue-600 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-300 hover:bg-white/30 backdrop-blur-sm border border-transparent hover:border-white/30"
            >
              Home
            </Link>
            <Link 
              to="/products" 
              className="text-gray-800 hover:text-blue-600 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-300 hover:bg-white/30 backdrop-blur-sm border border-transparent hover:border-white/30"
            >
              Products
            </Link>
            <Link 
              to="/about" 
              className="text-gray-800 hover:text-blue-600 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-300 hover:bg-white/30 backdrop-blur-sm border border-transparent hover:border-white/30"
            >
              About
            </Link>
            <Link 
              to="/contact" 
              className="text-gray-800 hover:text-blue-600 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-300 hover:bg-white/30 backdrop-blur-sm border border-transparent hover:border-white/30"
            >
              Contact
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-2">
            {/* Search */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative bg-white/20 hover:bg-white/30 text-gray-700 border border-white/30 backdrop-blur-sm transition-all duration-300"
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Wishlist */}
            <Link to="/wishlist" className="relative">
              <Button 
                variant="ghost" 
                size="icon"
                className="bg-white/20 hover:bg-white/30 text-gray-700 border border-white/30 backdrop-blur-sm transition-all duration-300"
              >
                <Heart className="h-5 w-5" />
                {wishlistItemCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs bg-red-500 text-white border-2 border-white shadow-lg">
                    {wishlistItemCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Cart */}
            <Link to="/cart" className="relative">
              <Button 
                variant="ghost" 
                size="icon"
                className="bg-white/20 hover:bg-white/30 text-gray-700 border border-white/30 backdrop-blur-sm transition-all duration-300"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs bg-orange-500 text-white border-2 border-white shadow-lg">
                    {cartItemCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* User Menu */}
            <div className="flex items-center space-x-2">
              {isAuthenticated ? (
                <div className="relative">
                  <Button 
                    variant="ghost" 
                    className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 text-gray-700 border border-white/30 backdrop-blur-sm transition-all duration-300"
                    onClick={toggleUserMenu}
                  >
                    <div className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center border border-white/30">
                      <User className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium">{user?.name}</span>
                    <Badge variant="secondary" className="text-xs bg-white/30 text-gray-700 border-white/40">
                      {user?.role}
                    </Badge>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  
                  {/* User Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl py-2 z-50 border border-white/30" ref={userMenuRef}>
                      {canAccessCustomerFeatures && (
                        <>
                          {user?.role === 'vendor' && (
                            <div className="px-4 py-3 text-xs text-blue-600 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border-b border-white/30 rounded-t-xl backdrop-blur-sm">
                              <div className="flex items-center">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
                                Shopping as Customer
                              </div>
                            </div>
                          )}
                          <Link
                            to="/customer/profile"
                            className="block px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-200"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <User className="h-4 w-4 inline mr-3 text-blue-500" />
                            My Profile
                          </Link>
                          <Link
                            to="/customer/orders"
                            className="block px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-200"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <ShoppingCart className="h-4 w-4 inline mr-3 text-green-500" />
                            My Orders
                          </Link>
                          <Link
                            to="/customer/wishlist"
                            className="block px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-200"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Heart className="h-4 w-4 inline mr-3 text-red-500" />
                            My Wishlist
                          </Link>
                        </>
                      )}
                      
                      {user?.role === 'vendor' && (
                        <>
                          <div className="border-t border-white/30 my-2"></div>
                          <Link
                            to="/vendor/dashboard"
                            className="block px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/50 transition-all duration-200"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Store className="h-4 w-4 inline mr-3 text-purple-500" />
                            Vendor Dashboard
                          </Link>
                          <Link
                            to="/vendor/products"
                            className="block px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/50 transition-all duration-200"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Settings className="h-4 w-4 inline mr-3 text-purple-500" />
                            Manage Products
                          </Link>
                        </>
                      )}
                      
                      <div className="border-t border-white/30 my-2"></div>
                      <button
                        onClick={() => {
                          handleUserClick();
                          setIsUserMenuOpen(false);
                        }}
                        className="block w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-gradient-to-r hover:from-red-50/50 hover:to-pink-50/50 transition-all duration-200 rounded-b-xl"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Button 
                  variant="outline" 
                  onClick={handleUserClick}
                  className="bg-white/20 hover:bg-white/30 text-gray-700 border-white/40 hover:border-white/50 backdrop-blur-sm transition-all duration-300"
                >
                  <User className="h-4 w-4 mr-2" />
                  Login
                </Button>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleMobileMenu}
              className="bg-white/20 hover:bg-white/30 text-gray-700 border border-white/30 backdrop-blur-sm transition-all duration-300"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white/95 backdrop-blur-md border-t border-white/30 rounded-b-xl shadow-lg">
              <Link
                to="/"
                className="text-gray-700 hover:text-blue-600 block px-3 py-3 rounded-lg text-base font-medium hover:bg-blue-50/50 transition-all duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/products"
                className="text-gray-700 hover:text-blue-600 block px-3 py-3 rounded-lg text-base font-medium hover:bg-blue-50/50 transition-all duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Products
              </Link>
              <Link
                to="/about"
                className="text-gray-700 hover:text-blue-600 block px-3 py-3 rounded-lg text-base font-medium hover:bg-blue-50/50 transition-all duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link
                to="/contact"
                className="text-gray-700 hover:text-blue-600 block px-3 py-3 rounded-lg text-base font-medium hover:bg-blue-50/50 transition-all duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact
              </Link>
              
              {/* Mobile Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-white/30">
                <div className="flex items-center space-x-2">
                  <Link to="/wishlist" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" size="icon" className="relative bg-blue-50/80 hover:bg-blue-100/80 text-blue-600 backdrop-blur-sm">
                      <Heart className="h-5 w-5" />
                      {wishlistItemCount > 0 && (
                        <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs bg-red-500 text-white border-2 border-white shadow-lg">
                          {wishlistItemCount}
                        </Badge>
                      )}
                    </Button>
                  </Link>
                  <Link to="/cart" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" size="icon" className="relative bg-blue-50/80 hover:bg-blue-100/80 text-blue-600 backdrop-blur-sm">
                      <ShoppingCart className="h-5 w-5" />
                      {cartItemCount > 0 && (
                        <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs bg-orange-500 text-white border-2 border-white shadow-lg">
                          {cartItemCount}
                        </Badge>
                      )}
                    </Button>
                  </Link>
                </div>
                
                {isAuthenticated ? (
                  <Button variant="outline" onClick={handleUserClick} className="border-red-300 text-red-600 hover:bg-red-50/50 backdrop-blur-sm">
                    <User className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                ) : (
                  <Button variant="outline" onClick={handleUserClick} className="border-blue-300 text-blue-600 hover:bg-blue-50/50 backdrop-blur-sm">
                    <User className="h-4 w-4 mr-2" />
                    Login
                  </Button>
                )}
              </div>
              
              {/* Mobile User Menu */}
              {isAuthenticated && (
                <div className="pt-4 border-t border-white/30 space-y-2">
                  {canAccessCustomerFeatures && (
                    <>
                      {user?.role === 'vendor' && (
                        <div className="px-3 py-3 text-xs text-blue-600 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 rounded-lg mb-2 backdrop-blur-sm">
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
                            Shopping as Customer
                          </div>
                        </div>
                      )}
                      <Link
                        to="/customer/profile"
                        className="block px-3 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 rounded-lg transition-all duration-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <User className="h-4 w-4 inline mr-3 text-blue-500" />
                        My Profile
                      </Link>
                      <Link
                        to="/customer/orders"
                        className="block px-3 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 rounded-lg transition-all duration-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <ShoppingCart className="h-4 w-4 inline mr-3 text-green-500" />
                        My Orders
                      </Link>
                      <Link
                        to="/customer/wishlist"
                        className="block px-3 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 rounded-lg transition-all duration-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Heart className="h-4 w-4 inline mr-3 text-red-500" />
                        My Wishlist
                      </Link>
                    </>
                  )}
                  
                  {user?.role === 'vendor' && (
                    <>
                      <div className="border-t border-white/30 my-2"></div>
                      <Link
                        to="/vendor/dashboard"
                        className="block px-3 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/50 rounded-lg transition-all duration-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Store className="h-4 w-4 inline mr-3 text-purple-500" />
                        Vendor Dashboard
                      </Link>
                      <Link
                        to="/vendor/products"
                        className="block px-3 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/50 rounded-lg transition-all duration-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4 inline mr-3 text-purple-500" />
                        Manage Products
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}