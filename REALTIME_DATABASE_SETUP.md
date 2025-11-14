# Firebase Realtime Database Setup Guide

This guide explains how to configure and use Firebase Realtime Database in your Auprolis project.

## Prerequisites

- Firebase project created: `auprolis-mvp2`
- Realtime Database enabled in Firebase Console

## Step 1: Enable Realtime Database in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `auprolis-mvp2`
3. Navigate to **Realtime Database** in the left sidebar
4. Click **Create Database**
5. Choose a location (select closest to your users)
6. Choose security rules:
   - **Start in test mode** (for initial setup)
   - Or **Start in locked mode** (if you want to configure rules first)
7. Click **Enable**

## Step 2: Get Your Database URL

After creating the database, you'll see your database URL. It will look like:
```
https://auprolis-mvp2-default-rtdb.firebaseio.com
```

Or for a specific region:
```
https://auprolis-mvp2-default-rtdb.europe-west1.firebasedatabase.app
```

## Step 3: Update Configuration

1. Open `assets/js/firebase-config.js`
2. Update the `databaseURL` in the `firebaseConfig` object with your actual database URL:

```javascript
const firebaseConfig = {
    // ... other config ...
    databaseURL: "https://YOUR-PROJECT-ID-default-rtdb.firebaseio.com"
};
```

## Step 4: Deploy Security Rules

### Option A: Using Firebase CLI

1. Install Firebase CLI (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase (if not already done):
   ```bash
   firebase init database
   ```
   - Select your Firebase project
   - Use `database.rules.json` as the rules file

4. Deploy the security rules:
   ```bash
   firebase deploy --only database
   ```

### Option B: Manual Deployment

1. Go to Firebase Console → **Realtime Database** → **Rules**
2. Copy the contents of `database.rules.json`
3. Paste into the rules editor
4. Click **Publish**

## Step 5: Include Realtime Database Service

Add the Realtime Database service script to your HTML files that need database functionality. Add this script **after** `firebase-config.js`:

```html
<script src="assets/js/firebase-config.js"></script>
<script src="assets/js/realtime-db-service.js"></script>
```

## Step 6: Using the Realtime Database Service

### Basic Usage

```javascript
// Store user data
await realtimeDbService.storeUser(userId, {
    email: 'user@example.com',
    fullName: 'John Doe',
    userType: 'buyer'
});

// Get user data
const user = await realtimeDbService.getUser(userId);

// Update user data
await realtimeDbService.updateUser(userId, {
    status: 'active'
});

// Store asset
await realtimeDbService.storeAsset(assetId, {
    title: 'Property for Sale',
    category: 'property',
    location: 'Gaborone',
    price: 500000
});

// Get all assets
const assets = await realtimeDbService.getAllAssets();
```

### Real-time Listeners

```javascript
// Listen to user data changes
const unsubscribe = realtimeDbService.onValue(`users/${userId}`, (data) => {
    console.log('User data updated:', data);
});

// Listen to new assets
const unsubscribeAssets = realtimeDbService.onChildAdded('assets', (asset, key) => {
    console.log('New asset added:', asset, key);
});

// Don't forget to unsubscribe when done
unsubscribe();
```

## Database Structure

The Realtime Database uses a JSON tree structure:

```
{
  "users": {
    "userId1": {
      "uid": "userId1",
      "email": "user@example.com",
      "fullName": "John Doe",
      "userType": "buyer",
      "createdAt": 1234567890,
      "updatedAt": 1234567890
    }
  },
  "assets": {
    "assetId1": {
      "assetId": "assetId1",
      "title": "Property for Sale",
      "category": "property",
      "location": "Gaborone",
      "price": 500000,
      "createdBy": "userId1",
      "createdAt": 1234567890
    }
  },
  "reservations": {
    "reservationId1": {
      "reservationId": "reservationId1",
      "userId": "userId1",
      "assetId": "assetId1",
      "status": "pending",
      "createdAt": 1234567890
    }
  },
  "bids": {
    "bidId1": {
      "bidId": "bidId1",
      "userId": "userId1",
      "assetId": "assetId1",
      "amount": 550000,
      "createdAt": 1234567890
    }
  },
  "watchlist": {
    "watchlistId1": {
      "watchlistId": "watchlistId1",
      "userId": "userId1",
      "assetId": "assetId1",
      "createdAt": 1234567890
    }
  },
  "notifications": {
    "userId1": {
      "notificationId1": {
        "message": "Your bid was accepted",
        "read": false,
        "createdAt": 1234567890
      }
    }
  }
}
```

## Security Rules Overview

The security rules in `database.rules.json` provide:

- **Users**: Users can read/write their own data, admins can access all users
- **Assets**: All authenticated users can read, only sellers/sheriffs/admins can write
- **Reservations**: Users can manage their own reservations
- **Watchlist**: Users can manage their own watchlist items
- **Bids**: All authenticated users can read, users can create their own bids
- **Notifications**: Users can read their own notifications

## Testing the Connection

1. Open your browser's developer console
2. Check for the message: "Realtime Database initialized"
3. Try storing a test user:
   ```javascript
   realtimeDbService.storeUser('test-user', {
       email: 'test@example.com',
       fullName: 'Test User',
       userType: 'buyer'
   });
   ```
4. Check Firebase Console → Realtime Database → Data to verify the data was stored

## Troubleshooting

### "Permission denied" errors
- Check that security rules are deployed
- Verify user is authenticated
- Check user's `userType` and permissions in the rules

### Database URL not working
- Verify the URL in Firebase Console → Realtime Database → Data
- Ensure the URL matches exactly (including region if specified)
- Check that Realtime Database is enabled (not just Firestore)

### Real-time listeners not working
- Ensure you're using the correct path
- Check browser console for errors
- Verify authentication status

## Differences: Realtime Database vs Firestore

- **Realtime Database**: JSON tree, better for real-time sync, simpler queries
- **Firestore**: Document-based, better for complex queries, more scalable

Your project is configured to use **both** databases:
- Use **Realtime Database** for real-time features (live bids, notifications, chat)
- Use **Firestore** for structured data (user profiles, asset listings)

## Next Steps

1. Update your HTML files to include `realtime-db-service.js`
2. Migrate or duplicate data operations to use Realtime Database where appropriate
3. Set up real-time listeners for live features
4. Test all database operations
5. Deploy security rules to production

## Resources

- [Firebase Realtime Database Documentation](https://firebase.google.com/docs/database)
- [Realtime Database Security Rules](https://firebase.google.com/docs/database/security)
- [Realtime Database Web API Reference](https://firebase.google.com/docs/reference/js/database)

