import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productAPI, CreateProductData } from '../../services/productAPI';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Package, 
  Save, 
  ArrowLeft,
  Upload,
  X,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

export function AddEditProductForm() {
  const navigate = useNavigate();
  const { productId } = useParams();

  const [formData, setFormData] = useState<CreateProductData>({
    name: '',
    description: '',
    price: 0,
    originalPrice: 0,
    category: 'clothing',
    stock: 0,
    images: [],
    sizes: [],
    colors: []
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    'clothing',
    'accessories', 
    'footwear',
    'jewelry',
    'home',
    'other'
  ];

  const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const colorOptions = ['black', 'white', 'red', 'blue', 'green', 'yellow', 'purple', 'pink', 'gray', 'brown'];

  // Load product data if editing
  const loadProduct = useCallback(async () => {
    if (!productId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await productAPI.getProduct(productId);
      
      if (response.success && response.data) {
        const product = response.data.product;
        setFormData({
          name: product.name,
          description: product.description,
          price: product.price,
          originalPrice: product.originalPrice || 0,
          category: product.category,
          stock: product.stock,
          images: product.images,
          sizes: product.sizes || [],
          colors: product.colors || []
        });
      }
    } catch (error) {
      console.error('Load product error:', error);
      setError('Failed to load product');
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    if (productId) {
      loadProduct();
    }
  }, [productId, loadProduct]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const isNumericField = name === 'price' || name === 'originalPrice' || name === 'stock';
    
    console.log(`📝 Input change - Field: ${name}, Value: ${value}, Type: ${typeof value}, IsNumeric: ${isNumericField}`);
    
    setFormData(prev => {
      const newValue = isNumericField ? parseFloat(value) || 0 : value;
      console.log(`📝 Setting ${name} to: ${newValue} (Type: ${typeof newValue})`);
      
      return {
        ...prev,
        [name]: newValue
      };
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSizeToggle = (size: string) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes?.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...(prev.sizes || []), size]
    }));
  };

  const handleColorToggle = (color: string) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors?.includes(color)
        ? prev.colors.filter(c => c !== color)
        : [...(prev.colors || []), color]
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      console.log('📸 Image upload started:', files[0].name);
      console.log('📸 File size:', files[0].size);
      console.log('📸 File type:', files[0].type);
      
      try {
        console.log('📤 Calling productAPI.uploadProductImage...');
        const response = await productAPI.uploadProductImage(files[0]);
        console.log('📤 Upload response:', response);
        
        if (response.success && response.data?.imageUrl) {
          console.log('✅ Image upload successful, adding to form:', response.data.imageUrl);
          console.log('🔗 Image URL type:', typeof response.data.imageUrl);
          console.log('🔗 Image URL starts with /:', response.data.imageUrl.startsWith('/'));
          console.log('🔗 Full image URL:', `http://localhost:5000${response.data.imageUrl}`);
          
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, response.data!.imageUrl]
          }));
          toast.success('Image uploaded successfully!');
        } else {
          console.log('❌ Image upload failed:', response.message);
          toast.error('Upload failed: ' + (response.message || 'Unknown error'));
        }
      } catch (error) {
        console.error('💥 Image upload error:', error);
        console.error('💥 Error details:', (error as any)?.message);
        
        // Fallback: Use a placeholder image URL
        const placeholderUrl = `https://via.placeholder.com/400x400?text=${encodeURIComponent(files[0].name)}`;
        console.log('🔄 Using fallback placeholder:', placeholderUrl);
        
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, placeholderUrl]
        }));
        
        toast.warning('Image upload failed, using placeholder. You can replace it later.');
      }
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 Form submission started');
    console.log('📋 Form data:', formData);
    console.log('🔍 Form validation check...');
    
    if (formData.images.length === 0) {
      console.log('❌ No images found, showing error');
      toast.error('At least one image is required');
      return;
    }

    console.log('✅ Form validation passed, proceeding with submission');

    // Validate form data structure
    const requiredFields = ['name', 'description', 'price', 'category', 'stock'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      console.log('❌ Missing required fields:', missingFields);
      setError(`Missing required fields: ${missingFields.join(', ')}`);
      toast.error(`Missing required fields: ${missingFields.join(', ')}`);
      return;
    }
    
    // Validate price and stock are numbers
    if (typeof formData.price !== 'number' || formData.price <= 0) {
      console.log('❌ Invalid price:', formData.price, 'Type:', typeof formData.price);
      setError('Price must be a positive number');
      toast.error('Price must be a positive number');
      return;
    }
    
    if (typeof formData.stock !== 'number' || formData.stock < 0) {
      console.log('❌ Invalid stock:', formData.stock, 'Type:', typeof formData.stock);
      setError('Stock must be a non-negative number');
      toast.error('Stock must be a non-negative number');
      return;
    }
    
    // Ensure images array is properly formatted
    if (!Array.isArray(formData.images) || formData.images.length === 0) {
      console.log('❌ Invalid images:', formData.images);
      setError('At least one image is required');
      toast.error('At least one image is required');
      return;
    }
    
    // Validate image URLs
    const invalidImages = formData.images.filter(img => !img || typeof img !== 'string');
    if (invalidImages.length > 0) {
      console.log('❌ Invalid image URLs:', invalidImages);
      setError('Invalid image URLs detected');
      toast.error('Invalid image URLs detected');
      return;
    }
    
    console.log('✅ Form data validation passed');
    console.log('📊 Final form data to be sent:', {
      ...formData,
      price: formData.price,
      stock: formData.stock,
      images: formData.images,
      sizes: formData.sizes || [],
      colors: formData.colors || []
    });
    
    // Log data types for debugging
    console.log('🔍 Data type verification:');
    console.log(`   name: ${formData.name} (${typeof formData.name})`);
    console.log(`   description: ${formData.description} (${typeof formData.description})`);
    console.log(`   price: ${formData.price} (${typeof formData.price})`);
    console.log(`   category: ${formData.category} (${typeof formData.category})`);
    console.log(`   stock: ${formData.stock} (${typeof formData.stock})`);
    console.log(`   images: ${formData.images.length} items (${typeof formData.images})`);
    console.log(`   sizes: ${formData.sizes?.length || 0} items (${typeof formData.sizes})`);
    console.log(`   colors: ${formData.colors?.length || 0} items (${typeof formData.colors})`);

    try {
      setIsSaving(true);
      setError(null);
      
      console.log('🛍️ Submitting product data:', formData);
      console.log('🔑 Token check:', localStorage.getItem('token') ? 'Present' : 'Missing');
      
      let response;
      if (productId) {
        // Update existing product
        console.log('📝 Updating existing product...');
        response = await productAPI.updateProduct(productId, formData);
        console.log('📝 Update response:', response);
        if (response.success) {
          toast.success('Product updated successfully!');
        }
      } else {
        // Create new product
        console.log('🆕 Creating new product...');
        console.log('📤 Sending to productAPI.createProduct:', formData);
        
        response = await productAPI.createProduct(formData);
        console.log('🆕 Create response:', response);
        console.log('🆕 Response type:', typeof response);
        console.log('🆕 Response success:', response?.success);
        console.log('🆕 Response message:', response?.message);
        
        if (response.success) {
          toast.success('Product created successfully!');
        }
      }
      
      console.log('📊 Final response:', response);
      console.log('📊 Response success:', response?.success);
      console.log('📊 Response data:', response?.data);
      
      if (response && response.success) {
        console.log('✅ Product operation successful, navigating...');
        navigate('/vendor/products');
      } else {
        console.log('❌ Product operation failed');
        console.log('❌ Response:', response);
        console.log('❌ Response message:', response?.message);
        console.log('❌ Response errors:', response?.errors);
        
        // Log detailed validation errors
        if (response?.errors && Array.isArray(response.errors)) {
          console.log('🔍 Detailed validation errors:');
          response.errors.forEach((error, index) => {
            console.log(`   Error ${index + 1}:`);
            console.log(`     Field: ${error.field || error.path || 'unknown'}`);
            console.log(`     Message: ${error.message || error.msg || 'unknown'}`);
            console.log(`     Value: ${error.value || 'not provided'}`);
            console.log(`     Type: ${error.type || 'unknown'}`);
          });
        }
        
        const errorMessage = response?.message || 'Failed to save product';
        console.log('❌ Setting error message:', errorMessage);
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('💥 Save product error:', error);
      console.error('💥 Error type:', typeof error);
      console.error('💥 Error message:', (error as any)?.message);
      console.error('💥 Error stack:', (error as any)?.stack);
      
      if ((error as any)?.message) {
        setError((error as any).message);
        toast.error((error as any).message);
      } else {
        setError('Failed to save product');
        toast.error('Failed to save product');
      }
    } finally {
      console.log('🏁 Form submission completed, setting isSaving to false');
      setIsSaving(false);
    }
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {productId ? 'Edit Product' : 'Add New Product'}
          </h1>
          <p className="text-gray-600">
            {productId ? 'Update your product information' : 'Create a new product for your store'}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate('/vendor/products')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Products
        </Button>
      </div>

      {/* Shop Setup Notice */}
      {!productId && (
        <Alert>
          <Package className="h-4 w-4" />
          <AlertDescription>
            <strong>Note:</strong> You can create products without setting up a shop first. 
            In the future, you may want to create a shop profile to enhance your store's visibility and features.
          </AlertDescription>
        </Alert>
      )}

      {/* Debug Test Button - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-500">Debug Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={async () => {
                console.log('🧪 Testing API call manually...');
                try {
                  const timestamp = Date.now();
                  const testData = {
                    name: `Debug Test Product ${timestamp}`,
                    description: 'This is a test product for debugging',
                    price: 9.99,
                    category: 'clothing',
                    stock: 1,
                    images: ['/uploads/products/test-debug.png']
                  };
                  console.log('📤 Test data:', testData);
                  const response = await productAPI.createProduct(testData);
                  console.log('📊 Test API response:', response);
                  if (response.success) {
                    toast.success('Test API call successful!');
                  } else {
                    toast.error('Test API call failed: ' + response.message);
                  }
                } catch (error) {
                  console.error('💥 Test API error:', error);
                  toast.error('Test API error: ' + (error as any)?.message);
                }
              }}
            >
              Test API Call
            </Button>
          </CardContent>
        </Card>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter product name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => handleSelectChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your product..."
                rows={4}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Pricing & Stock */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing & Stock</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (₹) *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="originalPrice">Original Price (₹)</Label>
                <Input
                  id="originalPrice"
                  name="originalPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.originalPrice}
                  onChange={handleInputChange}
                  placeholder="0.00"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="stock">Stock Quantity *</Label>
                <Input
                  id="stock"
                  name="stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={handleInputChange}
                  placeholder="0"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle>Product Images</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Upload Images *</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  Click to upload or drag and drop
                </p>
                <div className="flex items-center justify-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => {
                        console.log('Choose Files button clicked');
                        const fileInput = document.getElementById('image-upload') as HTMLInputElement;
                        if (fileInput) {
                          fileInput.click();
                        }
                      }}
                    >
                      Choose Files
                    </Button>
                  </label>
                </div>
              </div>
            </div>
            
            {formData.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image.startsWith('http') ? image : `http://localhost:5000${image}`}
                      alt={`Product Image ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200"
                      onError={(e) => {
                        console.error('❌ Image failed to load:', image);
                        console.error('❌ Error target:', e.target);
                        // Fallback to placeholder if image fails to load
                        (e.target as HTMLImageElement).src = `https://via.placeholder.com/400x400?text=Image+${index + 1}`;
                      }}
                      onLoad={() => {
                        console.log('✅ Image loaded successfully:', image);
                      }}
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Options */}
        <Card>
          <CardHeader>
            <CardTitle>Product Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Sizes */}
            <div className="space-y-2">
              <Label>Sizes Available</Label>
              <div className="flex flex-wrap gap-2">
                {sizeOptions.map(size => (
                  <Button
                    key={size}
                    type="button"
                    variant={formData.sizes?.includes(size) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSizeToggle(size)}
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Colors */}
            <div className="space-y-2">
              <Label>Colors Available</Label>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map(color => (
                  <Button
                    key={color}
                    type="button"
                    variant={formData.colors?.includes(color) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleColorToggle(color)}
                  >
                    {color.charAt(0).toUpperCase() + color.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/vendor/products')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {productId ? 'Update Product' : 'Create Product'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
} 