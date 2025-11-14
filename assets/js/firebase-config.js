// Firebase Configuration
// Your actual Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyA9VPtRDIz4m903N4r4SDzIXPfU4LScCUQ",
    authDomain: "auprolis-mvp2.firebaseapp.com",
    projectId: "auprolis-mvp2",
    storageBucket: "auprolis-mvp2.firebasestorage.app",
    messagingSenderId: "954767989673",
    appId: "1:954767989673:web:c22f4ebb2227c9cf0d42b8",
    measurementId: "G-VQY6T0Q7Y0",
    // Realtime Database URL - Update this with your actual Realtime Database URL
    databaseURL: "https://auprolis-mvp2-default-rtdb.firebaseio.com"
};

// Initialize Firebase - Production Ready
// Note: Demo mode will only activate if Firebase truly fails to initialize
if (typeof firebase !== 'undefined' && firebase.initializeApp) {
    try {
        // Check if Firebase is already initialized
        if (firebase.apps.length === 0) {
            firebase.initializeApp(firebaseConfig);
            console.log('✅ Firebase initialized successfully');
        } else {
            console.log('✅ Firebase already initialized');
        }
        
        // Initialize Firebase Auth
        const auth = firebase.auth();
        
        // Initialize Firestore (NoSQL Document Database)
        const db = firebase.firestore();
        
        // Initialize Realtime Database (JSON Database) - only if SDK is loaded
        let realtimeDb = null;
        if (typeof firebase.database === 'function') {
            realtimeDb = firebase.database();
            console.log('✅ Realtime Database initialized');
        } else {
            console.warn('⚠️ Firebase Realtime Database SDK not loaded. This is optional and won\'t affect core functionality.');
        }
        
        // Google Auth Provider
        const googleProvider = new firebase.auth.GoogleAuthProvider();
        
        // Configure Google Auth Provider
        googleProvider.setCustomParameters({
            prompt: 'select_account'
        });
        
        // Export for use in other files
        window.auth = auth;
        window.db = db; // Firestore
        window.realtimeDb = realtimeDb; // Realtime Database (may be null)
        window.googleProvider = googleProvider;
        
        console.log('✅ Firestore database initialized');
        console.log('✅ Firebase Authentication ready');
    } catch (error) {
        console.error('❌ Firebase initialization failed:', error);
        console.error('Error details:', error.message);
        // Don't throw - let demo mode handle it
    }
} else {
    console.warn('⚠️ Firebase SDK not loaded. Application will run in demo mode.');
}

// Note: Demo mode will be handled by demo-mode.js if loaded
