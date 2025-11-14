/**
 * Script to update user types in Firebase
 * Run with: node update-user-types.js
 * 
 * Note: You'll need to set up Firebase Admin SDK first:
 * npm install firebase-admin
 * 
 * Then set the GOOGLE_APPLICATION_CREDENTIALS environment variable
 * or provide service account credentials
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin (you'll need to provide credentials)
// Option 1: Use service account key file
// const serviceAccount = require('./path-to-service-account-key.json');
// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount)
// });

// Option 2: Use environment variable GOOGLE_APPLICATION_CREDENTIALS
// admin.initializeApp();

// Option 3: Use default credentials (if running on GCP)
try {
    admin.initializeApp();
} catch (error) {
    console.error('Firebase Admin initialization failed. Please set up credentials.');
    console.error('See: https://firebase.google.com/docs/admin/setup');
    process.exit(1);
}

const db = admin.firestore();
const realtimeDb = admin.database();

// User updates to perform
const userUpdates = [
    { email: 'thegreatmayabane@gmail.com', userType: 'buyer' },
    { email: 'auprolis@gmail.com', userType: 'admin' },
    { email: 'aivanguardd@gmail.com', userType: 'sheriff' }
];

async function findUserByEmail(email) {
    try {
        // Try Firestore first
        const firestoreQuery = await db.collection('users')
            .where('email', '==', email.toLowerCase())
            .limit(1)
            .get();

        if (!firestoreQuery.empty) {
            const doc = firestoreQuery.docs[0];
            return {
                uid: doc.id,
                data: doc.data(),
                source: 'firestore'
            };
        }

        // Try Realtime Database
        const realtimeSnapshot = await realtimeDb.ref('users')
            .orderByChild('email')
            .equalTo(email.toLowerCase())
            .once('value');

        if (realtimeSnapshot.exists()) {
            const users = realtimeSnapshot.val();
            const userId = Object.keys(users)[0];
            return {
                uid: userId,
                data: users[userId],
                source: 'realtime'
            };
        }

        return null;
    } catch (error) {
        console.error(`Error finding user ${email}:`, error.message);
        return null;
    }
}

async function updateUserInFirestore(uid, userType) {
    try {
        await db.collection('users').doc(uid).update({
            userType: userType,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`✓ Updated user ${uid} to ${userType} in Firestore`);
        return true;
    } catch (error) {
        console.error(`✗ Error updating Firestore: ${error.message}`);
        return false;
    }
}

async function updateUserInRealtimeDb(uid, userType) {
    try {
        await realtimeDb.ref(`users/${uid}`).update({
            userType: userType,
            updatedAt: admin.database.ServerValue.TIMESTAMP
        });
        console.log(`✓ Updated user ${uid} to ${userType} in Realtime Database`);
        return true;
    } catch (error) {
        console.error(`✗ Error updating Realtime Database: ${error.message}`);
        return false;
    }
}

async function updateUserTypes() {
    console.log('Starting user type updates...\n');

    let successCount = 0;
    let failCount = 0;

    for (const update of userUpdates) {
        console.log(`\nProcessing: ${update.email} → ${update.userType}`);
        
        const user = await findUserByEmail(update.email);
        
        if (!user) {
            console.log(`✗ User not found: ${update.email}`);
            failCount++;
            continue;
        }

        console.log(`Found user: ${user.uid} (${user.data.email})`);
        console.log(`Current userType: ${user.data.userType || 'not set'}`);

        // Update in Firestore
        const firestoreSuccess = await updateUserInFirestore(user.uid, update.userType);
        
        // Update in Realtime Database
        const realtimeSuccess = await updateUserInRealtimeDb(user.uid, update.userType);

        if (firestoreSuccess || realtimeSuccess) {
            console.log(`✓ Successfully updated ${update.email} to ${update.userType}`);
            successCount++;
        } else {
            console.log(`✗ Failed to update ${update.email}`);
            failCount++;
        }
    }

    console.log(`\n=== Update Complete ===`);
    console.log(`Success: ${successCount}`);
    console.log(`Failed: ${failCount}`);

    process.exit(failCount > 0 ? 1 : 0);
}

// Run the update
updateUserTypes().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});

