## Overview

This document lists all third-party services used in the Iyappaa website.

## Quick Reference

| Service | Purpose | Cost |
|---------|---------|------|
| Google OAuth | User Authentication | FREE |
| Stripe | Payment Processing | 2.9% + $0.30/transaction |
| Nodemailer | Email Service | FREE (Gmail) |
| Twilio | SMS/OTP | Paid |
| MongoDB Atlas | Database | FREE (512MB) |
| PDFKit | PDF Generation | FREE |

---

## 1. Google OAuth

**Purpose:** User authentication and login

**Setup:**
1. Go to https://console.cloud.google.com
2. Create project → Enable Google+ API
3. Create OAuth 2.0 credentials
4. Add authorized origins: `http://localhost:5173`, `https://iyappaa.com`
5. Copy Client ID and Secret

**Environment Variables:**
```bash
# Frontend
VITE_APP_GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com

# Backend
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx
```

**Cost:** FREE

---

## 2. Stripe Payment

**Purpose:** Credit/Debit card payment processing

**Setup:**
1. Create account at https://stripe.com
2. Dashboard → Developers → API keys
3. Copy Publishable Key (Frontend) and Secret Key (Backend)
4. For production: Setup webhook at `/api/payments/stripe-webhook`

**Environment Variables:**
```bash
# Frontend
VITE_APP_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx

# Backend
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

**Test Card:** 4242 4242 4242 4242

**Cost:** FREE (test), 2.9% + $0.30 per transaction (production)

---

## 3. Email Service (Nodemailer)

**Purpose:** Send order confirmations, invoices, OTP emails

**Setup:**
1. Enable 2FA on Google Account
2. Google Account → Security → App passwords
3. Generate app password (16 characters)
4. Use in environment variables

**Environment Variables:**
```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
BRAND_NAME=YourBrandName
```

**Cost:** FREE (500 emails/day with Gmail)

---

## 4. SMS Services

**Purpose:** Send OTP for verification

### Option : Twilio (Global)

**Setup:**
1. Sign up at https://www.twilio.com
2. Get Account SID, Auth Token, Phone Number

**Environment Variables:**
```bash
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_PHONE_NUMBER=+1234567890
```

**Cost:** $0.0075/SMS

---

## 5. MongoDB Atlas

**Purpose:** Database for all application data

**Setup:**
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create M0 Free cluster
3. Database Access → Add user (username/password)
4. Network Access → Allow 0.0.0.0/0
5. Connect → Copy connection string
6. Replace `<username>`, `<password>`, `<dbname>`

**Environment Variables:**
```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecommerce?retryWrites=true&w=majority
```

**Collections:** users, products, orders, payments, carts, wishlists, reviews, coupons, offers, subscriptions, contacts, testimonials, recommendations, userbehaviors, refunds, datas

**Cost:** FREE (512MB)

---

## 6. PDF Generation (PDFKit)

**Purpose:** Generate invoices and receipts

**Setup:** Install via npm
```bash
npm install pdfkit qrcode
```

**Usage:** Generates order confirmations, invoices, bills with QR codes

**Storage:** PDFs stored in MongoDB

**Cost:** FREE

---

## 7. Other Libraries

### Frontend
- **React** (19.1.0) - UI framework
- **Vite** (7.0.4) - Build tool
- **React Router** (7.7.0) - Routing
- **Axios** (1.11.0) - HTTP requests
- **React Icons, Lucide React** - Icons
- **Framer Motion** - Animations
- **React Toastify** - Notifications
- **Chart.js, Recharts** - Charts
- **Country-State-City** - Location data
- **React Phone Input** - Phone input

### Backend
- **Express** (5.1.0) - Web framework
- **Mongoose** (8.16.3) - MongoDB ODM
- **JWT** (9.0.2) - Authentication
- **bcrypt** (6.0.0) - Password hashing
- **cors** - CORS handling
- **express-rate-limit** - Rate limiting
- **multer** - File uploads
- **node-cron** - Scheduled jobs
- **dotenv** - Environment variables

---

## 8. Complete Environment Setup

### Frontend .env
```bash
VITE_APP_API_URL=http://api.domain.com
VITE_APP_ADMIN_URL=http://api.domain.com
VITE_APP_GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
VITE_APP_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
```

### Backend .env
```bash
# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ecommerce
PORT=8000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Authentication
JWT_SECRET=your_secret_key_min_32_chars
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx

# Payment
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
BRAND_NAME=YourBrand

# SMS (Choose one provider)
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_PHONE_NUMBER=+1234567890
```

---

## Quick Start

```bash
# Install dependencies
cd Ecommerce-Frontend && npm install
cd ../Ecommerce-Backend && npm install

# Setup environment variables (create .env files above)

# Run application
# Terminal 1
cd Ecommerce-Backend && npm run dev

# Terminal 2
cd Ecommerce-Frontend && npm run dev
```

---

## Cost Summary

**Development:** FREE (all services have free tiers)

**Production (Monthly):**
- Google OAuth: FREE
- Stripe: 2.9% + $0.30 per transaction
- Email: FREE (Gmail) or $20/month (SendGrid)
- SMS: ~$100-200 (depends on volume)
- MongoDB: FREE (M0) or $9/month (M2)
- Hosting: $10-50/month

**Total:** ~$150-300/month (depends on usage)

---

## Important Notes

1. Never commit .env files to Git
2. Use different keys for development and production
3. Enable 2FA on all service accounts
4. Rotate API keys regularly
5. Use HTTPS in production

---

