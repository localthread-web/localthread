export interface FilterState {
  category: string[];
  size: string[];
  priceRange: [number, number];
  colors: string[];
  vendors: string[];
  sortBy: SortOption;
  searchQuery: string;
  page: number;
  isLoading: boolean;
}

export type SortOption = 
  | 'price-low-high'
  | 'price-high-low'
  | 'newest-first'
  | 'popularity'
  | 'discount';

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface PriceRange {
  min: number;
  max: number;
}

export interface ColorOption {
  value: string;
  label: string;
  hex: string;
}

export interface VendorOption {
  id: string;
  name: string;
  count: number;
} 