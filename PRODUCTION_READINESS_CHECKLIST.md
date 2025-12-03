# Production Readiness Checklist for Auprolis

## ⚠️ **NOT READY FOR PRODUCTION YET**

The site has most components in place, but several critical steps need to be completed before going live.

---

## ✅ **COMPLETED (Ready to Deploy)**

### Frontend
- ✅ Static HTML/CSS/JS files complete
- ✅ All pages created (landing, login, dashboards, etc.)
- ✅ Firebase SDK integrated
- ✅ Google Sheets integration configured
- ✅ Demo mode fallback implemented
- ✅ Code pushed to GitHub
- ✅ GitHub Pages deployment ready

### Code & Configuration
- ✅ Firebase configuration files created (`firebase.json`)
- ✅ Firestore security rules written (`firestore.rules`)
- ✅ Realtime Database rules written (`database.rules.json`)
- ✅ Cloud Functions created (TypeScript)
- ✅ Backend API code complete
- ✅ Documentation created

---

## ❌ **CRITICAL - MUST DO BEFORE GOING LIVE**

### 1. Firebase Setup & Deployment

#### Firestore Database
- [ ] **Create Firestore Database** in Firebase Console
  - Go to [Firebase Console](https://console.firebase.google.com/) → Project `auprolis-mvp2`
  - Navigate to **Firestore Database**
  - Click **Create database**
  - Choose **Production mode** (or test mode initially)
  - Select location closest to your users (e.g., `us-central1`, `europe-west1`)

- [ ] **Deploy Firestore Security Rules**
  ```bash
  firebase deploy --only firestore:rules
  ```
  OR manually copy `firestore.rules` content to Firebase Console → Firestore → Rules → Publish

#### Realtime Database (if using bidding/chat)
- [ ] **Create Realtime Database** in Firebase Console
  - Go to **Realtime Database** → **Create database**
  - Choose location
  - Start in **Locked mode** (we'll deploy rules)

- [ ] **Deploy Realtime Database Rules**
  ```bash
  firebase deploy --only database
  ```
  OR manually copy `database.rules.json` content to Firebase Console → Realtime Database → Rules → Publish

#### Cloud Functions
- [ ] **Deploy Cloud Functions**
  ```bash
  cd functions
  npm install  # Already done ✅
  npm run build
  cd ..
  firebase deploy --only functions
  ```

#### Firebase Authentication
- [ ] **Verify Authentication Methods Enabled**
  - Go to Firebase Console → **Authentication** → **Sign-in method**
  - Ensure **Email/Password** is enabled ✅
  - Ensure **Google** is enabled ✅

- [ ] **Create Admin User**
  - Go to **Authentication** → **Users** → **Add user**
  - Email: `auprolis@gmail.com` (or your admin email)
  - Set a strong password
  - After creation, manually set `userType: 'admin'` in Firestore `users` collection

### 2. Backend API Setup

#### MongoDB Database
- [ ] **Set up MongoDB** (choose one):
  
  **Option A: MongoDB Atlas (Recommended for Production)**
  - Create account at https://www.mongodb.com/cloud/atlas
  - Create a free cluster
  - Get connection string
  - Whitelist your IP address (or use 0.0.0.0/0 for all IPs - less secure)
  
  **Option B: Local MongoDB**
  - Install MongoDB locally
  - Start MongoDB service
  - Use connection string: `mongodb://localhost:27017/auprolis`

#### Environment Variables
- [ ] **Create `.env` file in `backend/` directory**
  ```env
  # Server Configuration
  PORT=3000
  NODE_ENV=production
  
  # MongoDB Configuration
  MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/auprolis?retryWrites=true&w=majority
  # OR for local: MONGODB_URI=mongodb://localhost:27017/auprolis
  
  # JWT Secret (generate a strong random string)
  JWT_SECRET=your-super-secret-jwt-key-generate-this
  JWT_EXPIRE=7d
  
  # CORS Configuration (your production frontend URL)
  CORS_ORIGIN=https://yourusername.github.io,https://yourdomain.com
  ```

- [ ] **Generate JWT Secret**
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
  Copy the output and use it as `JWT_SECRET`

#### Backend Deployment
- [ ] **Deploy Backend API** to a hosting service:
  - **Options**: Heroku, Railway, Render, AWS, DigitalOcean, etc.
  - Set environment variables in hosting platform
  - Ensure MongoDB connection works from hosting platform
  - Update `CORS_ORIGIN` in `.env` to include your frontend URL

- [ ] **Test Backend API**
  ```bash
  # Health check
  curl https://your-backend-url.com/api/health
  
  # Should return: {"success":true,"message":"Server is running",...}
  ```

### 3. Google Sheets Configuration

- [ ] **Verify Google Sheets is Published**
  - Open: https://docs.google.com/spreadsheets/d/1lMVPGTNptVxn8NS7937FtxI9NAC5VeJKlXEPL5pTwmg/edit
  - Go to **File** → **Share** → **Publish to the web**
  - For **Buyers** tab: Publish as CSV
  - For **Sheriffs** tab: Publish as CSV
  - Verify CSV URLs are accessible:
    - Buyers: `https://docs.google.com/spreadsheets/d/1lMVPGTNptVxn8NS7937FtxI9NAC5VeJKlXEPL5pTwmg/gviz/tq?tqx=out:csv&gid=0`
    - Sheriffs: `https://docs.google.com/spreadsheets/d/1lMVPGTNptVxn8NS7937FtxI9NAC5VeJKlXEPL5pTwmg/gviz/tq?tqx=out:csv&gid=2054246567`

- [ ] **Add Initial Users to Google Sheets**
  - Add at least one admin user
  - Add test buyers and sheriffs
  - Ensure email addresses match exactly (case-sensitive)

### 4. Frontend Configuration Updates

- [ ] **Update Firebase Config** (if needed)
  - Verify `assets/js/firebase-config.js` has correct project ID
  - Ensure all Firebase services are enabled

- [ ] **Update Backend API URL** (if using backend API)
  - Update any hardcoded API URLs in frontend code
  - Use environment variables or config file for API base URL

- [ ] **Test Frontend on GitHub Pages**
  - Verify site loads: `https://yourusername.github.io/Auprolis-Final/`
  - Test login functionality
  - Test asset browsing
  - Check browser console for errors

### 5. Security & Testing

- [ ] **Test Authentication Flow**
  - [ ] Admin can log in
  - [ ] Buyers can log in (if in Google Sheets)
  - [ ] Sheriffs can log in (if in Google Sheets)
  - [ ] Users NOT in Google Sheets are denied access
  - [ ] Google OAuth sign-in works

- [ ] **Test User Permissions**
  - [ ] Buyers cannot create assets
  - [ ] Sheriffs can create assets
  - [ ] Admins can manage users
  - [ ] Users can only access their own data

- [ ] **Test Core Features**
  - [ ] Asset listing creation (Sheriff)
  - [ ] Asset browsing (Buyer)
  - [ ] Reservation creation (Buyer)
  - [ ] Bidding (if implemented)
  - [ ] Chat/messaging (if implemented)

- [ ] **Security Audit**
  - [ ] All security rules deployed
  - [ ] JWT secret is strong and secure
  - [ ] MongoDB connection string is secure
  - [ ] No sensitive data in client-side code
  - [ ] CORS is properly configured

---

## ⚠️ **RECOMMENDED (Before Full Launch)**

### Performance & Monitoring
- [ ] Set up Firebase Analytics
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Configure Firebase Performance Monitoring
- [ ] Set up uptime monitoring for backend API

### Backup & Recovery
- [ ] Set up Firestore backups
- [ ] Set up MongoDB backups
- [ ] Document recovery procedures

### Documentation
- [ ] Create user guide for buyers
- [ ] Create user guide for sheriffs
- [ ] Create admin documentation
- [ ] Document API endpoints

### Payment Integration (if using)
- [ ] Set up PayFast merchant account
- [ ] Configure PayFast API keys
- [ ] Test payment flow
- [ ] Set up payment webhooks

### Email Notifications (if needed)
- [ ] Set up email service (SendGrid, Mailgun, etc.)
- [ ] Configure email templates
- [ ] Test email delivery

---

## 🚀 **DEPLOYMENT STEPS (In Order)**

### Step 1: Firebase Setup
```bash
# 1. Login to Firebase
firebase login

# 2. Select project
firebase use auprolis-mvp2

# 3. Deploy Firestore rules
firebase deploy --only firestore:rules

# 4. Deploy Realtime Database rules (if using)
firebase deploy --only database

# 5. Build and deploy Functions
cd functions
npm run build
cd ..
firebase deploy --only functions
```

### Step 2: Backend Setup
```bash
# 1. Create .env file in backend/
# (Copy from ENV_SETUP.md and update values)

# 2. Install dependencies
cd backend
npm install

# 3. Test locally
npm run dev

# 4. Deploy to hosting platform
# (Follow your hosting platform's instructions)
```

### Step 3: Frontend Verification
- Verify GitHub Pages is enabled
- Check site loads correctly
- Test all major features
- Monitor browser console for errors

### Step 4: Initial Data Setup
- Create admin user in Firebase Auth
- Add admin user to Firestore with `userType: 'admin'`
- Add test users to Google Sheets
- Create test assets (if needed)

---

## 📊 **READINESS STATUS**

| Component | Status | Action Required |
|-----------|--------|-----------------|
| Frontend Code | ✅ Ready | Deploy to GitHub Pages |
| Firebase Config | ✅ Ready | Deploy rules & functions |
| Firestore Database | ❌ Not Created | Create in Firebase Console |
| Realtime Database | ❌ Not Created | Create if using bidding/chat |
| Security Rules | ✅ Written | Deploy to Firebase |
| Cloud Functions | ✅ Written | Build & Deploy |
| Backend API Code | ✅ Ready | Set up MongoDB & Deploy |
| MongoDB Database | ❌ Not Set Up | Create Atlas cluster or local |
| Environment Variables | ❌ Not Created | Create `.env` file |
| Google Sheets | ⚠️ Check | Verify published & accessible |
| Admin User | ❌ Not Created | Create in Firebase Auth |
| Testing | ❌ Not Done | Test all features |

---

## 🎯 **QUICK START TO GO LIVE**

### Minimum Required Steps:

1. **Firebase Console** (15 minutes):
   - Create Firestore Database
   - Create Realtime Database (if needed)
   - Deploy security rules
   - Create admin user

2. **Deploy Functions** (5 minutes):
   ```bash
   firebase deploy --only functions
   ```

3. **Backend Setup** (30 minutes):
   - Create MongoDB Atlas cluster
   - Create `.env` file
   - Deploy backend to hosting

4. **Google Sheets** (5 minutes):
   - Verify published
   - Add admin user

5. **Test** (30 minutes):
   - Test login
   - Test core features
   - Verify security

**Total Estimated Time: ~1.5 hours**

---

## ✅ **FINAL CHECKLIST BEFORE LAUNCH**

- [ ] All Firebase services deployed and working
- [ ] Backend API deployed and accessible
- [ ] MongoDB connected and working
- [ ] Security rules deployed and tested
- [ ] Admin user created and can log in
- [ ] Google Sheets accessible and users added
- [ ] Frontend loads without errors
- [ ] Authentication works (Email/Password + Google)
- [ ] User permissions work correctly
- [ ] Core features tested and working
- [ ] No sensitive data exposed
- [ ] Error handling in place
- [ ] Monitoring set up (optional but recommended)

---

## 🆘 **IF SOMETHING GOES WRONG**

1. **Check Firebase Console** for errors
2. **Check Backend Logs** (hosting platform)
3. **Check Browser Console** for frontend errors
4. **Verify Environment Variables** are set correctly
5. **Test Locally** before deploying
6. **Check Security Rules** are deployed
7. **Verify Database Connections** are working

---

## 📝 **NOTES**

- **Demo Mode**: The site will fall back to demo mode if Firebase fails to initialize. This is good for testing but should not be used in production.

- **GitHub Pages**: Your frontend is currently on GitHub Pages. Consider Firebase Hosting for better integration with Firebase services.

- **Backend API**: The backend API is optional if you're using Firebase for all operations. However, it provides additional security and control.

- **MongoDB**: Only needed if using the Node.js backend API. If using Firebase exclusively, MongoDB is not required.

---

**Once all critical items are checked, your site will be ready to go live! 🚀**

