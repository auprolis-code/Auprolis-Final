# Auprolis Complete Application Overview
## Comprehensive Documentation for Gemini Agent on Firebase

---

## 1. APPLICATION OVERVIEW

### 1.1 What is Auprolis?
**Auprolis** is a digital marketplace platform specifically designed for the Sheriff Asset Marketplace of Botswana. It serves as a trusted platform for verified asset sales, connecting buyers with sheriffs and institutions selling assets through auctions and direct sales.

### 1.2 Core Purpose
- **For Buyers**: Browse, reserve, and bid on assets (properties, vehicles, equipment, furniture, electronics)
- **For Sheriffs**: Create and manage asset listings, handle reservations, communicate with buyers
- **For Admins**: Manage users, oversee system operations, view analytics

### 1.3 Business Model
- Subscription-based platform with Free/Paid tiers
- Payment integration with PayFast
- Google Sheets integration for user verification/registry
- Real-time bidding and reservation system

---

## 2. ARCHITECTURE OVERVIEW

### 2.1 Technology Stack

#### Frontend
- **HTML5/CSS3/JavaScript** (Vanilla JS, no frameworks)
- **Responsive Design** (Mobile-first approach)
- **Firebase SDK** (v8/v9) for client-side operations
- **Demo Mode** (localStorage-based fallback when Firebase unavailable)

#### Backend
- **Node.js** with **Express.js** framework
- **MongoDB** with **Mongoose** ODM
- **JWT** (JSON Web Tokens) for authentication
- **bcryptjs** for password hashing
- **RESTful API** design

#### Firebase Services
- **Firebase Authentication** (Email/Password + Google OAuth)
- **Cloud Firestore** (NoSQL document database)
- **Realtime Database** (JSON database for real-time features)
- **Firebase Hosting** (optional, currently using GitHub Pages)

#### External Integrations
- **Google Sheets API** (User registry/verification)
- **PayFast** (Payment gateway)

### 2.2 Project Structure

```
Auprolis-Final/
├── Frontend (Static HTML/CSS/JS)
│   ├── index.html                    # Landing page
│   ├── login.html                    # Login/signup page
│   ├── assets-list.html              # Browse all assets
│   ├── buyer-dashboard.html          # Buyer dashboard
│   ├── sheriff-dashboard.html        # Sheriff/Seller dashboard
│   ├── admin-dashboard.html          # Admin dashboard
│   ├── application-form.html         # Seller application form
│   ├── payment-portal.html           # Payment processing
│   ├── bidding-modal.html            # Bidding interface
│   └── assets/
│       ├── css/                      # Stylesheets
│       ├── js/                       # JavaScript modules
│       └── images/                   # Image assets
│
├── Backend (Node.js/Express)
│   ├── server.js                     # Express server entry point
│   ├── config/
│   │   └── database.js               # MongoDB connection
│   ├── models/
│   │   └── User.js                   # User Mongoose model
│   ├── controllers/
│   │   ├── authController.js         # Authentication logic
│   │   └── userController.js        # User management
│   ├── routes/
│   │   ├── authRoutes.js             # Auth endpoints
│   │   └── userRoutes.js             # User endpoints
│   ├── middleware/
│   │   └── auth.js                   # JWT authentication middleware
│   └── utils/
│       └── generateToken.js          # JWT token generation
│
├── Firebase Configuration
│   ├── firebase.json                 # Firebase project config
│   ├── firestore.rules               # Firestore security rules
│   ├── firestore.indexes.json        # Firestore indexes
│   ├── database.rules.json            # Realtime DB security rules
│   └── assets/js/firebase-config.js  # Client-side Firebase config
│
└── Documentation
    ├── README.md                     # Main project readme
    ├── DEMO-SETUP.md                 # Demo mode setup guide
    ├── FIREBASE_SETUP.md             # Firebase configuration guide
    ├── PRODUCTION_SETUP.md           # Production deployment guide
    ├── USER_TYPE_SYSTEM.md           # User type documentation
    └── REALTIME_DATABASE_SETUP.md   # Realtime DB setup
```

---

## 3. USER TYPES & PERMISSIONS

### 3.1 User Types
The platform supports **3 primary user types**:

