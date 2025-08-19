import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { Toaster } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';

// Redux slices
import cartReducer from './store/cartSlice';
import wishlistReducer from './store/wishlistSlice';
import authReducer from './store/authSlice';
import filterReducer from './store/filterSlice';

// Components
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HeroSection } from './components/HeroSection';
import { CategoriesSection } from './components/CategoriesSection';
import { ProductGrid } from './components/ProductGrid';
import { ProductListingPage } from './components/pages/ProductListingPage';
import { ProductDetailsPage } from './components/ProductDetailsPage';
import { CartPage } from './components/CartPage';
import { WishlistPage } from './components/WishlistPage';
import { CheckoutPage } from './components/CheckoutPage';
import { PaymentPage } from './components/PaymentPage';
import { AdminDashboard } from './components/pages/AdminDashboard';
import { AccessDeniedPage } from './components/AccessDeniedPage';

// Auth Components
import { UnifiedAuthPage } from './components/auth/UnifiedAuthPage';
import CustomerRoute from './components/auth/CustomerRoute';
import { AdminRoute } from './components/auth/AdminRoute';
import { VendorRoute } from './components/auth/VendorRoute';

// Vendor Components
import { VendorDashboardHome } from './components/vendor/VendorDashboardHome';
import { VendorProductsPage } from './components/vendor/VendorProductsPage';
import { AddEditProductForm } from './components/vendor/AddEditProductForm';
import { VendorOrdersPage } from './components/vendor/VendorOrdersPage';
import { VendorProfilePage } from './components/vendor/VendorProfilePage';
import { VendorManagementPage } from './components/admin/VendorManagementPage';

// Customer Components
import CustomerDashboardLayout from './components/customer/CustomerDashboardLayout';
import CustomerProfilePage from './components/customer/CustomerProfilePage';
import CustomerOrdersPage from './components/customer/CustomerOrdersPage';
import CustomerAddressesPage from './components/customer/CustomerAddressesPage';
import CustomerWishlistPage from './components/customer/CustomerWishlistPage';

// Data
import { featuredProducts } from './data/products';

// Redux actions
import { addToCart } from './store/cartSlice';
import { toggleWishlist } from './store/wishlistSlice';

// Configure Redux store
const store = configureStore({
  reducer: {
    cart: cartReducer,
    wishlist: wishlistReducer,
    auth: authReducer,
    filter: filterReducer,
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// HomePage component
function HomePage() {
  const dispatch = useDispatch();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);

  const handleAddToCart = (productId: string) => {
    dispatch(addToCart({ productId }));
  };

  const handleToggleWishlist = (productId: string) => {
    dispatch(toggleWishlist(productId));
  };

  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <CategoriesSection />
      <ProductGrid 
        products={featuredProducts}
        onAddToCart={handleAddToCart}
        onToggleWishlist={handleToggleWishlist}
      />
    </div>
  );
}

function AppContent() {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  // Debug logging
  console.log('App - Authentication state:', { isAuthenticated, user: user?.name, userRole: user?.role });
  
  return (
    <Router>
      <div className="min-h-screen bg-white text-gray-900">
        <Header />
        <main className="flex-1">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductListingPage />} />
            <Route path="/product/:id" element={<ProductDetailsPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/auth" element={<UnifiedAuthPage />} />
            
            {/* Protected Routes */}
            <Route path="/access-denied" element={<AccessDeniedPage />} />
            <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            
            {/* Customer Routes */}
            <Route path="/customer" element={<CustomerRoute><CustomerDashboardLayout /></CustomerRoute>}>
              <Route path="profile" element={<CustomerProfilePage />} />
              <Route path="orders" element={<CustomerOrdersPage />} />
              <Route path="addresses" element={<CustomerAddressesPage />} />
              <Route path="wishlist" element={<CustomerWishlistPage />} />
            </Route>
            
            {/* Vendor Routes */}
            <Route path="/vendor/dashboard" element={<VendorRoute><VendorDashboardHome /></VendorRoute>} />
            <Route path="/vendor/products" element={<VendorRoute><VendorProductsPage /></VendorRoute>} />
            <Route path="/vendor/products/add" element={<VendorRoute><AddEditProductForm /></VendorRoute>} />
            <Route path="/vendor/products/edit/:productId" element={<VendorRoute><AddEditProductForm /></VendorRoute>} />
            <Route path="/vendor/orders" element={<VendorRoute><VendorOrdersPage /></VendorRoute>} />
            <Route path="/vendor/profile" element={<VendorRoute><VendorProfilePage /></VendorRoute>} />
            <Route path="/admin/vendors" element={<AdminRoute><VendorManagementPage /></AdminRoute>} />
          </Routes>
        </main>
        <Footer />
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
 