// Enhanced Dashboard Handler
class DashboardHandler {
    constructor() {
        // DEMO MODE: Use demo authentication if available
        this.auth = typeof demoAuth !== 'undefined' ? demoAuth : 
                    (typeof firebase !== 'undefined' && firebase.auth ? firebase.auth() : null);
        this.db = typeof demoFirestore !== 'undefined' ? demoFirestore : 
                  (typeof firebase !== 'undefined' && firebase.firestore ? firebase.firestore() : null);
        this.user = null;
        this.userData = null;
        this.assets = SAMPLE_ASSETS || [];
        this.watchlist = [];
        this.alerts = [];
        this.activity = [];
        
        this.init();
    }

    init() {
        // Check authentication state - demo mode or Firebase
        if (this.auth && this.auth.onAuthStateChanged) {
            this.auth.onAuthStateChanged((user) => {
                if (user) {
                    this.user = user;
                    this.loadUserData();
                } else {
                    // Check localStorage for demo user
                    const storedUser = localStorage.getItem('demo_user');
                    if (storedUser) {
                        this.user = JSON.parse(storedUser);
                        this.loadUserData();
                    } else {
                        // Redirect to login if not authenticated
                        window.location.href = 'login.html';
                    }
                }
            });
        } else {
            // No auth available - check localStorage for demo user
            const storedUser = localStorage.getItem('demo_user');
            if (storedUser) {
                this.user = JSON.parse(storedUser);
                this.loadUserData();
            } else {
                // Redirect to login if not authenticated
                window.location.href = 'login.html';
            }
        }

        this.bindEvents();
        this.loadDashboardData();
    }

    bindEvents() {
        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }

        // Dashboard buttons
        const viewBidsBtn = document.getElementById('viewBidsBtn');
        const viewWatchlistBtn = document.getElementById('viewWatchlistBtn');
        const generateReportsBtn = document.getElementById('generateReportsBtn');

        if (viewBidsBtn) {
            viewWatchlistBtn.addEventListener('click', () => this.showBids());
        }

        if (viewWatchlistBtn) {
            viewWatchlistBtn.addEventListener('click', () => this.showWatchlist());
        }

        if (generateReportsBtn) {
            generateReportsBtn.addEventListener('click', () => this.showReports());
        }

        // Quick action buttons
        const propertyReportBtn = document.getElementById('propertyReportBtn');
        const reservationHistoryBtn = document.getElementById('reservationHistoryBtn');
        const watchlistBtn = document.getElementById('watchlistBtn');
        const alertsBtn = document.getElementById('alertsBtn');

        if (propertyReportBtn) {
            propertyReportBtn.addEventListener('click', () => this.generatePropertyReport());
        }

        if (reservationHistoryBtn) {
            reservationHistoryBtn.addEventListener('click', () => {
                if (typeof ReservationHandler !== 'undefined' && window.reservationHandler) {
                    window.reservationHandler.showReservationHistory();
                } else {
                    this.switchTab('reservations');
                }
            });
        }

        if (watchlistBtn) {
            watchlistBtn.addEventListener('click', () => this.showWatchlist());
        }

        if (alertsBtn) {
            alertsBtn.addEventListener('click', () => this.manageAlerts());
        }

