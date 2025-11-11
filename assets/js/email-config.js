// Email Configuration
// This file contains the email settings for the application form

const EMAIL_CONFIG = {
    // Primary email address to receive applications
    RECIPIENT_EMAIL: 'auprolis@gmail.com',
    
    // EmailJS Configuration (if using EmailJS)
    EMAILJS_SERVICE_ID: 'your_service_id_here',
    EMAILJS_TEMPLATE_ID: 'your_template_id_here',
    EMAILJS_PUBLIC_KEY: 'your_public_key_here',
    
    // Alternative: Formspree configuration (recommended for static sites)
    FORMSPREE_ENDPOINT: 'https://formspree.io/f/xpwyggje',
    
    // Fallback: Netlify Forms (if hosting on Netlify)
    NETLIFY_FORM_NAME: 'seller-application'
};

// Email template for the application
const EMAIL_TEMPLATE = {
    subject: 'New Seller Application - Auprolis',
    body: `
New seller application received:

Applicant Details:
- Full Name: {{fullName}}
- Institution: {{institutionName}}
- Email: {{email}}
- Message: {{message}}

Application Details:
- Submitted: {{timestamp}}
- User Agent: {{userAgent}}

Please review this application and respond to the applicant.

Best regards,
Auprolis System
    `.trim()
};

// Export configuration
window.EMAIL_CONFIG = EMAIL_CONFIG;
window.EMAIL_TEMPLATE = EMAIL_TEMPLATE;
