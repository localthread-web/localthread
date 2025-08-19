import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Shield, Home, ArrowLeft } from 'lucide-react';

export function AccessDeniedPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mx-auto w-24 h-24 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
          <Shield className="w-12 h-12 text-destructive" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-foreground mb-4">
          Access Denied
        </h1>

        {/* Description */}
        <p className="text-muted-foreground text-lg mb-8">
          Sorry, you don't have permission to access this page. 
          Please contact your administrator if you believe this is an error.
        </p>

        {/* Error Code */}
        <div className="bg-muted rounded-lg p-4 mb-8">
          <p className="text-sm text-muted-foreground">
            Error Code: 403 Forbidden
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>
          
          <Button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Button>
        </div>

        {/* Additional Help */}
        <div className="mt-8 pt-6 border-t">
          <p className="text-sm text-muted-foreground">
            Need help? Contact support at{' '}
            <a 
              href="mailto:support@localthread.com" 
              className="text-primary hover:underline"
            >
              support@localthread.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
} 