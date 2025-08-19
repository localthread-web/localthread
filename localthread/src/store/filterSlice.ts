import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FilterState, SortOption } from '../types/filter';

const initialState: FilterState = {
  category: [],
  size: [],
  priceRange: [0, 1000],
  colors: [],
  vendors: [],
  sortBy: 'newest-first',
  searchQuery: '',
  page: 1,
  isLoading: false,
};

const filterSlice = createSlice({
  name: 'filter',
  initialState,
  reducers: {
    setCategory: (state, action: PayloadAction<string[]>) => {
      state.category = action.payload;
      state.page = 1; // Reset to first page when filters change
    },
    setSize: (state, action: PayloadAction<string[]>) => {
      state.size = action.payload;
      state.page = 1;
    },
    setPriceRange: (state, action: PayloadAction<[number, number]>) => {
      state.priceRange = action.payload;
      state.page = 1;
    },
    setColors: (state, action: PayloadAction<string[]>) => {
      state.colors = action.payload;
      state.page = 1;
    },
    setVendors: (state, action: PayloadAction<string[]>) => {
      state.vendors = action.payload;
      state.page = 1;
    },
    setSortBy: (state, action: PayloadAction<SortOption>) => {
      state.sortBy = action.payload;
      state.page = 1;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.page = 1;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    clearFilters: (state) => {
      state.category = [];
      state.size = [];
      state.priceRange = [0, 1000];
      state.colors = [];
      state.vendors = [];
      state.sortBy = 'newest-first';
      state.searchQuery = '';
      state.page = 1;
    },
    clearSearch: (state) => {
      state.searchQuery = '';
      state.page = 1;
    },
  },
});

export const {
  setCategory,
  setSize,
  setPriceRange,
  setColors,
  setVendors,
  setSortBy,
  setSearchQuery,
  setPage,
  setLoading,
  clearFilters,
  clearSearch,
} = filterSlice.actions;

export default filterSlice.reducer; 