export interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  category: string
  isNew?: boolean
  isSale?: boolean
  colors: string[]
  sizes: string[]
  rating: number
  vendorId: string
  description: string
  createdAt: string
}

export interface CartItem {
  productId: string
  quantity: number
  size?: string
  color?: string
}

export interface CartState {
  items: CartItem[]
  totalItems: number
}

export interface WishlistState {
  items: string[]
}