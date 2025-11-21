# Firebase Backend Setup Summary for Auprolis

This document summarizes all the Firebase backend components that have been configured for the Auprolis application.

## 📁 Files Created/Updated

### 1. Configuration Files

#### `firebase.json`
- ✅ Added `functions` section configured for TypeScript
- ✅ Functions source directory: `functions` (compiles `src/index.ts` to `lib/index.js`)
- ✅ Predeploy script to build TypeScript before deployment
- ✅ `firestore` section linking to `firestore.rules` and `firestore.indexes.json`
- ✅ `database` section linking to `database.rules.json`
- ❌ Removed `hosting` section (using GitHub Pages)

#### `database.rules.json` (Realtime Database)
- ✅ **Bidding Rules** (`/bids/{bidId}`):
  - **Read**: All authenticated users can read bids for assets they're associated with
  - **Write**: Only Buyers and Sheriffs can place new bids (must match their `userId`)
  
- ✅ **Chat Rules** (`/chats/{assetId}/{messageId}`):
  - **Read**: Users can read messages for assets where they are the sender, receiver, or asset owner
  - **Write**: Buyers and Sheriffs can send messages only for assets they're associated with (must be sender and either receiver is asset owner or sender is asset owner)
  
- ✅ **Default Deny**: All other paths default to `.read: false, .write: false`

#### `firestore.rules` (Cloud Firestore)
- ✅ **Users Collection** (`/users/{userId}`):
  - Users can read/update their own documents
  - Admins have full CRUD access
  
- ✅ **Assets Collection** (`/assets/{assetId}`):
  - All authenticated users can read
  - Only Sheriffs and Admins can create assets
  - Only asset owner (Sheriff/Admin) or Admin can update
  - Only Admin can delete
  
- ✅ **Reservations Collection** (`/reservations/{reservationId}`):
  - Buyers can create and read their own reservations
  - Sheriffs can read and update reservations for their assets
  - Admins have full CRUD access

### 2. Cloud Functions (TypeScript)

#### `functions/package.json`
- ✅ TypeScript configuration
- ✅ Firebase Admin SDK and Functions SDK dependencies
- ✅ Build and deployment scripts
- ✅ Node.js 18 engine requirement

#### `functions/tsconfig.json`
- ✅ TypeScript compiler configuration
- ✅ Strict mode enabled
- ✅ Output to `lib/` directory
- ✅ ES2020 target

#### `functions/src/index.ts`
Contains two example Cloud Functions:

1. **`onNewBid`** (Realtime Database Trigger)
   - Triggered when a bid is created/updated in `/bids/{bidId}`
   - Logs bid details
   - Updates asset's highest bid in Firestore
   - Creates notifications for:
     - Asset owner (sheriff) when new bid is placed
     - Other bidders when they're outbid
   - Handles bid updates and deletions

2. **`syncGoogleSheetUser`** (HTTP Callable Function)
   - Can be invoked from your Node.js backend
   - Accepts: `email`, `userType`, `verifiedInSheets`, `additionalData`
   - Validates user verification in Google Sheets
   - Sets custom claims in Firebase Auth (`userType`, `verified`)
   - Updates user document in Firestore
   - Updates user data in Realtime Database
   - Returns success/error response

#### Supporting Files
- ✅ `functions/.gitignore` - Excludes `node_modules/`, `lib/`, logs
- ✅ `functions/.eslintrc.js` - ESLint configuration (optional)

## 🔧 Security Rules Summary

### Realtime Database Rules

| Path | Read Access | Write Access |
|------|------------|--------------|
| `/users/{uid}` | Own data or Admin | Own data or Admin |
| `/assets` | All authenticated | Sheriffs/Admins only |
| `/assets/{assetId}` | All authenticated | Asset owner or Admin |
| `/bids/{bidId}` | All authenticated (associated assets) | Buyers/Sheriffs only |
| `/chats/{assetId}/{messageId}` | Sender/Receiver/Asset owner | Buyers/Sheriffs (associated assets) |
| `/reservations/{reservationId}` | Own or Admin | Own or Admin |
| `/watchlist/{watchlistId}` | Own | Own |
| `/notifications/{uid}` | Own | Own or Admin |

### Firestore Rules

| Collection | Read | Create | Update | Delete |
|------------|------|--------|--------|--------|
| `users/{userId}` | Own or Admin | Own | Own or Admin | Admin only |
| `assets/{assetId}` | All authenticated | Sheriff/Admin | Owner or Admin | Admin only |
| `reservations/{reservationId}` | Own/Sheriff (own assets)/Admin | Buyer (own) | Own/Sheriff (own assets)/Admin | Own or Admin |
| `watchlist/{watchlistId}` | Own or Admin | Own | Own | Own |

