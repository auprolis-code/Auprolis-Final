// User Type Service
// Unified service for automatically detecting and managing user types
// Works with both Firestore and Realtime Database

class UserTypeService {
    constructor() {
        // Prefer Firestore, fallback to Realtime Database
        this.preferFirestore = true;
    }

    /**
     * Automatically detect user type on login
     * Tries Firestore first, then Realtime Database
     * @param {string} uid - User ID from Firebase Auth
     * @returns {Promise<string|null>} - Returns 'admin', 'buyer', 'sheriff', or null
     */
    async detectUserType(uid) {
        if (!uid) {
            console.error('User ID is required');
            return null;
        }

        try {
            // Try Firestore first
            if (this.preferFirestore && typeof window.firestoreUserService !== 'undefined') {
                try {
                    const userType = await window.firestoreUserService.getUserType(uid);
                    if (userType) {
                        console.log(`User type detected from Firestore: ${userType}`);
                        return userType;
                    }
                } catch (error) {
                    console.warn('Firestore user type detection failed, trying Realtime Database:', error);
                }
            }

            // Fallback to Realtime Database
            if (typeof window.realtimeDbService !== 'undefined') {
                try {
                    const userType = await window.realtimeDbService.getUserType(uid);
                    if (userType) {
                        console.log(`User type detected from Realtime Database: ${userType}`);
                        return userType;
                    }
                } catch (error) {
                    console.warn('Realtime Database user type detection failed:', error);
                }
            }

            console.warn('Could not detect user type from any database');
            return null;
        } catch (error) {
            console.error('Error detecting user type:', error);
            return null;
        }
    }

    /**
     * Get user type and full user data
     * @param {string} uid - User ID
     * @returns {Promise<object|null>} - Returns user object with userType property
     */
    async getUserWithType(uid) {
        if (!uid) {
            console.error('User ID is required');
            return null;
        }

        try {
            // Try Firestore first
            if (this.preferFirestore && typeof window.firestoreUserService !== 'undefined') {
                try {
                    const user = await window.firestoreUserService.getUser(uid);
                    if (user && user.userType) {
                        return user;
                    }
                } catch (error) {
                    console.warn('Firestore user fetch failed, trying Realtime Database:', error);
                }
            }

            // Fallback to Realtime Database
            if (typeof window.realtimeDbService !== 'undefined') {
                try {
                    const user = await window.realtimeDbService.getUser(uid);
                    if (user && user.userType) {
                        return user;
                    }
                } catch (error) {
                    console.warn('Realtime Database user fetch failed:', error);
                }
            }

            return null;
        } catch (error) {
            console.error('Error getting user with type:', error);
            return null;
        }
    }

    /**
     * Check if user is admin
     * @param {string} uid - User ID
     * @returns {Promise<boolean>}
     */
    async isAdmin(uid) {
        const userType = await this.detectUserType(uid);
        return userType === 'admin';
    }

    /**
     * Check if user is buyer
     * @param {string} uid - User ID
     * @returns {Promise<boolean>}
     */
    async isBuyer(uid) {
        const userType = await this.detectUserType(uid);
        return userType === 'buyer';
    }

    /**
     * Check if user is sheriff
     * @param {string} uid - User ID
     * @returns {Promise<boolean>}
     */
    async isSheriff(uid) {
        const userType = await this.detectUserType(uid);
        return userType === 'sheriff';
    }

    /**
     * Get the appropriate dashboard URL based on user type
     * @param {string} uid - User ID
     * @returns {Promise<string>} - Returns dashboard URL
     */
    async getDashboardUrl(uid) {
        const userType = await this.detectUserType(uid);
        
        switch (userType) {
            case 'admin':
                return 'admin-dashboard.html';
            case 'sheriff':
                return 'sheriff-dashboard.html';
            case 'buyer':
                return 'buyer-dashboard.html';
            default:
                console.warn('Unknown user type, redirecting to buyer dashboard');
                return 'buyer-dashboard.html';
        }
    }

    /**
     * Redirect user to appropriate dashboard based on their type
     * @param {string} uid - User ID
     * @returns {Promise<void>}
     */
    async redirectToDashboard(uid) {
        const dashboardUrl = await this.getDashboardUrl(uid);
        window.location.href = dashboardUrl;
    }

    /**
     * Validate user type
     * @param {string} userType - User type to validate
     * @returns {boolean}
     */
    isValidUserType(userType) {
        const validTypes = ['admin', 'buyer', 'sheriff'];
        return validTypes.includes(userType);
    }

    /**
     * Get all valid user types
     * @returns {Array<string>}
     */
    getValidUserTypes() {
        return ['admin', 'buyer', 'sheriff'];
    }

    /**
     * Get user type display name
     * @param {string} userType - User type
     * @returns {string}
     */
    getUserTypeDisplayName(userType) {
        const displayNames = {
            'admin': 'Administrator',
            'buyer': 'Buyer',
            'sheriff': 'Sheriff'
        };
        return displayNames[userType] || userType;
    }

    /**
     * Get permissions for a user type
     * @param {string} userType - User type
     * @returns {Array<string>}
     */
    getPermissionsForUserType(userType) {
        const permissions = {
            'admin': [
                'placeBids',
                'createListings',
                'manageBids',
                'manageUsers',
                'viewAnalytics',
                'manageSystem',
                'deleteAssets',
                'manageAllReservations'
            ],
            'sheriff': [
                'placeBids',
                'createListings',
                'manageBids',
                'viewAnalytics',
                'manageOwnReservations'
            ],
            'buyer': [
                'placeBids',
                'viewAssets',
                'manageOwnReservations',
                'manageOwnWatchlist'
            ]
        };

        return permissions[userType] || [];
    }
}

// Create and export singleton instance
const userTypeService = new UserTypeService();
window.userTypeService = userTypeService;

// Export class for use in other files
window.UserTypeService = UserTypeService;

