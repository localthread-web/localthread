import React from 'react';
import { Search, Filter, Package } from 'lucide-react';
import { Button } from './button';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: 'search' | 'filter' | 'general';
}

export function EmptyState({ 
  title, 
  description, 
  icon, 
  action, 
  variant = 'general' 
}: EmptyStateProps) {
  const getDefaultContent = () => {
    switch (variant) {
      case 'search':
        return {
          title: 'No products found',
          description: 'Try adjusting your search terms or browse our categories to find what you\'re looking for.',
          icon: <Search className="h-12 w-12 text-muted-foreground" />
        };
      case 'filter':
        return {
          title: 'No products match your filters',
          description: 'Try adjusting your filters or clear all filters to see more products.',
          icon: <Filter className="h-12 w-12 text-muted-foreground" />
        };
      default:
        return {
          title: 'No products available',
          description: 'Check back later for new arrivals or browse our other categories.',
          icon: <Package className="h-12 w-12 text-muted-foreground" />
        };
    }
  };

  const defaultContent = getDefaultContent();

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="mb-4">
        {icon || defaultContent.icon}
      </div>
      
      <h3 className="text-lg font-semibold mb-2">
        {title || defaultContent.title}
      </h3>
      
      <p className="text-muted-foreground mb-6 max-w-md">
        {description || defaultContent.description}
      </p>
      
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
} 