1. **Admin** (`admin`)
   - Full system access and management
   - Can manage all users, assets, reservations
   - Can delete assets and users
   - Access to analytics and system settings

2. **Buyer** (`buyer`)
   - Can browse assets
   - Can make reservations
   - Can place bids
   - Can manage own watchlist
   - Can communicate with sheriffs
   - **Cannot** create asset listings

3. **Sheriff** (`sheriff`) - Also referred to as "Seller"
   - Can create and manage asset listings
   - Can manage reservations on their assets
   - Can make reservations (like buyers)
   - Can communicate with buyers
   - Can view analytics for their assets
   - **Cannot** delete assets (only admin can)

### 3.2 User Data Schema

#### Firebase (Firestore/Realtime DB)
```javascript
{
  uid: "firebase-auth-uid",
  email: "user@example.com",
  fullName: "John Doe",
  firstName: "John",
  lastName: "Doe",
  displayName: "John Doe",
  phone: "+267 712 345 678",  // Optional
  userType: "admin" | "buyer" | "sheriff",  // REQUIRED
  subscriptionStatus: "pending" | "active" | "expired" | "cancelled",
  paymentStatus: "pending" | "completed" | "failed" | "refunded",
  status: "active" | "inactive" | "suspended" | "deleted",
  googleId: "google-user-id",  // For OAuth users
  isEmailVerified: true | false,
  permissions: ["makeReservations", "createListings", ...],
  createdAt: Timestamp,
  updatedAt: Timestamp,
  lastActivity: Timestamp
}
```

#### MongoDB (Backend API)
```javascript
{
  _id: ObjectId,
  email: String (unique, required),
  password: String (hashed, required unless OAuth),
  fullName: String (required),
  firstName: String,
  lastName: String,
  displayName: String,
  phone: String,
  userType: "buyer" | "seller" | "admin" | "sheriff" (enum),
  subscriptionStatus: "pending" | "active" | "expired" | "cancelled",
  paymentStatus: "pending" | "completed" | "failed" | "refunded",
  status: "active" | "inactive" | "suspended" | "deleted",
  googleId: String (unique, sparse),
  isEmailVerified: Boolean,
  permissions: [String],
  createdAt: Date,
  updatedAt: Date,
  lastActivity: Date
}
```

### 3.3 Permissions Matrix

| Permission | Admin | Sheriff | Buyer |
|------------|-------|---------|-------|
| `makeReservations` | ✅ | ✅ | ✅ |
| `createListings` | ✅ | ✅ | ❌ |
| `manageReservations` | ✅ (all) | ✅ (own assets) | ✅ (own) |
| `manageUsers` | ✅ | ❌ | ❌ |
| `viewAnalytics` | ✅ | ✅ (own assets) | ❌ |
| `manageSystem` | ✅ | ❌ | ❌ |
| `deleteAssets` | ✅ | ❌ | ❌ |
| `placeBids` | ✅ | ✅ | ✅ |
| `manageOwnWatchlist` | ✅ | ✅ | ✅ |

---

## 4. CORE FEATURES

### 4.1 Authentication System

#### Frontend Authentication (Firebase)
- **Email/Password** authentication via Firebase Auth
- **Google OAuth** sign-in
- **Demo Mode** fallback using localStorage (for offline/demo purposes)
- **Google Sheets Verification**: Users must be in Google Sheets to access the app
  - Buyers tab: `https://docs.google.com/spreadsheets/d/1lMVPGTNptVxn8NS7937FtxI9NAC5VeJKlXEPL5pTwmg/gviz/tq?tqx=out:csv&gid=0`
  - Sheriffs tab: `https://docs.google.com/spreadsheets/d/1lMVPGTNptVxn8NS7937FtxI9NAC5VeJKlXEPL5pTwmg/gviz/tq?tqx=out:csv&gid=2054246567`

#### Backend Authentication (Node.js API)
- **JWT-based** authentication
- **Email/Password** registration and login
- **Google OAuth** support
- **Protected routes** with middleware
- **Role-based access control**

#### Authentication Flow
1. User signs up/logs in via Firebase Auth or Backend API
2. System checks if user exists in Google Sheets
3. If verified, user data is stored in Firestore/MongoDB
4. User type is determined and stored
5. User is redirected to appropriate dashboard based on userType

