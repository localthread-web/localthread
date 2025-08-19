import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { toast } from 'sonner';
import { registerUser, clearError } from '../store/authSlice';
import { RootState } from '../store';

export function SignupForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [errors, setErrors] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  
  // Clear errors when user starts typing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'name') {
      setName(value);
      if (errors.name) {
        setErrors(prev => ({ ...prev, name: '' }));
      }
    } else if (name === 'email') {
      setEmail(value);
      if (errors.email) {
        setErrors(prev => ({ ...prev, email: '' }));
      }
    } else if (name === 'password') {
      setPassword(value);
      if (errors.password) {
        setErrors(prev => ({ ...prev, password: '' }));
      }
    } else if (name === 'confirmPassword') {
      setConfirmPassword(value);
      if (errors.confirmPassword) {
        setErrors(prev => ({ ...prev, confirmPassword: '' }));
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

  // Load role from localStorage on component mount
  useEffect(() => {
    const savedRole = localStorage.getItem('signupRole');
    if (savedRole && (savedRole === 'customer' || savedRole === 'vendor')) {
      setRole(savedRole);
    }
  }, []);

  // Save role to localStorage whenever it changes
  const handleRoleChange = (value: string) => {
    setRole(value);
    localStorage.setItem('signupRole', value);
  };

  const validate = () => {
    const newErrors = { name: '', email: '', password: '', confirmPassword: '' };
    if (!name) {
      newErrors.name = 'Name is required';
    }
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
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate();
    
    if (newErrors.name || newErrors.email || newErrors.password || newErrors.confirmPassword) {
      setErrors(newErrors);
      return;
    }

    // Clear previous errors
    setErrors({ name: '', email: '', password: '', confirmPassword: '' });
    
    // Prepare user data
    const userData = {
      name,
      email,
      password,
      confirmPassword,
      role: role as 'customer' | 'vendor',
    };
    
    // Dispatch register action
    const result = await dispatch(registerUser(userData) as any);
    
    if (registerUser.fulfilled.match(result)) {
      toast.success(`Signed up successfully as ${role === 'customer' ? 'Customer' : 'Vendor'}!`);
      
      // Reset form
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setRole('customer');
      // Clear localStorage after successful signup
      localStorage.removeItem('signupRole');
      
      // Navigate based on role
      if (role === 'vendor') {
        navigate('/vendor/dashboard');
      } else {
        navigate('/customer/profile');
      }
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Create an Account</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
                         <Input
               id="name"
               name="name"
               type="text"
               placeholder="Enter your name"
               value={name}
               onChange={handleInputChange}
               disabled={isLoading}
               className={errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
             />
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
          </div>
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
            <Label>Role</Label>
            <RadioGroup
              value={role}
              onValueChange={handleRoleChange}
              disabled={isLoading}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="customer" id="customer" />
                <Label htmlFor="customer">Customer</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="vendor" id="vendor" />
                <Label htmlFor="vendor">Vendor (Shop Owner)</Label>
              </div>
            </RadioGroup>
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
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
                         <Input
               id="confirmPassword"
               name="confirmPassword"
               type="password"
               placeholder="Confirm your password"
               value={confirmPassword}
               onChange={handleInputChange}
               disabled={isLoading}
               className={errors.confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
             />
            {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Sign Up'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 