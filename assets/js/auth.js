// Authentication Functions
class AuthManager {
    constructor() {
        // FIREBASE FIRST: Prioritize Firebase authentication over demo mode
        if (typeof firebase !== 'undefined' && firebase.auth) {
            this.auth = firebase.auth();
            this.googleProvider = new firebase.auth.GoogleAuthProvider();
            console.log('Using Firebase auth');
        } else if (typeof demoAuth !== 'undefined') {
            this.auth = demoAuth;
            console.log('Firebase not available, using demoAuth for authentication');
        } else {
            console.error('No authentication method available!');
            this.auth = null;
            this.googleProvider = null;
        }
        this.init();
    }

    init() {
        // Check if user is already logged in
        if (this.auth && this.auth.onAuthStateChanged) {
            this.auth.onAuthStateChanged((user) => {
                if (user) {
                    // Don't auto-redirect on page load - let user login first
                }
            });
        }

        // Bind form events
        this.bindEvents();
    }

    bindEvents() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleEmailLogin(e));
        }

        // Google sign in
        const googleBtn = document.getElementById('googleSignIn');
        if (googleBtn) {
            googleBtn.addEventListener('click', (e) => this.handleGoogleLogin(e));
        }

        // Real-time form validation
        this.setupFormValidation();
    }

    setupFormValidation() {
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');

        if (emailInput) {
            emailInput.addEventListener('blur', () => this.validateEmail());
            emailInput.addEventListener('input', () => this.clearError('email'));
        }

        if (passwordInput) {
            passwordInput.addEventListener('blur', () => this.validatePassword());
            passwordInput.addEventListener('input', () => this.clearError('password'));
        }
    }

    validateEmail() {
        const email = document.getElementById('email').value;
        const emailError = document.getElementById('emailError');
        
        if (!email) {
            this.showError('email', 'Email is required');
            return false;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.showError('email', 'Please enter a valid email address');
            return false;
        }
        
        this.clearError('email');
        return true;
    }

    validatePassword() {
        const password = document.getElementById('password').value;
        const passwordError = document.getElementById('passwordError');
        
        if (!password) {
            this.showError('password', 'Password is required');
            return false;
        }
        
        // In demo mode, accept any password length (we accept any password anyway)
        // For production, require at least 6 characters
        if (typeof firebase === 'undefined' || !firebase.auth) {
            // Demo mode - any password is fine
            this.clearError('password');
            return true;
        }
        
        if (password.length < 6) {
            this.showError('password', 'Password must be at least 6 characters');
            return false;
        }
        
        this.clearError('password');
        return true;
    }

    showError(field, message) {
        const errorElement = document.getElementById(field + 'Error');
        const inputElement = document.getElementById(field);
        
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }
        
        if (inputElement) {
            inputElement.classList.add('error');
        }
    }

    clearError(field) {
        const errorElement = document.getElementById(field + 'Error');
        const inputElement = document.getElementById(field);
        
        if (errorElement) {
            errorElement.classList.remove('show');
        }
        
        if (inputElement) {
            inputElement.classList.remove('error');
        }
    }

    async handleEmailLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const loginBtn = document.getElementById('loginBtn');
        
        // Validate form
        if (!this.validateEmail() || !this.validatePassword()) {
            return;
        }
        
        // Show loading state
        this.setLoadingState(loginBtn, true);
        
        try {
            if (!this.auth) {
                console.error('Auth not initialized. Available auth:', typeof demoAuth !== 'undefined' ? 'demoAuth' : typeof firebase !== 'undefined' ? 'firebase' : 'none');
                throw { code: 'auth/not-initialized', message: 'Authentication not initialized. Please refresh the page.' };
            }
            
            console.log('Attempting login with email:', email);
            const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;
            console.log('✓ Login successful, user:', user);
            console.log('User details:', {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                userType: user.userType
            });
            
            // Get user data (try both uid and email)
            let userData = await this.getUserData(user.uid || user.email || email);
            console.log('User data retrieved:', userData);
            
            // If userData not found but we have user object, use user object as fallback
            if (!userData && user) {
                userData = user;
                console.log('Using user object as userData fallback');
            }
            
            // Ensure user is stored in localStorage for dashboard access
            const finalUserData = userData || user;
            if (finalUserData) {
                try {
                    localStorage.setItem('demo_user', JSON.stringify(finalUserData));
                    console.log('✓ User stored in localStorage for dashboard access');
                } catch (storageError) {
                    console.warn('Could not store user in localStorage:', storageError);
                }
            }
            
            // Get userType from userData or default to 'buyer'
            const userType = (userData && userData.userType) || (user && user.userType) || 'buyer';
            console.log('✓ Login successful! Redirecting to dashboard for userType:', userType);
            
            // Show success message and redirect directly
            this.showMessage('Login successful! Redirecting...', 'success');
            
            // Small delay to show success message, then redirect
            setTimeout(() => {
                this.redirectToDashboard(finalUserData, userType);
            }, 500);
            
        } catch (error) {
            console.error('Login error:', error);
            this.handleAuthError(error);
        } finally {
            this.setLoadingState(loginBtn, false);
        }
    }

    async handleGoogleLogin(e) {
        e.preventDefault();
        
        const googleBtn = document.getElementById('googleSignIn');
        this.setLoadingState(googleBtn, true);
        
        try {
            if (!this.auth) {
                throw { code: 'auth/not-initialized', message: 'Authentication not initialized. Please refresh the page.' };
            }
            
            // Demo mode doesn't support popup, use first demo user
            if (!this.auth.signInWithPopup) {
                const demoUser = typeof DEMO_USERS !== 'undefined' && DEMO_USERS.length > 0 ? DEMO_USERS[0] : null;
                if (!demoUser) {
                    throw { code: 'auth/user-not-found', message: 'No demo users available.' };
                }
                
                this.auth.currentUser = demoUser;
                localStorage.setItem('demo_user', JSON.stringify(demoUser));
                
                const userType = demoUser.userType || 'buyer';
                this.setLoadingState(googleBtn, false);
                this.showMessage('Login successful! Redirecting...', 'success');
                
                setTimeout(() => {
                    this.redirectToDashboard(demoUser, userType);
                }, 500);
                return;
            }
            
            const result = await this.auth.signInWithPopup(this.googleProvider);
            const user = result.user;
            
            // Check if user exists in our system
            const userData = await this.getUserData(user.uid || user.email);
            
            // Ensure user is stored in localStorage for dashboard access
            const finalUserData = userData || user;
            if (finalUserData) {
                try {
                    localStorage.setItem('demo_user', JSON.stringify(finalUserData));
                    console.log('✓ User stored in localStorage for dashboard access');
                } catch (storageError) {
                    console.warn('Could not store user in localStorage:', storageError);
                }
            }
            
            // Get userType from userData or default to 'buyer'
            const userType = (userData && userData.userType) || (user && user.userType) || 'buyer';
            console.log('✓ Google login successful! Redirecting to dashboard for userType:', userType);
            
            this.setLoadingState(googleBtn, false);
            this.showMessage('Login successful! Redirecting...', 'success');
            
            // Small delay to show success message, then redirect
            setTimeout(() => {
                this.redirectToDashboard(finalUserData, userType);
            }, 500);
            
        } catch (error) {
            console.error('Google login error:', error);
            this.handleAuthError(error);
            this.setLoadingState(googleBtn, false);
        }
    }

    async getUserData(uidOrEmail) {
        try {
            // FIREBASE FIRST: Fetch user data from Firestore if Firebase is available
            if (typeof firebase !== 'undefined' && firebase.firestore && uidOrEmail) {
                try {
                    const db = firebase.firestore();
                    // Try as UID first
                    const userDoc = await db.collection('users').doc(uidOrEmail).get();
                    
                    if (userDoc.exists) {
                        console.log('Found user in Firestore:', uidOrEmail);
                        return userDoc.data();
                    }
                } catch (firestoreError) {
                    console.warn('Firestore error:', firestoreError);
                }
            }
            
            // DEMO MODE FALLBACK: Check demo users only if Firebase is not available
            if (typeof DEMO_USERS !== 'undefined' && (typeof firebase === 'undefined' || !firebase.firestore)) {
                // Try to find by uid first, then by email (case-insensitive)
                let demoUser = null;
                
                if (uidOrEmail) {
                    // Try by UID first
                    demoUser = DEMO_USERS.find(u => u.uid === uidOrEmail);
                    
                    // If not found and it's a string, try by email
                    if (!demoUser && typeof uidOrEmail === 'string') {
                        const emailLower = uidOrEmail.toLowerCase();
                        demoUser = DEMO_USERS.find(u => u.email && u.email.toLowerCase() === emailLower);
                    }
                }
                
                if (demoUser) {
                    console.log('Found demo user:', demoUser.email);
                    return demoUser;
                }
            }
            
            // User not found in database
            console.log('User data not found for:', uidOrEmail);
            return null;
        } catch (error) {
            console.error('Error fetching user data:', error);
            
            // DEMO MODE: Fallback to demo users only if Firebase failed
            if (typeof DEMO_USERS !== 'undefined') {
                let demoUser = null;
                if (uidOrEmail) {
                    demoUser = DEMO_USERS.find(u => u.uid === uidOrEmail);
                    if (!demoUser && typeof uidOrEmail === 'string') {
                        const emailLower = uidOrEmail.toLowerCase();
                        demoUser = DEMO_USERS.find(u => u.email && u.email.toLowerCase() === emailLower);
                    }
                }
                if (demoUser) {
                    return demoUser;
                }
            }
            
            return null;
        }
    }

    redirectToDashboard(user, userType) {
        console.log('redirectToDashboard called with userType:', userType);
        console.log('User object:', user);
        
        // Map user type to dashboard URL
        let redirectUrl = 'buyer-dashboard.html'; // default
        
        if (userType === 'admin') {
            redirectUrl = 'admin-dashboard.html';
        } else if (userType === 'sheriff' || userType === 'seller') {
            redirectUrl = 'sheriff-dashboard.html';
        } else if (userType === 'buyer') {
            redirectUrl = 'buyer-dashboard.html';
        }
        
        console.log('✓ Redirecting to:', redirectUrl);
        
        // Verify the dashboard file exists (in browser, this will just navigate)
        // Force navigation
        try {
            window.location.href = redirectUrl;
        } catch (error) {
            console.error('Redirect error:', error);
            // Fallback: try using replace
            window.location.replace(redirectUrl);
        }
    }

    handleAuthError(error) {
        let errorMessage = 'An error occurred. Please try again.';
        
        switch (error.code) {
            case 'auth/user-not-found':
                errorMessage = 'No account found with this email address.';
                break;
            case 'auth/wrong-password':
                errorMessage = 'Incorrect password. Please try again.';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Please enter a valid email address.';
                break;
            case 'auth/user-disabled':
                errorMessage = 'This account has been disabled.';
                break;
            case 'auth/too-many-requests':
                errorMessage = 'Too many failed attempts. Please try again later.';
                break;
            case 'auth/network-request-failed':
                errorMessage = 'Network error. Please check your connection.';
                break;
            case 'auth/popup-closed-by-user':
                errorMessage = 'Sign-in was cancelled.';
                break;
            case 'auth/account-not-in-database':
                errorMessage = 'Account not found in our system. Please sign up first.';
                break;
            case 'auth/not-initialized':
                errorMessage = error.message || 'Authentication not initialized. Please refresh the page.';
                break;
            default:
                errorMessage = error.message || errorMessage;
        }
        
        this.showMessage(errorMessage, 'error');
    }

    setLoadingState(button, isLoading) {
        if (!button) return;
        
        if (isLoading) {
            button.disabled = true;
            button.classList.add('loading');
            // Show spinner
            const btnText = button.querySelector('.btn-text');
            const btnSpinner = button.querySelector('.btn-spinner');
            if (btnText) btnText.style.display = 'none';
            if (btnSpinner) btnSpinner.style.display = 'inline-block';
        } else {
            button.disabled = false;
            button.classList.remove('loading');
            // Hide spinner
            const btnText = button.querySelector('.btn-text');
            const btnSpinner = button.querySelector('.btn-spinner');
            if (btnText) btnText.style.display = '';
            if (btnSpinner) btnSpinner.style.display = 'none';
        }
    }

    showMessage(message, type = 'info') {
        const messagesContainer = document.getElementById('authMessages');
        if (!messagesContainer) return;
        
        const messageElement = document.createElement('div');
        messageElement.className = `auth-message ${type}`;
        messageElement.textContent = message;
        
        messagesContainer.appendChild(messageElement);
        
        // Show message
        setTimeout(() => {
            messageElement.classList.add('show');
        }, 100);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            messageElement.classList.remove('show');
            setTimeout(() => {
                if (messagesContainer.contains(messageElement)) {
                    messagesContainer.removeChild(messageElement);
                }
            }, 300);
        }, 5000);
    }

}

