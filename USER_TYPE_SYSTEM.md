# User Type System Documentation

## Overview

The Auprolis platform supports **3 user types**:
- **Admin** - Full system access and management
- **Buyer** - Can browse assets, place bids, and make reservations
- **Sheriff** - Can create and manage asset listings, place bids

## Database Structure

### User Data Schema

All users are stored with the following structure in both Firestore and Realtime Database:

```javascript
{
  uid: "user-id-from-firebase-auth",
  email: "user@example.com",
  fullName: "John Doe",
  firstName: "John",
  lastName: "Doe",
  displayName: "John Doe",
  phone: "+267 712 345 678", // optional
  userType: "admin" | "buyer" | "sheriff", // REQUIRED - Only these 3 types are valid
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

### Important: User Type Validation

- Only `"admin"`, `"buyer"`, and `"sheriff"` are valid user types
- Invalid user types will default to `"buyer"`
- Any attempt to set an invalid user type will throw an error

## Automatic User Type Detection

The system automatically detects user type on login using the `UserTypeService`:

```javascript
// Automatically detect user type
const userType = await userTypeService.detectUserType(userId);

// Check specific user type
const isAdmin = await userTypeService.isAdmin(userId);
const isBuyer = await userTypeService.isBuyer(userId);
const isSheriff = await userTypeService.isSheriff(userId);

// Get full user data with type
const user = await userTypeService.getUserWithType(userId);
```

## User Permissions

### Admin Permissions
- `placeBids` - Can place bids on assets
- `createListings` - Can create asset listings
- `manageBids` - Can manage all bids
- `manageUsers` - Can manage all users
- `viewAnalytics` - Can view system analytics
- `manageSystem` - Full system management
- `deleteAssets` - Can delete any asset
- `manageAllReservations` - Can manage all reservations

### Sheriff Permissions
- `placeBids` - Can place bids on assets
- `createListings` - Can create asset listings
- `manageBids` - Can manage bids on their assets
- `viewAnalytics` - Can view analytics for their assets
- `manageOwnReservations` - Can manage their own reservations

### Buyer Permissions
- `placeBids` - Can place bids on assets
- `viewAssets` - Can view asset listings
- `manageOwnReservations` - Can manage their own reservations
- `manageOwnWatchlist` - Can manage their own watchlist

## Database Access Rules

### Firestore Rules

- **Users Collection**: Users can read/update their own data, admins can access all
- **Assets Collection**: 
  - All authenticated users can read
  - Only **sheriffs** and **admins** can create assets (buyers cannot)
  - Only asset owner or admin can update
  - Only admin can delete
- **Reservations**: Users can manage their own, admins can manage all
- **Watchlist**: Users can manage their own

### Realtime Database Rules

- **Users**: Users can read/write their own data, admins can access all
- **Assets**: 
  - All authenticated users can read
  - Only **sheriffs** and **admins** can create (buyers cannot)
  - Only asset owner or admin can update
- **Reservations**: Users can manage their own, admins can manage all
- **Bids**: All authenticated users can read, users can create their own
- **Notifications**: Users can read their own

## Usage Examples

### On Login - Automatic Detection

```javascript
// After successful authentication
firebase.auth().onAuthStateChanged(async (user) => {
    if (user) {
        // Automatically detect user type
        const userType = await userTypeService.detectUserType(user.uid);
        
        // Redirect to appropriate dashboard
        await userTypeService.redirectToDashboard(user.uid);
        
        // Or manually redirect
        switch (userType) {
            case 'admin':
                window.location.href = 'admin-dashboard.html';
                break;
            case 'sheriff':
                window.location.href = 'sheriff-dashboard.html';
                break;
            case 'buyer':
                window.location.href = 'buyer-dashboard.html';
                break;
        }
    }
});
```

### Using Firestore Service

```javascript
// Get user type
const userType = await firestoreUserService.getUserType(userId);

// Check if admin
const isAdmin = await firestoreUserService.isAdmin(userId);

// Set user type (admin only)
await firestoreUserService.setUserType(userId, 'sheriff');
```

### Using Realtime Database Service

```javascript
// Get user type
const userType = await realtimeDbService.getUserType(userId);

// Check if sheriff
const isSheriff = await realtimeDbService.isSheriff(userId);

// Get all buyers
const buyers = await realtimeDbService.getUsersByType('buyer');
```

## Dashboard Routing

The system automatically routes users to the correct dashboard:

- **Admin** → `admin-dashboard.html`
- **Sheriff** → `sheriff-dashboard.html`
- **Buyer** → `buyer-dashboard.html`

```javascript
// Automatic routing
await userTypeService.redirectToDashboard(userId);

// Or get URL
const dashboardUrl = await userTypeService.getDashboardUrl(userId);
window.location.href = dashboardUrl;
```

## Security Considerations

1. **User Type Validation**: Always validate user types before use
2. **Database Rules**: Security rules enforce permissions at the database level
3. **Client-Side Checks**: Client-side checks are for UX only, not security
4. **Server-Side Validation**: Always validate on the server/backend

## Creating Users

When creating a new user, always specify a valid user type:

```javascript
// Create user with type
await firestoreUserService.storeUser(userId, {
    email: 'user@example.com',
    fullName: 'John Doe',
    userType: 'buyer', // Must be 'admin', 'buyer', or 'sheriff'
    status: 'active',
    // ... other fields
});
```

## Testing User Types

```javascript
// Test user type detection
const userType = await userTypeService.detectUserType('test-user-id');
console.log('User type:', userType);

// Test permissions
const permissions = userTypeService.getPermissionsForUserType(userType);
console.log('Permissions:', permissions);

// Test display name
const displayName = userTypeService.getUserTypeDisplayName(userType);
console.log('Display name:', displayName);
```

## Migration Notes

- Old user types like `"seller"` are no longer supported
- Users with invalid types will default to `"buyer"`
- Update existing users to use one of the 3 valid types

## Files Reference

- `assets/js/user-type-service.js` - Unified user type service
- `assets/js/firestore-user-service.js` - Firestore user operations
- `assets/js/realtime-db-service.js` - Realtime Database operations
- `firestore.rules` - Firestore security rules
- `database.rules.json` - Realtime Database security rules

