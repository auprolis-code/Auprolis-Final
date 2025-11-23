// Demo Mode for Local Testing
// This provides a working demo without requiring Firebase setup

// Check if we're in demo mode (no Firebase connection)
// Only use demo mode if Firebase is truly not available
const DEMO_MODE = typeof firebase === 'undefined' || !firebase.apps || firebase.apps.length === 0;

console.log('DEMO_MODE:', DEMO_MODE);
if (!DEMO_MODE) {
    console.log('Firebase is available - demo mode will not be used');
}

// Demo Firebase-like wrapper
const demoAuth = {
    _currentUser: null,
    
    // Store auth state
    onAuthStateChanged(callback) {
        // Check localStorage for existing session
        const storedUser = localStorage.getItem('demo_user');
        if (storedUser) {
            this._currentUser = JSON.parse(storedUser);
        }
        
        // Call the callback with current user
        if (callback) {
            callback(this._currentUser || null);
        }
        
        // Listen for changes
        window.addEventListener('storage', () => {
            const newUser = localStorage.getItem('demo_user');
            this._currentUser = newUser ? JSON.parse(newUser) : null;
            if (callback) {
                callback(this._currentUser);
            }
        });
        
        return () => {}; // Return unsubscribe function
    },
    
    async signInWithEmailAndPassword(email, password) {
        console.log('demoAuth.signInWithEmailAndPassword called with:', email);
        
        // Check if DEMO_USERS is available
        if (typeof DEMO_USERS === 'undefined') {
            console.error('DEMO_USERS is not defined!');
            throw { code: 'auth/not-initialized', message: 'User data not loaded. Please refresh the page.' };
        }
        
        // Find user in demo users (case-insensitive email match)
        const emailLower = email.toLowerCase();
        const user = DEMO_USERS.find(u => u.email && u.email.toLowerCase() === emailLower);
        
        console.log('Looking for user with email:', emailLower);
        console.log('Available users:', DEMO_USERS.map(u => u.email));
        console.log('Found user:', user);
        
        if (!user) {
            throw { code: 'auth/user-not-found', message: 'No account found with this email address.' };
        }
        
        // In demo mode, accept any password
        this._currentUser = user;
        localStorage.setItem('demo_user', JSON.stringify(user));
        console.log('User logged in and saved to localStorage:', user.email);
        
        // Return in Firebase format
        return { 
            user: {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || user.firstName + ' ' + user.lastName,
                ...user
            }
        };
    },
    
    async createUserWithEmailAndPassword(email, password) {
        // Check if DEMO_USERS is available
        if (typeof DEMO_USERS === 'undefined') {
            throw { code: 'auth/not-initialized', message: 'User data not loaded. Please refresh the page.' };
        }
        
        // Check if user already exists
        const existingUser = DEMO_USERS.find(u => u.email && u.email.toLowerCase() === email.toLowerCase());
        if (existingUser) {
            throw { code: 'auth/email-already-in-use', message: 'An account with this email already exists' };
        }
        
        // Create new user
        const newUser = {
            uid: 'demo-user-' + Date.now(),
            email: email,
            displayName: email.split('@')[0], // Use email prefix as display name
            userType: 'buyer',
            createdAt: new Date(),
            subscriptionStatus: 'active'
        };
        
        // Add to demo users
        DEMO_USERS.push(newUser);
        localStorage.setItem('demo_users', JSON.stringify(DEMO_USERS));
        
        // Set as current user
        this._currentUser = newUser;
        localStorage.setItem('demo_user', JSON.stringify(newUser));
        
        return { 
            user: {
                uid: newUser.uid,
                email: newUser.email,
                displayName: newUser.displayName,
                ...newUser
            }
        };
    },
    
    async signInWithPopup(provider) {
        // Check if DEMO_USERS is available
        if (typeof DEMO_USERS === 'undefined' || DEMO_USERS.length === 0) {
            throw { code: 'auth/user-not-found', message: 'No demo users available.' };
        }
        
        // Simulate Google sign-in with first demo user
        const user = DEMO_USERS[0];
        this._currentUser = user;
        localStorage.setItem('demo_user', JSON.stringify(user));
        
        return { 
            user: {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || user.firstName + ' ' + user.lastName,
                ...user
            }
        };
    },
    
    async updateProfile(profileData) {
        const current = this.currentUser;
        if (current) {
            // Update the current user's profile
            Object.assign(current, profileData);
            this._currentUser = current;
            localStorage.setItem('demo_user', JSON.stringify(current));
            
            // Update in DEMO_USERS array
            const userIndex = DEMO_USERS.findIndex(u => u.uid === current.uid);
            if (userIndex >= 0) {
                DEMO_USERS[userIndex] = current;
                localStorage.setItem('demo_users', JSON.stringify(DEMO_USERS));
            }
        }
    },
    
    async sendEmailVerification() {
        // Simulate email verification - in demo mode, just log it
        const current = this.currentUser;
        console.log('Demo: Email verification sent to', current?.email);
        return Promise.resolve();
    },
    
    async signOut() {
        const stored = localStorage.getItem('demo_user');
        if (stored) {
            localStorage.removeItem('demo_user');
        }
        // Clear the internal reference
        this._currentUser = null;
    },
    
    get currentUser() {
        const stored = localStorage.getItem('demo_user');
        return stored ? JSON.parse(stored) : this._currentUser || null;
    },
    
    set currentUser(user) {
        this._currentUser = user;
        if (user) {
            localStorage.setItem('demo_user', JSON.stringify(user));
        } else {
            localStorage.removeItem('demo_user');
        }
    }
};

