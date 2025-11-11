// Application Form Handler
class ApplicationFormHandler {
    constructor() {
        this.form = document.getElementById('applicationForm');
        this.submitBtn = document.getElementById('submitBtn');
        this.init();
    }

    init() {
        // Initialize EmailJS
        this.initEmailJS();
        
        // Bind form events
        this.bindEvents();
        
        // Setup real-time validation
        this.setupValidation();
    }

    initEmailJS() {
        // Initialize EmailJS with your service ID
        // You'll need to replace 'your_service_id' with your actual EmailJS service ID
        emailjs.init('your_service_id');
    }

    bindEvents() {
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
    }

    setupValidation() {
        const inputs = this.form.querySelectorAll('input, textarea');
        
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
        if (field.hasAttribute('required') && !value) {
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

        // Name validation
        if (fieldName === 'fullName' && value) {
            if (value.length < 2) {
                isValid = false;
                errorMessage = 'Name must be at least 2 characters';
            }
        }

        // Institution name validation
        if (fieldName === 'institutionName' && value) {
            if (value.length < 3) {
                isValid = false;
                errorMessage = 'Institution name must be at least 3 characters';
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
            'institutionName': 'Institution Name',
            'email': 'Email Address',
            'message': 'Message'
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

    async handleSubmit(e) {
        e.preventDefault();
        
        // Validate all fields
        const inputs = this.form.querySelectorAll('input[required], textarea[required]');
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

        // Show loading state
        this.setLoadingState(true);

        try {
            // Get form data
            const formData = this.getFormData();
            
            // Send email using EmailJS
            await this.sendEmail(formData);
            
            // Show success message
            this.showMessage('Application submitted successfully! We will review your application and get back to you soon.', 'success');
            
            // Reset form
            this.form.reset();
            
        } catch (error) {
            console.error('Error submitting application:', error);
            this.showMessage('Failed to submit application. Please try again or contact support.', 'error');
        } finally {
            this.setLoadingState(false);
        }
    }

    getFormData() {
        return {
            fullName: document.getElementById('fullName').value,
            institutionName: document.getElementById('institutionName').value,
            email: document.getElementById('email').value,
            message: document.getElementById('message').value,
            timestamp: new Date().toLocaleString(),
            userAgent: navigator.userAgent
        };
    }

    async sendEmail(formData) {
        try {
            // Method 1: Try Formspree (recommended for static sites)
            if (window.EMAIL_CONFIG && window.EMAIL_CONFIG.FORMSPREE_ENDPOINT) {
                return await this.sendViaFormspree(formData);
            }
            
            // Method 2: Try EmailJS
            if (typeof emailjs !== 'undefined') {
                return await this.sendViaEmailJS(formData);
            }
            
            // Method 3: Fallback to mailto
            this.sendViaMailto(formData);
            return true;
            
        } catch (error) {
            console.error('Email sending failed:', error);
            // Fallback to mailto
            this.sendViaMailto(formData);
            return true;
        }
    }

    async sendViaFormspree(formData) {
        const response = await fetch(window.EMAIL_CONFIG.FORMSPREE_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: formData.fullName,
                institution: formData.institutionName,
                email: formData.email,
                message: formData.message,
                _subject: 'New Seller Application - Auprolis',
                _replyto: formData.email
            })
        });

        if (!response.ok) {
            throw new Error('Formspree submission failed');
        }
    }

    async sendViaEmailJS(formData) {
        const templateParams = {
            to_email: 'auprolis@gmail.com',
            from_name: formData.fullName,
            from_email: formData.email,
            institution: formData.institutionName,
            message: formData.message,
            timestamp: formData.timestamp
        };

        const response = await emailjs.send(
            window.EMAIL_CONFIG.EMAILJS_SERVICE_ID,
            window.EMAIL_CONFIG.EMAILJS_TEMPLATE_ID,
            templateParams
        );

        if (response.status !== 200) {
            throw new Error('EmailJS submission failed');
        }
    }

    sendViaMailto(formData) {
        const subject = `New Seller Application - ${formData.fullName}`;
        const body = `
New seller application received:

Name: ${formData.fullName}
Institution: ${formData.institutionName}
Email: ${formData.email}
Message: ${formData.message}
Timestamp: ${formData.timestamp}

Please review this application.
        `.trim();

        const mailtoLink = `mailto:auprolis@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(mailtoLink);
    }

    setLoadingState(isLoading) {
        if (isLoading) {
            this.submitBtn.disabled = true;
            this.submitBtn.classList.add('loading');
        } else {
            this.submitBtn.disabled = false;
            this.submitBtn.classList.remove('loading');
        }
    }

    showMessage(message, type = 'info') {
        const messagesContainer = document.getElementById('formMessages');
        if (!messagesContainer) return;
        
        const messageElement = document.createElement('div');
        messageElement.className = `form-message ${type}`;
        messageElement.textContent = message;
        
        messagesContainer.appendChild(messageElement);
        
        // Show message
        setTimeout(() => {
            messageElement.classList.add('show');
        }, 100);
        
        // Auto remove after 7 seconds
        setTimeout(() => {
            messageElement.classList.remove('show');
            setTimeout(() => {
                if (messagesContainer.contains(messageElement)) {
                    messagesContainer.removeChild(messageElement);
                }
            }, 300);
        }, 7000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new ApplicationFormHandler();
});

// Alternative email sending method using a simple form submission
// This can be used as a fallback if EmailJS is not available
function sendEmailFallback(formData) {
    // Create a mailto link as fallback
    const subject = `New Seller Application - ${formData.fullName}`;
    const body = `
New seller application received:

Name: ${formData.fullName}
Institution: ${formData.institutionName}
Email: ${formData.email}
Message: ${formData.message}
Timestamp: ${formData.timestamp}

Please review this application.
    `.trim();

    const mailtoLink = `mailto:auprolis@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink);
}

// Export for use in other files
window.ApplicationFormHandler = ApplicationFormHandler;
window.sendEmailFallback = sendEmailFallback;