### 4.2 Asset Management

#### Asset Categories
- **Property** (houses, land, buildings)
- **Vehicles** (cars, trucks, motorcycles)
- **Equipment** (machinery, tools)
- **Furniture** (office, home furniture)
- **Electronics** (computers, phones, appliances)

#### Asset Data Structure
```javascript
{
  assetId: "unique-id",
  title: "Asset Title",
  description: "Detailed description",
  category: "property" | "vehicles" | "equipment" | "furniture" | "electronics",
  location: "Gaborone",
  condition: "new" | "used" | "refurbished",
  price: 500000,
  reservePrice: 450000,  // Optional
  images: ["url1", "url2", ...],
  createdBy: "user-uid",
  status: "active" | "sold" | "reserved" | "cancelled",
  auctionEndDate: Timestamp,  // For auctions
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### Asset Operations
- **Create**: Only sheriffs and admins can create assets
- **Read**: All authenticated users can browse assets
- **Update**: Only asset owner (sheriff/admin) or admin can update
- **Delete**: Only admin can delete assets

### 4.3 Reservation System

#### Reservation Flow
1. Buyer browses assets
2. Buyer clicks "Reserve" on an asset
3. Reservation modal opens with asset details
4. Buyer confirms reservation
5. Reservation is created in Firestore/Realtime DB
6. Sheriff is notified
7. Buyer can view reservation history

#### Reservation Data Structure
```javascript
{
  reservationId: "unique-id",
  userId: "buyer-uid",
  assetId: "asset-uid",
  status: "pending" | "confirmed" | "cancelled" | "completed",
  reservationDate: Timestamp,
  notes: "Optional notes",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 4.4 Bidding System

#### Bidding Features
- **Real-time bidding** on auction assets
- **Auto-bid** functionality (maximum bid with automatic increments)
- **Bid history** tracking
- **Auction timer** countdown
- **Bid notifications** to other bidders

#### Bid Data Structure
```javascript
{
  bidId: "unique-id",
  userId: "buyer-uid",
  assetId: "asset-uid",
  amount: 550000,
  isAutoBid: false,
  maxAutoBidAmount: 0,  // If auto-bid enabled
  status: "active" | "outbid" | "winning" | "won",
  createdAt: Timestamp
}
```

### 4.5 Payment System

#### Payment Methods
- **DPO** (Direct Payment Online)
- **Credit/Debit Card** (via PayFast)
- **Bank Transfer**

#### Payment Flow
1. User completes signup
2. Redirected to payment portal
3. Selects payment method
4. Enters payment details
5. Payment processed via PayFast
6. Payment status updated in database
7. Subscription activated

#### Payment Data Structure
```javascript
{
  paymentId: "unique-id",
  userId: "user-uid",
  amount: 1000,
  currency: "BWP",
  paymentMethod: "dpo" | "card" | "bank",
  status: "pending" | "completed" | "failed" | "refunded",
  transactionId: "payfast-transaction-id",
  createdAt: Timestamp
}
```

### 4.6 Chat/Messaging System

#### Features
- Direct messaging between buyers and sheriffs
- Real-time message updates
- Message history per asset listing
- Notification system

#### Chat Data Structure
```javascript
{
  messageId: "unique-id",
  assetId: "asset-uid",
  senderId: "user-uid",
  receiverId: "user-uid",
  message: "Message text",
  read: false,
  createdAt: Timestamp
}
```

### 4.7 Watchlist System

#### Features
- Users can add assets to watchlist
- Get notified of price changes or updates
- Quick access to favorite assets

#### Watchlist Data Structure
```javascript
{
  watchlistId: "unique-id",
  userId: "user-uid",
  assetId: "asset-uid",
  createdAt: Timestamp
}
```

---

## 5. DATABASE ARCHITECTURE

### 5.1 Firebase Firestore Collections

#### Collections Structure
```
firestore/
├── users/
│   └── {userId}/
│       ├── uid, email, fullName, userType, ...
│
├── assets/
│   └── {assetId}/
│       ├── assetId, title, category, price, createdBy, ...
│
├── reservations/
│   └── {reservationId}/
│       ├── reservationId, userId, assetId, status, ...
│
├── watchlist/
│   └── {watchlistId}/
│       ├── watchlistId, userId, assetId, ...
│
└── (chat messages stored per asset or in separate collection)
```

### 5.2 Firebase Realtime Database Structure

```json
{
  "users": {
    "{userId}": {
      "uid": "...",
      "email": "...",
      "userType": "...",
      ...
    }
  },
  "assets": {
    "{assetId}": {
      "assetId": "...",
      "title": "...",
      ...
    }
  },
  "reservations": {
    "{reservationId}": {
      "userId": "...",
      "assetId": "...",
      ...
    }
  },
  "bids": {
    "{bidId}": {
      "userId": "...",
      "assetId": "...",
      "amount": 550000,
      ...
    }
  },
  "watchlist": {
    "{watchlistId}": {
      "userId": "...",
      "assetId": "...",
      ...
    }
  },
  "notifications": {
    "{userId}": {
      "{notificationId}": {
        "message": "...",
        "read": false,
        ...
      }
    }
  }
}
```

### 5.3 MongoDB Collections (Backend API)

#### Collections
- **users**: User accounts and profiles
- (Future: assets, reservations, bids, etc. may be migrated)

### 5.4 Security Rules

#### Firestore Rules
- **Users**: Users can read/update own data, admins can access all
- **Assets**: All authenticated users can read, only sheriffs/admins can create
- **Reservations**: Users can manage own reservations, admins can manage all
- **Watchlist**: Users can manage own watchlist items

#### Realtime Database Rules
- Similar structure to Firestore rules
- Real-time listeners for live updates
- User-based access control

---

## 6. API ENDPOINTS (Backend)

### 6.1 Authentication Endpoints

```
POST   /api/auth/register      # Register new user
POST   /api/auth/login         # Login user
POST   /api/auth/google        # Google OAuth authentication
GET    /api/auth/me            # Get current user (Protected)
PUT    /api/auth/update        # Update current user profile (Protected)
```

### 6.2 User Management Endpoints

```
GET    /api/users              # Get all users (Admin only)
GET    /api/users/:id          # Get user by ID (Protected)
PUT    /api/users/:id          # Update user (Protected - self or admin)
DELETE /api/users/:id          # Delete user (Admin only)
```

### 6.3 Health Check

```
GET    /api/health             # Server health check
```

### 6.4 API Response Format

#### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

#### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error (development only)"
}
```

---

## 7. FRONTEND PAGES & FUNCTIONALITY

### 7.1 Landing Page (`index.html`)
- Hero section with call-to-action
- Features showcase
- Pricing plans
- Featured assets
- Process explanation for buyers/sellers
- Navigation to other pages

### 7.2 Login/Signup Page (`login.html`)
- Email/Password authentication
- Google OAuth sign-in
- Signup form
- Google Sheets verification
- Redirect to appropriate dashboard after login

### 7.3 Assets List Page (`assets-list.html`)
- Browse all available assets
- Search functionality
- Filter by category, location, condition, price range
- Sort options (newest, price, etc.)
- Pagination
- Asset cards with images and details
- Reserve/Bid buttons (if logged in)

### 7.4 Buyer Dashboard (`buyer-dashboard.html`)
- User profile information
- Active reservations
- Watchlist
- Bid history
- Payment status
- Browse assets
- Filter and search assets

### 7.5 Sheriff Dashboard (`sheriff-dashboard.html`)
- Create new asset listings
- Manage existing listings
- View reservations on assets
- Respond to buyer inquiries
- Analytics for assets
- Payment/subscription status

### 7.6 Admin Dashboard (`admin-dashboard.html`)
- User management (view, edit, delete users)
- Add users to Google Sheets
- System analytics
- Asset management
- Reservation oversight
- System settings

### 7.7 Payment Portal (`payment-portal.html`)
- Payment method selection
- Payment form (card details, etc.)
- PayFast integration
- Payment confirmation
- Subscription activation

### 7.8 Application Form (`application-form.html`)
- Seller/Sheriff application
- Business information
- Verification process

---

## 8. INTEGRATION POINTS

### 8.1 Google Sheets Integration
- **Purpose**: User registry and verification
- **Service**: `google-sheets-service.js`
- **Tabs**: Buyers and Sheriffs
- **CSV Export URLs**: Used to fetch user data
- **Verification**: Users must be in Google Sheets to access the app

### 8.2 PayFast Integration
- **Purpose**: Payment processing
- **Payment Methods**: DPO, Credit/Debit Card, Bank Transfer
- **Integration**: Payment portal page
- **Status Updates**: Payment status stored in database

### 8.3 Firebase Services Integration
- **Authentication**: Email/Password + Google OAuth
- **Firestore**: Primary database for application data
- **Realtime Database**: Real-time features (bids, notifications, chat)
- **Hosting**: Optional deployment option

---

## 9. CURRENT STATE & SETUP

### 9.1 Completed Features
✅ User authentication (Firebase + Backend API)
✅ User type system (Admin, Buyer, Sheriff)
✅ Asset listing and browsing
✅ Reservation system
✅ Bidding system (frontend)
✅ Payment portal (frontend)
✅ Chat/messaging interface
✅ Watchlist functionality
✅ Google Sheets integration
✅ Admin dashboard
✅ Demo mode (localStorage fallback)
✅ Security rules (Firestore + Realtime DB)
✅ Backend API (Node.js/Express/MongoDB)

### 9.2 Configuration Status

#### Firebase Project
- **Project ID**: `auprolis-mvp2`
- **Authentication**: Email/Password + Google enabled
- **Firestore**: Configured with security rules
- **Realtime Database**: Configured (optional)
- **Config File**: `assets/js/firebase-config.js`

#### Backend API
- **Port**: 3000 (default)
- **Database**: MongoDB (connection via `MONGODB_URI`)
- **JWT**: Token-based authentication
- **CORS**: Configured for frontend access

#### Google Sheets
- **Sheet ID**: `1lMVPGTNptVxn8NS7937FtxI9NAC5VeJKlXEPL5pTwmg`
- **Buyers Tab GID**: `0`
- **Sheriffs Tab GID**: `2054246567`
- **CSV Export**: Enabled for both tabs

### 9.3 Demo Mode
- **Purpose**: Offline/demo functionality
- **Storage**: localStorage
- **Data**: `demo-data.js` contains sample data
- **Authentication**: `demo-mode.js` handles demo auth
- **Activation**: Automatically activates if Firebase fails

---

## 10. DEVELOPMENT WORKFLOW

### 10.1 Frontend Development
1. Edit HTML/CSS/JS files in root directory
2. Test locally using HTTP server (Python, Node.js, or VS Code Live Server)
3. Firebase operations use client-side SDK
4. Demo mode available for offline testing

### 10.2 Backend Development
1. Navigate to `backend/` directory
2. Install dependencies: `npm install`
3. Configure `.env` file with MongoDB URI, JWT secret, etc.
4. Run development server: `npm run dev` (uses nodemon)
5. API accessible at `http://localhost:3000`

