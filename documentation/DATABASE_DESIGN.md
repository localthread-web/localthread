# LocalThread Database Design & Integration

## Overview

This document outlines the comprehensive database design for LocalThread, a local marketplace platform connecting customers with local shops and vendors. The database is built using MongoDB with Mongoose ODM for robust data modeling and relationships.

## Database Collections

### 1. **Users Collection** (`User.js`)
**Purpose**: Stores all user accounts (customers, vendors, admins)

**Key Features**:
- Multi-role support (customer, vendor, admin)
- Vendor-specific fields (store details, verification)
- Customer-specific fields (addresses, wishlist)
- Authentication and security features
- Profile management

**Key Fields**:
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: ['customer', 'vendor', 'admin'],
  // Vendor fields
  storeName: String,
  storeLocation: String,
  isVerified: Boolean,
  // Customer fields
  addresses: [AddressSchema],
  wishlist: [ProductIds],
  // Common fields
  phone: String,
  avatar: String,
  isActive: Boolean
}
```

### 2. **Shops Collection** (`Shop.js`) - NEW
**Purpose**: Dedicated shop information separate from user accounts

**Key Features**:
- Comprehensive shop details
- Location-based search (geospatial)
- Operating hours
- Shop categories and features
- Rating and review system
- Follower management

**Key Fields**:
```javascript
{
  name: String,
  ownerId: ObjectId (ref: User),
  description: String,
  address: AddressSchema,
  location: {
    type: 'Point',
    coordinates: [longitude, latitude]
  },
  contact: {
    phone: String,
    email: String,
    website: String
  },
  categories: [String],
  operatingHours: {
    monday: { open: String, close: String, isOpen: Boolean },
    // ... other days
  },
  rating: { average: Number, count: Number },
  followersCount: Number,
  features: [String],
  isActive: Boolean,
  isVerified: Boolean
}
```

### 3. **Products Collection** (`Product.js`) - ENHANCED
**Purpose**: Product catalog with advanced features

**Key Features**:
- Product variants (size, color, stock)
- Shop relationships
- Advanced search and filtering
- Rating and review integration
- Inventory management
- SEO optimization

**Key Fields**:
```javascript
{
  name: String,
  description: String,
  shortDescription: String,
  price: Number,
  originalPrice: Number,
  discountPercentage: Number,
  category: String,
  subcategory: String,
  brand: String,
  vendorId: ObjectId (ref: User),
  shopId: ObjectId (ref: Shop),
  variants: [ProductVariantSchema],
  availableSizes: [String],
  availableColors: [String],
  stock: Number,
  images: [String],
  rating: {
    average: Number,
    count: Number,
    distribution: Object
  },
  salesCount: Number,
  viewCount: Number,
  isActive: Boolean,
  isApproved: Boolean,
  slug: String,
  tags: [String]
}
```

### 4. **Orders Collection** (`Order.js`) - ENHANCED
**Purpose**: Complete order management system

**Key Features**:
- Multi-vendor order support
- Comprehensive status tracking
- Payment integration
- Audit trail
- Vendor-specific order views
- Invoice generation

**Key Fields**:
```javascript
{
  orderNumber: String (unique),
  customerId: ObjectId (ref: User),
  items: [OrderItemSchema],
  subtotal: Number,
  taxAmount: Number,
  shippingFee: Number,
  discountAmount: Number,
  totalAmount: Number,
  status: String,
  shippingAddress: AddressSchema,
  paymentMethod: String,
  paymentStatus: String,
  paymentId: String,
  vendorOrders: [VendorOrderSchema],
  statusHistory: [StatusHistorySchema],
  appliedCoupons: [CouponSchema],
  estimatedDelivery: Date,
  actualDelivery: Date
}
```

### 5. **Cart Collection** (`Cart.js`) - NEW
**Purpose**: Shopping cart management

**Key Features**:
- Persistent cart storage
- Multi-vendor cart items
- Coupon and discount support
- Stock validation
- Cart analytics

**Key Fields**:
```javascript
{
  userId: ObjectId (ref: User),
  items: [CartItemSchema],
  totalItems: Number,
  subtotal: Number,
  appliedCoupons: [CouponSchema],
  isActive: Boolean,
  lastActivity: Date,
  shippingAddress: AddressSchema
}
```

### 6. **Reviews Collection** (`Review.js`) - NEW
**Purpose**: Product and shop review system

**Key Features**:
- Product and shop reviews
- Rating aggregation
- Moderation system
- Helpful votes
- Purchase verification

**Key Fields**:
```javascript
{
  productId: ObjectId (ref: Product),
  userId: ObjectId (ref: User),
  shopId: ObjectId (ref: Shop),
  rating: Number (1-5),
  title: String,
  comment: String,
  isVerified: Boolean,
  isHelpful: Number,
  helpfulVotes: [VoteSchema],
  status: ['pending', 'approved', 'rejected'],
  images: [String],
  tags: [String],
  isVerifiedPurchase: Boolean
}
```

### 7. **Follows Collection** (`Follow.js`) - NEW
**Purpose**: Shop following system

**Key Features**:
- Shop following/unfollowing
- Notification preferences
- Follower analytics
- Trending shops
- Mutual followers

**Key Fields**:
```javascript
{
  followerId: ObjectId (ref: User),
  shopId: ObjectId (ref: Shop),
  followedAt: Date,
  notifications: {
    newProducts: Boolean,
    offers: Boolean,
    updates: Boolean
  },
  isActive: Boolean
}
```

## Database Relationships

### One-to-Many Relationships
- **User → Products**: One vendor can have many products
- **User → Orders**: One customer can have many orders
- **Shop → Products**: One shop can have many products
- **Shop → Reviews**: One shop can have many reviews
- **Product → Reviews**: One product can have many reviews

### Many-to-Many Relationships
- **Users ↔ Shops**: Users can follow multiple shops, shops can have multiple followers
- **Users ↔ Products**: Users can have multiple products in wishlist, products can be in multiple wishlists

### Complex Relationships
- **Orders**: Connect customers, vendors, products, and shops
- **Cart**: Connect users with products from multiple vendors
- **Reviews**: Connect users, products, and shops

## Key Features Implemented

### 1. **Shop Listing System**
- **Location-based search**: Geospatial queries for nearby shops
- **Category filtering**: Filter shops by clothing categories
- **Rating and popularity**: Sort by ratings and follower count
- **Search functionality**: Text search across shop names and descriptions
- **Pagination**: Efficient loading of shop lists

### 2. **Advanced Product Management**
- **Product variants**: Size, color, and stock management
- **Inventory tracking**: Real-time stock updates
- **SEO optimization**: Slugs, keywords, and meta descriptions
- **Rating aggregation**: Automatic calculation of product ratings
- **Sales analytics**: View counts, sales counts, and popularity metrics

### 3. **Comprehensive Order System**
- **Multi-vendor orders**: Single order with items from multiple vendors
- **Status tracking**: Detailed order status with audit trail
- **Payment integration**: Support for multiple payment gateways
- **Vendor-specific views**: Each vendor sees only their order items
- **Invoice generation**: Automatic invoice creation

### 4. **Shopping Cart System**
- **Persistent storage**: Cart data survives browser sessions
- **Multi-vendor support**: Items from different vendors in same cart
- **Stock validation**: Real-time stock checking
- **Coupon support**: Discount and coupon application
- **Cart analytics**: User behavior tracking

### 5. **Review and Rating System**
- **Product reviews**: Detailed product feedback
- **Shop reviews**: Shop-level ratings and reviews
- **Moderation**: Admin approval system
- **Helpful votes**: Community-driven review quality
- **Purchase verification**: Verified purchase badges

### 6. **Shop Following System**
- **Follow/unfollow**: User engagement with shops
- **Notifications**: Configurable notification preferences
- **Analytics**: Follower growth and engagement metrics
- **Trending shops**: Popular shops discovery
- **Mutual followers**: Social features

## Performance Optimizations

### Indexing Strategy
- **Text search indexes**: For product and shop search
- **Geospatial indexes**: For location-based queries
- **Compound indexes**: For complex filtering
- **Unique indexes**: For data integrity
- **Sparse indexes**: For optional fields

### Query Optimization
- **Aggregation pipelines**: For complex analytics
- **Population strategies**: Efficient data loading
- **Pagination**: Limit and skip for large datasets
- **Caching considerations**: For frequently accessed data

### Data Integrity
- **Validation**: Comprehensive field validation
- **References**: Proper foreign key relationships
- **Atomic operations**: For stock updates and counters
- **Pre-save hooks**: Automatic data processing

## Security Features

### Authentication & Authorization
- **Password hashing**: Bcrypt with configurable rounds
- **Role-based access**: Customer, vendor, admin roles
- **JWT tokens**: Secure session management
- **Input validation**: Comprehensive data validation

### Data Protection
- **Sensitive data exclusion**: Passwords and tokens not returned
- **Public profiles**: Sanitized data for public access
- **Audit trails**: Complete action logging
- **Rate limiting**: API abuse prevention

## Usage Examples

### Creating a Shop
```javascript
const shop = new Shop({
  name: "Fashion Hub",
  ownerId: vendorUserId,
  description: "Premium clothing store",
  address: {
    street: "123 Main St",
    city: "Bangalore",
    state: "Karnataka",
    zipCode: "560001"
  },
  location: {
    type: 'Point',
    coordinates: [77.5946, 12.9716] // longitude, latitude
  },
  categories: ['mens-wear', 'womens-wear'],
  contact: {
    phone: "+91-9876543210",
    email: "contact@fashionhub.com"
  }
});
await shop.save();
```

### Adding Products to Shop
```javascript
const product = new Product({
  name: "Cotton T-Shirt",
  description: "Comfortable cotton t-shirt",
  price: 599,
  originalPrice: 799,
  category: "clothing",
  vendorId: vendorUserId,
  shopId: shopId,
  stock: 50,
  images: ["image1.jpg", "image2.jpg"],
  variants: [
    {
      size: "M",
      color: "Blue",
      stock: 20,
      price: 599
    }
  ],
  availableSizes: ["S", "M", "L", "XL"],
  availableColors: ["Blue", "Red", "Black"]
});
await product.save();
```

### Customer Following a Shop
```javascript
const follow = new Follow({
  followerId: customerUserId,
  shopId: shopId,
  notifications: {
    newProducts: true,
    offers: true,
    updates: false
  }
});
await follow.save();
```

### Creating an Order
```javascript
const order = new Order({
  customerId: customerUserId,
  items: [{
    productId: productId,
    vendorId: vendorUserId,
    shopId: shopId,
    quantity: 2,
    price: 599,
    productSnapshot: {
      name: "Cotton T-Shirt",
      images: ["image1.jpg"],
      category: "clothing"
    }
  }],
  shippingAddress: {
    street: "456 Customer St",
    city: "Mumbai",
    state: "Maharashtra",
    zipCode: "400001",
    phone: "+91-9876543210"
  },
  paymentMethod: "card"
});
await order.calculateTotals();
await order.save();
```

## Migration Strategy

### Phase 1: Core Models
1. Update existing User model
2. Create Shop model
3. Enhance Product model
4. Update Order model

### Phase 2: New Features
1. Create Cart model
2. Create Review model
3. Create Follow model

### Phase 3: Integration
1. Update API routes
2. Add new endpoints
3. Update frontend integration
4. Data migration scripts

## Monitoring and Analytics

### Key Metrics
- **Shop performance**: Sales, ratings, followers
- **Product analytics**: Views, sales, reviews
- **User engagement**: Cart activity, orders, reviews
- **System performance**: Query times, index usage

### Health Checks
- **Database connectivity**: Connection monitoring
- **Index performance**: Query execution plans
- **Data integrity**: Reference validation
- **Storage usage**: Collection sizes and growth

This database design provides a solid foundation for LocalThread's marketplace functionality with room for future enhancements and scalability. 