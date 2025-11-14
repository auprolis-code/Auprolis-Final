# Instructions to Update User Types

## Option 1: Using the HTML Page (Recommended)

1. The file `update-user-types.html` has been opened in your browser
2. **Important**: You need to be logged in as an admin user first
3. Click the "Update User Types" button
4. The script will:
   - Find each user by email
   - Update their userType in both Firestore and Realtime Database
   - Show progress and results

## Option 2: Using Browser Console

If you prefer to run it manually, follow these steps:

1. Open your app and log in as an admin user
2. Open browser console (F12)
3. Make sure Firebase is initialized
4. Run this script:

```javascript
// User updates to perform
const userUpdates = [
    { email: 'thegreatmayabane@gmail.com', userType: 'buyer' },
    { email: 'auprolis@gmail.com', userType: 'admin' },
    { email: 'aivanguardd@gmail.com', userType: 'sheriff' }
];

async function updateUserTypes() {
    for (const update of userUpdates) {
        try {
            // Find user in Firestore
            const querySnapshot = await db.collection('users')
                .where('email', '==', update.email.toLowerCase())
                .limit(1)
                .get();
            
            if (!querySnapshot.empty) {
                const doc = querySnapshot.docs[0];
                const uid = doc.id;
                
                // Update Firestore
                await db.collection('users').doc(uid).update({
                    userType: update.userType,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                console.log(`✓ Updated ${update.email} to ${update.userType} in Firestore`);
                
                // Update Realtime Database
                await realtimeDb.ref(`users/${uid}`).update({
                    userType: update.userType,
                    updatedAt: firebase.database.ServerValue.TIMESTAMP
                });
                console.log(`✓ Updated ${update.email} to ${update.userType} in Realtime Database`);
            } else {
                console.log(`✗ User not found: ${update.email}`);
            }
        } catch (error) {
            console.error(`Error updating ${update.email}:`, error);
        }
    }
    console.log('Update complete!');
}

updateUserTypes();
```

## Option 3: Direct Firebase Console

You can also update users directly in Firebase Console:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `auprolis-mvp2`
3. Go to **Firestore Database** → **Data**
4. Find the `users` collection
5. Search for each email and update the `userType` field:
   - `thegreatmayabane@gmail.com` → `buyer`
   - `auprolis@gmail.com` → `admin`
   - `aivanguardd@gmail.com` → `sheriff`
6. Repeat for **Realtime Database** if you're using it

## Verification

After updating, verify the changes:

1. Check in Firebase Console that userType is set correctly
2. Try logging in with each account
3. Verify they're redirected to the correct dashboard:
   - Admin → `admin-dashboard.html`
   - Sheriff → `sheriff-dashboard.html`
   - Buyer → `buyer-dashboard.html`

