import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { loginUser, clearError } from '../store/authSlice';
import { RootState } from '../store';

// LoginForm component for user authentication
export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '' });
  
  // Clear errors when user starts typing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'email') {
      setEmail(value);
      if (errors.email) {
        setErrors(prev => ({ ...prev, email: '' }));
      }
    } else if (name === 'password') {
      setPassword(value);
      if (errors.password) {
        setErrors(prev => ({ ...prev, password: '' }));
      }
    }
  };
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Clear error when component mounts
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Show error toast when error occurs
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const validate = () => {
    const newErrors = { email: '', password: '' };
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate();
    
    if (newErrors.email || newErrors.password) {
      setErrors(newErrors);
      return;
    }

    // Clear previous errors
    setErrors({ email: '', password: '' });
    
    // Dispatch login action
    const result = await dispatch(loginUser({ email, password }) as any);
    
    if (loginUser.fulfilled.match(result)) {
      toast.success('Logged in successfully!');
      
      // Reset form
      setEmail('');
      setPassword('');
      
      // Navigate based on user role
      const user = result.payload;
      if (user?.role === 'vendor') {
        navigate('/vendor/dashboard');
      } else if (user?.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/customer/profile');
      }
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
                         <Input
               id="email"
               name="email"
               type="email"
               placeholder="Enter your email"
               value={email}
               onChange={handleInputChange}
               disabled={isLoading}
               className={errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
             />
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
                         <Input
               id="password"
               name="password"
               type="password"
               placeholder="Enter your password"
               value={password}
               onChange={handleInputChange}
               disabled={isLoading}
               className={errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
             />
            {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Login'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 