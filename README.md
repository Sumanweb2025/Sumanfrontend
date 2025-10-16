# Iyappaa Website Frontend - Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Architecture](#project-architecture)
4. [Folder Structure](#folder-structure)
5. [Key Features](#key-features)
6. [Authentication System](#authentication-system)
7. [API Integration](#api-integration)
8. [Payment Integration](#payment-integration)
9. [Routing Structure](#routing-structure)
10. [State Management](#state-management)
11. [Component Architecture](#component-architecture)
12. [Environment Setup](#environment-setup)
13. [Installation & Development](#installation--development)
14. [Build & Deployment](#build--deployment)

---

## Project Overview

**Iyappaa Website** is a modern React-based ecommerce platform for traditional Indian snacks, sweets, and groceries across 4 brands: **Iyappaa**, **Amirth**, **Venba**, and **Little Krishna**.

### Tech Summary
- **Framework**: React 19.1.0 + Vite 7.0.4
- **Language**: JavaScript (ES6+)
- **Build Tool**: Vite (Lightning-fast HMR)
- **Deployment**: Netlify-ready

---

## Technology Stack

### Core Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.1.0 | UI framework with concurrent features |
| **React DOM** | 19.1.0 | DOM rendering |
| **Vite** | 7.0.4 | Build tool & dev server |
| **React Router DOM** | 7.7.0 | Client-side routing |
| **Axios** | 1.11.0 | HTTP client for API calls |

### UI & Styling
| Package | Purpose |
|---------|---------|
| **Custom CSS** | Component-scoped styling |
| **React Icons** 5.5.0 | Icon library |
| **Lucide React** 0.539.0 | Modern icons |
| **Framer Motion** 12.23.9 | Animations & transitions |
| **React Spinners** 0.17.0 | Loading indicators |

### Authentication & Authorization
| Package | Purpose |
|---------|---------|
| **@react-oauth/google** 0.12.2 | Google OAuth integration |
| **JWT** | Token-based authentication |

### Payment Processing
| Package | Purpose |
|---------|---------|
| **@stripe/react-stripe-js** 3.9.0 | Stripe payment UI |
| **@stripe/stripe-js** 7.8.0 | Stripe.js library |

### Form & Location Services
| Package | Purpose |
|---------|---------|
| **Country-State-City** 3.2.1 | Location data |
| **React Country State City** 1.1.12 | Dropdowns for country/state/city |
| **React Phone Input 2** 2.15.1 | Phone number input |
| **React Select** 5.10.2 | Custom select components |

### Data Visualization (Admin)
| Package | Purpose |
|---------|---------|
| **Chart.js** 4.5.0 | Charts for analytics |
| **React Chart.js 2** 5.3.0 | React wrapper |
| **Recharts** 3.1.2 | Alternative charting |

### Notifications
| Package | Purpose |
|---------|---------|
| **React Toastify** 11.0.5 | Toast notifications |

---

## Project Architecture

### Architecture Pattern
**Component-Based Architecture** with:
- Separation of concerns (Pages vs Components)
- Unidirectional data flow (Props down, events up)
- localStorage for client-side persistence
- RESTful API integration

### Application Flow
```
Entry Point (main.jsx)
    ↓
App.jsx (Router Setup)
    ↓
┌──────────────┬───────────────┬──────────────┐
│ Public Pages │  Auth Pages   │ Admin Pages  │
│ - Home       │  - SignIn     │ - Dashboard  │
│ - Categories │  - SignUp     │ - Management │
│ - Brands     │  - Profile    │ - Analytics  │
└──────────────┴───────────────┴──────────────┘
    ↓
Shared Components (Header, Footer, etc.)
    ↓
Backend API (Axios + JWT)
```

---

## Folder Structure

```
Sumanfrontend/
│
├── public/                      # Static assets
│
├── src/
│   ├── assets/                  # Images, logos and additional images
│   │
│   ├── Components/              # 23 Reusable Components
│   │   ├── Admin/              # 9 Admin components
│   │   │   ├── AdminProfile/
│   │   │   ├── Analytics/
│   │   │   ├── Dashboard/
│   │   │   ├── Header/
│   │   │   ├── OrderManagement/
│   │   │   ├── PaymentManagement/
│   │   │   ├── ProductManagement/
|   |   |   |── OfferManagement/
|   |   |   |── CouponManagement/
│   │   │   ├── Sidebar/
│   │   │   └── UserManagement/
│   │   │
│   │   ├── Header/             # Composite header
│   │   ├── TopHeader/          # Top bar
│   │   ├── MainHeader/         # Search, cart, profile
│   │   ├── Navbar/             # Navigation
│   │   ├── Footer/             # Site footer
│   │   │
│   │   ├── Product/            # Product card
│   │   ├── Ourproduct/         # Product showcase
│   │   ├── Ourproduct1/        # Alternative display
│   │   ├── Gudproduct/         # Featured products
│   │   │
│   │   ├── Iyyapa/             # Brand: Iyappaa
│   │   ├── Amirth/             # Brand: Amirth
│   │   ├── Venba/              # Brand: Venba
│   │   ├── LittleKrishna/      # Brand: Little Krishna
│   │   │
│   │   ├── CartPopup/          # Cart modal
│   │   ├── WishlistPopup/      # Wishlist modal
│   │   ├── GuestPopup/         # Guest welcome
│   │   │
│   │   ├── Payments/           # Stripe integration
│   │   ├── LoadingSpinner/     # Loading UI
│   │   ├── ScrolltoTop/        # Scroll utility
│   │   ├── ShippingBanner/     # Shipping info
│   │   ├── Testimonials/       # Reviews
│   │   └── Offer/              # Offers section
│   │
│   ├── Pages/                  # 18 Route Pages
│   │   ├── Home/               # Homepage
│   │   │
│   │   ├── Sweets/             # Category pages
│   │   ├── Snacks/
│   │   ├── Groceries/
│   │   │
│   │   ├── ProductDetailsPage/ # Individual product
│   │   │
│   │   ├── Signin/             # Authentication
│   │   ├── Signup/
│   │   ├── ForgotPassword/
│   │   ├── ResetPassword/
│   │   ├── OTPVerification/
│   │   │
│   │   ├── Profile/            # User pages
│   │   ├── Cart/
│   │   ├── Wishlist/
│   │   ├── CheckOut/
│   │   ├── Myorders/
│   │   ├── OrderTracking/
│   │   │
│   │   ├── Contact/            # Static pages
│   │   ├── Aboutus/
│   │   │
│   │   ├── AdminDashboard/     # Admin pages
│   │   └── AdminLogin/
│   │
│   ├── App.jsx                 # Main app + routes
│   ├── App.css                 # Global styles
│   ├── main.jsx                # Entry point
│   └── index.css               # CSS reset
│
├── index.html                  # HTML template
├── vite.config.js              # Vite config
├── package.json                # Dependencies
├── netlify.toml                # Deployment config
└── .env                        # Environment variables
```

---

## Key Features

### 1. Multi-Brand Ecommerce Platform
- **4 Brands**: Iyappaa, Amirth, Venba, Little Krishna
- **3 Categories**: Sweets, Snacks, Groceries
- Brand-specific landing pages

### 2. Dual Authentication System
- **Local Auth**: Email/password with JWT
- **Google OAuth**: One-click sign-in
- **Guest Mode**: Shop without account
- **Password Recovery**: OTP-based reset

### 3. Complete Shopping Experience
- **Product Browsing**: Category/brand navigation, search
- **Product Details**: Images, description, ingredients, reviews
- **Shopping Cart**: Add/remove, quantity update, price calculation
- **Wishlist**: Save favorites for later
- **Real-time Counts**: Cart & wishlist badges

### 4. Advanced Checkout
- **Multi-step Process**: Contact → Address → Payment
- **Dynamic Location**: Country/state/city dropdowns
- **Payment Options**: 
  - Stripe (Credit/Debit cards)
  - Cash on Delivery (COD)
- **Coupon System**: Apply discounts
- **Free Shipping**: Orders over $75

### 5. Order Management
- **Order History**: View all orders
- **Order Tracking**: Real-time status updates
- **Order Details**: Full order information
- **Invoice Download**: PDF invoices (backend)

### 6. Admin Dashboard
- **Dashboard**: Sales analytics, charts
- **User Management**: View/manage users
- **Product Management**: CRUD operations
- **Order Management**: Process orders, update status
- **Payment Tracking**: Transaction history
- **Analytics**: Revenue reports, trends

### 7. UX Features
- **Responsive Design**: Mobile/tablet/desktop
- **Loading States**: Spinners during data fetch
- **Toast Notifications**: Success/error messages
- **Smooth Animations**: Framer Motion transitions
- **Image Carousel**: Auto-play home slider
- **Modal Dialogs**: Confirmations, forms
- **Scroll to Top**: Quick navigation

---

## Authentication System

### Authentication Methods

#### 1. Local Authentication
```javascript
// Sign Up
POST /api/auth/signup
Body: { email, password, name, phone }
Response: { token, user }

// Sign In
POST /api/auth/login
Body: { email, password }
Response: { token, user }
```

#### 2. Google OAuth
```javascript
// Google Sign-In flow
1. User clicks Google button
2. Google OAuth popup
3. Receive credential token
4. POST /api/auth/google-login
5. Backend validates & returns JWT
6. Store token & user data
```

#### 3. Guest Mode
```javascript
// Guest session
localStorage.setItem('userType', 'guest');
localStorage.setItem('guestSessionId', 'guest_<timestamp>_<random>');
// Limited features, prompted to sign up at checkout
```

### Authentication Storage
```javascript
// LocalStorage keys
'token'              // JWT token
'user'               // User object (JSON)
'userType'           // 'guest' or undefined
'guestSessionId'     // Guest session ID
'adminToken'         // Admin JWT
```

### Password Recovery Flow
```
1. Forgot Password → Email OTP
2. Verify OTP → Validation
3. Reset Password → Update password
```

---

## API Integration

### API Configuration
```javascript
// Environment variable
const API_URL = import.meta.env.VITE_APP_API_URL;

// Development: http://localhost:5000/
// Production: https://api.iyappaa.com/
```

### HTTP Client (Axios)
```javascript
import axios from 'axios';
```

### API Endpoints Used

#### Authentication
- `POST /api/auth/signup` - Register user
- `POST /api/auth/login` - Login user
- `POST /api/auth/google-login` - Google OAuth
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/forgot-password` - Request OTP
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/reset-password` - Reset password

#### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `GET /api/products/category/:category` - Get by category
- `GET /api/products/brand/:brand` - Get by brand

#### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart` - Add to cart
- `PUT /api/cart/:productId` - Update quantity
- `DELETE /api/cart/:productId` - Remove from cart
- `DELETE /api/cart` - Clear cart

#### Wishlist
- `GET /api/wishlist` - Get wishlist
- `POST /api/wishlist` - Add to wishlist
- `DELETE /api/wishlist/:productId` - Remove from wishlist

#### Orders
- `GET /api/orders` - Get user orders
- `GET /api/orders/:orderId` - Get order details
- `POST /api/orders` - Create order

#### Payments
- `POST /api/payments/create-intent` - Create Stripe payment intent
- `POST /api/payments/stripe-webhook` - Stripe webhook
- `POST /api/payments/cod` - Cash on delivery

#### Admin
- `GET /api/admin/users` - Get all users
- `GET /api/admin/products` - Manage products
- `GET /api/admin/orders` - Manage orders
- `GET /api/admin/analytics` - Get analytics data

---

## Payment Integration

### Payment Methods

#### 1. Stripe (Credit/Debit Cards)
```javascript
// Initialize Stripe
import { loadStripe } from '@stripe/stripe-js';

// Payment flow
1. Create payment intent (backend)
2. Confirm payment with card details
3. Verify payment status
4. Create order on success
```

#### 2. Cash on Delivery (COD)
```javascript
// Direct order creation
POST /api/payments/cod
Body: { orderData, billingAddress }
Response: { orderId, orderNumber }
```

### Stripe Integration Details
- **Elements**: `CardElement` for card input
- **Payment Intent**: Server-side amount calculation
- **3D Secure**: Built-in SCA support
- **Error Handling**: Card errors, network issues

### Shipping Calculation
```javascript
// Free shipping logic
const shippingCost = subtotal >= 75 ? 0 : 9.99;
```

---

## Routing Structure

### Complete Routes (30 routes)

```javascript
// Public Routes
/                           → Home
/sweets                     → Sweets category
/snacks                     → Snacks category
/groceries                  → Groceries category
/product/:id                → Product details
/brands/iyappaa             → Iyappaa brand
/brands/amrith              → Amirth brand
/brands/venba               → Venba brand
/brands/little-krishna      → Little Krishna brand
/contact                    → Contact page
/aboutus                    → About us

// Authentication Routes
/signin                     → Sign in
/signup                     → Sign up
/forgot-password            → Forgot password
/reset-password             → Reset password
/verify-otp                 → OTP verification

// User Routes (Protected)
/profile                    → User profile
/cart                       → Shopping cart
/wishlist                   → Wishlist
/checkout                   → Checkout
/myorders                   → Order history
/track-order                → Order tracking

// Admin Routes (Protected)
/admin/login                → Admin login
/admin/dashboard            → Admin dashboard
/admin/profile              → Admin profile
```

### Router Implementation
```javascript
// App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
```

---

## State Management

### Approach
**Local Component State + localStorage** (No Redux/Context API)

### Patterns Used

#### 1. Local State (useState)
```javascript
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
```

#### 2. localStorage Persistence
```javascript
// Save
localStorage.setItem('user', JSON.stringify(userData));

// Load
const user = JSON.parse(localStorage.getItem('user'));
```

#### 3. Custom Events (Cross-component communication)
```javascript
// Emit
window.dispatchEvent(new Event('cartUpdated'));

// Listen
window.addEventListener('cartUpdated', handleCartUpdate);
```

#### 4. Effect Hooks
```javascript
useEffect(() => {
  fetchData();
}, [dependency]); // Re-run when dependency changes
```

### Common State Patterns

#### Loading Pattern
```javascript
const [loading, setLoading] = useState(true);

useEffect(() => {
  setLoading(true);
  fetchData().finally(() => setLoading(false));
}, []);

if (loading) return <LoadingSpinner />;
```

#### Form State Pattern
```javascript
const [formData, setFormData] = useState({ email: '', password: '' });
const [errors, setErrors] = useState({});

const handleChange = (e) => {
  setFormData({ ...formData, [e.target.name]: e.target.value });
};
```

#### Modal Pattern
```javascript
const [showModal, setShowModal] = useState(false);
const [modalData, setModalData] = useState(null);

const openModal = (data) => {
  setModalData(data);
  setShowModal(true);
};
```

---

## Component Architecture

### Component Categories

#### 1. Layout Components
- **Header**: TopHeader + MainHeader + Navbar
- **Footer**: Site footer with links
- **ScrollToTop**: Auto-scroll on route change

#### 2. Feature Components
- **Product**: Product card display
- **CartPopup**: Quick cart view
- **WishlistPopup**: Quick wishlist view
- **GuestPopup**: Guest welcome modal
- **LoadingSpinner**: Loading indicator

#### 3. Brand Components
- **Iyyapa, Amirth, Venba, LittleKrishna**: Brand-specific layouts

#### 4. Admin Components (9 components)
- **Dashboard**: Overview with stats
- **UserManagement**: CRUD users
- **ProductManagement**: CRUD products
- **OrderManagement**: Manage orders
- **PaymentManagement**: Track payments
- **OfferManagement**: Manage offers
- **CouponManagement**: Manage discount coupons
- **Analytics**: Charts & reports
- **Header, Sidebar, AdminProfile**: Admin UI

#### 5. Payment Components
- **StripePayments**: Stripe Elements integration

### Component Communication

```
Parent Component
    ↓ (Props)
Child Component
    ↓ (Callback)
Parent Component
    ↓ (Update State)
Re-render
```

### Reusability Principles
- Components accept props for customization
- CSS is component-scoped
- Logic separated from UI where possible
- Common patterns extracted to utilities

---

## Environment Setup

### Environment Variables (.env)

```bash
# API Configuration

# Google OAuth

# Stripe

# Admin API (if different from main API)
```

### Accessing Environment Variables
```javascript
// In code
const apiUrl = import.meta.env.VITE_APP_API_URL;
const googleClientId = import.meta.env.VITE_APP_GOOGLE_CLIENT_ID;
```

**Note**: All env variables must be prefixed with `VITE_` to be exposed to client code.

---

## Installation & Development

### Prerequisites
- **Node.js**: Version 18 or higher
- **npm**: Version 7 or higher

### Installation Steps

```bash
# 1. Clone the repository
git clone <repository-url>
cd Sumanfrontend

# 2. Install dependencies
npm install

# 3. Create .env file
cp .env.example .env
# Edit .env with your configuration

# 4. Start development server
npm run dev
```

### Development Server
```bash
# Start dev server (default: http://localhost:5173)
npm run dev

# The server will auto-reload on file changes
# HMR (Hot Module Replacement) is enabled
```

### Available Scripts

```bash
# Development
npm run dev          # Start dev server

# Production Build
npm run build        # Build for production (output: /dist)

# Preview Production Build
npm run preview      # Preview production build locally

# Linting
npm run lint         # Run ESLint

# Start (for Netlify)
npm start            # Alias for 'npm run preview'
```

### Development URL
- Default: `http://localhost:5173`
- Can be configured in `vite.config.js`

---

## Build & Deployment

### Production Build

```bash
# Create production build
npm run build

# Output directory: /dist
# Contains optimized, minified files
```

### Build Output Structure
```
dist/
├── index.html              # Entry HTML (optimized)
├── assets/                 # Bundled assets
│   ├── index-[hash].js    # Main JavaScript bundle
│   ├── index-[hash].css   # Main CSS bundle
│   └── [images]           # Optimized images
└── ...
```

### Deployment to Hostinger(Check deployment md file)

## Code Patterns & Best Practices

### React Best Practices

#### 1. Component Structure

#### 2. Conditional Rendering

#### 3. Event Handlers

#### 4. Error Handling

### CSS Best Practices

#### 1. Component-Scoped CSS

#### 2. BEM-like Naming
```css
.product-card { }
.product-card__image { }
.product-card__title { }
.product-card--featured { }
```

#### 3. Responsive Design
```css
/* Mobile first */
.component {
  /* Mobile styles */
}

/* Tablet */
@media (min-width: 768px) {
  .component { /* Tablet styles */ }
}

/* Desktop */
@media (min-width: 1024px) {
  .component { /* Desktop styles */ }
}
```

### API Call Best Practices

#### 1. Error Handling

#### 2. Authentication Headers

### Performance Optimization

#### 1. Lazy Loading

#### 2. Memoization

#### 3. Image Optimization
---

## Key Logic Flows

### 1. User Registration & Login Flow
```
User enters details → Validate → POST /api/auth/signup
→ Receive JWT + user data → Store in localStorage
→ Navigate to profile/home
```

### 2. Add to Cart Flow
```
Click "Add to Cart" → Check authentication
→ If guest: use session ID, If user: use token
→ POST /api/cart → Update cart count
→ Emit 'cartUpdated' event → Show toast notification
```

### 3. Checkout Flow
```
View Cart → Click Checkout → Navigate to /checkout
→ Fill billing info → Select payment method
→ If Stripe: Create payment intent → Confirm payment
→ If COD: Direct order creation
→ POST /api/orders → Show success modal → Navigate to order tracking
```

### 4. Order Tracking Flow
```
View Orders → Click order → Navigate to /track-order
→ GET /api/orders/:orderId → Display order status timeline
→ Real-time updates (if implemented)
```

### 5. Admin Dashboard Flow
```
Admin login → Store adminToken → Navigate to /admin/dashboard
→ Fetch analytics data → Display charts
→ Navigate to management sections (Users, Products, Orders)
→ Perform CRUD operations with API calls
```

---

## Common Issues & Solutions

### Issue 1: "Token expired" errors
**Solution**: Implement token refresh or force re-login

### Issue 2: Images not loading
**Solution**: Check image path resolution

### Issue 3: Cart count not updating
**Solution**: Emit custom event after cart update

### Issue 4: CORS errors
**Solution**: Configure backend CORS to allow frontend origin

### Issue 5: Payment processing fails
**Solution**: Verify Stripe keys and check network requests

### Issue 6: Google OAuth not working
**Solution**: Ensure correct Client ID and authorized JavaScript origins

---

## Feature Implementation Details

### Offer System
- **Active Offers Display**: Homepage and product pages show active offers
- **Offer Application**: Automatic discount application at checkout
- **Offer Types**: Percentage discounts, fixed amount discounts, BOGO offers
- **Offer Management**: Admin can create, update, and deactivate offers
- **Offer Validation**: Real-time validation of offer eligibility

### Inventory Management
- **Stock Tracking**: Real-time inventory updates
- **Low Stock Alerts**: Visual indicators for low stock products
- **Out of Stock**: Automatic disabling of "Add to Cart" for unavailable items
- **Stock History**: Admin dashboard tracks inventory changes

### Guest Checkout System
- **Session Management**: Guest sessions tracked via sessionId
- **Guest Cart Persistence**: Guest cart saved for 7 days
- **Guest Wishlist**: Temporary wishlist for guest users
- **Guest to User Migration**: Seamless migration when guest signs up
- **Guest Limitations**: Prompted to sign in at checkout for better experience

### Product Variants
- **Weight Variants**: Multiple weight options per product
- **Price Variations**: Different prices for different variants
- **Variant Selection**: Dropdown/button selector on product details
- **Variant Badge**: Visual indicator showing selected variant

### Multi-Brand System Architecture
- **Brand Pages**: Dedicated landing pages for each brand
  - **Iyappaa**: Traditional Tamil snacks and sweets
  - **Amirth**: Premium sweets collection
  - **Venba**: Healthy snacks range
  - **Little Krishna**: Kids-friendly treats
- **Brand Filtering**: Filter products by brand across categories
- **Brand-specific Styling**: Unique color schemes and branding per brand

### Review & Rating System
- **User Reviews**: Authenticated users can review purchased products
- **Star Ratings**: 5-star rating system
- **Review Images**: Users can upload images with reviews
- **Verified Purchase Badge**: Shows if reviewer purchased the product
- **Review Sorting**: Sort by most recent, highest rated, lowest rated
- **Admin Moderation**: Admin can approve/reject reviews

### Order Cancellation Flow
```
My Orders → View Order → Cancel Order Button
→ Cancellation Reason Form → Confirm Cancellation
→ Backend Processing → Refund Initiation (if paid)
→ Email Notification → Order Status Updated
```

### Advanced Search & Filtering
- **Text Search**: Search products by name, brand, category
- **Category Filters**: Filter by Sweets, Snacks, Groceries
- **Brand Filters**: Filter by 4 brands
- **Price Range**: Slider to filter by price range
- **Rating Filter**: Filter by minimum rating
- **Sorting Options**: Price (low-high, high-low), Rating, Newest

### Responsive Design Breakpoints
```css
/* Mobile: 320px - 767px */
/* Tablet: 768px - 1023px */
/* Desktop: 1024px+ */
/* Large Desktop: 1440px+ */
```

---

## Additional Resources

### Documentation Links
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [React Router](https://reactrouter.com)
- [Axios Documentation](https://axios-http.com)
- [Stripe React](https://stripe.com/docs/stripe-js/react)
- [Chart.js](https://www.chartjs.org)
- [Framer Motion](https://www.framer.com/motion)

### Learning Resources
- React 19 features: Concurrent rendering, Suspense
- Vite advantages over Create React App
- JWT authentication best practices
- Stripe payment integration guide

---
