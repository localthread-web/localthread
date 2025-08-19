import React, { useState, useEffect } from 'react';
import { vendorAPI, VendorProfile } from '../../services/vendorAPI';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Loader2, 
  Search, 
  Shield, 
  ShieldCheck, 
  User, 
  Store, 
  Mail, 
  Calendar,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';

export function VendorManagementPage() {
  const [vendors, setVendors] = useState<VendorProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState<boolean | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadVendors();
  }, [currentPage, searchTerm, verifiedFilter]);

  const loadVendors = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await vendorAPI.getAllVendors({
        page: currentPage,
        limit: 10,
        verified: verifiedFilter || undefined,
        search: searchTerm || undefined
      });
      
      if (response.success && response.data) {
        setVendors(response.data.vendors);
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Load vendors error:', error);
      setError('Failed to load vendors');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyVendor = async (vendorId: string) => {
    try {
      setIsVerifying(vendorId);
      
      const response = await vendorAPI.verifyVendor(vendorId);
      
      if (response.success) {
        toast.success('Vendor verified successfully!');
        loadVendors(); // Reload the list
      }
    } catch (error) {
      console.error('Verify vendor error:', error);
      toast.error('Failed to verify vendor');
    } finally {
      setIsVerifying(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Vendor Management</h1>
        <p className="text-gray-600">Manage and verify vendor accounts</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search vendors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={verifiedFilter === null ? "default" : "outline"}
                onClick={() => setVerifiedFilter(null)}
              >
                All Vendors
              </Button>
              <Button
                variant={verifiedFilter === true ? "default" : "outline"}
                onClick={() => setVerifiedFilter(true)}
              >
                <ShieldCheck className="mr-2 h-4 w-4" />
                Verified
              </Button>
              <Button
                variant={verifiedFilter === false ? "default" : "outline"}
                onClick={() => setVerifiedFilter(false)}
              >
                <Shield className="mr-2 h-4 w-4" />
                Pending
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vendors List */}
      <Card>
        <CardHeader>
          <CardTitle>Vendors ({vendors.length})</CardTitle>
          <CardDescription>
            Manage vendor accounts and verification status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {vendors.length === 0 ? (
            <div className="text-center py-8">
              <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No vendors found
              </h3>
              <p className="text-gray-500">
                {searchTerm ? 'Try adjusting your search terms.' : 'No vendors have registered yet.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {vendors.map((vendor) => (
                <div key={vendor._id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-gray-600" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{vendor.name}</h3>
                          {vendor.isVerified ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-yellow-600" />
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {vendor.email}
                          </div>
                          
                          {vendor.storeName && (
                            <div className="flex items-center gap-1">
                              <Store className="h-3 w-3" />
                              {vendor.storeName}
                            </div>
                          )}
                          
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Joined {formatDate(vendor.createdAt)}
                          </div>
                        </div>
                        
                        {vendor.storeDescription && (
                          <p className="text-sm text-gray-500 mt-2">
                            {vendor.storeDescription}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {!vendor.isVerified ? (
                        <Button
                          onClick={() => handleVerifyVendor(vendor._id)}
                          disabled={isVerifying === vendor._id}
                          size="sm"
                        >
                          {isVerifying === vendor._id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <ShieldCheck className="h-4 w-4" />
                          )}
                          Verify
                        </Button>
                      ) : (
                        <div className="text-sm text-green-600 font-medium">
                          Verified
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
} 