// Demo Firestore wrapper
const demoFirestore = {
    collection(name) {
        return {
            doc(id) {
                return {
                    get: async () => {
                        let data = null;
                        
                        if (name === 'users') {
                            const users = JSON.parse(localStorage.getItem('demo_users') || JSON.stringify(DEMO_USERS));
                            const user = users.find(u => u.uid === id);
                            if (user) {
                                data = {
                                    exists: true,
                                    data: () => user
                                };
                            } else {
                                data = {
                                    exists: false
                                };
                            }
                        }
                        
                        return data;
                    },
                    
                    set: async (data) => {
                        if (name === 'users') {
                            let users = JSON.parse(localStorage.getItem('demo_users') || JSON.stringify(DEMO_USERS));
                            const index = users.findIndex(u => u.uid === id);
                            if (index >= 0) {
                                users[index] = { ...users[index], ...data };
                            } else {
                                users.push({ uid: id, ...data });
                            }
                            localStorage.setItem('demo_users', JSON.stringify(users));
                            
                            // Also update DEMO_USERS array
                            const demoIndex = DEMO_USERS.findIndex(u => u.uid === id);
                            if (demoIndex >= 0) {
                                DEMO_USERS[demoIndex] = { ...DEMO_USERS[demoIndex], ...data };
                            } else {
                                DEMO_USERS.push({ uid: id, ...data });
                            }
                        }
                    },
                    
                    update: async (data) => {
                        if (name === 'users') {
                            let users = JSON.parse(localStorage.getItem('demo_users') || JSON.stringify(DEMO_USERS));
                            const index = users.findIndex(u => u.uid === id);
                            if (index >= 0) {
                                users[index] = { ...users[index], ...data };
                                localStorage.setItem('demo_users', JSON.stringify(users));
                                
                                // Also update DEMO_USERS array
                                const demoIndex = DEMO_USERS.findIndex(u => u.uid === id);
                                if (demoIndex >= 0) {
                                    DEMO_USERS[demoIndex] = { ...DEMO_USERS[demoIndex], ...data };
                                }
                            }
                        }
                    }
                };
            },
            
            add: async (data) => {
                const newDoc = {
                    id: 'demo-' + Date.now(),
                    ...data
                };
                
                const stored = JSON.parse(localStorage.getItem(`demo_${name}`) || '[]');
                stored.push(newDoc);
                localStorage.setItem(`demo_${name}`, JSON.stringify(stored));
                
                return { id: newDoc.id };
            },
            
            get: async () => {
                const data = localStorage.getItem(`demo_${name}`);
                
                if (name === 'assets') {
                    return {
                        docs: (DEMO_ASSETS || []).map(asset => ({
                            data: () => asset
                        }))
                    };
                }
                
                if (name === 'bids') {
                    return {
                        docs: (DEMO_BIDS || []).map(bid => ({
                            data: () => bid
                        }))
                    };
                }
                
                return {
                    docs: (data ? JSON.parse(data) : []).map(item => ({
                        data: () => item
                    }))
                };
            }
        };
    }
};

// Initialize Firebase or Demo Mode
// Only initialize demo mode if Firebase is truly not available
if (DEMO_MODE && (typeof firebase === 'undefined' || !firebase.apps || firebase.apps.length === 0)) {
    console.log('Running in DEMO MODE - using localStorage instead of Firebase');
    
    // Only create demo Firebase object if Firebase is not defined
    if (typeof firebase === 'undefined') {
        window.firebase = {
            auth: () => demoAuth,
            firestore: () => demoFirestore,
            apps: [],
            initializeApp: function() {
                console.log('Firebase.initializeApp called in demo mode');
            }
        };
    }
    
    window.auth = demoAuth;
    window.demoAuth = demoAuth;
    window.demoFirestore = demoFirestore;
    
    console.log('Demo mode initialized. You can login with:');
    console.log('- buyer@demo.com (any password)');
    console.log('- seller@demo.com (any password)');
    console.log('- admin@demo.com (any password)');
} else {
    console.log('Running with Firebase - demo mode disabled');
    // Make demoAuth available as fallback, but don't override Firebase
    window.demoAuth = demoAuth;
    window.demoFirestore = demoFirestore;
}

// Export for use in other files
window.DEMO_MODE = DEMO_MODE;
window.demoAuth = demoAuth;
window.demoFirestore = demoFirestore;
