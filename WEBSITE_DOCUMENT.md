# E-Commerce Platform Documentation

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [System Architecture](#3-system-architecture)
4. [Database Schema](#4-database-schema)
5. [API Endpoints](#5-api-endpoints)
6. [Frontend Structure](#6-frontend-structure)
7. [Authentication Flow](#7-authentication-flow)
8. [Payment Integration](#8-payment-integration)
9. [Email & SMS Services](#9-email--sms-services)
10. [Deployment Guide](#10-deployment-guide)
11. [Troubleshooting](#11-troubleshooting)
12. [Future Enhancements](#12-future-enhancements)

---

## 1. Project Overview

### 1.1 Purpose
A full-featured e-commerce platform with admin dashboard, user authentication, product management, and payment processing.

### 1.2 Key Features
- User authentication (Email/Google OAuth)
- Product catalog with categories
- Shopping cart and wishlist
- Order management
- Payment processing (Stripe/Razorpay)
- Admin dashboard
- Email notifications
- SMS OTP verification
- PDF invoice generation
- Product reviews and ratings
- Coupon and discount system
- User behavior tracking
- Recommendation system

---

## 2. Technology Stack

### 2.1 Frontend
- **Framework**: React 18.2.0
- **Build Tool**: Vite 7.0.4
- **State Management**: React Context API
- **Routing**: React Router DOM 7.7.0
- **UI Components**: Custom components with CSS modules
- **HTTP Client**: Axios 1.7.2
- **Form Handling**: React Hook Form
- **Charts**: Chart.js, Recharts
- **Icons**: React Icons, Lucide React
- **Animations**: Framer Motion

### 2.2 Backend
- **Runtime**: Node.js
- **Framework**: Express.js 5.1.0
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT, Google OAuth 2.0
- **File Upload**: Multer
- **PDF Generation**: PDFKit
- **Email**: Nodemailer
- **SMS**: Twilio/Fast2SMS/MSG91
- **Payments**: Stripe, Razorpay
- **Scheduling**: node-cron
- **Validation**: express-validator

### 2.3 Development Tools
- **Version Control**: Git
- **Package Manager**: npm
- **Environment Management**: dotenv
- **API Testing**: Postman/Thunder Client
- **Code Quality**: ESLint, Prettier

---

## 3. System Architecture

### 3.1 High-Level Architecture
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│             │    │             │    │             │
│  Frontend   │◄──►│   Backend   │◄──►│  Database   │
│  (React)    │    │  (Node.js/  │    │  (MongoDB)  │
│             │    │   Express)  │    │             │
└──────┬──────┘    └──────┬──────┘    └─────────────┘
       │                  │
       ▼                  ▼
┌─────────────┐    ┌─────────────┐
│             │    │             │
│  External   │    │  Payment    │
│  Services   │    │  Gateways   │
│  (Email/SMS)│    │  (Stripe/   │
│             │    │   Razorpay) │
└─────────────┘    └─────────────┘
```

### 3.2 Directory Structure

#### Backend
```
Ecommerce-Backend/
├── Controllers/     # Route controllers
├── Models/          # MongoDB schemas
├── Routers/         # API routes
├── Middleware/      # Custom middleware
├── Services/        # Business logic
├── Utils/           # Helper functions
├── DB_Connection/   # Database connection
└── uploads/         # File uploads
```

#### Frontend
```
Ecommerce-Frontend/
├── public/          # Static files
└── src/
    ├── Components/  # Reusable components
    ├── Pages/       # Page components
    ├── Context/     # React context
    ├── Assets/      # Images, styles
    ├── Utils/       # Helper functions
    └── Services/    # API services
```

---

## 4. Database Schema

### 4.1 Collections

#### Users
```javascript
{
  name: String,
  email: { type: String, unique: true },
  password: String,
  phone: String,
  addresses: [{
    type: { type: String }, // home/office/other
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
    isDefault: Boolean
  }],
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isEmailVerified: Boolean,
  googleId: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### Products
```javascript
{
  name: String,
  description: String,
  price: Number,
  comparePrice: Number,
  category: String,
  subCategory: String,
  brand: String,
  images: [String],
  stock: Number,
  sku: String,
  barcode: String,
  weight: Number,
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  },
  isActive: Boolean,
  featured: Boolean,
  tags: [String],
  attributes: [{
    name: String,
    value: String
  }],
  ratings: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: Number,
    review: String,
    createdAt: Date
  }],
  averageRating: Number,
  reviewCount: Number
}
```

#### Orders
```javascript
{
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  orderNumber: String,
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    quantity: Number,
    price: Number,
    image: String,
    variant: String
  }],
  shippingAddress: {
    name: String,
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
    phone: String
  },
  paymentMethod: String,
  paymentResult: {
    id: String,
    status: String,
    update_time: String,
    email_address: String
  },
  itemsPrice: Number,
  taxPrice: Number,
  shippingPrice: Number,
  totalPrice: Number,
  couponApplied: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },
  discountAmount: Number,
  isPaid: Boolean,
  paidAt: Date,
  isDelivered: Boolean,
  deliveredAt: Date,
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending'
  },
  trackingNumber: String,
  carrier: String
}
```

#### Carts
```javascript
{
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    quantity: { type: Number, default: 1 },
    price: Number,
    image: String,
    variant: String
  }],
  coupon: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },
  totalPrice: Number,
  totalItems: Number,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

#### Coupons
```javascript
{
  code: { type: String, unique: true, uppercase: true },
  description: String,
  discountType: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
  discountValue: Number,
  minPurchase: Number,
  maxDiscount: Number,
  startDate: Date,
  endDate: Date,
  isActive: Boolean,
  usageLimit: Number,
  usedCount: { type: Number, default: 0 },
  usersUsed: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  categories: [String],
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

#### Offers
```javascript
{
  name: String,
  description: String,
  type: { type: String, enum: ['product', 'category', 'order'] },
  discountType: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
  discountValue: Number,
  minPurchase: Number,
  maxDiscount: Number,
  startDate: Date,
  endDate: Date,
  isActive: Boolean,
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  categories: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

---

## 5. API Endpoints

### 5.1 Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/google` - Google OAuth login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/update-profile` - Update user profile
- `PUT /api/auth/update-password` - Update password

### 5.2 Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)
- `POST /api/products/:id/reviews` - Add product review

### 5.3 Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:itemId` - Update cart item quantity
- `DELETE /api/cart/:itemId` - Remove item from cart
- `POST /api/cart/apply-coupon` - Apply coupon to cart
- `DELETE /api/cart/remove-coupon` - Remove coupon from cart

### 5.4 Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id/pay` - Update order to paid
- `PUT /api/orders/:id/deliver` - Update order to delivered (admin)
- `PUT /api/orders/:id/cancel` - Cancel order
- `POST /api/orders/:id/refund` - Request refund

### 5.5 Payments
- `POST /api/payments/create-payment-intent` - Create payment intent (Stripe)
- `POST /api/payments/process-payment` - Process payment
- `POST /api/payments/webhook` - Stripe webhook
- `POST /api/payments/create-razorpay-order` - Create Razorpay order
- `POST /api/payments/verify-razorpay-payment` - Verify Razorpay payment

### 5.6 Admin
- `GET /api/admin/orders` - Get all orders (admin)
- `GET /api/admin/users` - Get all users (admin)
- `PUT /api/admin/users/:id` - Update user (admin)
- `DELETE /api/admin/users/:id` - Delete user (admin)
- `GET /api/admin/stats` - Get sales statistics (admin)
- `POST /api/admin/upload` - Upload image (admin)

---

## 6. Frontend Structure

### 6.1 Key Components

#### Layout
- `Header` - Main navigation and search
- `Footer` - Site links and information
- `Sidebar` - Admin dashboard navigation
- `Layout` - Main layout wrapper

#### Pages
- `Home` - Landing page with featured products
- `Shop` - Product listing with filters
- `Product` - Product details page
- `Cart` - Shopping cart
- `Checkout` - Checkout process
- `Login/Register` - Authentication forms
- `User Dashboard` - User profile and orders
- `Admin Dashboard` - Admin control panel

#### Reusable Components
- `ProductCard` - Display product in grid/list
- `Rating` - Star rating display
- `QuantitySelector` - Product quantity selector
- `Pagination` - Page navigation
- `Modal` - Reusable modal dialog
- `Alert` - Notification messages
- `LoadingSpinner` - Loading indicator

### 6.2 State Management
- **React Context API** for global state
- **useReducer** for complex state logic
- **Local Storage** for cart persistence

### 6.3 Routing
- Public routes (Home, Shop, Product, etc.)
- Protected routes (User Dashboard, Checkout)
- Admin routes (Admin Dashboard, Product Management)

---

## 7. Authentication Flow

### 7.1 User Registration
1. User fills registration form
2. Form validation on client-side
3. API call to `/api/auth/register`
4. Send verification email
5. User verifies email
6. Account created successfully

### 7.2 User Login
1. User enters credentials
2. Form validation
3. API call to `/api/auth/login`
4. Server validates credentials
5. JWT token generated and sent to client
6. Token stored in HTTP-only cookie
7. User redirected to dashboard

### 7.3 Google OAuth
1. User clicks "Sign in with Google"
2. Redirect to Google consent screen
3. User grants permission
4. Google sends authorization code
5. Server exchanges code for user info
6. Create/update user in database
7. Generate JWT token and log user in

### 7.4 Password Reset
1. User clicks "Forgot Password"
2. Enters email address
3. Server generates reset token
4. Sends email with reset link
5. User clicks link and enters new password
6. Server validates token and updates password

---

## 8. Payment Integration

### 8.1 Stripe
1. Client creates payment intent
2. Server confirms payment
3. Process payment with Stripe
4. Update order status
5. Send confirmation email

### 8.2 Razorpay
1. Create Razorpay order
2. Open Razorpay checkout
3. Process payment
4. Verify payment signature
5. Update order status

### 8.3 Refund Process
1. User requests refund
2. Admin reviews request
3. Process refund through payment gateway
4. Update order status
5. Notify user via email

---

## 9. Email & SMS Services

### 9.1 Email Templates
- Welcome email
- Order confirmation
- Payment confirmation
- Shipping confirmation
- Password reset
- Account verification
- Order cancellation
- Refund processed

### 9.2 SMS Notifications
- OTP verification
- Order confirmation
- Shipping updates
- Payment reminders
- Promotional messages

### 9.3 Service Providers
- **Email**: Nodemailer with Gmail/SendGrid
- **SMS**: Twilio (global), Fast2SMS (India), MSG91 (India)

---

## 10. Deployment Guide

### 10.1 Prerequisites
- Node.js (v16+)
- MongoDB Atlas account
- Domain name (for production)
- SSL certificate (Let's Encrypt)

### 10.2 Environment Variables
Create `.env` files for both frontend and backend with required variables.

### 10.3 Backend Deployment
1. Install dependencies: `npm install`
2. Build for production: `npm run build`
3. Start server: `npm start`
4. Use PM2 for process management:
   ```bash
   npm install -g pm2
   pm2 start server.js --name "ecommerce-backend"
   pm2 save
   pm2 startup
   ```

### 10.4 Frontend Deployment
1. Install dependencies: `npm install`
2. Build for production: `npm run build`
3. Deploy `dist` folder to hosting service:
   - Vercel
   - Netlify
   - AWS S3 + CloudFront
   - Nginx

### 10.5 Domain Setup
1. Point domain to hosting server
2. Configure SSL (Let's Encrypt)
3. Set up redirects
4. Configure CORS on backend

### 10.6 Monitoring
- Uptime monitoring
- Error tracking (Sentry)
- Performance monitoring
- Log management

---

## 11. Troubleshooting

### 11.1 Common Issues
- **MongoDB connection failed**: Check connection string and network access
- **JWT errors**: Verify secret key and token expiration
- **File upload issues**: Check multer configuration and file size limits
- **Email not sending**: Verify SMTP settings and credentials
- **Payment failures**: Check payment gateway logs and API keys
- **CORS errors**: Configure CORS middleware properly

### 11.2 Debugging
1. Check server logs
2. Test API endpoints with Postman
3. Verify environment variables
4. Check database connection
5. Test in development mode

### 11.3 Performance Optimization
- Implement caching (Redis)
- Optimize database queries
- Use pagination for large datasets
- Compress responses
- Enable GZIP compression
- Optimize images
- Use CDN for static assets

---

## 12. Third-Party Integrations

### 12.1 Payment Gateway

#### Stripe
- **Purpose**: Process credit/debit card payments
- **Implementation**:
  - Server-side: `stripe` npm package
  - Client-side: `@stripe/stripe-js` and `@stripe/react-stripe-js`
- **Key Features**:
  - Secure payment processing
  - Support for multiple payment methods
  - Subscription billing
  - Webhook integration for payment events
- **Setup**:
  1. Create Stripe account at https://dashboard.stripe.com/register
  2. Get API keys (publishable and secret keys)
  3. Configure webhook endpoint for payment events
  4. Install required packages
- **Environment Variables**:
  ```
  STRIPE_SECRET_KEY=sk_test_...
  STRIPE_WEBHOOK_SECRET=whsec_...
  ```

### 12.2 Authentication

#### Google OAuth 2.0
- **Purpose**: Social login and user authentication
- **Implementation**: `google-auth-library` (server) + Google Identity Services (client)
- **Setup**:
  1. Create project at https://console.cloud.google.com/
  2. Enable Google+ API
  3. Configure OAuth consent screen
  4. Create OAuth 2.0 credentials
  5. Add authorized redirect URIs
- **Environment Variables**:
  ```
  GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
  GOOGLE_CLIENT_SECRET=GOCSPX-xxx
  ```

#### JWT (JSON Web Tokens)
- **Purpose**: Secure API authentication
- **Implementation**: `jsonwebtoken` package
- **Features**:
  - Stateless authentication
  - Token expiration
  - Role-based access control
- **Environment Variables**:
  ```
  JWT_SECRET=your_secure_secret_key_min_32_chars
  JWT_EXPIRE=30d
  JWT_COOKIE_EXPIRE=30
  ```

### 12.3 Email Service

#### Nodemailer with Gmail
- **Purpose**: Send transactional emails
- **Implementation**: `nodemailer` package
- **Features**:
  - HTML email templates
  - File attachments
  - Bulk email sending
- **Setup**:
  1. Enable 2FA on Google account
  2. Generate App Password
- **Environment Variables**:
  ```
  EMAIL_HOST=smtp.gmail.com
  EMAIL_PORT=587
  EMAIL_USER=your-email@gmail.com
  EMAIL_PASSWORD=your_app_password
  ```

### 12.4 SMS Services

#### Twilio (Global)
- **Purpose**: Send SMS/OTP globally
- **Implementation**: `twilio` npm package
- **Features**:
  - Global coverage
  - Phone number verification
  - Two-factor authentication
- **Environment Variables**:
  ```
  TWILIO_ACCOUNT_SID=ACxxx
  TWILIO_AUTH_TOKEN=xxx
  TWILIO_PHONE_NUMBER=+1234567890
  ```

### 12.5 Database

#### MongoDB Atlas
- **Purpose**: Cloud database service
- **Implementation**: `mongoose` ODM
- **Features**:
  - Fully managed database
  - Automated backups
  - Horizontal scaling
- **Setup**:
  1. Create free cluster at https://www.mongodb.com/cloud/atlas
  2. Create database user
  3. Whitelist IP addresses
  4. Get connection string
- **Environment Variables**:
  ```
  MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority
  ```

### 12.8 Monitoring

#### Sentry
- **Purpose**: Error tracking and performance monitoring
- **Implementation**: `@sentry/nextjs`
- **Environment Variables**:
  ```
  NEXT_PUBLIC_SENTRY_DSN=xxx
  SENTRY_ORG=your-org
  SENTRY_PROJECT=your-project
  SENTRY_AUTH_TOKEN=xxx
  ```

## 13. Future Enhancements

### 13.1 Features
- Multi-vendor support
- Subscription model
- Loyalty program
- Gift cards
- Multi-currency support
- Multi-language support
- Advanced search with filters
- Product comparison
- Wishlist sharing
- Social login (Facebook, Apple)
- Push notifications
- Live chat support
- AR product preview
- Voice search
- AI-powered recommendations

### 12.2 Technical Improvements
- Migrate to TypeScript
- Implement GraphQL API
- Add unit and integration tests
- Implement CI/CD pipeline
- Containerize with Docker
- Implement microservices architecture
- Add API documentation (Swagger/OpenAPI)
- Implement rate limiting
- Add request validation
- Improve error handling

### 12.3 Performance
- Implement server-side rendering (Next.js)
- Add service workers for offline support
- Optimize image loading
- Implement code splitting
- Add lazy loading
- Optimize bundle size
- Implement caching strategies

### 12.4 Security
- Implement rate limiting
- Add request validation
- Implement CSRF protection
- Add security headers
- Regular security audits
- Dependency updates
- Penetration testing

---

## Conclusion

This documentation provides a comprehensive overview of the e-commerce platform. It covers the technology stack, system architecture, database schema, API endpoints, frontend structure, authentication flow, payment integration, and deployment process. Use this as a reference for development, maintenance, and onboarding new team members.

For any questions or issues, please refer to the project's GitHub repository.