### 10.3 Database Operations
- **Firestore**: Use Firebase Console or client SDK
- **Realtime DB**: Use Firebase Console or client SDK
- **MongoDB**: Use Mongoose models in backend

### 10.4 Testing
- **Demo Accounts**:
  - Buyer: `buyer@demo.com` (any password)
  - Seller: `seller@demo.com` (any password)
  - Admin: `admin@demo.com` (any password)

---

## 11. SECURITY CONSIDERATIONS

### 11.1 Authentication Security
- Passwords hashed with bcryptjs (backend)
- JWT tokens for API authentication
- Firebase Auth handles client-side authentication
- Google Sheets verification prevents unauthorized access

### 11.2 Database Security
- Firestore security rules enforce access control
- Realtime Database rules enforce access control
- User type validation on all operations
- Admin-only operations protected

### 11.3 API Security
- JWT middleware protects routes
- Role-based access control
- Input validation using express-validator
- CORS configured for frontend access

---

## 12. DEPLOYMENT

### 12.1 Frontend Deployment
- **Current**: GitHub Pages
- **Alternative**: Firebase Hosting
- **Static Files**: All HTML/CSS/JS files
- **No Build Process**: Direct file serving

### 12.2 Backend Deployment
- **Platform**: Any Node.js hosting (Heroku, Railway, AWS, etc.)
- **Environment Variables**: Required (.env file)
- **Database**: MongoDB Atlas (cloud) or self-hosted
- **Process Manager**: PM2 recommended for production

