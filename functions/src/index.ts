import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
admin.initializeApp();

const db = admin.database();
const firestore = admin.firestore();
const auth = admin.auth();

/**
 * Cloud Function: onNewBid
 * 
 * Triggered when a new bid is placed in Firebase Realtime Database at /bids/{bidId}
 * This function logs the bid details and can trigger notifications to other bidders or the sheriff.
 * 
 * @example
 * When a bid is created:
 * {
 *   bidId: "bid123",
 *   userId: "user456",
 *   assetId: "asset789",
 *   amount: 550000,
 *   createdAt: 1234567890
 * }
 */
export const onNewBid = functions.database
  .ref('/bids/{bidId}')
  .onWrite(async (change, context) => {
    const bidId = context.params.bidId;
    const bidData = change.after.val();

    // If bid was deleted, exit early
    if (!bidData) {
      console.log(`Bid ${bidId} was deleted`);
      return null;
    }

    // Check if this is a new bid (not an update)
    const beforeData = change.before.val();
    const isNewBid = !beforeData;

    try {
      // Log bid details
      console.log(`New bid placed:`, {
        bidId,
        userId: bidData.userId,
        assetId: bidData.assetId,
        amount: bidData.amount,
        isNewBid,
        timestamp: new Date().toISOString()
      });

      // Get asset details from Firestore
      const assetDoc = await firestore.collection('assets').doc(bidData.assetId).get();
      
      if (!assetDoc.exists) {
        console.error(`Asset ${bidData.assetId} not found`);
        return null;
      }

      const assetData = assetDoc.data();
      const assetOwnerId = assetData?.createdBy;

      // Update asset's highest bid in Firestore (if needed)
      if (isNewBid || (beforeData && bidData.amount > beforeData.amount)) {
        await firestore.collection('assets').doc(bidData.assetId).update({
          highestBid: bidData.amount,
          highestBidder: bidData.userId,
          lastBidAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }

      // Get user details for notification
      const bidderDoc = await firestore.collection('users').doc(bidData.userId).get();
      const bidderData = bidderDoc.data();

      // Create notification for asset owner (sheriff)
      if (assetOwnerId && assetOwnerId !== bidData.userId) {
        const notificationRef = db.ref(`notifications/${assetOwnerId}`).push();
        await notificationRef.set({
          type: 'new_bid',
          message: `New bid of ${bidData.amount} BWP placed on ${assetData?.title || 'your asset'}`,
          assetId: bidData.assetId,
          bidId: bidId,
          bidderName: bidderData?.fullName || bidderData?.displayName || 'A buyer',
          amount: bidData.amount,
          read: false,
          createdAt: admin.database.ServerValue.TIMESTAMP
        });
      }

      // Get all other bidders for this asset to notify them
      const bidsSnapshot = await db.ref('bids')
        .orderByChild('assetId')
        .equalTo(bidData.assetId)
        .once('value');

      const notifiedUsers = new Set<string>();
      notifiedUsers.add(bidData.userId); // Don't notify the bidder themselves
      if (assetOwnerId) {
        notifiedUsers.add(assetOwnerId); // Already notified above
      }

      bidsSnapshot.forEach((bidSnapshot) => {
        const otherBid = bidSnapshot.val();
        if (otherBid.userId && !notifiedUsers.has(otherBid.userId) && otherBid.userId !== bidData.userId) {
          notifiedUsers.add(otherBid.userId);
          
          // Notify other bidders that they've been outbid
          db.ref(`notifications/${otherBid.userId}`).push().set({
            type: 'outbid',
            message: `You've been outbid on ${assetData?.title || 'an asset'}. New bid: ${bidData.amount} BWP`,
            assetId: bidData.assetId,
            bidId: bidId,
            amount: bidData.amount,
            read: false,
            createdAt: admin.database.ServerValue.TIMESTAMP
          });
        }
      });

      console.log(`Bid ${bidId} processed successfully`);
      return null;
    } catch (error) {
      console.error(`Error processing bid ${bidId}:`, error);
      throw error;
    }
  });

/**
 * Cloud Function: syncGoogleSheetUser
 * 
 * HTTP Callable function that your Node.js backend can invoke to sync user data
 * from Google Sheets verification into Firebase Authentication and set custom claims.
 * 
 * This function expects:
 * - email: string (user's email)
 * - userType: 'buyer' | 'sheriff' | 'admin'
 * - verifiedInSheets: boolean (whether user was verified in Google Sheets)
 * - additionalData?: object (optional user profile data)
 * 
 * @example
 * From your Node.js backend:
 * const functions = require('firebase-functions');
 * const syncUser = functions.httpsCallable('syncGoogleSheetUser');
 * await syncUser({ email: 'user@example.com', userType: 'buyer', verifiedInSheets: true });
 */
export const syncGoogleSheetUser = functions.https.onCall(async (data, context) => {
  // Verify the request is authenticated (optional, but recommended)
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    );
  }

  const { email, userType, verifiedInSheets, additionalData } = data;

  // Validate required fields
  if (!email || !userType || typeof verifiedInSheets !== 'boolean') {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Missing required fields: email, userType, verifiedInSheets'
    );
  }

  // Validate userType
  const validUserTypes = ['buyer', 'sheriff', 'admin'];
  if (!validUserTypes.includes(userType)) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      `Invalid userType. Must be one of: ${validUserTypes.join(', ')}`
    );
  }

  try {
    // If user is not verified in Google Sheets, reject
    if (!verifiedInSheets) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'User is not verified in Google Sheets'
      );
    }

    // Find user by email in Firebase Auth
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(email);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        // User doesn't exist in Firebase Auth yet
        // You might want to create them here, or return an error
        throw new functions.https.HttpsError(
          'not-found',
          'User not found in Firebase Authentication. Please create the user first.'
        );
      }
      throw error;
    }

    // Set custom claims for userType
    await auth.setCustomUserClaims(userRecord.uid, {
      userType: userType,
      verified: true,
      verifiedAt: Date.now()
    });

    // Update user document in Firestore
    const userRef = firestore.collection('users').doc(userRecord.uid);
    const userDoc = await userRef.get();

    const userData = {
      uid: userRecord.uid,
      email: email,
      userType: userType,
      isEmailVerified: userRecord.emailVerified,
      verifiedInSheets: true,
      verifiedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      ...additionalData
    };

    if (userDoc.exists) {
      // Update existing user
      await userRef.update(userData);
      console.log(`Updated user ${userRecord.uid} with userType ${userType}`);
    } else {
      // Create new user document
      await userRef.set({
        ...userData,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`Created user document for ${userRecord.uid} with userType ${userType}`);
    }

    // Also update in Realtime Database if you're using it
    const realtimeUserRef = db.ref(`users/${userRecord.uid}`);
    await realtimeUserRef.update({
      userType: userType,
      verifiedInSheets: true,
      verifiedAt: admin.database.ServerValue.TIMESTAMP,
      updatedAt: admin.database.ServerValue.TIMESTAMP
    });

    return {
      success: true,
      message: `User ${email} synced successfully with userType ${userType}`,
      uid: userRecord.uid,
      userType: userType
    };
  } catch (error: any) {
    console.error('Error syncing user:', error);
    
    // If it's already an HttpsError, re-throw it
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }

    // Otherwise, wrap it in an HttpsError
    throw new functions.https.HttpsError(
      'internal',
      `Failed to sync user: ${error.message}`
    );
  }
});

