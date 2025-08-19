import { Product } from '../types'

export const featuredProducts: Product[] = [
  {
    id: '1',
    name: 'Organic Cotton T-Shirt',
    price: 29,
    originalPrice: 39,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop&crop=center',
    category: 'Women\'s Tops',
    isNew: true,
    colors: ['#000000', '#FFFFFF', '#FF6B6B', '#4ECDC4']
  },
  {
    id: '2',
    name: 'Sustainable Denim Jacket',
    price: 89,
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop&crop=center',
    category: 'Women\'s Outerwear',
    colors: ['#1E3A8A', '#6B7280']
  },
  {
    id: '3',
    name: 'Merino Wool Sweater',
    price: 79,
    originalPrice: 99,
    image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=500&fit=crop&crop=center',
    category: 'Women\'s Knitwear',
    isSale: true,
    colors: ['#8B5CF6', '#F59E0B', '#EF4444']
  },
  {
    id: '4',
    name: 'Classic White Shirt',
    price: 45,
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=500&fit=crop&crop=center',
    category: 'Men\'s Shirts',
    colors: ['#FFFFFF', '#E5E7EB']
  },
  {
    id: '5',
    name: 'Casual Chino Pants',
    price: 55,
    image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&h=500&fit=crop&crop=center',
    category: 'Men\'s Pants',
    colors: ['#92400E', '#059669', '#1F2937']
  },
  {
    id: '6',
    name: 'Summer Floral Dress',
    price: 65,
    image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=500&fit=crop&crop=center',
    category: 'Women\'s Dresses',
    isNew: true,
    colors: ['#F472B6', '#A78BFA', '#34D399']
  },
  {
    id: '7',
    name: 'Leather Crossbody Bag',
    price: 129,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=500&fit=crop&crop=center',
    category: 'Accessories',
    colors: ['#8B5A00', '#000000', '#7C3AED']
  },
  {
    id: '8',
    name: 'Running Sneakers',
    price: 95,
    originalPrice: 120,
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=500&fit=crop&crop=center',
    category: 'Footwear',
    isSale: true,
    colors: ['#FFFFFF', '#000000', '#3B82F6']
  }
]