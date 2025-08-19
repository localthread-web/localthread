# 🔗 Frontend-Backend Integration Guide

This guide explains how to connect your React frontend to the Node.js backend for the LocalThread e-commerce platform.

## 🚀 Quick Start

### 1. **Start the Backend Server**

```bash
# Navigate to backend directory
cd localthread-b

# Start the server
npm run dev
```

Your backend will be running on `http://localhost:5000`

### 2. **Configure Frontend Environment**

Create a `.env` file in the frontend directory:

```bash
# Navigate to frontend directory
cd localthread

# Copy environment template
cp env.example .env
```

Edit `.env` file:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENVIRONMENT=development
```

### 3. **Start the Frontend**

```bash
# In the frontend directory
npm start
```

Your frontend will be running on `http://localhost:3000`

## 🔧 How the Integration Works

### 1. **API Service Layer**

The frontend uses a centralized API service (`src/services/api.ts`) that handles:

- **Base URL Configuration**: Points to your backend API
- **Authentication Headers**: Automatically includes JWT tokens
- **Error Handling**: Handles network errors and API responses
- **Token Management**: Stores and manages JWT tokens

### 2. **Redux Store Integration**

The auth slice (`src/store/authSlice.ts`) now includes:

- **Async Thunks**: For API calls (login, register, etc.)
- **Token Storage**: Automatically stores JWT tokens in localStorage
- **State Management**: Manages authentication state
- **Error Handling**: Handles API errors and displays them

### 3. **Component Integration**

Components like `LoginForm` and `SignupForm` now:

- **Dispatch Actions**: Use Redux actions for API calls
- **Handle Loading States**: Show loading indicators during API calls
- **Display Errors**: Show error messages from the backend
- **Navigate on Success**: Redirect after successful authentication

## 📡 API Communication Flow

### 1. **User Registration**

```javascript
// Frontend sends registration data
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "customer"
}

// Backend responds with user data and token
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { /* user object */ },
    "token": "jwt_token_here"
  }
}
```

### 2. **User Login**

```javascript
// Frontend sends login credentials
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}

// Backend responds with user data and token
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { /* user object */ },
    "token": "jwt_token_here"
  }
}
```

### 3. **Authenticated Requests**

```javascript
// Frontend includes token in headers
GET /api/users/profile
Authorization: Bearer jwt_token_here

// Backend responds with user profile
{
  "success": true,
  "data": {
    "user": { /* user profile */ }
  }
}
```

## 🛠️ Configuration Files

### 1. **Frontend Environment (.env)**

```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENVIRONMENT=development

# Optional: Different URLs for different environments
# REACT_APP_API_URL=https://api.localthread.com/api  # Production
# REACT_APP_API_URL=http://localhost:5000/api        # Development
```

### 2. **Backend Environment (.env)**

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/localthread

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

## 🔐 Authentication Flow

### 1. **Token Storage**

```javascript
// After successful login/registration
localStorage.setItem('token', response.data.token);
localStorage.setItem('user', JSON.stringify(response.data.user));
```

### 2. **Token Usage**

```javascript
// API service automatically includes token
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
};
```

### 3. **Token Expiry Handling**

```javascript
// API service handles 401 responses
if (response.status === 401) {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
}
```

## 🧪 Testing the Integration

### 1. **Test Backend Health**

```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "LocalThread API is running",
  "timestamp": "2025-08-05T19:04:29.900Z"
}
```

### 2. **Test User Registration**

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "customer"
  }'
```

### 3. **Test User Login**

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 4. **Test Frontend Integration**

1. Open `http://localhost:3000` in your browser
2. Navigate to the login/signup page
3. Try registering a new user
4. Try logging in with the registered user
5. Check that the user is redirected to the dashboard

## 🔄 Development Workflow

### 1. **Starting Both Servers**

```bash
# Terminal 1: Start Backend
cd localthread-b
npm run dev

# Terminal 2: Start Frontend
cd localthread
npm start
```

### 2. **Making Changes**

- **Backend Changes**: Restart the backend server
- **Frontend Changes**: React will hot-reload automatically
- **Environment Changes**: Restart both servers

### 3. **Debugging**

#### Backend Debugging
```bash
# Check backend logs
cd localthread-b
npm run dev

# Check API endpoints
curl http://localhost:5000/api/health
```

#### Frontend Debugging
```bash
# Check frontend logs
cd localthread
npm start

# Check browser console for errors
# Check Network tab for API calls
```

## 🚨 Common Issues and Solutions

### 1. **CORS Errors**

**Problem**: Browser blocks requests to different origins
**Solution**: Backend is already configured with CORS for `http://localhost:3000`

### 2. **API Connection Errors**

**Problem**: Frontend can't connect to backend
**Solution**: 
- Ensure backend is running on port 5000
- Check `.env` file has correct API URL
- Verify no firewall blocking the connection

### 3. **Authentication Errors**

**Problem**: JWT tokens not working
**Solution**:
- Check JWT_SECRET in backend `.env`
- Verify token is being sent in headers
- Check token expiry

### 4. **Database Connection Errors**

**Problem**: Backend can't connect to MongoDB
**Solution**:
- Ensure MongoDB is running
- Check MONGODB_URI in backend `.env`
- Verify database permissions

## 📱 Frontend Components Updated

### 1. **LoginForm.tsx**
- ✅ Connected to Redux store
- ✅ Uses real API calls
- ✅ Handles loading states
- ✅ Shows error messages
- ✅ Redirects on success

### 2. **SignupForm.tsx**
- ✅ Connected to Redux store
- ✅ Uses real API calls
- ✅ Handles role selection
- ✅ Validates input
- ✅ Shows success/error messages

### 3. **useAuth Hook**
- ✅ Provides authentication state
- ✅ Role-based helpers
- ✅ User type safety

## 🔧 API Endpoints Available

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh-token` - Refresh JWT token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `POST /api/auth/verify-email` - Verify email

### User Profile
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `PUT /api/users/avatar` - Upload avatar
- `PUT /api/users/store-image` - Upload store image (vendor)
- `PUT /api/users/password` - Change password
- `DELETE /api/users/account` - Deactivate account
- `GET /api/users/vendors` - Get all vendors
- `GET /api/users/vendors/:id` - Get vendor profile

## 🎯 Next Steps

### 1. **Test the Integration**
- Register a new user
- Login with the user
- Check that authentication state persists
- Test logout functionality

### 2. **Add More Features**
- Profile management
- Password reset functionality
- Email verification
- File upload for avatars

### 3. **Production Deployment**
- Set up production environment variables
- Configure CORS for production domains
- Set up SSL certificates
- Configure database for production

## 🎉 Success!

Your frontend and backend are now connected! You can:

- ✅ Register new users
- ✅ Login with existing users
- ✅ Manage authentication state
- ✅ Handle API errors gracefully
- ✅ Use role-based authorization
- ✅ Upload files (avatars, store images)

The integration is complete and ready for further development! 🚀 