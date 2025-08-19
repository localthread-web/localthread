# LocalThread API Documentation

## Overview

LocalThread API provides comprehensive endpoints for managing a local marketplace platform. This documentation covers all available endpoints, request/response formats, and authentication requirements.

## Base URL

```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Response Format

All API responses follow a consistent format:

```json
{
  "success": true/false,
  "message": "Response message",
  "data": { ... }
}
```

## Error Responses

```json
{
  "success": false,
  "message": "Error description"
}
```

---

## 🔐 Authentication Routes

### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "customer" // "customer", "vendor", "admin"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { ... },
    "token": "jwt-token"
  }
}
```

### POST /api/auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### POST /api/auth/logout
Logout user (invalidate token).

---

## 🏪 Shop Management Routes

### GET /api/shops
Get all shops with filtering and pagination.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `category` (string): Filter by category
- `city` (string): Filter by city
- `rating` (number): Filter by minimum rating
- `search` (string): Search in shop name/description
- `isVerified` (boolean): Filter by verification status
- `sortBy` (string): Sort field (default: "createdAt")
- `sortOrder` (string): "asc" or "desc" (default: "desc")

**Response:**
```json
{
  "success": true,
  "data": {
    "docs": [...],
    "totalDocs": 100,
    "limit": 10,
    "page": 1,
    "totalPages": 10
  }
}
```

### GET /api/shops/nearby
Get shops near a specific location.

**Query Parameters:**
- `longitude` (number): Required
- `latitude` (number): Required
- `maxDistance` (number): Maximum distance in meters (default: 10000)
- `limit` (number): Maximum results (default: 20)

### GET /api/shops/trending
Get trending shops (most followed).

**Query Parameters:**
- `limit` (number): Number of shops (default: 10)

