import React from 'react';
import { Skeleton } from './skeleton';

export function ProductSkeleton() {
  return (
    <div className="group relative">
      {/* Image Skeleton */}
      <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-200">
        <Skeleton className="h-full w-full" />
      </div>
      
      {/* Content Skeleton */}
      <div className="mt-4 space-y-2">
        {/* Title */}
        <Skeleton className="h-4 w-3/4" />
        
        {/* Price */}
        <Skeleton className="h-5 w-1/3" />
        
        {/* Rating */}
        <div className="flex items-center gap-1">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-8" />
        </div>
        
        {/* Buttons */}
        <div className="flex gap-2 mt-3">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 w-9" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <ProductSkeleton key={index} />
      ))}
    </div>
  );
} 