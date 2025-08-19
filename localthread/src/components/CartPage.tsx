import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { ImageWithFallback } from './figma/ImageWithFallback'
import { RootState } from '../App'
import { removeFromCart, updateCartItemQuantity } from '../store/cartSlice'
import { featuredProducts } from '../data/products'
import { toast } from "sonner"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from './ui/breadcrumb'

export function CartPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const cartItems = useSelector((state: RootState) => state.cart.items)
  const totalItems = useSelector((state: RootState) => state.cart.totalItems)

  const detailedCartItems = cartItems.map(cartItem => {
    const product = featuredProducts.find(p => p.id === cartItem.productId)
    return product ? { ...product, ...cartItem } : null
  }).filter(Boolean) as (typeof featuredProducts[0] & { quantity: number, size?: string, color?: string })[]

  const subtotal = detailedCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shippingFee = subtotal > 0 ? 49 : 0
  const discount = 0; // Placeholder for discount logic
  const grandTotal = subtotal + shippingFee - discount

  const handleRemoveFromCart = (productId: string, size?: string, color?: string) => {
    dispatch(removeFromCart({ productId, size, color }))
    toast.info("Item removed from cart.")
  }

  const handleUpdateQuantity = (productId: string, newQuantity: number, size?: string, color?: string) => {
    if (newQuantity < 1) {
      handleRemoveFromCart(productId, size, color)
    } else {
      dispatch(updateCartItemQuantity({ productId, quantity: newQuantity, size, color }))
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb className="mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Cart</BreadcrumbPage>
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
              <BreadcrumbLink href="/confirmation">Confirmation</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">Your Shopping Cart</h1>

        {detailedCartItems.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="mx-auto h-24 w-24 text-gray-400 mb-6" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">Your cart is empty.</h2>
            <p className="text-gray-500 mb-6">Looks like you haven't added anything to your cart yet.</p>
            <Button onClick={() => window.history.back()} size="lg">
              Continue Shopping
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Cart Item List */}
            <div className="lg:col-span-2 space-y-4">
              {detailedCartItems.map((item, index) => (
                <Card key={`${item.id}-${item.size}-${item.color}-${index}`} className="flex items-center p-4 transition-shadow hover:shadow-md">
                  <div className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden mr-4">
                    <ImageWithFallback src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                    <div className="md:col-span-2">
                      <h2 className="font-semibold text-lg text-gray-800">{item.name}</h2>
                      <p className="text-sm text-gray-500">Size: {item.size || 'One Size'}</p>
                      <p className="text-sm text-gray-500">Color: {item.color || 'Default'}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1, item.size, item.color)}
                        className="h-8 w-8"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-12 text-center font-medium">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1, item.size, item.color)}
                        className="h-8 w-8"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lg text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                      {item.originalPrice && (
                        <p className="text-sm text-gray-500 line-through">
                          ${(item.originalPrice * item.quantity).toFixed(2)}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveFromCart(item.id, item.size, item.color)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal ({totalItems} items)</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Shipping</span>
                      <span>${shippingFee.toFixed(2)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount</span>
                        <span>-${discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="border-t pt-2">
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total</span>
                        <span>${grandTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => navigate('/checkout')} 
                    className="w-full" 
                    size="lg"
                    disabled={detailedCartItems.length === 0}
                  >
                    Proceed to Checkout
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/products')} 
                    className="w-full"
                  >
                    Continue Shopping
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
