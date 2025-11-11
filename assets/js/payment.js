// Payment Handler
class PaymentHandler {
    constructor() {
        this.auth = firebase.auth();
        this.db = firebase.firestore();
        this.userId = null;
        this.userEmail = null;
        this.selectedPaymentMethod = 'dpo';
        
        this.init();
    }

    init() {
        this.getUrlParameters();
        this.bindEvents();
        this.setupFormValidation();
    }

    getUrlParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        this.userId = urlParams.get('userId');
        this.userEmail = urlParams.get('email');
        
        if (!this.userId || !this.userEmail) {
            this.showMessage('Invalid payment session. Please sign up again.', 'error');
            setTimeout(() => {
                window.location.href = 'signup.html';
            }, 3000);
            return;
        }
        
        // Set billing email from URL parameter
        const billingEmail = document.getElementById('billingEmail');
        if (billingEmail && this.userEmail) {
            billingEmail.value = decodeURIComponent(this.userEmail);
        }
    }

    bindEvents() {
        // Payment form submission
        const paymentForm = document.getElementById('paymentForm');
        if (paymentForm) {
            paymentForm.addEventListener('submit', (e) => this.handlePayment(e));
        }

        // Process payment button
        const processBtn = document.getElementById('processPayment');
        if (processBtn) {
            processBtn.addEventListener('click', (e) => this.processPayment(e));
        }

        // Payment method selection
        const paymentMethods = document.querySelectorAll('.payment-method-btn');
        paymentMethods.forEach(btn => {
            btn.addEventListener('click', (e) => this.selectPaymentMethod(e));
        });

        // Form validation
        const inputs = document.querySelectorAll('#paymentForm input');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearError(input));
        });
    }

    setupFormValidation() {
        // Card number formatting
        const cardNumber = document.getElementById('cardNumber');
        if (cardNumber) {
            cardNumber.addEventListener('input', (e) => this.formatCardNumber(e));
        }

        // Expiry date formatting
        const expiryDate = document.getElementById('expiryDate');
        if (expiryDate) {
            expiryDate.addEventListener('input', (e) => this.formatExpiryDate(e));
        }

        // CVV formatting
        const cvv = document.getElementById('cvv');
        if (cvv) {
            cvv.addEventListener('input', (e) => this.formatCVV(e));
        }
    }

    formatCardNumber(e) {
        let value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
        let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
        e.target.value = formattedValue;
    }

    formatExpiryDate(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        e.target.value = value;
    }

    formatCVV(e) {
        e.target.value = e.target.value.replace(/\D/g, '').substring(0, 4);
    }

    selectPaymentMethod(e) {
        const method = e.currentTarget.dataset.method;
        this.selectedPaymentMethod = method;
        
        // Update UI
        document.querySelectorAll('.payment-method-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        e.currentTarget.classList.add('active');
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        // Required field validation
        if (!value) {
            isValid = false;
            errorMessage = 'This field is required';
        }

        // Email validation
        if (field.id === 'billingEmail' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }
        }

        // Card number validation
        if (field.id === 'cardNumber' && value) {
            const cardNumber = value.replace(/\s/g, '');
            if (cardNumber.length < 13 || cardNumber.length > 19) {
                isValid = false;
                errorMessage = 'Please enter a valid card number';
            }
        }

        // Expiry date validation
        if (field.id === 'expiryDate' && value) {
            const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
            if (!expiryRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid expiry date (MM/YY)';
            } else {
                const [month, year] = value.split('/');
                const currentDate = new Date();
                const currentYear = currentDate.getFullYear() % 100;
                const currentMonth = currentDate.getMonth() + 1;
                
                if (parseInt(year) < currentYear || 
                    (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
                    isValid = false;
                    errorMessage = 'Card has expired';
                }
            }
        }

        // CVV validation
        if (field.id === 'cvv' && value) {
            if (value.length < 3 || value.length > 4) {
                isValid = false;
                errorMessage = 'Please enter a valid CVV';
            }
        }

        if (isValid) {
            this.clearError(field);
        } else {
            this.showFieldError(field, errorMessage);
        }

        return isValid;
    }

    showFieldError(field, message) {
        field.classList.add('error');
        // You could add error message display here if needed
    }

    clearError(field) {
        field.classList.remove('error');
    }

    async handlePayment(e) {
        e.preventDefault();
        await this.processPayment(e);
    }

    async processPayment(e) {
        e.preventDefault();
        
        // Validate all fields
        const inputs = document.querySelectorAll('#paymentForm input[required]');
        let isFormValid = true;
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isFormValid = false;
            }
        });

        if (!isFormValid) {
            this.showMessage('Please fix the errors above', 'error');
            return;
        }

        const processBtn = document.getElementById('processPayment');
        this.setLoadingState(processBtn, true);

        try {
            await this.processDPOPayment();
        } catch (error) {
            console.error('Payment processing error:', error);
            this.showMessage('Payment processing failed. Please try again.', 'error');
        } finally {
            this.setLoadingState(processBtn, false);
        }
    }

    async processDPOPayment() {
        // Show processing modal
        this.showProcessingModal();
        
        try {
            // Simulate DPO payment processing
            // In real implementation, this would integrate with DPO API
            const paymentData = {
                userId: this.userId,
                email: this.userEmail,
                amount: 250,
                currency: 'BWP',
                paymentMethod: 'dpo',
                timestamp: new Date(),
                status: 'processing'
            };

            // Store payment record in Firebase
            await this.db.collection('payments').add(paymentData);

            // Simulate payment processing delay
            await new Promise(resolve => setTimeout(resolve, 3000));

            // Simulate successful payment
            const paymentResult = {
                success: true,
                transactionId: 'DPO_' + Date.now(),
                amount: 250,
                currency: 'BWP'
            };

            // Update user subscription status
            await this.updateUserSubscription(paymentResult);
            
            // Hide processing modal
            this.hideProcessingModal();
            
            // Show success message
            this.showMessage('Payment successful! Redirecting to dashboard...', 'success');
            
            // Redirect to buyer dashboard
            setTimeout(() => {
                window.location.href = 'buyer-dashboard.html';
            }, 2000);

        } catch (error) {
            this.hideProcessingModal();
            throw error;
        }
    }


    async updateUserSubscription(paymentResult) {
        try {
            await this.db.collection('users').doc(this.userId).update({
                subscriptionStatus: 'active',
                paymentStatus: 'completed',
                subscriptionStartDate: new Date(),
                paymentMethod: this.selectedPaymentMethod,
                transactionId: paymentResult.transactionId,
                lastPaymentDate: new Date()
            });
            
            console.log('User subscription updated successfully');
        } catch (error) {
            console.error('Error updating user subscription:', error);
            throw error;
        }
    }


    showProcessingModal() {
        const modal = document.getElementById('processingModal');
        if (modal) {
            modal.classList.add('show');
            modal.style.display = 'flex';
        }
    }

    hideProcessingModal() {
        const modal = document.getElementById('processingModal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
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
        const messagesContainer = document.getElementById('paymentMessages');
        if (!messagesContainer) return;
        
        const messageElement = document.createElement('div');
        messageElement.className = `payment-message ${type}`;
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

// Initialize Payment Handler when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if Firebase is loaded
    if (typeof firebase !== 'undefined') {
        new PaymentHandler();
    } else {
        console.error('Firebase not loaded. Please check your Firebase configuration.');
    }
});

// Export for use in other files
window.PaymentHandler = PaymentHandler;
