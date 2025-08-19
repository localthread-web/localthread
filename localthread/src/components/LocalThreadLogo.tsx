import React from 'react';

interface LocalThreadLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LocalThreadLogo({ className = '', size = 'md' }: LocalThreadLogoProps) {
  const sizeClasses = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-12'
  };

  return (
    <div className={`flex items-center ${className}`}>
      <img 
        src="/images/localthread-logo.png" 
        alt="LocalThread Logo"
        className={`${sizeClasses[size]} w-auto`}
      />
    </div>
  );
} 