### 12.3 Firebase Deployment
- **Firestore Rules**: Deploy via Firebase CLI or Console
- **Realtime DB Rules**: Deploy via Firebase CLI or Console
- **Hosting**: Optional, can use Firebase Hosting

---

## 13. KNOWN ISSUES & LIMITATIONS

### 13.1 Current Limitations
- Backend API only handles authentication/user management
- Asset/reservation/bid operations primarily in frontend (Firebase)
- Payment integration needs PayFast API keys
- Google Sheets must be published as CSV for access
- Demo mode uses localStorage (data not persistent across browsers)

### 13.2 Integration Gaps
- Backend API doesn't handle assets/reservations/bids yet
- Payment processing needs PayFast API integration
- Email notifications not implemented
- Real-time chat needs WebSocket or Firebase Functions

---

## 14. NEXT STEPS & DEVELOPMENT PRIORITIES

### 14.1 Backend API Expansion
- [ ] Asset CRUD endpoints
- [ ] Reservation management endpoints
- [ ] Bidding system endpoints
- [ ] Payment processing endpoints
- [ ] Chat/messaging endpoints
- [ ] Analytics endpoints

### 14.2 Feature Enhancements
- [ ] Email notifications
- [ ] SMS notifications (optional)
- [ ] Advanced search and filtering
- [ ] Image upload to Firebase Storage
- [ ] Asset analytics dashboard
- [ ] Export functionality (reports, data)