        // Modal close buttons
        this.bindModalEvents();
    }

    bindModalEvents() {
        // Property modal
        const propertyModalClose = document.getElementById('propertyModalClose');
        if (propertyModalClose) {
            propertyModalClose.addEventListener('click', () => this.closeModal('propertyModal'));
        }

        // Watchlist modal
        const watchlistModalClose = document.getElementById('watchlistModalClose');
        if (watchlistModalClose) {
            watchlistModalClose.addEventListener('click', () => this.closeModal('watchlistModal'));
        }

        // Reports modal
        const reportsModalClose = document.getElementById('reportsModalClose');
        if (reportsModalClose) {
            reportsModalClose.addEventListener('click', () => this.closeModal('reportsModal'));
        }

        // Close modals on backdrop click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target.id);
            }
        });
    }

    async loadUserData() {
        try {
            const userDoc = await this.db.collection('users').doc(this.user.uid).get();
            
            if (userDoc.exists) {
                this.userData = userDoc.data();
                this.updateUI();
            } else {
                // User not found in database - redirect to login
                console.log('User not found in database - redirecting to login');
                alert('Your account is not authorized. Please contact support.');
                await this.auth.signOut();
                window.location.href = 'login.html';
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            // On error, redirect to login for security
            window.location.href = 'login.html';
        }
    }

    updateUI() {
        // Update user info
        const userInfo = document.getElementById('userInfo');
        if (userInfo && this.user) {
            userInfo.textContent = `Welcome, ${this.user.displayName || this.user.email}!`;
        }

        // Update subscription status
        this.updateSubscriptionStatus();

        // Update dashboard stats
        this.updateDashboardStats();

        // Load recent activity
        this.loadRecentActivity();

        // Load alerts
        this.loadAlerts();
    }

    async loadDashboardData() {
        // Load watchlist
        await this.loadWatchlist();

        // Load user activity
        await this.loadUserActivity();

        // Load alerts
        await this.loadUserAlerts();
    }

    updateDashboardStats() {
        // Update active reservations count
        const activeBidsCount = document.getElementById('activeBidsCount');
        if (activeBidsCount) {
            activeBidsCount.textContent = this.getActiveReservationsCount();
        }

        // Update watchlist count
        const watchlistCount = document.getElementById('watchlistCount');
        if (watchlistCount) {
            watchlistCount.textContent = this.watchlist.length;
        }

        // Update total reservations count
        const totalBidsCount = document.getElementById('totalBidsCount');
        if (totalBidsCount) {
            totalBidsCount.textContent = this.getTotalReservationsCount();
        }

        // Update completed reservations count
        const wonAuctionsCount = document.getElementById('wonAuctionsCount');
        if (wonAuctionsCount) {
            wonAuctionsCount.textContent = this.getCompletedReservationsCount();
        }
    }

    getActiveReservationsCount() {
        // This would typically come from the database
        // For now, check DEMO_RESERVATIONS
        if (typeof DEMO_RESERVATIONS !== 'undefined') {
            return DEMO_RESERVATIONS.filter(r => r.userId === this.user?.uid && (r.status === 'pending' || r.status === 'confirmed')).length;
        }
        return 3;
    }

    getTotalReservationsCount() {
        // This would typically come from the database
        // For now, check DEMO_RESERVATIONS
        if (typeof DEMO_RESERVATIONS !== 'undefined') {
            return DEMO_RESERVATIONS.filter(r => r.userId === this.user?.uid).length;
        }
        return 5;
    }

    getCompletedReservationsCount() {
        // This would typically come from the database
        // For now, check DEMO_RESERVATIONS
        if (typeof DEMO_RESERVATIONS !== 'undefined') {
            return DEMO_RESERVATIONS.filter(r => r.userId === this.user?.uid && r.status === 'completed').length;
        }
        return 1;
    }

    loadRecentActivity() {
        const activityFeed = document.getElementById('activityFeed');
        if (!activityFeed) return;

        const mockActivity = [
            {
                icon: '📅',
                title: 'Reservation Made',
                description: 'You booked Toyota Hilux',
                time: '2 hours ago'
            },
            {
                icon: '❤️',
                title: 'Added to Watchlist',
                description: 'Luxury Villa - Phakalane added to your watchlist',
                time: '1 day ago'
            },
            {
                icon: '📊',
                title: 'Report Generated',
                description: 'Property report for BMW X5 downloaded',
                time: '2 days ago'
            },
            {
                icon: '🔔',
                title: 'Alert Received',
                description: 'Auction ending soon: Massey Ferguson Tractor',
                time: '3 days ago'
            }
        ];

        activityFeed.innerHTML = mockActivity.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">${activity.icon}</div>
                <div class="activity-content">
                    <h4>${activity.title}</h4>
                    <p>${activity.description}</p>
                </div>
                <div class="activity-time">${activity.time}</div>
            </div>
        `).join('');
    }

    loadAlerts() {
        const alertsList = document.getElementById('alertsList');
        if (!alertsList) return;

        const mockAlerts = [
            {
                icon: '⚠️',
                type: 'urgent',
                title: 'Auction Ending Soon',
                description: 'Toyota Hilux auction ends in 2 hours',
                time: '2 hours ago'
            },
            {
                icon: '💰',
                type: 'info',
                title: 'New Bid Alert',
                description: 'Someone outbid you on BMW X5',
                time: '1 day ago'
            },
            {
                icon: '📅',
                type: 'info',
                title: 'Inspection Reminder',
                description: 'Property inspection scheduled for tomorrow',
                time: '2 days ago'
            }
        ];

        alertsList.innerHTML = mockAlerts.map(alert => `
            <div class="alert-item ${alert.type}">
                <div class="alert-icon">${alert.icon}</div>
                <div class="alert-content">
                    <h4>${alert.title}</h4>
                    <p>${alert.description}</p>
                </div>
                <div class="alert-time">${alert.time}</div>
            </div>
        `).join('');
    }

    updateSubscriptionStatus() {
        const statusElement = document.getElementById('subscriptionStatus');
        if (!statusElement || !this.userData) return;

        const status = this.userData.subscriptionStatus || 'pending';
        const paymentStatus = this.userData.paymentStatus || 'pending';

        let statusHTML = '';
        
        if (status === 'active' && paymentStatus === 'completed') {
            statusHTML = `
                <span class="status-badge active">Active</span>
                <p>Your premium subscription is active. You have full access to all features.</p>
            `;
        } else if (paymentStatus === 'pending') {
            statusHTML = `
                <span class="status-badge pending">Payment Pending</span>
                <p>Your payment is being processed. You'll have full access once confirmed.</p>
            `;
        } else {
            statusHTML = `
                <span class="status-badge pending">Pending</span>
                <p>Your subscription is being processed. You'll have full access once payment is confirmed.</p>
            `;
        }

        statusElement.innerHTML = statusHTML;
    }

    // Watchlist functionality
    async loadWatchlist() {
        // This would typically load from Firebase
        // For now, use mock data
        this.watchlist = [
            {
                id: 'watch-001',
                assetId: 'asset-001',
                asset: this.assets.find(a => a.id === 'asset-001'),
                addedAt: new Date('2024-01-15'),
                notes: 'Great condition, good price',
                priceWhenAdded: 150000
            },
            {
                id: 'watch-002',
                assetId: 'asset-009',
                asset: this.assets.find(a => a.id === 'asset-009'),
                addedAt: new Date('2024-01-20'),
                notes: 'Luxury villa, perfect location',
                priceWhenAdded: 2800000
            }
        ];
    }

    showWatchlist() {
        const modal = document.getElementById('watchlistModal');
        const content = document.getElementById('watchlistContent');
        
        if (content) {
            content.innerHTML = this.watchlist.map(item => `
                <div class="watchlist-item">
                    <div class="watchlist-image">
                        <img src="${item.asset.images[0]}" alt="${item.asset.title}">
                    </div>
                    <div class="watchlist-info">
                        <h4>${item.asset.title}</h4>
                        <p>${item.asset.location}</p>
                        <p>Added: ${item.addedAt.toLocaleDateString()}</p>
                        <p>Notes: ${item.notes}</p>
                    </div>
                    <div class="watchlist-price">
                        BWP ${item.asset.currentBid.toLocaleString()}
                    </div>
                    <div class="watchlist-actions">
                        <button class="watchlist-btn primary" onclick="dashboardHandler.viewPropertyDetails('${item.assetId}')">
                            View Details
                        </button>
                        <button class="watchlist-btn secondary" onclick="dashboardHandler.removeFromWatchlist('${item.id}')">
                            Remove
                        </button>
                    </div>
                </div>
            `).join('');
        }

        this.showModal('watchlistModal');
    }

    async removeFromWatchlist(watchlistId) {
        this.watchlist = this.watchlist.filter(item => item.id !== watchlistId);
        this.updateDashboardStats();
        this.showWatchlist(); // Refresh the modal
    }

    // Reports functionality
    showReports() {
        const modal = document.getElementById('reportsModal');
        const content = document.getElementById('reportsContent');
        
        if (content) {
            content.innerHTML = `
                <div class="report-option" onclick="dashboardHandler.generatePropertyReport()">
                    <div class="report-icon">🏠</div>
                    <h4>Property Report</h4>
                    <p>Detailed property information with valuations and documents</p>
                </div>
                <div class="report-option" onclick="dashboardHandler.generateReservationHistory()">
                    <div class="report-icon">📈</div>
                    <h4>Reservation History</h4>
                    <p>Complete history of your reservations and bookings</p>
                </div>
                <div class="report-option" onclick="dashboardHandler.generateWatchlistReport()">
                    <div class="report-icon">❤️</div>
                    <h4>Watchlist Report</h4>
                    <p>Summary of your saved properties and price tracking</p>
                </div>
                <div class="report-option" onclick="dashboardHandler.generateFinancialReport()">
                    <div class="report-icon">💰</div>
                    <h4>Financial Summary</h4>
                    <p>Total bids, deposits, and financial overview</p>
                </div>
            `;
        }

        this.showModal('reportsModal');
    }

    generatePropertyReport() {
        alert('Property report generation will be implemented with PDF/Excel export functionality.');
        this.closeModal('reportsModal');
    }

    generateBiddingHistory() {
        alert('Reservation history report generation will be implemented with PDF/Excel export functionality.');
        this.closeModal('reportsModal');
    }

    generateReservationHistory() {
        alert('Reservation history report generation will be implemented with PDF/Excel export functionality.');
        this.closeModal('reportsModal');
    }

    generateWatchlistReport() {
        alert('Watchlist report generation will be implemented with PDF/Excel export functionality.');
        this.closeModal('reportsModal');
    }

    generateFinancialReport() {
        alert('Financial report generation will be implemented with PDF/Excel export functionality.');
        this.closeModal('reportsModal');
    }

    // Enhanced property details
    viewPropertyDetails(assetId) {
        const asset = this.assets.find(a => a.id === assetId);
        if (!asset) return;

        const modal = document.getElementById('propertyModal');
        const title = document.getElementById('propertyModalTitle');
        const content = document.getElementById('propertyDetailsContent');

        if (title) title.textContent = asset.title;
        
        if (content) {
            content.innerHTML = `
                <div class="property-gallery">
                    <div class="property-main-image">
                        <img src="${asset.images[0]}" alt="${asset.title}" id="mainPropertyImage">
                    </div>
                    <div class="property-thumbnails">
                        ${asset.images.map((img, index) => `
                            <div class="property-thumbnail ${index === 0 ? 'active' : ''}" onclick="dashboardHandler.changePropertyImage('${img}')">
                                <img src="${img}" alt="${asset.title}">
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="property-info">
                    <h4>${asset.title}</h4>
                    <div class="property-details">
                        <h5>Property Details</h5>
                        <p><strong>Location:</strong> ${asset.location}</p>
                        <p><strong>Condition:</strong> ${asset.condition}</p>
                        <p><strong>Starting Bid:</strong> BWP ${asset.startingBid.toLocaleString()}</p>
                        <p><strong>Current Bid:</strong> BWP ${asset.currentBid.toLocaleString()}</p>
                        <p><strong>Ends:</strong> ${new Date(asset.endDate).toLocaleString()}</p>
                        ${asset.bedrooms ? `<p><strong>Bedrooms:</strong> ${asset.bedrooms}</p>` : ''}
                        ${asset.bathrooms ? `<p><strong>Bathrooms:</strong> ${asset.bathrooms}</p>` : ''}
                        ${asset.size ? `<p><strong>Size:</strong> ${asset.size}</p>` : ''}
                        <p>${asset.description}</p>
                    </div>
                    
                    ${asset.valuations ? `
                        <div class="valuation-info">
                            <h5>Valuation Information</h5>
                            <p><strong>Market Value:</strong> BWP ${asset.valuations.marketValue.toLocaleString()}</p>
                            <p><strong>Reserve Price:</strong> BWP ${asset.valuations.reservePrice.toLocaleString()}</p>
                            <p><strong>Appraisal Date:</strong> ${asset.valuations.appraisalDate}</p>
                            <p><strong>Appraiser:</strong> ${asset.valuations.appraiser}</p>
                        </div>
                    ` : ''}
                    
                    ${asset.sheriffDetails ? `
                        <div class="sheriff-info">
                            <h5>Sheriff Contact Information</h5>
                            <p><strong>Office:</strong> ${asset.sheriffDetails.office}</p>
                            <p><strong>Address:</strong> ${asset.sheriffDetails.address}</p>
                            <p><strong>Contact Person:</strong> ${asset.sheriffDetails.contactPerson}</p>
                            <p><strong>Phone:</strong> ${asset.sheriffDetails.phone}</p>
                            <p><strong>Email:</strong> ${asset.sheriffDetails.email}</p>
                            <p><strong>Office Hours:</strong> ${asset.sheriffDetails.officeHours}</p>
                            <p><strong>Inspection:</strong> ${asset.sheriffDetails.inspectionSchedule}</p>
                        </div>
                    ` : ''}
                    
                    ${asset.documents ? `
                        <div class="documents-section">
                            <h5>Available Documents</h5>
                            <div class="document-list">
                                ${asset.documents.map(doc => `
                                    <a href="${doc.url}" class="document-item" target="_blank">
                                        <span class="document-icon">📄</span>
                                        <span>${doc.name}</span>
                                    </a>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    <div class="property-actions" style="margin-top: 2rem; padding-top: 2rem; border-top: 1px solid #e2e8f0;">
                        <div class="action-buttons" style="display: flex; gap: 1rem;">
                            <button class="btn btn-primary" onclick="dashboardHandler.bookItem('${assetId}')">
                                Book Item
                            </button>
                            <button class="btn btn-secondary" onclick="dashboardHandler.addToWatchlist('${assetId}')">
                                Add to Watchlist
                            </button>
                            <button class="btn btn-secondary" onclick="dashboardHandler.viewReservations('${assetId}')">
                                View My Reservations
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }

        this.showModal('propertyModal');
    }

    bookItem(assetId) {
        // Redirect to Google Form for bidding spot reservation
        const googleFormUrl = 'https://docs.google.com/forms/d/e/12vg2Tc2tct_uV6RIG3bJv1P5HmvLJvJtLLkhejSKpY0/viewform';
        
        // Optionally, you can pre-fill form fields if your Google Form supports it
        // const asset = this.assets.find(a => a.id === assetId);
        // if (asset) {
        //     googleFormUrl += `?entry.XXXXXXX=${encodeURIComponent(asset.title)}`;
        // }
        
        window.open(googleFormUrl, '_blank');
    }

    addToWatchlist(assetId) {
        const asset = this.assets.find(a => a.id === assetId);
        if (!asset) return;

        // Add to watchlist (this would typically save to database)
        this.watchlist.push({
            id: `watch-${Date.now()}`,
            assetId: assetId,
            asset: asset,
            addedAt: new Date(),
            notes: '',
            priceWhenAdded: asset.currentBid
        });

        this.updateDashboardStats();
        this.showMessage(`${asset.title} added to watchlist!`, 'success');
    }

    viewReservations(assetId) {
        // Open reservation history modal
        if (typeof ReservationHandler !== 'undefined' && window.reservationHandler) {
            window.reservationHandler.showReservationHistory();
        } else {
            alert('Reservation history will be available shortly.');
        }
    }

    showMessage(message, type) {
        // Create and show a temporary message
        const messageDiv = document.createElement('div');
        messageDiv.className = `bidding-message ${type}`;
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            font-weight: 600;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        `;
        
        if (type === 'success') {
            messageDiv.style.background = '#f0fdf4';
            messageDiv.style.border = '1px solid #bbf7d0';
            messageDiv.style.color = '#166534';
        } else if (type === 'error') {
            messageDiv.style.background = '#fef2f2';
            messageDiv.style.border = '1px solid #fecaca';
            messageDiv.style.color = '#dc2626';
        }
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }

    changePropertyImage(imageSrc) {
        const mainImage = document.getElementById('mainPropertyImage');
        if (mainImage) {
            mainImage.src = imageSrc;
        }

        // Update active thumbnail
        document.querySelectorAll('.property-thumbnail').forEach(thumb => {
            thumb.classList.remove('active');
        });
        event.target.closest('.property-thumbnail').classList.add('active');
    }

    // Modal management
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
            modal.style.display = 'flex';
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
    }

    // Additional methods
    showBids() {
        alert('Bid management functionality will be implemented with real-time bidding system.');
    }

    manageAlerts() {
        alert('Alert management functionality will be implemented with notification preferences.');
    }

    async loadUserActivity() {
        // This would load from Firebase
        // For now, use mock data
    }

    async loadUserAlerts() {
        // This would load from Firebase
        // For now, use mock data
    }

    async handleLogout() {
        try {
            // Clear localStorage for demo mode
            localStorage.removeItem('demo_user');
            
            // Sign out from auth (works for both Firebase and demo)
            if (this.auth && this.auth.signOut) {
                await this.auth.signOut();
            }
            
            window.location.href = 'login.html';
        } catch (error) {
            console.error('Error signing out:', error);
            // Force redirect even if signout fails
            localStorage.removeItem('demo_user');
            window.location.href = 'login.html';
        }
    }
}

// Initialize Dashboard Handler when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Always initialize - works in both demo mode and Firebase mode
    window.dashboardHandler = new DashboardHandler();
});

// Export for use in other files
window.DashboardHandler = DashboardHandler;
