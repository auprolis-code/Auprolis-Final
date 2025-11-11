// Authentication Functions
class AuthManager {
    constructor() {
        // DEMO MODE: Use demo authentication
        if (typeof demoAuth !== 'undefined') {
            this.auth = demoAuth;
            console.log('Using demoAuth for authentication');
        } else if (typeof firebase !== 'undefined' && firebase.auth) {
            this.auth = firebase.auth();
            this.googleProvider = new firebase.auth.GoogleAuthProvider();
            console.log('Using Firebase auth');
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

        // Role selection dropdown
        const userRole = document.getElementById('userRole');
        if (userRole) {
            userRole.addEventListener('change', () => this.handleRoleSelection());
        }

        // Continue button
        const continueBtn = document.getElementById('continueToDashboard');
        if (continueBtn) {
            continueBtn.addEventListener('click', () => this.continueToDashboard());
        }

        // Modal overlay click to close
        const roleModalOverlay = document.querySelector('.role-selection-overlay');
        if (roleModalOverlay) {
            roleModalOverlay.addEventListener('click', () => {
                // Don't close on overlay click - require role selection
                // this.hideRoleSelectionModal();
            });
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
            
            // Store user data for role selection
            this.currentLoginUser = user;
            this.currentLoginUserData = userData || user;
            
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
            
            // Show role selection modal - user will choose their role
            this.showRoleSelectionModal();
            
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
                
                this.currentLoginUser = demoUser;
                this.currentLoginUserData = demoUser;
                
                this.setLoadingState(googleBtn, false);
                this.showRoleSelectionModal();
                return;
            }
            
            const result = await this.auth.signInWithPopup(this.googleProvider);
            const user = result.user;
            
            // Check if user exists in our system
            const userData = await this.getUserData(user.uid || user.email);
            
            // Store user data for role selection
            this.currentLoginUser = user;
            this.currentLoginUserData = userData;
            
            // Show role selection modal
            this.setLoadingState(googleBtn, false);
            this.showRoleSelectionModal();
            
        } catch (error) {
            console.error('Google login error:', error);
            this.handleAuthError(error);
            this.setLoadingState(googleBtn, false);
        }
    }

    async getUserData(uidOrEmail) {
        try {
            // DEMO MODE: Check demo users first
            if (typeof DEMO_USERS !== 'undefined') {
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
            
            // Fetch user data from Firestore
            if (typeof firebase !== 'undefined' && firebase.firestore && uidOrEmail) {
                try {
                    const db = firebase.firestore();
                    // Try as UID first
                    const userDoc = await db.collection('users').doc(uidOrEmail).get();
                    
                    if (userDoc.exists) {
                        return userDoc.data();
                    }
                } catch (firestoreError) {
                    console.warn('Firestore error (expected in demo mode):', firestoreError);
                }
            }
            
            // User not found in database
            console.log('User data not found for:', uidOrEmail);
            return null;
        } catch (error) {
            console.error('Error fetching user data:', error);
            
            // DEMO MODE: Fallback to demo users
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

    showRoleSelectionModal() {
        const modal = document.getElementById('roleSelectionModal');
        if (modal) {
            modal.style.display = 'flex';
            modal.classList.add('show');
            // Reset role selection
            const userRole = document.getElementById('userRole');
            const continueBtn = document.getElementById('continueToDashboard');
            if (userRole) {
                userRole.value = '';
            }
            if (continueBtn) {
                continueBtn.disabled = true;
            }
            
            // Trigger opacity transition
            setTimeout(() => {
                modal.style.opacity = '1';
            }, 10);
        }
        this.showMessage('Login successful! Please select your role.', 'success');
    }

    hideRoleSelectionModal() {
        const modal = document.getElementById('roleSelectionModal');
        if (modal) {
            modal.style.opacity = '0';
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
    }

    handleRoleSelection() {
        const userRole = document.getElementById('userRole');
        const continueBtn = document.getElementById('continueToDashboard');
        
        if (userRole && continueBtn) {
            if (userRole.value) {
                continueBtn.disabled = false;
            } else {
                continueBtn.disabled = true;
            }
        }
    }

    continueToDashboard() {
        const userRole = document.getElementById('userRole');
        if (!userRole || !userRole.value) {
            this.showMessage('Please select a role first.', 'error');
            return;
        }

        const selectedRole = userRole.value;
        const user = this.currentLoginUser;
        
        if (!user) {
            console.error('No user data available for redirect');
            this.showMessage('Login session expired. Please login again.', 'error');
            return;
        }
        
        // Map selected role to userType
        let userType = selectedRole;
        if (selectedRole === 'seller') {
            userType = 'sheriff';
        }
        
        console.log('Continuing to dashboard with role:', selectedRole, 'userType:', userType);
        
        // Determine redirect URL upfront
        let redirectUrl = 'buyer-dashboard.html'; // default
        if (userType === 'admin') {
            redirectUrl = 'admin-dashboard.html';
        } else if (userType === 'sheriff' || userType === 'seller') {
            redirectUrl = 'sheriff-dashboard.html';
        } else if (userType === 'buyer') {
            redirectUrl = 'buyer-dashboard.html';
        }
        console.log('✓ Will redirect to:', redirectUrl);

        // Ensure user is in localStorage before redirecting
        if (user) {
            try {
                localStorage.setItem('demo_user', JSON.stringify(user));
                console.log('✓ User data saved to localStorage before redirect');
            } catch (storageError) {
                console.warn('Could not save user to localStorage:', storageError);
            }
        }

        this.hideRoleSelectionModal();
        this.showMessage('Redirecting to dashboard...', 'success');
        
        // Small delay to let modal close animation complete, then redirect
        setTimeout(() => {
            console.log('Executing redirect to:', redirectUrl);
            this.redirectToDashboard(user, userType);
        }, 300);
    }
}

// Initialize Auth Manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Function to initialize auth manager
    function initAuthManager() {
        // Check if required dependencies are loaded
        if (typeof DEMO_USERS === 'undefined' && typeof firebase === 'undefined') {
            console.warn('Waiting for dependencies to load...');
            setTimeout(initAuthManager, 100);
            return;
        }
        
        // Check if demoAuth is available (for demo mode)
        if (typeof demoAuth === 'undefined' && (typeof firebase === 'undefined' || !firebase.auth)) {
            console.warn('No authentication method available. Retrying...');
            setTimeout(initAuthManager, 100);
            return;
        }
        
        try {
            window.authManager = new AuthManager();
            console.log('✓ AuthManager initialized successfully');
            console.log('✓ Auth method:', typeof demoAuth !== 'undefined' ? 'Demo Mode' : 'Firebase');
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
        const auth = typeof demoAuth !== 'undefined' ? demoAuth : 
                     (typeof firebase !== 'undefined' && firebase.auth ? firebase.auth() : null);
        if (auth && auth.onAuthStateChanged) {
            auth.onAuthStateChanged((user) => {
                resolve(user);
            });
        } else {
            // Check localStorage for demo user
            const storedUser = localStorage.getItem('demo_user');
            resolve(storedUser ? JSON.parse(storedUser) : null);
        }
    });
}

// Export for use in other files
window.AuthManager = AuthManager;
window.checkAuthState = checkAuthState;
