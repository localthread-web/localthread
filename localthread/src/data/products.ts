import { Product } from '../types/index'

export const featuredProducts: Product[] = [
  {
    id: '1',
    name: 'Organic Cotton T-Shirt',
    price: 29,
    originalPrice: 39,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop&crop=center',
    category: 't-shirts',
    isNew: true,
    colors: ['black', 'white', 'red', 'blue'],
    sizes: ['S', 'M', 'L', 'XL'],
    rating: 4.5,
    vendorId: 'vendor1',
    description: 'Comfortable organic cotton t-shirt perfect for everyday wear.',
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    name: 'Sustainable Denim Jacket',
    price: 89,
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop&crop=center',
    category: 'hoodies',
    colors: ['blue', 'gray'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    rating: 4.8,
    vendorId: 'vendor2',
    description: 'Eco-friendly denim jacket with a modern fit.',
    createdAt: '2024-01-10'
  },
  {
    id: '3',
    name: 'Merino Wool Sweater',
    price: 79,
    originalPrice: 99,
    image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=500&fit=crop&crop=center',
    category: 'hoodies',
    isSale: true,
    colors: ['purple', 'yellow', 'red'],
    sizes: ['S', 'M', 'L'],
    rating: 4.6,
    vendorId: 'vendor3',
    description: 'Premium merino wool sweater for ultimate comfort.',
    createdAt: '2024-01-05'
  },
  {
    id: '4',
    name: 'Classic White Shirt',
    price: 45,
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=500&fit=crop&crop=center',
    category: 'shirts',
    colors: ['white', 'gray'],
    sizes: ['S', 'M', 'L', 'XL'],
    rating: 4.3,
    vendorId: 'vendor4',
    description: 'Timeless white shirt for any occasion.',
    createdAt: '2024-01-20'
  },
  {
    id: '5',
    name: 'Casual Chino Pants',
    price: 55,
    image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&h=500&fit=crop&crop=center',
    category: 'jeans',
    colors: ['brown', 'green', 'black'],
    sizes: ['S', 'M', 'L', 'XL'],
    rating: 4.4,
    vendorId: 'vendor5',
    description: 'Comfortable chino pants for casual and formal wear.',
    createdAt: '2024-01-12'
  },
  {
    id: '6',
    name: 'Summer Floral Dress',
    price: 65,
    image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=500&fit=crop&crop=center',
    category: 'dresses',
    isNew: true,
    colors: ['pink', 'purple', 'green'],
    sizes: ['S', 'M', 'L'],
    rating: 4.7,
    vendorId: 'vendor1',
    description: 'Beautiful floral dress perfect for summer occasions.',
    createdAt: '2024-01-18'
  },
  {
    id: '7',
    name: 'Leather Crossbody Bag',
    price: 129,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=500&fit=crop&crop=center',
    category: 'accessories',
    colors: ['brown', 'black', 'purple'],
    sizes: ['One Size'],
    rating: 4.9,
    vendorId: 'vendor2',
    description: 'Stylish leather crossbody bag with multiple compartments.',
    createdAt: '2024-01-08'
  },
  {
    id: '8',
    name: 'Running Sneakers',
    price: 95,
    originalPrice: 120,
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=500&fit=crop&crop=center',
    category: 'footwear',
    isSale: true,
    colors: ['white', 'black', 'blue'],
    sizes: ['S', 'M', 'L', 'XL'],
    rating: 4.5,
    vendorId: 'vendor3',
    description: 'Comfortable running sneakers for your active lifestyle.',
    createdAt: '2024-01-14'
  }
]

// Export all products for the product listing page
export const products: Product[] = [
  ...featuredProducts,
  // Add more products to make filtering more interesting
  {
    id: '9',
    name: 'Ethnic Kurta Set',
    price: 85,
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=500&fit=crop&crop=center',
    category: 'ethnic',
    colors: ['red', 'blue', 'green'],
    sizes: ['S', 'M', 'L', 'XL'],
    rating: 4.6,
    vendorId: 'vendor4',
    description: 'Traditional ethnic kurta set for special occasions.',
    createdAt: '2024-01-16'
  },
  {
    id: '10',
    name: 'Casual Hoodie',
    price: 49,
    originalPrice: 69,
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=500&fit=crop&crop=center',
    category: 'hoodies',
    isSale: true,
    colors: ['black', 'gray', 'blue'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    rating: 4.4,
    vendorId: 'vendor5',
    description: 'Comfortable casual hoodie for everyday wear.',
    createdAt: '2024-01-11'
  },
  {
    id: '11',
    name: 'Formal Business Shirt',
    price: 75,
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&h=500&fit=crop&crop=center',
    category: 'shirts',
    colors: ['white', 'blue', 'pink'],
    sizes: ['S', 'M', 'L', 'XL'],
    rating: 4.7,
    vendorId: 'vendor1',
    description: 'Professional business shirt for formal occasions.',
    createdAt: '2024-01-13'
  },
  {
    id: '12',
    name: 'Skinny Jeans',
    price: 69,
    originalPrice: 89,
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=500&fit=crop&crop=center',
    category: 'jeans',
    isSale: true,
    colors: ['blue', 'black'],
    sizes: ['S', 'M', 'L', 'XL'],
    rating: 4.3,
    vendorId: 'vendor2',
    description: 'Stylish skinny jeans with perfect fit.',
    createdAt: '2024-01-09'
  }
]