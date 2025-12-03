// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }
});

// Process Tab Functionality
document.addEventListener('DOMContentLoaded', function() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Remove active class from all buttons and panels
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanels.forEach(panel => panel.classList.remove('active'));
            
            // Add active class to clicked button and corresponding panel
            this.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
});

// Smooth Scrolling for Navigation Links
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80; // Account for fixed navbar
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
});

// Add scroll effect to navbar
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.backdropFilter = 'blur(10px)';
    } else {
        navbar.style.background = '#fff';
        navbar.style.backdropFilter = 'none';
    }
});

// Intersection Observer for Animation on Scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', function() {
    const animatedElements = document.querySelectorAll('.feature-card, .pricing-card, .asset-card, .step');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Form Validation (for future forms)
function validateForm(form) {
    const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.style.borderColor = '#ef4444';
            isValid = false;
        } else {
            input.style.borderColor = '#e2e8f0';
        }
    });
    
    return isValid;
}

// Utility function for showing notifications
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#2563eb'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 5000);
}

// Lazy loading for images
document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
});

// Add loading states for buttons
function addLoadingState(button) {
    const originalText = button.textContent;
    button.textContent = 'Loading...';
    button.disabled = true;
    button.style.opacity = '0.7';
    
    return function removeLoadingState() {
        button.textContent = originalText;
        button.disabled = false;
        button.style.opacity = '1';
    };
}

// Handle external links
document.addEventListener('DOMContentLoaded', function() {
    const externalLinks = document.querySelectorAll('a[href^="http"]');
    
    externalLinks.forEach(link => {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
    });
});

// Keyboard navigation support
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        // Close mobile menu if open
        const navMenu = document.getElementById('nav-menu');
        const hamburger = document.getElementById('hamburger');
        
        if (navMenu && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        }
    }
});

// Performance optimization: Debounce scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply debounced scroll handler
const debouncedScrollHandler = debounce(function() {
    const navbar = document.querySelector('.navbar');
    
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.backdropFilter = 'blur(10px)';
    } else {
        navbar.style.background = '#fff';
        navbar.style.backdropFilter = 'none';
    }
}, 10);

window.addEventListener('scroll', debouncedScrollHandler);

// Enhanced Button Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Handle "View Available Deals" button
    const browseAssetsBtn = document.querySelector('.hero-buttons a[href="login.html"]');
    if (browseAssetsBtn) {
        browseAssetsBtn.addEventListener('click', function(e) {
            // Add loading state
            const originalText = this.textContent;
            this.textContent = 'Loading...';
            this.style.opacity = '0.7';
            
            // Reset after navigation
            setTimeout(() => {
                this.textContent = originalText;
                this.style.opacity = '1';
            }, 1000);
        });
    }

    // Handle "List an Asset (Sheriff / Bank)" button
    const becomeSellerBtn = document.querySelector('a[href="application-form.html"]');
    if (becomeSellerBtn) {
        becomeSellerBtn.addEventListener('click', function(e) {
            // Add loading state
            const originalText = this.textContent;
            this.textContent = 'Loading...';
            this.style.opacity = '0.7';
            
            // Reset after navigation
            setTimeout(() => {
                this.textContent = originalText;
                this.style.opacity = '1';
            }, 1000);
        });
    }

    // Handle "Get Started" buttons
    const getStartedBtns = document.querySelectorAll('a[href="login.html"]');
    getStartedBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            // Add loading state
            const originalText = this.textContent;
            this.textContent = 'Redirecting...';
            this.style.opacity = '0.7';
            
            // Reset after navigation
            setTimeout(() => {
                this.textContent = originalText;
                this.style.opacity = '1';
            }, 1000);
        });
    });

    // Handle "Choose Paid" button
    const choosePaidBtn = document.querySelector('a[href="payment-portal.html"]');
    if (choosePaidBtn) {
        choosePaidBtn.addEventListener('click', function(e) {
            // Add loading state
            const originalText = this.textContent;
            this.textContent = 'Loading...';
            this.style.opacity = '0.7';
            
            // Reset after navigation
            setTimeout(() => {
                this.textContent = originalText;
                this.style.opacity = '1';
            }, 1000);
        });
    }

    // Handle "View Details" buttons
    const viewDetailsBtns = document.querySelectorAll('a[href="assets-list.html"]');
    viewDetailsBtns.forEach(btn => {
        if (btn.textContent.includes('View Details')) {
            btn.addEventListener('click', function(e) {
                // Add loading state
                const originalText = this.textContent;
                this.textContent = 'Loading...';
                this.style.opacity = '0.7';
                
                // Reset after navigation
                setTimeout(() => {
                    this.textContent = originalText;
                    this.style.opacity = '1';
                }, 1000);
            });
        }
    });

    // Handle "View All Auctions" button
    const viewAllAuctionsBtn = document.querySelector('a[href="assets-list.html"]');
    if (viewAllAuctionsBtn && viewAllAuctionsBtn.textContent.includes('View All Auctions')) {
        viewAllAuctionsBtn.addEventListener('click', function(e) {
            // Add loading state
            const originalText = this.textContent;
            this.textContent = 'Loading...';
            this.style.opacity = '0.7';
            
            // Reset after navigation
            setTimeout(() => {
                this.textContent = originalText;
                this.style.opacity = '1';
            }, 1000);
        });
    }

    // Enhanced Modal Functionality
    initializeModalFunctionality();
});

// Enhanced Modal Functionality
function initializeModalFunctionality() {
    // Close modal on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });

    // Close modal on backdrop click
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target.id);
        }
    });

    // Close modal on close button click
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal-close')) {
            const modal = e.target.closest('.modal');
            if (modal) {
                closeModal(modal.id);
            }
        }
    });
}

// Modal utility functions
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = ''; // Restore scrolling
        }, 300);
    }
}

function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        closeModal(modal.id);
    });
}

// Enhanced form validation
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePhone(phone) {
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
}

function validateRequired(value) {
    return value && value.trim().length > 0;
}

// Enhanced error handling
function handleError(error, context = '') {
    console.error(`Error in ${context}:`, error);
    
    // Show user-friendly error message
    const errorMessage = error.message || 'An unexpected error occurred. Please try again.';
    showNotification(errorMessage, 'error');
}

// Enhanced success handling
function handleSuccess(message, context = '') {
    console.log(`Success in ${context}:`, message);
    showNotification(message, 'success');
}

// Export utility functions for use in other files
window.showModal = showModal;
window.closeModal = closeModal;
window.closeAllModals = closeAllModals;
window.validateEmail = validateEmail;
window.validatePhone = validatePhone;
window.validateRequired = validateRequired;
window.handleError = handleError;
window.handleSuccess = handleSuccess;