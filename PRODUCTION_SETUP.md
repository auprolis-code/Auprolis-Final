# Production Setup Guide for Auprolis

This guide will help you prepare the Auprolis application for production deployment.

## ✅ Completed Setup

1. **Google Sheets Integration** - Configured and working
2. **Admin Dashboard** - Ready with user management
3. **Firebase SDK** - All required scripts added
4. **Authentication Flow** - Google Sheets verification working

## 🔧 Firebase Configuration Required

### Step 1: Enable Firebase Services

Go to [Firebase Console](https://console.firebase.google.com/) → Select project `auprolis-mvp2`

#### 1.1 Authentication
- ✅ **Email/Password** - Already enabled
- ✅ **Google Sign-In** - Already enabled
- **Action Required**: Verify both are enabled in Authentication → Sign-in method

#### 1.2 Firestore Database
- **Action Required**: 
  1. Go to **Firestore Database**
  2. If not created, click "Create database"
  3. Choose "Start in production mode" (or test mode for now)
  4. Select location closest to your users
  5. Deploy security rules from `firestore.rules`

#### 1.3 Realtime Database (Optional)
- **Status**: SDK is loaded, but database is optional
- **Action Required**: Only enable if you plan to use it
  - Go to **Realtime Database** → Create database
  - Choose location
  - Set up security rules

### Step 2: Security Rules

#### Firestore Rules
Deploy the security rules from `firestore.rules`:
1. Go to **Firestore Database** → **Rules**
2. Copy content from `firestore.rules` file
3. Click "Publish"

#### Realtime Database Rules (if using)
1. Go to **Realtime Database** → **Rules**
2. Copy content from `database.rules.json`
3. Click "Publish"

### Step 3: Create Admin User in Firebase

1. Go to **Authentication** → **Users**
2. Click "Add user"
3. Enter:
   - **Email**: `auprolis@gmail.com`
   - **Password**: (set a strong password)
4. Click "Add user"

### Step 4: Add Users to Google Sheets

Users must be added to Google Sheets before they can log in:

1. **Admin logs in** with `auprolis@gmail.com`
2. **Go to Admin Dashboard** → **User Management**
3. **Click "Add User"**
4. Fill in:
   - First Name
   - Last Name
   - Email
   - Phone (optional)
   - Select Tab: **Buyers** or **Sheriffs**
5. Data is copied to clipboard
6. **Paste into Google Sheets** in the appropriate tab

### Step 5: Google Sheets Setup

#### Publish Google Sheets
1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1lMVPGTNptVxn8NS7937FtxI9NAC5VeJKlXEPL5pTwmg/edit
2. Go to **File** → **Share** → **Publish to the web**
3. For each tab (Buyers and Sheriffs):
   - Select the tab
   - Choose "Comma-separated values (.csv)"
   - Click "Publish"
4. Verify CSV export works by opening:
   - Buyers: `https://docs.google.com/spreadsheets/d/1lMVPGTNptVxn8NS7937FtxI9NAC5VeJKlXEPL5pTwmg/gviz/tq?tqx=out:csv&gid=0`
   - Sheriffs: `https://docs.google.com/spreadsheets/d/1lMVPGTNptVxn8NS7937FtxI9NAC5VeJKlXEPL5pTwmg/gviz/tq?tqx=out:csv&gid=2054246567`

## 📋 Production Checklist

### Firebase Setup
- [ ] Email/Password authentication enabled
- [ ] Google Sign-In enabled
- [ ] Firestore Database created
- [ ] Firestore security rules deployed
- [ ] Admin user (`auprolis@gmail.com`) created in Firebase Authentication
- [ ] Realtime Database created (if needed)
- [ ] Realtime Database rules deployed (if using)

### Google Sheets Setup
- [ ] Buyers tab published as CSV
- [ ] Sheriffs tab published as CSV
- [ ] CSV export URLs are accessible
- [ ] Test users added to appropriate tabs

### Application Configuration
- [ ] All Firebase SDK scripts loaded (✅ Done)
- [ ] Firebase config matches your project (✅ Done)
- [ ] Google Sheets service configured (✅ Done)
- [ ] Admin dashboard accessible (✅ Done)

### Testing
- [ ] Admin can log in with `auprolis@gmail.com`
- [ ] Admin can add users to Google Sheets
- [ ] Buyers can log in and access buyer dashboard
- [ ] Sheriffs can log in and access sheriff dashboard
- [ ] Users not in Google Sheets are denied access
- [ ] Google Sheets verification works correctly

## 🚀 Deployment

### GitHub Pages (Current)
- ✅ Code is pushed to GitHub
- ✅ GitHub Pages is enabled
- ⚠️ **Note**: GitHub Pages may cache files. Clear browser cache or wait a few minutes after pushing changes.

### Alternative: Firebase Hosting (Recommended for Production)
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init hosting`
4. Deploy: `firebase deploy --only hosting`

## 🔒 Security Considerations

1. **Firebase Security Rules**: Ensure rules are properly configured
2. **API Keys**: Firebase API keys are safe to expose in client-side code
3. **Google Sheets**: Keep the sheet private or restrict access
4. **Admin Access**: Only `auprolis@gmail.com` should have admin access
5. **User Verification**: All users must be in Google Sheets to access the app

## 📝 Notes

- **Demo Mode**: Will automatically activate if Firebase fails to initialize
- **Google Sheets**: Acts as the user registry/backend
- **Firebase**: Handles authentication only
- **Firestore**: Used for storing application data (listings, reservations, etc.)

## 🆘 Troubleshooting

### "Firebase initialization failed"
- Check browser console for specific error
- Verify Firebase SDK scripts are loading
- Check Firebase project configuration

### "User not found in Google Sheets"
- Verify user email is in the correct tab (Buyers or Sheriffs)
- Check that Google Sheets is published
- Verify CSV export URLs are accessible
- Check browser console for parsing errors

### "Demo mode" when Firebase should work
- Clear browser cache
- Check Firebase initialization errors in console
- Verify Firebase config matches your project

## 📞 Support

For issues, check:
1. Browser console for errors
2. Firebase Console for authentication issues
3. Google Sheets for user data
4. Network tab for failed requests

