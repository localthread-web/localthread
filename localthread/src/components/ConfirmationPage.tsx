import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { CheckCircle, Package, Truck, Home, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Header } from './Header';
import { Footer } from './Footer';
import { RootState } from '../App';
import { featuredProducts } from '../data/products';
import { clearCart } from '../store/cartSlice';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from './ui/breadcrumb';

export function ConfirmationPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cartItems = useSelector((state: RootState) => state.cart.items);
  
  // Generate a random order number
  const orderNumber = React.useMemo(() => {
    return `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
  }, []);

  // Calculate cart totals
  const detailedCartItems = cartItems.map(cartItem => {
    const product = featuredProducts.find(p => p.id === cartItem.productId);
    return product ? { ...product, ...cartItem } : null;
  }).filter(Boolean) as (typeof featuredProducts[0] & { quantity: number, size?: string, color?: string })[];

  const subtotal = detailedCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = 49;
  const discount = 0;
  const grandTotal = subtotal + shippingFee - discount;

  // Clear cart after confirmation is shown
  useEffect(() => {
    // We don't clear the cart immediately to show the order summary
    // In a real app, you would clear it after successful payment processing
    const timer = setTimeout(() => {
      dispatch(clearCart());
    }, 5000);

    return () => clearTimeout(timer);
  }, [dispatch]);

  // If cart is empty and no order number, redirect to home
  if (detailedCartItems.length === 0 && !orderNumber) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-3xl font-bold mb-6">No order found</h1>
          <p className="mb-8">Please place an order first.</p>
          <Button onClick={() => navigate('/')}>Continue Shopping</Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb className="mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/cart">Cart</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/checkout">Checkout</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/payment">Payment</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Confirmation</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Order Confirmed!</h1>
          <p className="text-xl text-gray-600 mb-2">Thank you for your purchase</p>
          <p className="text-gray-500">Order #{orderNumber}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          <div className="lg:col-span-2 space-y-8">
            {/* Order Details */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Order Details</h2>
                
                <div className="space-y-4">
                  {detailedCartItems.map((item, index) => (
                    <div key={`${item.id}-${item.size}-${item.color}-${index}`} className="flex justify-between items-center py-3 border-b last:border-0">
                      <div className="flex items-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden mr-4">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h3 className="font-medium">{item.name}</h3>
                          <p className="text-sm text-gray-500">
                            {item.size && `Size: ${item.size}`}
                            {item.size && item.color && ' | '}
                            {item.color && `Color: ${item.color}`}
                          </p>
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <div className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Delivery Timeline */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-6">Delivery Timeline</h2>
                
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-6 top-0 h-full w-0.5 bg-gray-200"></div>
                  
                  {/* Timeline steps */}
                  <div className="space-y-8">
                    <div className="relative flex items-start ml-2">
                      <div className="absolute left-4 -translate-x-1/2 w-8 h-8 rounded-full bg-primary flex items-center justify-center z-10">
                        <CheckCircle className="h-5 w-5 text-white" />
                      </div>
                      <div className="ml-12">
                        <h3 className="font-medium">Order Confirmed</h3>
                        <p className="text-sm text-gray-500">Your order has been confirmed</p>
                        <p className="text-xs text-gray-400 mt-1">{new Date().toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <div className="relative flex items-start ml-2">
                      <div className="absolute left-4 -translate-x-1/2 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center z-10">
                        <Package className="h-5 w-5 text-gray-500" />
                      </div>
                      <div className="ml-12">
                        <h3 className="font-medium">Processing Order</h3>
                        <p className="text-sm text-gray-500">Your order is being processed</p>
                        <p className="text-xs text-gray-400 mt-1">Expected in 1-2 days</p>
                      </div>
                    </div>
                    
                    <div className="relative flex items-start ml-2">
                      <div className="absolute left-4 -translate-x-1/2 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center z-10">
                        <Truck className="h-5 w-5 text-gray-500" />
                      </div>
                      <div className="ml-12">
                        <h3 className="font-medium">Shipping</h3>
                        <p className="text-sm text-gray-500">Your order is on the way</p>
                        <p className="text-xs text-gray-400 mt-1">Expected in 3-5 days</p>
                      </div>
                    </div>
                    
                    <div className="relative flex items-start ml-2">
                      <div className="absolute left-4 -translate-x-1/2 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center z-10">
                        <Home className="h-5 w-5 text-gray-500" />
                      </div>
                      <div className="ml-12">
                        <h3 className="font-medium">Delivery</h3>
                        <p className="text-sm text-gray-500">Your order will be delivered</p>
                        <p className="text-xs text-gray-400 mt-1">Expected by {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg rounded-lg sticky top-20">
              <CardContent className="p-6 space-y-6">
                <h2 className="text-xl font-bold">Order Summary</h2>
                
                <div className="space-y-2 text-gray-700">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>₹{shippingFee.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-₹{discount.toFixed(2)}</span>
                    </div>
                  )}
                </div>
                
                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between font-bold text-lg text-gray-900">
                    <span>Total</span>
                    <span>₹{grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                <div className="pt-4">
                  <Button className="w-full" onClick={() => navigate('/')}>
                    Continue Shopping <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}