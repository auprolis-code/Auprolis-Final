// Realtime Database Service
// Helper functions for data operations in Firebase Realtime Database

class RealtimeDatabaseService {
    constructor() {
        // Try to use pre-initialized instance from firebase-config.js first
        if (typeof window !== 'undefined' && window.realtimeDb) {
            this.db = window.realtimeDb;
            console.log('✅ Using pre-initialized Realtime Database instance');
        } else if (typeof firebase !== 'undefined' && firebase.database) {
            // Fallback: initialize our own instance
            try {
                this.db = firebase.database();
                console.log('✅ Realtime Database initialized in service');
            } catch (error) {
                console.warn('⚠️ Could not initialize Realtime Database:', error);
                this.db = null;
            }
        } else {
            console.warn('⚠️ Firebase Realtime Database not available');
            this.db = null;
        }
    }

    /**
     * Store user data in Realtime Database
     * @param {string} uid - User ID from Firebase Auth
     * @param {object} userData - User data to store
     * @returns {Promise<void>}
     */
    async storeUser(uid, userData) {
        if (!this.db) {
            throw new Error('Realtime Database not initialized');
        }

        try {
            const userRef = this.db.ref(`users/${uid}`);
            const userDoc = {
                ...userData,
                uid: uid,
                createdAt: firebase.database.ServerValue.TIMESTAMP,
                updatedAt: firebase.database.ServerValue.TIMESTAMP,
                lastActivity: firebase.database.ServerValue.TIMESTAMP
            };

            await userRef.set(userDoc);
            console.log('User data stored successfully in Realtime Database');
            return userDoc;
        } catch (error) {
            console.error('Error storing user data in Realtime Database:', error);
            throw error;
        }
    }

    /**
     * Update user data in Realtime Database
     * @param {string} uid - User ID
     * @param {object} updates - Fields to update
     * @returns {Promise<void>}
     */
    async updateUser(uid, updates) {
        if (!this.db) {
            throw new Error('Realtime Database not initialized');
        }

        try {
            const userRef = this.db.ref(`users/${uid}`);
            const updateData = {
                ...updates,
                updatedAt: firebase.database.ServerValue.TIMESTAMP
            };

            await userRef.update(updateData);
            console.log('User data updated successfully in Realtime Database');
        } catch (error) {
            console.error('Error updating user data in Realtime Database:', error);
            throw error;
        }
    }

