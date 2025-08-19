import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { CartState, CartItem } from '../types/index'

const initialState: CartState = {
  items: [],
  totalItems: 0
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<Omit<CartItem, 'quantity'> & { quantity?: number }>) => {
      const { productId, size, color, quantity = 1 } = action.payload
      const existingItem = state.items.find(
        item => item.productId === productId && item.size === size && item.color === color
      )
      
      if (existingItem) {
        existingItem.quantity += quantity
      } else {
        state.items.push({ productId, size, color, quantity })
      }
      
      state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0)
    },
    removeFromCart: (state, action: PayloadAction<Partial<CartItem>>) => {
      const { productId, size, color } = action.payload
      state.items = state.items.filter(
        item => !(item.productId === productId && item.size === size && item.color === color)
      )
      state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0)
    },
    updateCartItemQuantity: (state, action: PayloadAction<CartItem>) => {
      const { productId, quantity, size, color } = action.payload
      const existingItem = state.items.find(
        item => item.productId === productId && item.size === size && item.color === color
      )
      
      if (existingItem) {
        if (quantity <= 0) {
          state.items = state.items.filter(
            item => !(item.productId === productId && item.size === size && item.color === color)
          )
        } else {
          existingItem.quantity = quantity
        }
      }
      
      state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0)
    },
    clearCart: (state) => {
      state.items = []
      state.totalItems = 0
    }
  }
})

export const { addToCart, removeFromCart, updateCartItemQuantity, clearCart } = cartSlice.actions
export default cartSlice.reducer