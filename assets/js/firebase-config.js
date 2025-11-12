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

// Initialize Firebase - with fallback to demo mode
try {
    if (typeof firebase !== 'undefined' && firebase.initializeApp) {
        firebase.initializeApp(firebaseConfig);
        
        // Initialize Firebase Auth
        const auth = firebase.auth();
        
        // Initialize Firestore (NoSQL Document Database)
        const db = firebase.firestore();
        
        // Initialize Realtime Database (JSON Database)
        const realtimeDb = firebase.database();
        
        // Google Auth Provider
        const googleProvider = new firebase.auth.GoogleAuthProvider();
        
        // Configure Google Auth Provider
        googleProvider.setCustomParameters({
            prompt: 'select_account'
        });
        
        // Export for use in other files
        window.auth = auth;
        window.db = db; // Firestore
        window.realtimeDb = realtimeDb; // Realtime Database
        window.googleProvider = googleProvider;
        
        console.log('Firebase initialized successfully');
        console.log('Firestore database initialized');
        console.log('Realtime Database initialized');
    }
} catch (error) {
    console.error('Firebase initialization failed:', error);
    console.log('Running in offline/demo mode');
}

// Note: Demo mode will be handled by demo-mode.js if loaded