### 14.3 Integration Improvements
- [ ] Complete PayFast API integration
- [ ] Email service integration (SendGrid, etc.)
- [ ] Firebase Cloud Functions for server-side operations
- [ ] Webhook handling for payment callbacks

### 14.4 Testing & Quality
- [ ] Unit tests for backend API
- [ ] Integration tests
- [ ] E2E tests for critical flows
- [ ] Performance optimization
- [ ] Security audit

---

## 15. KEY FILES REFERENCE

### 15.1 Frontend JavaScript Services
- `assets/js/firebase-config.js` - Firebase initialization
- `assets/js/auth.js` - Authentication logic
- `assets/js/firestore-user-service.js` - Firestore user operations
- `assets/js/realtime-db-service.js` - Realtime DB operations
- `assets/js/user-type-service.js` - User type detection and routing
- `assets/js/google-sheets-service.js` - Google Sheets integration
- `assets/js/assets-list.js` - Asset listing and filtering
- `assets/js/reservation.js` - Reservation system
- `assets/js/bidding.js` - Bidding system
- `assets/js/payment.js` - Payment processing
- `assets/js/demo-mode.js` - Demo mode fallback
- `assets/js/demo-data.js` - Demo data

### 15.2 Backend Files
- `backend/server.js` - Express server
- `backend/models/User.js` - User Mongoose model
- `backend/controllers/authController.js` - Auth logic
- `backend/controllers/userController.js` - User management
- `backend/routes/authRoutes.js` - Auth routes
- `backend/routes/userRoutes.js` - User routes
- `backend/middleware/auth.js` - JWT middleware
- `backend/config/database.js` - MongoDB connection

### 15.3 Configuration Files
- `firebase.json` - Firebase project config
- `firestore.rules` - Firestore security rules
- `database.rules.json` - Realtime DB security rules
- `backend/package.json` - Backend dependencies
- `.env` (backend) - Environment variables

---

## 16. BUSINESS LOGIC SUMMARY

### 16.1 User Registration Flow
1. User fills signup form
2. System checks if email exists in Google Sheets
3. If verified, create Firebase Auth account
4. Store user data in Firestore/MongoDB
5. Set userType based on Google Sheets tab (Buyers/Sheriffs)
6. Redirect to payment portal (if subscription required)
7. After payment, activate account

### 16.2 Asset Listing Flow
1. Sheriff/Admin logs in
2. Navigate to sheriff dashboard
3. Click "Create Listing"
4. Fill asset details (title, category, price, images, etc.)
5. Submit listing
6. Asset stored in Firestore
7. Asset appears in assets list for buyers