    /**
     * Get user data from Realtime Database
     * @param {string} uid - User ID
     * @returns {Promise<object|null>}
     */
    async getUser(uid) {
        if (!this.db) {
            throw new Error('Realtime Database not initialized');
        }

        try {
            const userRef = this.db.ref(`users/${uid}`);
            const snapshot = await userRef.once('value');
            
            if (snapshot.exists()) {
                return snapshot.val();
            }
            return null;
        } catch (error) {
            console.error('Error getting user data from Realtime Database:', error);
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
            throw new Error('Realtime Database not initialized');
        }

        try {
            const usersRef = this.db.ref('users');
            const snapshot = await usersRef.orderByChild('email').equalTo(email.toLowerCase()).once('value');
            
            if (snapshot.exists()) {
                const users = snapshot.val();
                return Object.values(users)[0]; // Return first matching user
            }
            return null;
        } catch (error) {
            console.error('Error getting user by email from Realtime Database:', error);
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
            return; // Silently fail if database not available
        }

        try {
            const userRef = this.db.ref(`users/${uid}`);
            await userRef.update({
                lastActivity: firebase.database.ServerValue.TIMESTAMP
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
            const userRef = this.db.ref(`users/${uid}`);
            const snapshot = await userRef.once('value');
            return snapshot.exists();
        } catch (error) {
            console.error('Error checking if user exists:', error);
            return false;
        }
    }

    /**
     * Store asset in Realtime Database
     * @param {string} assetId - Asset ID
     * @param {object} assetData - Asset data
     * @returns {Promise<void>}
     */
    async storeAsset(assetId, assetData) {
        if (!this.db) {
            throw new Error('Realtime Database not initialized');
        }

        try {
            const assetRef = this.db.ref(`assets/${assetId}`);
            const assetDoc = {
                ...assetData,
                assetId: assetId,
                createdAt: firebase.database.ServerValue.TIMESTAMP,
                updatedAt: firebase.database.ServerValue.TIMESTAMP
            };

            await assetRef.set(assetDoc);
            console.log('Asset stored successfully in Realtime Database');
            return assetDoc;
        } catch (error) {
            console.error('Error storing asset in Realtime Database:', error);
            throw error;
        }
    }

    /**
     * Get asset from Realtime Database
     * @param {string} assetId - Asset ID
     * @returns {Promise<object|null>}
     */
    async getAsset(assetId) {
        if (!this.db) {
            throw new Error('Realtime Database not initialized');
        }

        try {
            const assetRef = this.db.ref(`assets/${assetId}`);
            const snapshot = await assetRef.once('value');
            
            if (snapshot.exists()) {
                return snapshot.val();
            }
            return null;
        } catch (error) {
            console.error('Error getting asset from Realtime Database:', error);
            throw error;
        }
    }

    /**
     * Get all assets with optional filters
     * @param {object} filters - Optional filters (category, location, status)
     * @returns {Promise<Array>}
     */
    async getAllAssets(filters = {}) {
        if (!this.db) {
            throw new Error('Realtime Database not initialized');
        }

        try {
            const assetsRef = this.db.ref('assets');
            const snapshot = await assetsRef.once('value');
            
            if (!snapshot.exists()) {
                return [];
            }

            let assets = Object.values(snapshot.val());

            // Apply filters
            if (filters.category) {
                assets = assets.filter(asset => asset.category === filters.category);
            }
            if (filters.location) {
                assets = assets.filter(asset => asset.location === filters.location);
            }
            if (filters.status) {
                assets = assets.filter(asset => asset.status === filters.status);
            }

            // Sort by createdAt descending
            assets.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

            return assets;
        } catch (error) {
            console.error('Error getting all assets from Realtime Database:', error);
            throw error;
        }
    }

    /**
     * Store reservation in Realtime Database
     * @param {string} reservationId - Reservation ID
     * @param {object} reservationData - Reservation data
     * @returns {Promise<void>}
     */
    async storeReservation(reservationId, reservationData) {
        if (!this.db) {
            throw new Error('Realtime Database not initialized');
        }

        try {
            const reservationRef = this.db.ref(`reservations/${reservationId}`);
            const reservationDoc = {
                ...reservationData,
                reservationId: reservationId,
                createdAt: firebase.database.ServerValue.TIMESTAMP,
                updatedAt: firebase.database.ServerValue.TIMESTAMP
            };

            await reservationRef.set(reservationDoc);
            console.log('Reservation stored successfully in Realtime Database');
            return reservationDoc;
        } catch (error) {
            console.error('Error storing reservation in Realtime Database:', error);
            throw error;
        }
    }

    /**
     * Get user's reservations
     * @param {string} userId - User ID
     * @returns {Promise<Array>}
     */
    async getUserReservations(userId) {
        if (!this.db) {
            throw new Error('Realtime Database not initialized');
        }

        try {
            const reservationsRef = this.db.ref('reservations');
            const snapshot = await reservationsRef.orderByChild('userId').equalTo(userId).once('value');
            
            if (!snapshot.exists()) {
                return [];
            }

            const reservations = snapshot.val();
            return Object.values(reservations).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        } catch (error) {
            console.error('Error getting user reservations from Realtime Database:', error);
            throw error;
        }
    }

    /**
     * Listen to real-time updates on a path
     * @param {string} path - Database path
     * @param {function} callback - Callback function
     * @returns {function} - Unsubscribe function
     */
    onValue(path, callback) {
        if (!this.db) {
            console.warn('Realtime Database not initialized');
            return () => {};
        }

        const ref = this.db.ref(path);
        const listener = ref.on('value', (snapshot) => {
            if (snapshot.exists()) {
                callback(snapshot.val());
            } else {
                callback(null);
            }
        });

        // Return unsubscribe function
        return () => ref.off('value', listener);
    }

    /**
     * Listen to child added events
     * @param {string} path - Database path
     * @param {function} callback - Callback function
     * @returns {function} - Unsubscribe function
     */
    onChildAdded(path, callback) {
        if (!this.db) {
            console.warn('Realtime Database not initialized');
            return () => {};
        }

        const ref = this.db.ref(path);
        const listener = ref.on('child_added', (snapshot) => {
            callback(snapshot.val(), snapshot.key);
        });

        return () => ref.off('child_added', listener);
    }

    /**
     * Listen to child changed events
     * @param {string} path - Database path
     * @param {function} callback - Callback function
     * @returns {function} - Unsubscribe function
     */
    onChildChanged(path, callback) {
        if (!this.db) {
            console.warn('Realtime Database not initialized');
            return () => {};
        }

        const ref = this.db.ref(path);
        const listener = ref.on('child_changed', (snapshot) => {
            callback(snapshot.val(), snapshot.key);
        });

        return () => ref.off('child_changed', listener);
    }

    /**
     * Get user type for authenticated user
     * Automatically detects user type on login
     * @param {string} uid - User ID
     * @returns {Promise<string|null>} - Returns 'admin', 'buyer', 'sheriff', or null
     */
    async getUserType(uid) {
        if (!this.db) {
            throw new Error('Realtime Database not initialized');
        }

        try {
            const userRef = this.db.ref(`users/${uid}`);
            const snapshot = await userRef.once('value');
            
            if (snapshot.exists()) {
                const userData = snapshot.val();
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
            console.error('Error getting user type from Realtime Database:', error);
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

    /**
     * Get all users by type
     * @param {string} userType - 'admin', 'buyer', or 'sheriff'
     * @returns {Promise<Array>}
     */
    async getUsersByType(userType) {
        if (!this.db) {
            throw new Error('Realtime Database not initialized');
        }

        const validTypes = ['admin', 'buyer', 'sheriff'];
        if (!validTypes.includes(userType)) {
            throw new Error(`Invalid user type. Must be one of: ${validTypes.join(', ')}`);
        }

        try {
            const usersRef = this.db.ref('users');
            const snapshot = await usersRef.orderByChild('userType').equalTo(userType).once('value');
            
            if (!snapshot.exists()) {
                return [];
            }

            const users = snapshot.val();
            return Object.values(users);
        } catch (error) {
            console.error('Error getting users by type from Realtime Database:', error);
            throw error;
        }
    }
}

// Create and export singleton instance
const realtimeDbService = new RealtimeDatabaseService();
window.realtimeDbService = realtimeDbService;

// Export class for use in other files
window.RealtimeDatabaseService = RealtimeDatabaseService;

