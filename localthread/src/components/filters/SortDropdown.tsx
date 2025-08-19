import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { setSortBy } from '../../store/filterSlice';
import { SortOption } from '../../types/filter';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { ArrowUpDown, TrendingUp, Clock, Star, Percent } from 'lucide-react';

const sortOptions: { value: SortOption; label: string; icon: React.ReactNode }[] = [
  {
    value: 'newest-first',
    label: 'Newest First',
    icon: <Clock className="h-4 w-4" />,
  },
  {
    value: 'price-low-high',
    label: 'Price: Low to High',
    icon: <ArrowUpDown className="h-4 w-4" />,
  },
  {
    value: 'price-high-low',
    label: 'Price: High to Low',
    icon: <ArrowUpDown className="h-4 w-4" />,
  },
  {
    value: 'popularity',
    label: 'Popularity',
    icon: <TrendingUp className="h-4 w-4" />,
  },
  {
    value: 'discount',
    label: 'Discount %',
    icon: <Percent className="h-4 w-4" />,
  },
];

export function SortDropdown() {
  const dispatch = useDispatch();
  const sortBy = useSelector((state: RootState) => state.filter.sortBy);

  const handleSortChange = (value: string) => {
    dispatch(setSortBy(value as SortOption));
  };

  const getCurrentSortIcon = () => {
    const currentSort = sortOptions.find(option => option.value === sortBy);
    return currentSort?.icon || <ArrowUpDown className="h-4 w-4" />;
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground">Sort by:</span>
      <Select value={sortBy} onValueChange={handleSortChange}>
        <SelectTrigger className="w-[180px]">
          <div className="flex items-center gap-2">
            {getCurrentSortIcon()}
            <SelectValue />
          </div>
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center gap-2">
                {option.icon}
                {option.label}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
} 