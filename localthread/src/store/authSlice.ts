import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { AuthState, LoginCredentials, RegisterCredentials, Customer, Vendor, Admin } from '../types/auth';
import { authAPI, ApiError } from '../services/api';

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Load user from localStorage on initialization
const loadUserFromStorage = (): Customer | Vendor | Admin | null => {
  try {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error loading user from storage:', error);
    return null;
  }
};

// Load token from localStorage
const loadTokenFromStorage = (): string | null => {
  return localStorage.getItem('token');
};

// Async thunk for login
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(credentials);
      if (response.success && response.data) {
        // Store token and user data
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return response.data.user;
      } else {
        return rejectWithValue(response.message || 'Login failed');
      }
    } catch (error) {
      if (error instanceof ApiError) {
        // Handle field-specific validation errors
        if (error.errors && error.errors.length > 0) {
          const fieldErrors = error.errors.map(err => `${err.field}: ${err.message}`).join(', ');
          return rejectWithValue(fieldErrors);
        }
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Network error. Please try again.');
    }
  }
);

// Async thunk for registration
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: RegisterCredentials, { rejectWithValue }) => {
    try {
      console.log('Registering user with data:', userData); // Debug log
      const response = await authAPI.register(userData);
      console.log('Registration response:', response); // Debug log
      
      if (response.success && response.data) {
        // Store token and user data
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        console.log('Stored user data:', response.data.user); // Debug log
        console.log('User role:', response.data.user.role); // Debug log
        
        return response.data.user;
      } else {
        return rejectWithValue(response.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error); // Debug log
      if (error instanceof ApiError) {
        // Handle field-specific validation errors
        if (error.errors && error.errors.length > 0) {
          const fieldErrors = error.errors.map(err => `${err.field}: ${err.message}`).join(', ');
          return rejectWithValue(fieldErrors);
        }
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Network error. Please try again.');
    }
  }
);

// Async thunk for getting current user
export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.getCurrentUser();
      if (response.success && response.data) {
        return response.data.user;
      } else {
        return rejectWithValue(response.message || 'Failed to get user');
      }
    } catch (error) {
      if (error instanceof ApiError) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Network error. Please try again.');
    }
  }
);

// Async thunk for forgot password
export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await authAPI.forgotPassword(email);
      if (response.success) {
        return response.message;
      } else {
        return rejectWithValue(response.message || 'Failed to send reset email');
      }
    } catch (error) {
      if (error instanceof ApiError) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Network error. Please try again.');
    }
  }
);

// Async thunk for reset password
export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, password }: { token: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authAPI.resetPassword(token, password);
      if (response.success) {
        return response.message;
      } else {
        return rejectWithValue(response.message || 'Failed to reset password');
      }
    } catch (error) {
      if (error instanceof ApiError) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Network error. Please try again.');
    }
  }
);

// Async thunk for verify email
export const verifyEmail = createAsyncThunk(
  'auth/verifyEmail',
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await authAPI.verifyEmail(token);
      if (response.success) {
        return response.message;
      } else {
        return rejectWithValue(response.message || 'Failed to verify email');
      }
    } catch (error) {
      if (error instanceof ApiError) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Network error. Please try again.');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    ...initialState,
    user: loadUserFromStorage(),
    isAuthenticated: !!loadTokenFromStorage(),
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      // Clear from localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    },
    clearError: (state) => {
      state.error = null;
    },
    updateUser: (state, action: PayloadAction<Partial<Customer | Vendor | Admin>>) => {
      if (state.user) {
        // Type-safe update based on current user role
        const updatedUser = { ...state.user, ...action.payload };
        state.user = updatedUser as Customer | Vendor | Admin;
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
        
        // Debug logging
        console.log('Registration fulfilled - user:', action.payload);
        console.log('Registration fulfilled - user role:', action.payload?.role);
        console.log('Registration fulfilled - isAuthenticated:', true);
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get current user
    builder
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        // If getting current user fails, clear auth state
        state.user = null;
        state.isAuthenticated = false;
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      });

    // Forgot password
    builder
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Reset password
    builder
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Verify email
    builder
      .addCase(verifyEmail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyEmail.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  logout,
  clearError,
  updateUser,
} = authSlice.actions;

export default authSlice.reducer; 