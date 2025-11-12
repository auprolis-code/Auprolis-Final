// Firestore User Service
// Helper functions for user data operations in Firestore

class FirestoreUserService {
    constructor() {
        this.db = typeof firebase !== 'undefined' && firebase.firestore ? firebase.firestore() : null;
    }

    /**
     * Store user data in Firestore
     * @param {string} uid - User ID from Firebase Auth
     * @param {object} userData - User data to store
     * @returns {Promise<void>}
     */
    async storeUser(uid, userData) {
        if (!this.db) {
            throw new Error('Firestore not initialized');
        }

        try {
            // Ensure required fields
            const userDoc = {
                ...userData,
                uid: uid,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastActivity: firebase.firestore.FieldValue.serverTimestamp()
            };

            await this.db.collection('users').doc(uid).set(userDoc, { merge: false });
            console.log('User data stored successfully in Firestore');
            return userDoc;
        } catch (error) {
            console.error('Error storing user data in Firestore:', error);
            throw error;
        }
    }

    /**
     * Update user data in Firestore
     * @param {string} uid - User ID
     * @param {object} updates - Fields to update
     * @returns {Promise<void>}
     */
    async updateUser(uid, updates) {
        if (!this.db) {
            throw new Error('Firestore not initialized');
        }

        try {
            const updateData = {
                ...updates,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            await this.db.collection('users').doc(uid).update(updateData);
            console.log('User data updated successfully in Firestore');
        } catch (error) {
            console.error('Error updating user data in Firestore:', error);
            throw error;
        }
    }

    /**
     * Get user data from Firestore
     * @param {string} uid - User ID
     * @returns {Promise<object|null>}
     */
    async getUser(uid) {
        if (!this.db) {
            throw new Error('Firestore not initialized');
        }

        try {
            const userDoc = await this.db.collection('users').doc(uid).get();
            
            if (userDoc.exists) {
                return userDoc.data();
            }
            return null;
        } catch (error) {
            console.error('Error getting user data from Firestore:', error);
            throw error;
        }
    }

    /**
     * Get user by email
     * @param {string} email - User email
     * @returns {Promise<object|null>}
     */
    async getUserByEmail(email) {
        if (!this.db) {
            throw new Error('Firestore not initialized');
        }

        try {
            const usersRef = this.db.collection('users');
            const querySnapshot = await usersRef.where('email', '==', email.toLowerCase()).limit(1).get();
            
            if (!querySnapshot.empty) {
                return querySnapshot.docs[0].data();
            }
            return null;
        } catch (error) {
            console.error('Error getting user by email from Firestore:', error);
            throw error;
        }
    }

    /**
     * Update user's last activity timestamp
     * @param {string} uid - User ID
     * @returns {Promise<void>}
     */
    async updateLastActivity(uid) {
        if (!this.db) {
            return; // Silently fail if Firestore not available
        }

        try {
            await this.db.collection('users').doc(uid).update({
                lastActivity: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            console.warn('Error updating last activity:', error);
            // Don't throw - this is not critical
        }
    }

    /**
     * Check if user exists
     * @param {string} uid - User ID
     * @returns {Promise<boolean>}
     */
    async userExists(uid) {
        if (!this.db) {
            return false;
        }

        try {
            const userDoc = await this.db.collection('users').doc(uid).get();
            return userDoc.exists;
        } catch (error) {
            console.error('Error checking if user exists:', error);
            return false;
        }
    }

    /**
     * Get all users (admin only)
     * @param {object} filters - Optional filters (userType, status)
     * @returns {Promise<Array>}
     */
    async getAllUsers(filters = {}) {
        if (!this.db) {
            throw new Error('Firestore not initialized');
        }

        try {
            let query = this.db.collection('users');

            if (filters.userType) {
                query = query.where('userType', '==', filters.userType);
            }
            if (filters.status) {
                query = query.where('status', '==', filters.status);
            }

            const querySnapshot = await query.orderBy('createdAt', 'desc').get();
            return querySnapshot.docs.map(doc => doc.data());
        } catch (error) {
            console.error('Error getting all users from Firestore:', error);
            throw error;
        }
    }

    /**
     * Get user type for authenticated user
     * Automatically detects user type on login
     * @param {string} uid - User ID
     * @returns {Promise<string|null>} - Returns 'admin', 'buyer', 'sheriff', or null
     */
    async getUserType(uid) {
        if (!this.db) {
            throw new Error('Firestore not initialized');
        }

        try {
            const userDoc = await this.db.collection('users').doc(uid).get();
            
            if (userDoc.exists) {
                const userData = userDoc.data();
                const userType = userData.userType;
                
                // Validate user type (must be one of: admin, buyer, sheriff)
                const validTypes = ['admin', 'buyer', 'sheriff'];
                if (validTypes.includes(userType)) {
                    return userType;
                } else {
                    console.warn(`Invalid user type: ${userType}. Defaulting to 'buyer'`);
                    return 'buyer';
                }
            }
            return null;
        } catch (error) {
            console.error('Error getting user type from Firestore:', error);
            throw error;
        }
    }

    /**
     * Check if user is admin
     * @param {string} uid - User ID
     * @returns {Promise<boolean>}
     */
    async isAdmin(uid) {
        const userType = await this.getUserType(uid);
        return userType === 'admin';
    }

    /**
     * Check if user is buyer
     * @param {string} uid - User ID
     * @returns {Promise<boolean>}
     */
    async isBuyer(uid) {
        const userType = await this.getUserType(uid);
        return userType === 'buyer';
    }

    /**
     * Check if user is sheriff
     * @param {string} uid - User ID
     * @returns {Promise<boolean>}
     */
    async isSheriff(uid) {
        const userType = await this.getUserType(uid);
        return userType === 'sheriff';
    }

    /**
     * Validate and set user type (admin only)
     * @param {string} uid - User ID
     * @param {string} userType - Must be 'admin', 'buyer', or 'sheriff'
     * @returns {Promise<void>}
     */
    async setUserType(uid, userType) {
        const validTypes = ['admin', 'buyer', 'sheriff'];
        if (!validTypes.includes(userType)) {
            throw new Error(`Invalid user type. Must be one of: ${validTypes.join(', ')}`);
        }

        await this.updateUser(uid, { userType });
    }
}

// Create and export singleton instance
const firestoreUserService = new FirestoreUserService();
window.firestoreUserService = firestoreUserService;

// Export class for use in other files
window.FirestoreUserService = FirestoreUserService;