### GET /api/shops/:id
Get shop details by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "name": "Fashion Hub",
    "description": "Premium clothing store",
    "address": { ... },
    "rating": { "average": 4.5, "count": 25 },
    "followersCount": 150,
    "productsCount": 45,
    "reviewsCount": 25,
    "isFollowing": false
  }
}
```

### GET /api/shops/:id/products
Get products by shop.

**Query Parameters:**
- `page`, `limit`, `category`, `minPrice`, `maxPrice`, `sortBy`, `sortOrder`

### GET /api/shops/:id/reviews
Get reviews by shop.

**Query Parameters:**
- `page`, `limit`, `rating`, `sortBy`, `sortOrder`

### POST /api/shops
Create a new shop (Vendor only).

**Request Body:**
```json
{
  "name": "Fashion Hub",
  "description": "Premium clothing store",
  "address": {
    "street": "123 Main St",
    "city": "Bangalore",
    "state": "Karnataka",
    "zipCode": "560001"
  },
  "location": {
    "coordinates": [77.5946, 12.9716]
  },
  "contact": {
    "phone": "+91-9876543210",
    "email": "contact@fashionhub.com"
  },
  "categories": ["mens-wear", "womens-wear"],
  "operatingHours": { ... },
  "features": ["home-delivery", "fitting-room"]
}
```

### PUT /api/shops/:id
Update shop details (Shop Owner only).

### POST /api/shops/:id/logo
Upload shop logo (Shop Owner only).

**Request:** Multipart form with `logo` file.

### POST /api/shops/:id/banner
Upload shop banner (Shop Owner only).

**Request:** Multipart form with `banner` file.

### POST /api/shops/:id/gallery
Upload shop gallery images (Shop Owner only).

**Request:** Multipart form with `images` files (max 10).

### GET /api/shops/:id/analytics
Get shop analytics (Shop Owner only).

**Response:**
```json
{
  "success": true,
  "data": {
    "shop": { ... },
    "productsCount": 45,
    "reviewsCount": 25,
    "followerAnalytics": [...],
    "salesStats": {
      "totalOrders": 150,
      "totalRevenue": 75000,
      "averageOrderValue": 500
    }
  }
}
```

---

## 🛒 Shopping Cart Routes

### GET /api/cart
Get user's cart.

**Response:**
```json
{
  "success": true,
  "data": {
    "cart": {
      "items": [...],
      "totalItems": 5,
      "subtotal": 2500,
      "appliedCoupons": [...]
    },
    "summary": {
      "totalItems": 5,
      "subtotal": 2500,
      "totalDiscount": 100,
      "total": 2400
    }
  }
}
```

### POST /api/cart/items
Add item to cart.

**Request Body:**
```json
{
  "productId": "product-id",
  "quantity": 2,
  "size": "M",
  "color": "Blue"
}
```

### PUT /api/cart/items/:itemId
Update cart item quantity.

**Request Body:**
```json
{
  "quantity": 3
}
```

### DELETE /api/cart/items/:itemId
Remove item from cart.

### POST /api/cart/coupons
Apply coupon to cart.

**Request Body:**
```json
{
  "code": "SAVE100"
}
```

### DELETE /api/cart/coupons/:code
Remove coupon from cart.

### POST /api/cart/check-availability
Check cart items availability.

### POST /api/cart/save-address
Save shipping address to cart.

**Request Body:**
```json
{
  "street": "456 Customer St",
  "city": "Mumbai",
  "state": "Maharashtra",
  "zipCode": "400001"
}
```

### DELETE /api/cart
Clear cart.

### GET /api/cart/summary
Get cart summary.

---

## ⭐ Review & Rating Routes

### GET /api/reviews
Get reviews with filtering.

**Query Parameters:**
- `productId`, `shopId`, `rating`, `status`, `verifiedOnly`
- `page`, `limit`, `sortBy`, `sortOrder`

### GET /api/reviews/:id
Get review by ID.

### POST /api/reviews
Create a new review.

**Request Body:**
```json
{
  "productId": "product-id",
  "shopId": "shop-id",
  "rating": 5,
  "title": "Great product!",
  "comment": "Excellent quality and fast delivery",
  "tags": ["quality", "delivery"]
}
```

### PUT /api/reviews/:id
Update review (Review Owner only).

### POST /api/reviews/:id/helpful
Mark review as helpful.

**Request Body:**
```json
{
  "isHelpful": true
}
```

### POST /api/reviews/:id/images
Upload review images (Review Owner only).

**Request:** Multipart form with `images` files (max 5).

### GET /api/reviews/stats/:productId
Get review statistics for a product.

**Response:**
```json
{
  "success": true,
  "data": {
    "averageRating": 4.5,
    "totalReviews": 25,
    "ratingDistribution": {
      "1": 1, "2": 2, "3": 3, "4": 8, "5": 11
    }
  }
}
```

### GET /api/reviews/user/:userId
Get reviews by user (User or Admin only).

### DELETE /api/reviews/:id
Delete review (Review Owner or Admin only).

### PUT /api/reviews/:id/moderate
Moderate review (Admin only).

**Request Body:**
```json
{
  "status": "approved", // "pending", "approved", "rejected"
  "reason": "Review meets guidelines"
}
```

### GET /api/reviews/pending
Get pending reviews for moderation (Admin only).

---

## 👥 Shop Following Routes

### POST /api/follows/:shopId
Follow a shop.

**Request Body:**
```json
{
  "notifications": {
    "newProducts": true,
    "offers": true,
    "updates": false
  }
}
```

### DELETE /api/follows/:shopId
Unfollow a shop.

### PUT /api/follows/:shopId
Toggle follow status.

### GET /api/follows/check/:shopId
Check if user follows a shop.

### GET /api/follows/following
Get user's followed shops.

**Query Parameters:**
- `page`, `limit`, `sortBy`, `sortOrder`

### GET /api/follows/shop/:shopId/followers
Get shop followers (Shop Owner or Admin only).

### PUT /api/follows/:shopId/notifications
Update notification preferences.

**Request Body:**
```json
{
  "notifications": {
    "newProducts": true,
    "offers": false,
    "updates": true
  }
}
```

### GET /api/follows/trending
Get trending shops (most followed).

### GET /api/follows/analytics/:shopId
Get follower analytics (Shop Owner or Admin only).

### GET /api/follows/mutual/:shopId1/:shopId2
Get mutual followers between two shops (Shop Owners or Admin only).

### GET /api/follows/notifications/:shopId
Get followers for specific notification type (Shop Owner or Admin only).

**Query Parameters:**
- `type`: "newProducts", "offers", or "updates"

### GET /api/follows/stats
Get user's following statistics.

---

## 📦 Product Routes

### GET /api/products
Get products with filtering and search.

**Query Parameters:**
- `page`, `limit`, `category`, `minPrice`, `maxPrice`
- `search`, `sortBy`, `sortOrder`, `shopId`

### GET /api/products/search
Search products with text search.

### GET /api/products/featured
Get featured products.

### GET /api/products/trending
Get trending products.

### GET /api/products/:id
Get product details by ID.

### POST /api/products
Create a new product (Vendor only).

### PUT /api/products/:id
Update product (Product Owner only).

### DELETE /api/products/:id
Delete product (Product Owner or Admin only).

---

## 📋 Order Routes

### GET /api/orders
Get user's orders.

### GET /api/orders/:id
Get order details by ID.

### POST /api/orders
Create a new order from cart.

### PUT /api/orders/:id/status
Update order status (Vendor or Admin only).

### PUT /api/orders/:id/tracking
Add tracking information (Vendor only).

### GET /api/orders/stats
Get order statistics (Vendor or Admin only).

---

## 👤 User Management Routes

### GET /api/users/profile
Get user profile.

### PUT /api/users/profile
Update user profile.

### GET /api/users/addresses
Get user addresses.

### POST /api/users/addresses
Add new address.

### PUT /api/users/addresses/:id
Update address.

### DELETE /api/users/addresses/:id
Delete address.

### GET /api/users/wishlist
Get user wishlist.

### POST /api/users/wishlist/:productId
Add product to wishlist.

### DELETE /api/users/wishlist/:productId
Remove product from wishlist.

---

## 🔧 Admin Routes

### GET /api/admin/dashboard
Get admin dashboard statistics.

### GET /api/admin/users
Get all users (Admin only).

### PUT /api/admin/users/:id/verify
Verify vendor (Admin only).

### GET /api/admin/products/pending
Get pending products for approval (Admin only).

### PUT /api/admin/products/:id/approve
Approve/reject product (Admin only).

### GET /api/admin/orders
Get all orders (Admin only).

---

## 📊 Analytics & Statistics

### GET /api/analytics/sales
Get sales analytics (Admin/Vendor only).

### GET /api/analytics/products
Get product performance analytics.

### GET /api/analytics/users
Get user engagement analytics.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Environment Variables
Create a `.env` file:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/localthread
JWT_SECRET=your-jwt-secret
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
FRONTEND_URL=http://localhost:3000
```

### 3. Start the Server
```bash
npm start
```

### 4. Test the API
```bash
# Health check
curl http://localhost:5000/api/health

# Register a user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123","role":"customer"}'
```

---

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt with configurable rounds
- **Rate Limiting**: Prevents API abuse
- **Input Validation**: Comprehensive request validation
- **CORS Protection**: Configurable cross-origin requests
- **Helmet Security**: HTTP headers security
- **Compression**: Response compression for performance

---

## 📈 Performance Optimizations

- **Database Indexing**: Strategic indexes for fast queries
- **Pagination**: Efficient large dataset handling
- **Population**: Optimized data loading
- **Caching Ready**: Prepared for Redis integration
- **Compression**: Reduced response sizes

---

## 🐛 Error Handling

All endpoints include comprehensive error handling:

- **400 Bad Request**: Invalid input data
- **401 Unauthorized**: Missing or invalid token
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server-side errors

---

## 📝 Rate Limits

- **Default**: 100 requests per 15 minutes per IP
- **Configurable**: Via environment variables
- **Per-endpoint**: Different limits for different endpoints

---

This API provides a complete foundation for LocalThread's marketplace functionality with room for future enhancements and scalability. 