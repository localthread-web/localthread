import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Header } from './components/Header'
import { HeroSection } from './components/HeroSection'
import { CategoriesSection } from './components/CategoriesSection'
import { ProductListingPage } from './components/ProductListingPage'
import { ProductDetailsPage } from './components/ProductDetailsPage'
import { CartPage } from './components/CartPage'
import { Footer } from './components/Footer'
import { Button } from './components/ui/button'
import { toast } from "sonner@2.0.3"
import { addToCart } from './store/cartSlice'
import { toggleWishlist } from './store/wishlistSlice'
import { featuredProducts } from './data/products'
import cartReducer from './store/cartSlice'
import wishlistReducer from './store/wishlistSlice'

// Create store directly in App.tsx to troubleshoot
const store = configureStore({
  reducer: {
    cart: cartReducer,
    wishlist: wishlistReducer
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

const useAppDispatch = () => useDispatch<AppDispatch>()
const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

function AppContent() {
  const dispatch = useAppDispatch()
  const wishlistItems = useAppSelector(state => state.wishlist.items)

  const handleAddToCart = (productId: string) => {
    dispatch(addToCart(productId))
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
      
      <main>
        <Routes>
          <Route path="/" element={
            <>
              <HeroSection />
              <CategoriesSection />
              <ProductListingPage />
            </>
          } />
          <Route path="/product/:productId" element={<ProductDetailsPage />} />
          <Route path="/cart" element={<CartPage />} />
        </Routes>

        {/* Sustainability Banner */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Sustainable Fashion</h2>
            <p className="text-lg mb-6 max-w-2xl mx-auto opacity-90">
              We're committed to creating beautiful clothing while protecting our planet. 
              Every piece is made with eco-friendly materials and ethical manufacturing practices.
            </p>
            <Button variant="secondary" size="lg">
              Learn More About Our Mission
            </Button>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <Provider store={store}>
      <Router>
        <AppContent />
      </Router>
    </Provider>
  )
}