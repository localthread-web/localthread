import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { WishlistState } from '../types/index'

const initialState: WishlistState = {
  items: []
}

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    addToWishlist: (state, action: PayloadAction<string>) => {
      const productId = action.payload
      if (!state.items.includes(productId)) {
        state.items.push(productId)
      }
    },
    removeFromWishlist: (state, action: PayloadAction<string>) => {
      const productId = action.payload
      state.items = state.items.filter(id => id !== productId)
    },
    toggleWishlist: (state, action: PayloadAction<string>) => {
      const productId = action.payload
      const existingIndex = state.items.findIndex(id => id === productId)
      
      if (existingIndex >= 0) {
        state.items.splice(existingIndex, 1)
      } else {
        state.items.push(productId)
      }
    },
    clearWishlist: (state) => {
      state.items = []
    }
  }
})

export const { addToWishlist, removeFromWishlist, toggleWishlist, clearWishlist } = wishlistSlice.actions
export default wishlistSlice.reducer