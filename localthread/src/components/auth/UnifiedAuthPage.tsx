import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { RootState } from '../../store';
import { loginUser, registerUser } from '../../store/authSlice';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Loader2, User, Store, ArrowLeft, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export function UnifiedAuthPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const location = useLocation();
  const { isLoading, error, user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  // Debug logging
  console.log('UnifiedAuthPage - Auth state:', { isAuthenticated, user: user?.name, userRole: user?.role });
  
  const [activeTab, setActiveTab] = useState<'customer' | 'vendor'>('customer');
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // API error state for field-specific errors
  const [apiErrors, setApiErrors] = useState<{[key: string]: string}>({});
  
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    storeName: '',
    storeDescription: ''
  });

  // Error states for form validation
  const [loginErrors, setLoginErrors] = useState({
    email: '',
    password: ''
  });

  const [registerErrors, setRegisterErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    storeName: '',
    storeDescription: ''
  });

  // Clear all errors when switching tabs or modes
  const clearAllErrors = () => {
    setLoginErrors({ email: '', password: '' });
    setRegisterErrors({
      name: '', email: '', password: '', confirmPassword: '', 
      phone: '', storeName: '', storeDescription: ''
    });
    setApiErrors({});
  };

  const handleLoginInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (loginErrors[name as keyof typeof loginErrors]) {
      setLoginErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    // Clear API error for this field
    if (apiErrors[name]) {
      setApiErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleRegisterInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (registerErrors[name as keyof typeof registerErrors]) {
      setRegisterErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    // Clear API error for this field
    if (apiErrors[name]) {
      setApiErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validation functions
  const validateLogin = () => {
    const errors = { email: '', password: '' };
    
    if (!loginData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(loginData.email)) {
      errors.email = 'Please enter a valid email';
    }
    
    if (!loginData.password) {
      errors.password = 'Password is required';
    } else if (loginData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    return errors;
  };

  const validateRegister = () => {
    const errors = { 
      name: '', 
      email: '', 
      password: '', 
      confirmPassword: '', 
      phone: '', 
      storeName: '', 
      storeDescription: '' 
    };
    
    if (!registerData.name.trim()) {
      errors.name = 'Name is required';
    } else if (registerData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    
    if (!registerData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(registerData.email)) {
      errors.email = 'Please enter a valid email';
    }
    
    if (!registerData.password) {
      errors.password = 'Password is required';
    } else if (registerData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (!registerData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (registerData.password !== registerData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    // Vendor-specific validations
    if (activeTab === 'vendor') {
      if (!registerData.storeName?.trim()) {
        errors.storeName = 'Store name is required for vendors';
      }
    }
    
    return errors;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setApiErrors({});
    
    // Validate form
    const errors = validateLogin();
    setLoginErrors(errors);
    
    // Check if there are any errors
    if (errors.email || errors.password) {
      toast.error('Please fix the errors above');
      return;
    }
    
    try {
      console.log('Attempting login with:', loginData);
      const result = await dispatch(loginUser(loginData) as any);
      
      if (loginUser.fulfilled.match(result)) {
        console.log('Login successful, user:', result.payload);
        console.log('User role:', result.payload?.role);
        
        toast.success('Login successful!');
        
        // Navigate based on user role
        if (result.payload?.role === 'vendor') {
          console.log('Navigating to vendor dashboard after login');
          navigate('/vendor/dashboard');
        } else if (result.payload?.role === 'admin') {
          console.log('Navigating to admin dashboard after login');
          navigate('/admin/dashboard');
        } else {
          console.log('Navigating to customer dashboard after login');
          navigate('/customer/profile');
        }
      } else if (loginUser.rejected.match(result)) {
        console.error('Login failed:', result.payload);
        
        // Handle field-specific errors from API
        if (typeof result.payload === 'string') {
          const errorMessage = result.payload;
          
          // Check for specific error patterns
          if (errorMessage.includes('Invalid credentials')) {
            // Check if this might be a non-existent account
            const email = loginData.email;
            if (email) {
              // Show a more helpful message suggesting registration
              setApiErrors({ 
                email: 'Account not found. Please register first or check your email.',
                password: 'Account not found. Please register first or check your email.'
              });
              toast.error('Account not found. Please register first or check your email and password.', {
                duration: 5000,
                action: {
                  label: 'Switch to Register',
                  onClick: () => setActiveTab('customer')
                }
              });
            } else {
              setApiErrors({ 
                email: 'Invalid email or password',
                password: 'Invalid email or password'
              });
              toast.error('Invalid email or password. Please try again.');
            }
          } else if (errorMessage.includes('Invalid email or password')) {
            setApiErrors({ 
              email: 'Invalid email or password',
              password: 'Invalid email or password'
            });
            toast.error('Invalid email or password. Please try again.');
          } else if (errorMessage.includes('email') || errorMessage.includes('Email')) {
            setApiErrors({ email: errorMessage });
          } else if (errorMessage.includes('password') || errorMessage.includes('Password')) {
            setApiErrors({ password: errorMessage });
          } else if (errorMessage.includes('Account is deactivated')) {
            toast.error('Your account has been deactivated. Please contact support.');
          } else {
            toast.error(errorMessage);
          }
        } else {
          toast.error('Login failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Network error. Please check your connection and try again.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setApiErrors({});
    
    // Validate form
    const errors = validateRegister();
    setRegisterErrors(errors);
    
    // Check if there are any errors
    if (Object.values(errors).some(error => error)) {
      toast.error('Please fix the errors above');
      return;
    }

    const userData = {
      name: registerData.name,
      email: registerData.email,
      password: registerData.password,
      confirmPassword: registerData.confirmPassword,
      role: activeTab as 'customer' | 'vendor',
      phone: registerData.phone || undefined,
      storeName: activeTab === 'vendor' ? registerData.storeName : undefined,
      storeDescription: activeTab === 'vendor' ? registerData.storeDescription : undefined,
    };

    try {
      const result = await dispatch(registerUser(userData) as any);
      
      if (registerUser.fulfilled.match(result)) {
        toast.success(`Welcome to LocalThread, ${registerData.name}!`);
        
        // Navigate based on role
        if (activeTab === 'vendor') {
          console.log('Navigating to vendor dashboard after registration');
          navigate('/vendor/dashboard');
        } else {
          console.log('Navigating to customer dashboard after registration');
          navigate('/customer/profile');
        }
      } else if (registerUser.rejected.match(result)) {
        console.error('Registration failed:', result.payload);
        
        // Handle field-specific errors from API
        if (typeof result.payload === 'string') {
          const errorMessage = result.payload;
          
          // Parse field-specific errors from backend validation
          if (errorMessage.includes('name:') || errorMessage.includes('Name')) {
            const nameError = errorMessage.match(/name:\s*([^,]+)/i)?.[1] || 'Name validation failed';
            setApiErrors({ name: nameError });
          } else if (errorMessage.includes('email:') || errorMessage.includes('Email')) {
            const emailError = errorMessage.match(/email:\s*([^,]+)/i)?.[1] || 'Email validation failed';
            setApiErrors({ email: emailError });
          } else if (errorMessage.includes('password:') || errorMessage.includes('Password')) {
            const passwordError = errorMessage.match(/password:\s*([^,]+)/i)?.[1] || 'Password validation failed';
            setApiErrors({ password: passwordError });
          } else if (errorMessage.includes('confirmPassword:') || errorMessage.includes('Password confirmation')) {
            setApiErrors({ confirmPassword: 'Password confirmation does not match password' });
          } else if (errorMessage.includes('storeName:') || errorMessage.includes('Store name')) {
            const storeError = errorMessage.match(/storeName:\s*([^,]+)/i)?.[1] || 'Store name validation failed';
            setApiErrors({ storeName: storeError });
          } else if (errorMessage.includes('phone:') || errorMessage.includes('Phone')) {
            const phoneError = errorMessage.match(/phone:\s*([^,]+)/i)?.[1] || 'Phone validation failed';
            setApiErrors({ phone: phoneError });
          } else if (errorMessage.includes('already exists') || errorMessage.includes('User with this email')) {
            setApiErrors({ email: 'An account with this email already exists' });
            toast.error('An account with this email already exists. Please try logging in instead.');
          } else {
            // Show general error message
            toast.error(errorMessage);
          }
        } else {
          toast.error('Registration failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Network error. Please check your connection and try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Back to main site */}
        <div className="mb-6">
          <Link 
            to="/" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to LocalThread
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
              <User className="h-6 w-6 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl">Welcome to LocalThread</CardTitle>
            <CardDescription>
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs 
              value={activeTab} 
              onValueChange={(value) => {
                setActiveTab(value as 'customer' | 'vendor');
                clearAllErrors();
              }}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="customer" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Customer
                </TabsTrigger>
                <TabsTrigger value="vendor" className="flex items-center gap-2">
                  <Store className="h-4 w-4" />
                  Vendor
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value={activeTab} className="mt-6">
                <div className="flex gap-2 mb-6">
                  <Button
                    variant={isLogin ? "default" : "outline"}
                    onClick={() => {
                      setIsLogin(true);
                      clearAllErrors();
                    }}
                    className="flex-1"
                  >
                    Login
                  </Button>
                  <Button
                    variant={!isLogin ? "default" : "outline"}
                    onClick={() => {
                      setIsLogin(false);
                      clearAllErrors();
                    }}
                    className="flex-1"
                  >
                    Register
                  </Button>
                </div>

                {/* Global error display */}
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {isLogin ? (
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        value={loginData.email}
                        onChange={handleLoginInputChange}
                        required
                        className={
                          loginErrors.email || apiErrors.email 
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                            : ''
                        }
                      />
                      {(loginErrors.email || apiErrors.email) && (
                        <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {loginErrors.email || apiErrors.email}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          value={loginData.password}
                          onChange={handleLoginInputChange}
                          required
                          className={
                            loginErrors.password || apiErrors.password 
                              ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                              : ''
                          }
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      {(loginErrors.password || apiErrors.password) && (
                        <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {loginErrors.password || apiErrors.password}
                        </p>
                      )}
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-gray-900 text-white hover:bg-black" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        'Sign In'
                      )}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Enter your full name"
                        value={registerData.name}
                        onChange={handleRegisterInputChange}
                        required
                        className={
                          registerErrors.name || apiErrors.name 
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                            : ''
                        }
                      />
                      {(registerErrors.name || apiErrors.name) && (
                        <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {registerErrors.name || apiErrors.name}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        value={registerData.email}
                        onChange={handleRegisterInputChange}
                        required
                        className={
                          registerErrors.email || apiErrors.email 
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                            : ''
                        }
                      />
                      {(registerErrors.email || apiErrors.email) && (
                        <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {registerErrors.email || apiErrors.email}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Create a password"
                          value={registerData.password}
                          onChange={handleRegisterInputChange}
                          required
                          className={
                            registerErrors.password || apiErrors.password 
                              ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                              : ''
                          }
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      {(registerErrors.password || apiErrors.password) && (
                        <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {registerErrors.password || apiErrors.password}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Confirm your password"
                          value={registerData.confirmPassword}
                          onChange={handleRegisterInputChange}
                          required
                          className={
                            registerErrors.confirmPassword 
                              ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                              : ''
                          }
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      {registerErrors.confirmPassword && (
                        <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {registerErrors.confirmPassword}
                        </p>
                      )}
                    </div>
                    
                    {activeTab === 'customer' && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone (Optional)</Label>
                          <Input
                            id="phone"
                            name="phone"
                            placeholder="Enter your phone number"
                            value={registerData.phone}
                            onChange={handleRegisterInputChange}
                            className={
                              registerErrors.phone || apiErrors.phone 
                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                                : ''
                            }
                          />
                          {(registerErrors.phone || apiErrors.phone) && (
                            <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {registerErrors.phone || apiErrors.phone}
                            </p>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="address">Address (Optional)</Label>
                          <Input
                            id="address"
                            name="address"
                            placeholder="Enter your address"
                            value={registerData.address}
                            onChange={handleRegisterInputChange}
                          />
                        </div>
                      </>
                    )}
                    
                    {activeTab === 'vendor' && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="storeName">Store Name</Label>
                          <Input
                            id="storeName"
                            name="storeName"
                            placeholder="Enter your store name"
                            value={registerData.storeName}
                            onChange={handleRegisterInputChange}
                            required
                            className={
                              registerErrors.storeName || apiErrors.storeName 
                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                                : ''
                            }
                          />
                          {(registerErrors.storeName || apiErrors.storeName) && (
                            <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {registerErrors.storeName || apiErrors.storeName}
                            </p>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="storeDescription">Store Description (Optional)</Label>
                          <Input
                            id="storeDescription"
                            name="storeDescription"
                            placeholder="Describe your store"
                            value={registerData.storeDescription}
                            onChange={handleRegisterInputChange}
                            className={
                              registerErrors.storeDescription || apiErrors.storeDescription 
                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                                : ''
                            }
                          />
                          {(registerErrors.storeDescription || apiErrors.storeDescription) && (
                            <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {registerErrors.storeDescription || apiErrors.storeDescription}
                            </p>
                          )}
                        </div>
                      </>
                    )}
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-gray-900 text-white hover:bg-black" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </Button>
                  </form>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        {/* Debug Section - Remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-sm text-gray-500">Debug Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs space-y-2">
                <div><strong>Is Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</div>
                <div><strong>User:</strong> {user?.name || 'None'}</div>
                <div><strong>User Role:</strong> {user?.role || 'None'}</div>
                <div><strong>Token:</strong> {localStorage.getItem('token') ? 'Present' : 'Missing'}</div>
                <div><strong>Stored User:</strong> {localStorage.getItem('user') ? 'Present' : 'Missing'}</div>
                <div><strong>Current Tab:</strong> {activeTab}</div>
                <div><strong>Is Login Mode:</strong> {isLogin ? 'Yes' : 'No'}</div>
                <div><strong>API URL:</strong> {process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}</div>
                <div><strong>API Errors:</strong> {Object.keys(apiErrors).length > 0 ? JSON.stringify(apiErrors) : 'None'}</div>
              </div>
              
              {/* Test API Connection */}
              <Button 
                onClick={async () => {
                  try {
                    const response = await fetch('http://localhost:5000/api/health');
                    const data = await response.json();
                    console.log('API Health Check:', data);
                    toast.success('API is working!');
                  } catch (error) {
                    console.error('API Health Check failed:', error);
                    toast.error('API connection failed');
                  }
                }}
                className="mt-2"
                size="sm"
              >
                Test API Connection
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 