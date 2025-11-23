// Sign Up Handler
class SignUpHandler {
    constructor() {
        this.auth = firebase.auth();
        this.db = firebase.firestore();
        this.googleProvider = new firebase.auth.GoogleAuthProvider();
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupFormValidation();
    }

    bindEvents() {
        // Sign up form
        const signupForm = document.getElementById('signupForm');
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => this.handleEmailSignup(e));
        }

        // Google sign up
        const googleBtn = document.getElementById('googleSignUp');
        if (googleBtn) {
            googleBtn.addEventListener('click', (e) => this.handleGoogleSignup(e));
        }
    }

    setupFormValidation() {
        const form = document.getElementById('signupForm');
        if (!form) return;
        
        const inputs = form.querySelectorAll('input[required]');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearError(input));
        });
    }

    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.name;
        let isValid = true;
        let errorMessage = '';

        // Required field validation
        if (!value) {
            isValid = false;
            errorMessage = `${this.getFieldLabel(fieldName)} is required`;
        }

        // Email validation
        if (fieldName === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }
        }

        // Password validation
        if (fieldName === 'password' && value) {
            if (value.length < 6) {
                isValid = false;
                errorMessage = 'Password must be at least 6 characters';
            }
        }

        // Confirm password validation
        if (fieldName === 'confirmPassword' && value) {
            const password = document.getElementById('password').value;
            if (value !== password) {
                isValid = false;
                errorMessage = 'Passwords do not match';
            }
        }

        // Full name validation
        if (fieldName === 'fullName' && value) {
            if (value.length < 2) {
                isValid = false;
                errorMessage = 'Name must be at least 2 characters';
            }
        }

        if (isValid) {
            this.clearError(field);
        } else {
            this.showError(field, errorMessage);
        }

        return isValid;
    }

    getFieldLabel(fieldName) {
        const labels = {
            'fullName': 'Full Name',
            'email': 'Email Address',
            'password': 'Password',
            'confirmPassword': 'Confirm Password'
        };
        return labels[fieldName] || fieldName;
    }

    showError(field, message) {
        const errorElement = document.getElementById(field.name + 'Error');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }
        field.classList.add('error');
    }

    clearError(field) {
        const errorElement = document.getElementById(field.name + 'Error');
        if (errorElement) {
            errorElement.classList.remove('show');
        }
        field.classList.remove('error');
    }

    async handleEmailSignup(e) {
        e.preventDefault();
        
        const fullName = document.getElementById('fullName').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const agreeTerms = document.getElementById('agreeTerms').checked;
        const signupBtn = document.getElementById('signupBtn');
        
        // Validate form
        if (!this.validateField(document.getElementById('fullName')) ||
            !this.validateField(document.getElementById('email')) ||
            !this.validateField(document.getElementById('password')) ||
            !this.validateField(document.getElementById('confirmPassword'))) {
            return;
        }

        if (!agreeTerms) {
            this.showMessage('Please agree to the Terms of Service and Privacy Policy', 'error');
            return;
        }
        
        // Show loading state
        this.setLoadingState(signupBtn, true);
        
        try {
            // Create user account
            const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            // Update user profile
            if (user.updateProfile) {
                await user.updateProfile({
                    displayName: fullName
                });
            }
            
            // Split full name into first and last name
            const nameParts = fullName.trim().split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';
            
            // Store user data in Firestore
            await this.storeUserData(user.uid, {
                uid: user.uid,
                email: email.toLowerCase(),
                fullName: fullName,
                firstName: firstName,
                lastName: lastName,
                displayName: fullName,
                userType: 'buyer',
                subscriptionStatus: 'active',
                status: 'active',
                isEmailVerified: false,
                permissions: ['placeBids']
            });
            
            // Send confirmation email
            await this.sendConfirmationEmail(user);
            
            // Redirect to dashboard
            this.showMessage('Account created successfully! Redirecting to dashboard...', 'success');
            setTimeout(() => {
                window.location.href = 'buyer-dashboard.html';
            }, 2000);
            
        } catch (error) {
            this.handleAuthError(error);
        } finally {
            this.setLoadingState(signupBtn, false);
        }
    }

    async handleGoogleSignup(e) {
        e.preventDefault();
        
        const googleBtn = document.getElementById('googleSignUp');
        this.setLoadingState(googleBtn, true);
        
        try {
            const result = await this.auth.signInWithPopup(this.googleProvider);
            const user = result.user;
            
            // Split display name into first and last name
            const displayName = user.displayName || user.email.split('@')[0];
            const nameParts = displayName.trim().split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';
            
            // Store user data in Firestore
            await this.storeUserData(user.uid, {
                uid: user.uid,
                googleId: user.uid, // Store Google ID for OAuth users
                email: user.email.toLowerCase(),
                fullName: displayName,
                firstName: firstName,
                lastName: lastName,
                displayName: displayName,
                userType: 'buyer',
                subscriptionStatus: 'active',
                status: 'active',
                isEmailVerified: user.emailVerified || true, // Google users are verified
                permissions: ['placeBids']
            });
            
            // Send confirmation email
            await this.sendConfirmationEmail(user);
            
            // Redirect to dashboard
            this.showMessage('Account created successfully! Redirecting to dashboard...', 'success');
            setTimeout(() => {
                window.location.href = 'buyer-dashboard.html';
            }, 2000);
            
        } catch (error) {
            this.handleAuthError(error);
        } finally {
            this.setLoadingState(googleBtn, false);
        }
    }

    async storeUserData(uid, userData) {
        try {
            // Use Firestore server timestamp for consistency
            const userDoc = {
                ...userData,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastActivity: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            await this.db.collection('users').doc(uid).set(userDoc);
            console.log('User data stored successfully in Firestore');
        } catch (error) {
            console.error('Error storing user data:', error);
            throw error;
        }
    }

    async sendConfirmationEmail(user) {
        try {
            await user.sendEmailVerification();
            console.log('Confirmation email sent');
        } catch (error) {
            console.error('Error sending confirmation email:', error);
            // Don't throw error - email sending is not critical for the flow
        }
    }

    handleAuthError(error) {
        let errorMessage = 'An error occurred. Please try again.';
        
        switch (error.code) {
            case 'auth/email-already-in-use':
                errorMessage = 'An account with this email already exists. Please sign in instead.';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Please enter a valid email address.';
                break;
            case 'auth/weak-password':
                errorMessage = 'Password is too weak. Please choose a stronger password.';
                break;
            case 'auth/network-request-failed':
                errorMessage = 'Network error. Please check your connection.';
                break;
            case 'auth/popup-closed-by-user':
                errorMessage = 'Sign-up was cancelled.';
                break;
            default:
                errorMessage = error.message || errorMessage;
        }
        
        this.showMessage(errorMessage, 'error');
    }

    setLoadingState(button, isLoading) {
        if (isLoading) {
            button.disabled = true;
            button.classList.add('loading');
        } else {
            button.disabled = false;
            button.classList.remove('loading');
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

// Initialize Sign Up Handler when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if Firebase is loaded
    if (typeof firebase !== 'undefined') {
        new SignUpHandler();
    } else {
        console.error('Firebase not loaded. Please check your Firebase configuration.');
    }
});

// Export for use in other files
window.SignUpHandler = SignUpHandler;