### 16.3 Reservation Flow
1. Buyer browses assets
2. Buyer clicks "Reserve" on asset
3. System checks buyer's subscription status
4. Create reservation in Firestore
5. Notify sheriff of new reservation
6. Sheriff can confirm/cancel reservation
7. Buyer receives notification

### 16.4 Bidding Flow
1. Buyer views auction asset
2. Buyer places bid (or enables auto-bid)
3. System validates bid (must be higher than current bid)
4. Update bid in Realtime Database (for real-time updates)
5. Notify other bidders of new bid
6. Update asset with new highest bid
7. When auction ends, notify winning bidder

### 16.5 Payment Flow
1. User completes signup
2. Redirected to payment portal with user info
3. User selects payment method
4. User enters payment details
5. Payment processed via PayFast
6. PayFast callback updates payment status
7. Subscription activated in database
8. User can now access full features

---

## 17. ENVIRONMENT VARIABLES (Backend)

### Required Variables
```env
MONGODB_URI=mongodb://localhost:27017/auprolis
# OR
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/auprolis

JWT_SECRET=your-super-secret-jwt-key-here

PORT=3000

CORS_ORIGIN=http://localhost:8000,https://yourdomain.com

NODE_ENV=development
```

---

## 18. FIREBASE CONFIGURATION

### Current Firebase Config
```javascript
{
  apiKey: "AIzaSyA9VPtRDIz4m903N4r4SDzIXPfU4LScCUQ",
  authDomain: "auprolis-mvp2.firebaseapp.com",
  projectId: "auprolis-mvp2",
  storageBucket: "auprolis-mvp2.firebasestorage.app",
  messagingSenderId: "954767989673",
  appId: "1:954767989673:web:c22f4ebb2227c9cf0d42b8",
  measurementId: "G-VQY6T0Q7Y0",
  databaseURL: "https://auprolis-mvp2-default-rtdb.firebaseio.com"
}
```

---

## 19. GOOGLE SHEETS CONFIGURATION

### Sheet Details
- **Sheet ID**: `1lMVPGTNptVxn8NS7937FtxI9NAC5VeJKlXEPL5pTwmg`
- **Buyers CSV**: `https://docs.google.com/spreadsheets/d/1lMVPGTNptVxn8NS7937FtxI9NAC5VeJKlXEPL5pTwmg/gviz/tq?tqx=out:csv&gid=0`
- **Sheriffs CSV**: `https://docs.google.com/spreadsheets/d/1lMVPGTNptVxn8NS7937FtxI9NAC5VeJKlXEPL5pTwmg/gviz/tq?tqx=out:csv&gid=2054246567`

### Required Columns
- **Buyers Tab**: First Name, Last Name, Email, Phone (optional)
- **Sheriffs Tab**: First Name, Last Name, Email, Phone (optional)

---

## 20. SUMMARY FOR GEMINI AGENT

### What Gemini Needs to Know

1. **Application Type**: Digital marketplace for asset sales (Botswana Sheriff Asset Marketplace)

2. **Architecture**: 
   - Frontend: Static HTML/CSS/JS with Firebase SDK
   - Backend: Node.js/Express/MongoDB REST API
   - Databases: Firebase Firestore + Realtime DB + MongoDB

3. **User Types**: Admin, Buyer, Sheriff (3 types with different permissions)

4. **Core Features**: 
   - Asset listings (create, browse, filter)
   - Reservations
   - Bidding system
   - Payment processing
   - Chat/messaging
   - Watchlist

5. **Current State**: 
   - Frontend fully functional
   - Backend API handles auth/users only
   - Firebase handles most data operations
   - Google Sheets for user verification

6. **Next Steps**: 
   - Expand backend API to handle assets, reservations, bids
   - Complete PayFast integration
   - Add email notifications
   - Implement Firebase Cloud Functions
   - Add comprehensive testing

7. **Key Integration Points**:
   - Firebase (Auth, Firestore, Realtime DB)
   - Google Sheets (User registry)
   - PayFast (Payments)
   - MongoDB (Backend database)

---

**This document provides a complete 360-degree view of the Auprolis application. Use this as a reference for understanding the system architecture, features, data models, and development workflow.**

