import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { 
  setCategory, 
  setSize, 
  setPriceRange, 
  setColors, 
  setVendors,
  clearFilters 
} from '../../store/filterSlice';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Slider } from '../ui/slider';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { X, Filter, RefreshCw } from 'lucide-react';
import { FilterOption, ColorOption, VendorOption } from '../../types/filter';

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const categories: FilterOption[] = [
  { value: 't-shirts', label: 'T-Shirts', count: 45 },
  { value: 'ethnic', label: 'Ethnic Wear', count: 32 },
  { value: 'hoodies', label: 'Hoodies', count: 28 },
  { value: 'jeans', label: 'Jeans', count: 56 },
  { value: 'dresses', label: 'Dresses', count: 38 },
  { value: 'shirts', label: 'Shirts', count: 42 },
];

const sizes: FilterOption[] = [
  { value: 'S', label: 'Small', count: 89 },
  { value: 'M', label: 'Medium', count: 156 },
  { value: 'L', label: 'Large', count: 134 },
  { value: 'XL', label: 'Extra Large', count: 67 },
  { value: 'XXL', label: '2XL', count: 34 },
];

const colors: ColorOption[] = [
  { value: 'black', label: 'Black', hex: '#000000' },
  { value: 'white', label: 'White', hex: '#ffffff' },
  { value: 'red', label: 'Red', hex: '#ff0000' },
  { value: 'blue', label: 'Blue', hex: '#0000ff' },
  { value: 'green', label: 'Green', hex: '#00ff00' },
  { value: 'yellow', label: 'Yellow', hex: '#ffff00' },
  { value: 'purple', label: 'Purple', hex: '#800080' },
  { value: 'pink', label: 'Pink', hex: '#ffc0cb' },
];

const vendors: VendorOption[] = [
  { id: 'vendor1', name: 'Fashion Hub', count: 45 },
  { id: 'vendor2', name: 'Style Studio', count: 32 },
  { id: 'vendor3', name: 'Urban Threads', count: 28 },
  { id: 'vendor4', name: 'Elegant Wear', count: 56 },
  { id: 'vendor5', name: 'Trendy Boutique', count: 38 },
];

export function FilterSidebar({ isOpen, onClose }: FilterSidebarProps) {
  const dispatch = useDispatch();
  const filterState = useSelector((state: RootState) => state.filter);

  const handleCategoryChange = (category: string, checked: boolean) => {
    const newCategories = checked
      ? [...filterState.category, category]
      : filterState.category.filter(c => c !== category);
    dispatch(setCategory(newCategories));
  };

  const handleSizeChange = (size: string, checked: boolean) => {
    const newSizes = checked
      ? [...filterState.size, size]
      : filterState.size.filter(s => s !== size);
    dispatch(setSize(newSizes));
  };

  const handleColorChange = (color: string, checked: boolean) => {
    const newColors = checked
      ? [...filterState.colors, color]
      : filterState.colors.filter(c => c !== color);
    dispatch(setColors(newColors));
  };

  const handleVendorChange = (vendorId: string, checked: boolean) => {
    const newVendors = checked
      ? [...filterState.vendors, vendorId]
      : filterState.vendors.filter(v => v !== vendorId);
    dispatch(setVendors(newVendors));
  };

  const handlePriceRangeChange = (value: number[]) => {
    dispatch(setPriceRange([value[0], value[1]]));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
  };

  const getActiveFiltersCount = () => {
    return (
      filterState.category.length +
      filterState.size.length +
      filterState.colors.length +
      filterState.vendors.length +
      (filterState.priceRange[0] > 0 || filterState.priceRange[1] < 1000 ? 1 : 0)
    );
  };

  return (
    <div className={`fixed inset-y-0 left-0 z-50 w-80 bg-background border-r shadow-lg transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Filters</h2>
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary">{getActiveFiltersCount()}</Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="text-xs"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Clear
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="md:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filter Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Categories */}
          <div>
            <h3 className="font-semibold mb-3">Categories</h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category.value}`}
                    checked={filterState.category.includes(category.value)}
                    onCheckedChange={(checked) => 
                      handleCategoryChange(category.value, checked as boolean)
                    }
                  />
                  <label
                    htmlFor={`category-${category.value}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1 cursor-pointer"
                  >
                    {category.label}
                  </label>
                  <Badge variant="outline" className="text-xs">
                    {category.count}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Sizes */}
          <div>
            <h3 className="font-semibold mb-3">Sizes</h3>
            <div className="grid grid-cols-2 gap-2">
              {sizes.map((size) => (
                <div key={size.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`size-${size.value}`}
                    checked={filterState.size.includes(size.value)}
                    onCheckedChange={(checked) => 
                      handleSizeChange(size.value, checked as boolean)
                    }
                  />
                  <label
                    htmlFor={`size-${size.value}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1 cursor-pointer"
                  >
                    {size.label}
                  </label>
                  <Badge variant="outline" className="text-xs">
                    {size.count}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Price Range */}
          <div>
            <h3 className="font-semibold mb-3">Price Range</h3>
            <div className="px-2">
              <Slider
                value={filterState.priceRange}
                onValueChange={handlePriceRangeChange}
                max={1000}
                min={0}
                step={10}
                className="w-full"
              />
              <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                <span>₹{filterState.priceRange[0]}</span>
                <span>₹{filterState.priceRange[1]}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Colors */}
          <div>
            <h3 className="font-semibold mb-3">Colors</h3>
            <div className="grid grid-cols-4 gap-2">
              {colors.map((color) => (
                <div key={color.value} className="flex flex-col items-center space-y-1">
                  <div
                    className={`w-8 h-8 rounded-full border-2 cursor-pointer transition-all ${
                      filterState.colors.includes(color.value)
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'border-border hover:border-primary/50'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    onClick={() => 
                      handleColorChange(color.value, !filterState.colors.includes(color.value))
                    }
                  />
                  <span className="text-xs text-center">{color.label}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Vendors */}
          <div>
            <h3 className="font-semibold mb-3">Vendors</h3>
            <div className="space-y-2">
              {vendors.map((vendor) => (
                <div key={vendor.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`vendor-${vendor.id}`}
                    checked={filterState.vendors.includes(vendor.id)}
                    onCheckedChange={(checked) => 
                      handleVendorChange(vendor.id, checked as boolean)
                    }
                  />
                  <label
                    htmlFor={`vendor-${vendor.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1 cursor-pointer"
                  >
                    {vendor.name}
                  </label>
                  <Badge variant="outline" className="text-xs">
                    {vendor.count}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 