// Initialize Auth Manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Function to initialize auth manager
    function initAuthManager() {
        // Check if Firebase is available (prioritize Firebase)
        if (typeof firebase === 'undefined' || !firebase.auth) {
            // If Firebase is not available, check for demo mode
            if (typeof DEMO_USERS === 'undefined' && typeof demoAuth === 'undefined') {
                console.warn('Waiting for dependencies to load...');
                setTimeout(initAuthManager, 100);
                return;
            }
        }
        
        // Check if at least one authentication method is available
        if ((typeof firebase === 'undefined' || !firebase.auth) && typeof demoAuth === 'undefined') {
            console.warn('No authentication method available. Retrying...');
            setTimeout(initAuthManager, 100);
            return;
        }
        
        try {
            window.authManager = new AuthManager();
            console.log('✓ AuthManager initialized successfully');
            const authMethod = (typeof firebase !== 'undefined' && firebase.auth) ? 'Firebase' : 'Demo Mode';
            console.log('✓ Auth method:', authMethod);
        } catch (error) {
            console.error('✗ Error initializing AuthManager:', error);
            // Try again after a short delay
            setTimeout(initAuthManager, 200);
        }
    }
    
    // Start initialization after a small delay to ensure scripts are loaded
    setTimeout(initAuthManager, 100);
});

// Utility function to check if user is logged in
function checkAuthState() {
    return new Promise((resolve) => {
        // FIREBASE FIRST: Prioritize Firebase auth
        const auth = (typeof firebase !== 'undefined' && firebase.auth) ? firebase.auth() :
                     (typeof demoAuth !== 'undefined' ? demoAuth : null);
        if (auth && auth.onAuthStateChanged) {
            auth.onAuthStateChanged((user) => {
                resolve(user);
            });
        } else {
            // Check localStorage for demo user (fallback)
            const storedUser = localStorage.getItem('demo_user');
            resolve(storedUser ? JSON.parse(storedUser) : null);
        }
    });
}

// Export for use in other files
window.AuthManager = AuthManager;
window.checkAuthState = checkAuthState;
