# Firebase Setup Guide for Auprolis

This guide will help you set up Firebase for user storage and authentication in the Auprolis platform.

## Prerequisites

- A Firebase account (free tier is sufficient)
- Access to Firebase Console: https://console.firebase.google.com/

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select your existing project (`auprolis-mvp2`)
3. Follow the setup wizard:
   - Enter project name: `auprolis-mvp2` (or your preferred name)
   - Enable Google Analytics (optional)
   - Create project

## Step 2: Enable Authentication

1. In Firebase Console, go to **Authentication** → **Get started**
2. Enable **Email/Password** authentication:
   - Click on "Email/Password"
   - Toggle "Enable" 
   - Click "Save"
3. Enable **Google** authentication:
   - Click on "Google"
   - Toggle "Enable"
   - Enter project support email
   - Click "Save"

## Step 3: Set Up Firestore Database

1. In Firebase Console, go to **Firestore Database** → **Create database**
2. Choose **Start in test mode** (we'll add security rules next)
3. Select a location (choose closest to your users)
4. Click "Enable"

## Step 4: Deploy Security Rules

1. Install Firebase CLI (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase in your project (if not already done):
   ```bash
   firebase init firestore
   ```
   - Select your Firebase project
   - Use `firestore.rules` as the rules file

4. Deploy the security rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

   Or manually copy the rules from `firestore.rules` to Firebase Console:
   - Go to **Firestore Database** → **Rules**
   - Paste the rules from `firestore.rules`
   - Click "Publish"

## Step 5: Verify Firebase Configuration

Your Firebase configuration is already set in `assets/js/firebase-config.js`:

```javascript
const firebaseConfig = {
    apiKey: "AIzaSyA9VPtRDIz4m903N4r4SDzIXPfU4LScCUQ",
    authDomain: "auprolis-mvp2.firebaseapp.com",
    projectId: "auprolis-mvp2",
    storageBucket: "auprolis-mvp2.firebasestorage.app",
    messagingSenderId: "954767989673",
    appId: "1:954767989673:web:c22f4ebb2227c9cf0d42b8",
    measurementId: "G-VQY6T0Q7Y0"
};
```

If you created a new project, update this configuration:
1. Go to **Project Settings** (gear icon) → **General**
2. Scroll to "Your apps" section
3. Copy the config values to `assets/js/firebase-config.js`

## Step 6: User Data Structure

Users are stored in the `users` collection with the following structure:

```javascript
{
  uid: "user-id-from-firebase-auth",
  email: "user@example.com",
  fullName: "John Doe",
  firstName: "John",
  lastName: "Doe",
  displayName: "John Doe",
  phone: "+267 712 345 678", // optional
  userType: "buyer" | "seller" | "admin" | "sheriff",
  subscriptionStatus: "pending" | "active" | "expired" | "cancelled",
  paymentStatus: "pending" | "completed" | "failed" | "refunded",
  status: "active" | "inactive" | "suspended" | "deleted",
  googleId: "google-user-id", // for OAuth users
  isEmailVerified: true | false,
  permissions: ["placeBids", "createListings", ...],
  createdAt: Timestamp,
  updatedAt: Timestamp,
  lastActivity: Timestamp
}
```

## Step 7: Test User Registration

1. Open your application
2. Navigate to the signup page
3. Create a test account
4. Check Firestore Console to verify the user was created:
   - Go to **Firestore Database** → **Data**
   - Look for the `users` collection
   - Verify the user document exists

## Step 8: Security Rules Overview

The security rules in `firestore.rules` provide:

- **Users Collection**: 
  - Users can read/update their own data
  - Admins can read/update/delete any user
  - Users can create their own profile

- **Assets Collection**:
  - All authenticated users can read
  - Only sellers, sheriffs, and admins can create
  - Only asset owner or admin can update
  - Only admin can delete

- **Reservations Collection**:
  - Users can manage their own reservations
  - Admins have full access

- **Watchlist Collection**:
  - Users can manage their own watchlist items

## Troubleshooting

### "Permission denied" errors
- Check that security rules are deployed
- Verify user is authenticated
- Check user's `userType` and `status` fields

### User not appearing in Firestore
- Check browser console for errors
- Verify Firebase initialization
- Check network tab for failed requests

### Authentication not working
- Verify Email/Password and Google auth are enabled
- Check Firebase config matches your project
- Ensure Firebase SDK is loaded before auth scripts

## Next Steps

1. Set up additional collections (assets, reservations, watchlist)
2. Configure Firebase Storage for file uploads (if needed)
3. Set up Firebase Functions for server-side operations (optional)
4. Configure Firebase Hosting for production deployment

## Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Authentication](https://firebase.google.com/docs/auth)