## 🚀 Deployment Checklist

Before deploying, ensure:

- [ ] Firebase CLI is installed: `npm install -g firebase-tools`
- [ ] Logged in to Firebase: `firebase login`
- [ ] Project selected: `firebase use auprolis-mvp2`
- [ ] Functions dependencies installed: `cd functions && npm install`
- [ ] Functions build successfully: `npm run build`
- [ ] Test rules locally (optional): `firebase emulators:start`

## 📝 Next Steps

1. **Install Functions Dependencies:**
   ```bash
   cd functions
   npm install
   cd ..
   ```

2. **Build Functions:**
   ```bash
   npm --prefix functions run build
   ```

3. **Test Locally (Optional):**
   ```bash
   firebase emulators:start
   ```

4. **Deploy:**
   ```bash
   # Deploy everything
   firebase deploy
   
   # Or deploy individually
   firebase deploy --only functions
   firebase deploy --only firestore:rules
   firebase deploy --only database
   ```

5. **Integrate with Node.js Backend:**
   - Install Firebase Admin SDK in your backend
   - Call `syncGoogleSheetUser` function after Google Sheets verification
   - Use Firebase Admin SDK to manage users and set custom claims

## 🔗 Integration with Node.js Backend

### Calling `syncGoogleSheetUser` from Backend

```javascript
// In your Node.js backend
const admin = require('firebase-admin');
const functions = require('firebase-functions');

// Initialize Admin SDK (if not already done)
if (!admin.apps.length) {
  admin.initializeApp();
}

// Call the function
const syncUser = functions.httpsCallable('syncGoogleSheetUser');

async function syncUserAfterVerification(email, userType) {
  try {
    const result = await syncUser({
      email: email,
      userType: userType,
      verifiedInSheets: true,
      additionalData: {
        // Optional: additional user data
      }
    });
    
    console.log('User synced:', result.data);
    return result.data;
  } catch (error) {
    console.error('Error syncing user:', error);
    throw error;
  }
}
```

### Using Custom Claims in Your Backend

After `syncGoogleSheetUser` sets custom claims, you can verify them:

```javascript
// Verify user token and get custom claims
const decodedToken = await admin.auth().verifyIdToken(idToken);
const userType = decodedToken.userType; // 'buyer', 'sheriff', or 'admin'
const verified = decodedToken.verified; // true
```

## 📚 Documentation Files

- **`FIREBASE_CLI_COMMANDS.md`** - Complete guide to Firebase CLI commands
- **`AUPROLIS_COMPLETE_OVERVIEW.md`** - Complete application overview
- **`FIREBASE_SETUP.md`** - Original Firebase setup guide
- **`REALTIME_DATABASE_SETUP.md`** - Realtime Database setup guide

## ⚠️ Important Notes

1. **Custom Claims**: The `syncGoogleSheetUser` function sets custom claims. Users must re-authenticate for claims to take effect in the client.

2. **Billing**: Cloud Functions have a free tier, but monitor usage to avoid unexpected charges.

3. **Security**: All security rules are enforced at the database level. Client-side checks are for UX only.

4. **Testing**: Always test rules and functions locally before deploying to production.

5. **Environment Variables**: For sensitive data (API keys, etc.), use Firebase's environment configuration or `.env` files.

## 🎯 Function Triggers

### `onNewBid` Trigger
- **Type**: Realtime Database `onWrite`
- **Path**: `/bids/{bidId}`
- **Triggers**: When a bid is created, updated, or deleted
- **Actions**: 
  - Updates asset highest bid
  - Sends notifications to asset owner
  - Sends outbid notifications to other bidders

### `syncGoogleSheetUser` Trigger
- **Type**: HTTP Callable
- **Endpoint**: `https://us-central1-auprolis-mvp2.cloudfunctions.net/syncGoogleSheetUser`
- **Invoked**: From your Node.js backend after Google Sheets verification
- **Actions**:
  - Sets custom claims in Firebase Auth
  - Updates user document in Firestore
  - Updates user data in Realtime Database

## ✅ Verification

After deployment, verify:

1. **Functions are deployed:**
   ```bash
   firebase functions:list
   ```

2. **Rules are deployed:**
   - Check Firebase Console → Firestore → Rules
   - Check Firebase Console → Realtime Database → Rules

3. **Functions are working:**
   - Check Firebase Console → Functions → Logs
   - Test `syncGoogleSheetUser` from your backend
   - Place a test bid to trigger `onNewBid`

---

**All Firebase backend components are now configured and ready for deployment!**

