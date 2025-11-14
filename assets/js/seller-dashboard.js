// Enhanced Seller Dashboard Handler
class SellerDashboardHandler {
    constructor() {
        // DEMO MODE: Use demo authentication if available
        this.auth = typeof demoAuth !== 'undefined' ? demoAuth : 
                    (typeof firebase !== 'undefined' && firebase.auth ? firebase.auth() : null);
        this.db = typeof demoFirestore !== 'undefined' ? demoFirestore : 
                  (typeof firebase !== 'undefined' && firebase.firestore ? firebase.firestore() : null);
        this.user = null;
        this.userData = null;
        this.listings = [];
        this.reservations = [];
        this.transactions = [];
        this.analytics = {};
        
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

        // Tab navigation
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.getAttribute('data-tab');
                this.switchTab(tabName);
            });
        });

        // Quick action buttons
        const createListingBtn = document.getElementById('createListingBtn');
        const viewBidsBtn = document.getElementById('viewBidsBtn');
        const generateReportBtn = document.getElementById('generateReportBtn');
        const manageAuctionsBtn = document.getElementById('manageAuctionsBtn');

        if (createListingBtn) {
            createListingBtn.addEventListener('click', () => this.openCreateListingModal());
        }

        if (viewBidsBtn) {
            viewBidsBtn.addEventListener('click', () => this.switchTab('reservations'));
        }

        if (generateReportBtn) {
            generateReportBtn.addEventListener('click', () => this.switchTab('analytics'));
        }

        if (manageAuctionsBtn) {
            manageAuctionsBtn.addEventListener('click', () => this.switchTab('listings'));
        }

        // Form submission
        const createListingForm = document.getElementById('createListingForm');
        if (createListingForm) {
            createListingForm.addEventListener('submit', (e) => this.handleCreateListing(e));
        }

        // Image upload
        const imageUpload = document.getElementById('imageUpload');
        if (imageUpload) {
            imageUpload.addEventListener('change', (e) => this.handleImageUpload(e));
        }

        // Filter events
        this.bindFilterEvents();

        // Modal events
        this.bindModalEvents();
    }

    bindFilterEvents() {
        // Listing status filter
        const listingStatusFilter = document.getElementById('listingStatusFilter');
        if (listingStatusFilter) {
            listingStatusFilter.addEventListener('change', () => this.filterListings());
        }

        // Reservation status filter
        const reservationStatusFilter = document.getElementById('reservationStatusFilter');
        if (reservationStatusFilter) {
            reservationStatusFilter.addEventListener('change', () => this.filterReservations());
        }

        // Reservation sort filter
        const reservationSortFilter = document.getElementById('reservationSortFilter');
        if (reservationSortFilter) {
            reservationSortFilter.addEventListener('change', () => this.sortReservations());
        }

        // Analytics period filter
        const analyticsPeriod = document.getElementById('analyticsPeriod');
        if (analyticsPeriod) {
            analyticsPeriod.addEventListener('change', () => this.updateAnalytics());
        }

        // Transaction status filter
        const transactionStatusFilter = document.getElementById('transactionStatusFilter');
        if (transactionStatusFilter) {
            transactionStatusFilter.addEventListener('change', () => this.filterTransactions());
        }
    }

    bindModalEvents() {
        // Create listing modal
        const createListingModalClose = document.getElementById('createListingModalClose');
        if (createListingModalClose) {
            createListingModalClose.addEventListener('click', () => this.closeCreateListingModal());
        }

        // Asset details modal
        const assetDetailsModalClose = document.getElementById('assetDetailsModalClose');
        if (assetDetailsModalClose) {
            assetDetailsModalClose.addEventListener('click', () => this.closeModal('assetDetailsModal'));
        }

        // Bid management modal
        const bidManagementModalClose = document.getElementById('bidManagementModalClose');
        if (bidManagementModalClose) {
            bidManagementModalClose.addEventListener('click', () => this.closeModal('bidManagementModal'));
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
            // First, check if user data is already in the user object (from localStorage or Firebase)
            if (this.user && (this.user.userType || this.user.email)) {
                // Use user data directly if available (demo mode or Firebase user with data)
                this.userData = this.user;
                console.log('Using user data from auth object:', this.user.email);
                this.updateUI();
                return;
            }

            // Try to get user data from Firestore if available
            if (this.db && this.user && this.user.uid) {
                try {
                    const userDoc = await this.db.collection('users').doc(this.user.uid).get();
                    
                    if (userDoc.exists) {
                        this.userData = userDoc.data();
                        console.log('Loaded user data from Firestore:', this.userData.email);
                        this.updateUI();
                        return;
                    }
                } catch (firestoreError) {
                    console.warn('Firestore error (may be in demo mode):', firestoreError);
                }
            }

            // Check localStorage for demo user data
            const storedUser = localStorage.getItem('demo_user');
            if (storedUser) {
                try {
                    const parsedUser = JSON.parse(storedUser);
                    if (parsedUser && (parsedUser.email || parsedUser.uid)) {
                        this.userData = parsedUser;
                        this.user = parsedUser; // Update user object
                        console.log('Using user data from localStorage:', parsedUser.email);
                        this.updateUI();
                        return;
                    }
                } catch (parseError) {
                    console.warn('Error parsing stored user:', parseError);
                }
            }

            // If we still don't have user data but have a user object, use it
            if (this.user && (this.user.email || this.user.uid)) {
                this.userData = this.user;
                console.log('Using Firebase auth user object:', this.user.email);
                this.updateUI();
                return;
            }

            // Only redirect if we truly have no user data
            console.log('No user data available - redirecting to login');
            window.location.href = 'login.html';
        } catch (error) {
            console.error('Error loading user data:', error);
            // Check localStorage as fallback before redirecting
            const storedUser = localStorage.getItem('demo_user');
            if (storedUser) {
                try {
                    this.userData = JSON.parse(storedUser);
                    this.user = this.userData;
                    this.updateUI();
                    return;
                } catch (parseError) {
                    console.error('Error parsing stored user:', parseError);
                }
            }
            // Only redirect if all options fail
            window.location.href = 'login.html';
        }
    }

    updateUI() {
        // Update user info
        const userInfo = document.getElementById('userInfo');
        if (userInfo && this.user) {
            userInfo.textContent = `Welcome, ${this.user.displayName || this.user.email}!`;
        }

        // Update dashboard stats
        this.updateDashboardStats();

        // Load recent activity
        this.loadRecentActivity();
    }

    async loadDashboardData() {
        // Load listings
        await this.loadListings();

        // Load reservations
        await this.loadReservations();

        // Load transactions
        await this.loadTransactions();

        // Load analytics
        await this.loadAnalytics();
    }

    switchTab(tabName) {
        // Hide all tab contents
        const tabContents = document.querySelectorAll('.tab-content');
        tabContents.forEach(content => {
            content.classList.remove('active');
        });

        // Remove active class from all tab buttons
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            btn.classList.remove('active');
        });

        // Show selected tab content
        const selectedTab = document.getElementById(tabName);
        if (selectedTab) {
            selectedTab.classList.add('active');
        }

        // Add active class to selected tab button
        const selectedButton = document.querySelector(`[data-tab="${tabName}"]`);
        if (selectedButton) {
            selectedButton.classList.add('active');
        }

        // Load tab-specific data
        if (tabName === 'listings') {
            this.loadListingsTab();
        } else if (tabName === 'reservations') {
            this.loadReservationsTab();
        } else if (tabName === 'analytics') {
            this.loadAnalyticsTab();
        } else if (tabName === 'transactions') {
            this.loadTransactionsTab();
        }
    }

    async loadListings() {
        // Try to load from Google Sheets first
        if (typeof googleSheetsService !== 'undefined') {
            try {
                const allListings = await googleSheetsService.readListings();
                // Filter listings for current seller
                const sheetListings = allListings.filter(listing => 
                    listing.sellerId === this.user.uid || 
                    listing.sellerEmail === this.user.email
                );
                
                if (sheetListings && sheetListings.length > 0) {
                    this.listings = sheetListings;
                    console.log(`Loaded ${this.listings.length} listings from Google Sheets for seller`);
                    
                    // Start real-time polling
                    googleSheetsService.startListingsPolling((allListings) => {
                        const sellerListings = allListings.filter(listing => 
                            listing.sellerId === this.user.uid || 
                            listing.sellerEmail === this.user.email
                        );
                        this.listings = sellerListings;
                        this.renderListings();
                    });
                    return;
                }
            } catch (error) {
                console.warn('Could not load listings from Google Sheets:', error);
            }
        }
        
        // Fallback to demo data or Firebase
        if (typeof DEMO_ASSETS !== 'undefined') {
            this.listings = DEMO_ASSETS.map(asset => ({
                ...asset,
                status: asset.status || 'active'
            }));
        } else if (this.db && this.db.collection) {
            try {
                const snapshot = await this.db.collection('listings').get();
                this.listings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            } catch (error) {
                console.error('Error loading listings:', error);
                this.listings = [];
            }
        }
    }

    loadListingsTab() {
        this.renderListings();
    }

    renderListings() {
        const listingsGrid = document.getElementById('listingsGrid');
        if (!listingsGrid) return;

        if (this.listings.length === 0) {
            listingsGrid.innerHTML = `
                <div class="empty-state">
                    <h3>No Listings Yet</h3>
                    <p>Create your first asset listing to get started.</p>
                    <button class="btn btn-primary" onclick="sellerHandler.openCreateListingModal()">Create Listing</button>
                </div>
            `;
            return;
        }

        listingsGrid.innerHTML = this.listings.map(listing => this.createListingItem(listing)).join('');
    }

    createListingItem(listing) {
        const endDate = new Date(listing.endDate);
        const now = new Date();
        const isEnded = endDate <= now;
        const timeRemaining = this.getTimeRemaining(endDate);

        return `
            <div class="listing-item ${listing.status} ${isEnded ? 'ended' : ''}">
                <div class="listing-image">
                    <img src="${listing.images[0]}" alt="${listing.title}">
                    <div class="listing-badge ${listing.status}">${listing.status}</div>
                </div>
                <div class="listing-content">
                    <div class="listing-header">
                        <h4>${listing.title}</h4>
                        <div class="listing-status">
                            <span class="status-badge ${listing.status}">${listing.status}</span>
                        </div>
                    </div>
                    <p class="listing-location">📍 ${listing.location}</p>
                    <p class="listing-description">${listing.description}</p>
                    
                    <div class="listing-stats">
                        <div class="stat-item">
                            <span class="stat-label">Starting Price:</span>
                            <span class="stat-value">BWP ${(listing.startingBid || listing.currentBid || 0).toLocaleString()}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Views:</span>
                            <span class="stat-value">${listing.viewCount || 0}</span>
                        </div>
                    </div>

                    ${!isEnded ? `
                        <div class="listing-timer">
                            <span class="timer-label">Ends in:</span>
                            <span class="timer-value">${timeRemaining}</span>
                        </div>
                    ` : listing.soldPrice ? `
                        <div class="listing-sold">
                            <span class="sold-label">Sold for:</span>
                            <span class="sold-value">BWP ${listing.soldPrice.toLocaleString()}</span>
                            <span class="sold-to">to ${listing.soldTo}</span>
                        </div>
                    ` : `
                        <div class="listing-no-sale">
                            <span class="no-sale-label">No Sale</span>
                        </div>
                    `}

                    <div class="listing-actions">
                        <button class="btn btn-primary" onclick="sellerHandler.viewListingDetails('${listing.id}')">
                            View Details
                        </button>
                        <button class="btn btn-secondary" onclick="sellerHandler.manageReservations('${listing.id}')">
                            Manage Reservations
                        </button>
                        ${listing.status === 'active' ? `
                            <button class="btn btn-secondary" onclick="sellerHandler.editListing('${listing.id}')">
                                Edit
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    async loadReservations() {
        try {
            // In a real app, this would fetch from Firebase
            // For now, use DEMO_RESERVATIONS or create sample data
            if (typeof DEMO_RESERVATIONS !== 'undefined') {
                this.reservations = DEMO_RESERVATIONS.map(reservation => {
                    const listing = this.listings.find(l => l.id === reservation.listingId);
                    return {
                        ...reservation,
                        listing: listing
                    };
                });
            } else {
                this.reservations = [
                    {
                        id: 'reservation-001',
                        listingId: 'listing-001',
                        listing: this.listings.find(l => l.id === 'listing-001'),
                        userName: 'John Smith',
                        userEmail: 'john@example.com',
                        userPhone: '+267 71 234 567',
                        notes: 'Interested in viewing the vehicle',
                        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
                        status: 'pending',
                        isActive: true
                    },
                    {
                        id: 'reservation-002',
                        listingId: 'listing-001',
                        listing: this.listings.find(l => l.id === 'listing-001'),
                        userName: 'Mary Johnson',
                        userEmail: 'mary@example.com',
                        userPhone: '+267 72 345 678',
                        notes: 'Would like to schedule a viewing',
                        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
                        status: 'confirmed',
                        isActive: true
                    },
                    {
                        id: 'reservation-003',
                        listingId: 'listing-002',
                        listing: this.listings.find(l => l.id === 'listing-002'),
                        userName: 'David Brown',
                        userEmail: 'david@example.com',
                        userPhone: '+267 73 456 789',
                        notes: '',
                        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                        status: 'pending',
                        isActive: true
                    }
                ];
            }
        } catch (error) {
            console.error('Error loading reservations:', error);
            this.reservations = [];
        }
    }

    loadReservationsTab() {
        this.renderReservations();
    }

    renderReservations() {
        const reservationsList = document.getElementById('reservationsList') || document.getElementById('bidsList');
        if (!reservationsList) return;

        if (this.reservations.length === 0) {
            reservationsList.innerHTML = `
                <div class="empty-state">
                    <h3>No Reservations Yet</h3>
                    <p>Reservations will appear here when buyers book your listings.</p>
                </div>
            `;
            return;
        }

        reservationsList.innerHTML = this.reservations.map(reservation => this.createReservationItem(reservation)).join('');
    }

    createReservationItem(reservation) {
        const listing = reservation.listing || reservation.asset;
        if (!listing) return '';

        return `
            <div class="reservation-item ${reservation.status}">
                <div class="reservation-listing-info">
                    <div class="reservation-listing-image">
                        <img src="${listing.images[0]}" alt="${listing.title}">
                    </div>
                    <div class="reservation-listing-details">
                        <h4>${listing.title}</h4>
                        <p>${listing.location}</p>
                    </div>
                </div>
                
                <div class="reservation-details">
                    <div class="reservation-time">${this.formatTime(reservation.timestamp)}</div>
                    <div class="reservation-user">
                        <strong>${reservation.userName}</strong><br>
                        <small>${reservation.userEmail}</small><br>
                        <small>${reservation.userPhone || 'No phone'}</small>
                    </div>
                    ${reservation.notes ? `
                    <div class="reservation-notes">
                        <strong>Notes:</strong> ${reservation.notes}
                    </div>
                    ` : ''}
                </div>
                
                <div class="reservation-status">
                    <div class="reservation-status-badge ${reservation.status}">
                        ${reservation.status === 'pending' ? 'Pending' : 
                          reservation.status === 'confirmed' ? 'Confirmed' : 
                          reservation.status === 'cancelled' ? 'Cancelled' : 'Completed'}
                    </div>
                </div>
                
                <div class="reservation-actions">
                    ${reservation.status === 'pending' ? `
                        <button class="btn btn-success" onclick="sellerHandler.confirmReservation('${reservation.id}')">
                            Confirm
                        </button>
                        <button class="btn btn-danger" onclick="sellerHandler.cancelReservation('${reservation.id}')">
                            Cancel
                        </button>
                    ` : ''}
                    <button class="btn btn-secondary" onclick="sellerHandler.viewReservationDetails('${reservation.id}')">
                        View Details
                    </button>
                </div>
            </div>
        `;
    }

    async loadTransactions() {
        try {
            // In a real app, this would fetch from Firebase
            this.transactions = [
                {
                    id: 'txn-001',
                    listingId: 'listing-003',
                    listingTitle: 'Massey Ferguson Tractor',
                    buyerName: 'John Smith',
                    amount: 95000,
                    commission: 4750,
                    netAmount: 90250,
                    status: 'completed',
                    date: new Date('2024-02-20T14:00:00Z'),
                    paymentMethod: 'Bank Transfer'
                },
                {
                    id: 'txn-002',
                    listingId: 'listing-004',
                    listingTitle: 'Office Furniture Set',
                    buyerName: 'Mary Johnson',
                    amount: 28000,
                    commission: 1400,
                    netAmount: 26600,
                    status: 'pending',
                    date: new Date('2024-02-18T13:00:00Z'),
                    paymentMethod: 'Credit Card'
                }
            ];
        } catch (error) {
            console.error('Error loading transactions:', error);
            this.transactions = [];
        }
    }

    loadTransactionsTab() {
        this.renderTransactions();
    }

    renderTransactions() {
        const transactionsList = document.getElementById('transactionsList');
        if (!transactionsList) return;

        if (this.transactions.length === 0) {
            transactionsList.innerHTML = `
                <div class="empty-state">
                    <h3>No Transactions Yet</h3>
                    <p>Transaction history will appear here when your listings are sold.</p>
                </div>
            `;
            return;
        }

        transactionsList.innerHTML = this.transactions.map(transaction => this.createTransactionItem(transaction)).join('');
    }

    createTransactionItem(transaction) {
        return `
            <div class="transaction-item ${transaction.status}">
                <div class="transaction-header">
                    <h4>${transaction.listingTitle}</h4>
                    <span class="transaction-status-badge ${transaction.status}">${transaction.status}</span>
                </div>
                <div class="transaction-details">
                    <div class="transaction-row">
                        <span class="label">Buyer:</span>
                        <span class="value">${transaction.buyerName}</span>
                    </div>
                    <div class="transaction-row">
                        <span class="label">Sale Price:</span>
                        <span class="value">BWP ${transaction.amount.toLocaleString()}</span>
                    </div>
                    <div class="transaction-row">
                        <span class="label">Commission (5%):</span>
                        <span class="value">BWP ${transaction.commission.toLocaleString()}</span>
                    </div>
                    <div class="transaction-row">
                        <span class="label">Net Amount:</span>
                        <span class="value net-amount">BWP ${transaction.netAmount.toLocaleString()}</span>
                    </div>
                    <div class="transaction-row">
                        <span class="label">Payment Method:</span>
                        <span class="value">${transaction.paymentMethod}</span>
                    </div>
                    <div class="transaction-row">
                        <span class="label">Date:</span>
                        <span class="value">${transaction.date.toLocaleDateString()}</span>
                    </div>
                </div>
                <div class="transaction-actions">
                    <button class="btn btn-secondary" onclick="sellerHandler.viewTransactionDetails('${transaction.id}')">
                        View Details
                    </button>
                    ${transaction.status === 'completed' ? `
                        <button class="btn btn-primary" onclick="sellerHandler.downloadReceipt('${transaction.id}')">
                            Download Receipt
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    async loadAnalytics() {
        try {
            // In a real app, this would fetch from Firebase
            this.analytics = {
                totalListings: this.listings.length,
                activeListings: this.listings.filter(l => l.status === 'active').length,
                completedAuctions: this.listings.filter(l => l.status === 'ended' && l.soldPrice).length,
                totalRevenue: this.transactions.reduce((sum, t) => sum + t.netAmount, 0),
                successRate: 75,
                averageSalePrice: 150000,
                totalReservations: this.reservations.length
            };
        } catch (error) {
            console.error('Error loading analytics:', error);
            this.analytics = {};
        }
    }

    loadAnalyticsTab() {
        this.updateAnalytics();
    }

    updateAnalytics() {
        // Update analytics metrics
        const successRate = document.getElementById('successRate');
        const avgSalePrice = document.getElementById('avgSalePrice');
        const totalBidsReceived = document.getElementById('totalBidsReceived');

        if (successRate) successRate.textContent = `${this.analytics.successRate}%`;
        if (avgSalePrice) avgSalePrice.textContent = `BWP ${this.analytics.averageSalePrice.toLocaleString()}`;
        if (totalBidsReceived) totalBidsReceived.textContent = this.analytics.totalBids;

        // Update charts (placeholder for now)
        this.updateCharts();
    }

    updateCharts() {
        // Placeholder for chart updates
        // In a real implementation, you would use a charting library like Chart.js
        const charts = ['listingPerformanceChart', 'revenueChart', 'bidActivityChart'];
        charts.forEach(chartId => {
            const chartElement = document.getElementById(chartId);
            if (chartElement) {
                chartElement.innerHTML = `
                    <div class="chart-placeholder">
                        <p>Chart visualization will be implemented with Chart.js</p>
                        <p>Data: ${this.analytics.totalListings} listings, ${this.analytics.totalRevenue} revenue</p>
                    </div>
                `;
            }
        });
    }

    updateDashboardStats() {
        // Update active listings count
        const activeListingsCount = document.getElementById('activeListingsCount');
        if (activeListingsCount) {
            activeListingsCount.textContent = this.analytics.activeListings || 0;
        }

        // Update total reservations count
        const totalBidsCount = document.getElementById('totalBidsCount');
        if (totalBidsCount) {
            totalBidsCount.textContent = this.analytics.totalReservations || 0;
        }

        // Update completed auctions count
        const completedAuctionsCount = document.getElementById('completedAuctionsCount');
        if (completedAuctionsCount) {
            completedAuctionsCount.textContent = this.analytics.completedAuctions || 0;
        }

        // Update total revenue count
        const totalRevenueCount = document.getElementById('totalRevenueCount');
        if (totalRevenueCount) {
            totalRevenueCount.textContent = `BWP ${(this.analytics.totalRevenue || 0).toLocaleString()}`;
        }
    }

    loadRecentActivity() {
        const activityFeed = document.getElementById('activityFeed');
        if (!activityFeed) return;

        const mockActivity = [
            {
                icon: '📋',
                title: 'New Listing Created',
                description: '2018 Toyota Hilux Double Cab listed for auction',
                time: '2 hours ago'
            },
            {
                icon: '📅',
                title: 'New Reservation Received',
                description: 'Reservation for Toyota Hilux from John Smith',
                time: '4 hours ago'
            },
            {
                icon: '🏆',
                title: 'Auction Completed',
                description: 'Massey Ferguson Tractor sold for BWP 95,000',
                time: '1 day ago'
            },
            {
                icon: '📊',
                title: 'Analytics Updated',
                description: 'Monthly performance report generated',
                time: '2 days ago'
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

    // Modal management
    openCreateListingModal() {
        this.showModal('createListingModal');
    }

    closeCreateListingModal() {
        this.closeModal('createListingModal');
        // Reset form
        const form = document.getElementById('createListingForm');
        if (form) form.reset();
    }

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

    // Form handling
    handleCreateListing(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const listingData = Object.fromEntries(formData.entries());
        
        // Add additional fields
        listingData.id = `listing-${Date.now()}`;
        listingData.sellerId = this.user.uid;
        listingData.sellerName = this.user.displayName || this.user.email;
        listingData.status = 'pending';
        listingData.createdAt = new Date();
        listingData.viewCount = 0;
        listingData.startingBid = parseInt(listingData.startingBid) || 0;
        // Set currentBid equal to startingBid for backward compatibility (platform uses reservations, not bidding)
        listingData.currentBid = listingData.startingBid;

        // In a real app, this would save to Firebase
        console.log('Creating listing:', listingData);
        
        this.showMessage('Listing created successfully! It will be reviewed before going live.', 'success');
        this.closeCreateListingModal();
        
        // Refresh listings
        this.loadListings();
        this.renderListings();
    }

    handleImageUpload(e) {
        const files = Array.from(e.target.files);
        const uploadedImages = document.getElementById('uploadedImages');
        
        files.forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const imageDiv = document.createElement('div');
                    imageDiv.className = 'uploaded-image';
                    imageDiv.innerHTML = `
                        <img src="${e.target.result}" alt="Uploaded image">
                        <button type="button" class="remove-image" onclick="this.parentElement.remove()">×</button>
                    `;
                    uploadedImages.appendChild(imageDiv);
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Reservation management
    confirmReservation(reservationId) {
        const reservation = this.reservations.find(r => r.id === reservationId);
        if (reservation) {
            reservation.status = 'confirmed';
            this.showMessage(`Reservation from ${reservation.userName} confirmed!`, 'success');
            this.renderReservations();
        }
    }

    cancelReservation(reservationId) {
        const reservation = this.reservations.find(r => r.id === reservationId);
        if (reservation) {
            reservation.status = 'cancelled';
            this.showMessage(`Reservation from ${reservation.userName} cancelled.`, 'info');
            this.renderReservations();
        }
    }

    // Filtering and sorting
    filterListings() {
        const statusFilter = document.getElementById('listingStatusFilter');
        if (!statusFilter) return;

        const selectedStatus = statusFilter.value;
        let filteredListings = this.listings;

        if (selectedStatus) {
            filteredListings = this.listings.filter(listing => listing.status === selectedStatus);
        }

        this.renderFilteredListings(filteredListings);
    }

    filterReservations() {
        const statusFilter = document.getElementById('reservationStatusFilter') || document.getElementById('bidStatusFilter');
        if (!statusFilter) return;

        const selectedStatus = statusFilter.value;
        let filteredReservations = this.reservations;

        if (selectedStatus) {
            filteredReservations = this.reservations.filter(reservation => reservation.status === selectedStatus);
        }

        this.renderFilteredReservations(filteredReservations);
    }

    sortReservations() {
        const sortFilter = document.getElementById('reservationSortFilter') || document.getElementById('bidSortFilter');
        if (!sortFilter) return;

        const sortBy = sortFilter.value;
        let sortedReservations = [...this.reservations];

        sortedReservations.sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.timestamp) - new Date(a.timestamp);
                case 'oldest':
                    return new Date(a.timestamp) - new Date(b.timestamp);
                default:
                    return 0;
            }
        });

        this.renderFilteredReservations(sortedReservations);
    }

    renderFilteredListings(listings) {
        const listingsGrid = document.getElementById('listingsGrid');
        if (!listingsGrid) return;

        if (listings.length === 0) {
            listingsGrid.innerHTML = `
                <div class="empty-state">
                    <h3>No Listings Found</h3>
                    <p>No listings match your current filters.</p>
                </div>
            `;
            return;
        }

        listingsGrid.innerHTML = listings.map(listing => this.createListingItem(listing)).join('');
    }

    renderFilteredReservations(reservations) {
        const reservationsList = document.getElementById('reservationsList') || document.getElementById('bidsList');
        if (!reservationsList) return;

        if (reservations.length === 0) {
            reservationsList.innerHTML = `
                <div class="empty-state">
                    <h3>No Reservations Found</h3>
                    <p>No reservations match your current filters.</p>
                </div>
            `;
            return;
        }

        reservationsList.innerHTML = reservations.map(reservation => this.createReservationItem(reservation)).join('');
    }

    filterTransactions() {
        const statusFilter = document.getElementById('transactionStatusFilter');
        if (!statusFilter) return;

        const selectedStatus = statusFilter.value;
        let filteredTransactions = this.transactions;

        if (selectedStatus) {
            filteredTransactions = this.transactions.filter(transaction => transaction.status === selectedStatus);
        }

        this.renderFilteredTransactions(filteredTransactions);
    }

    renderFilteredTransactions(transactions) {
        const transactionsList = document.getElementById('transactionsList');
        if (!transactionsList) return;

        if (transactions.length === 0) {
            transactionsList.innerHTML = `
                <div class="empty-state">
                    <h3>No Transactions Found</h3>
                    <p>No transactions match your current filters.</p>
                </div>
            `;
            return;
        }

        transactionsList.innerHTML = transactions.map(transaction => this.createTransactionItem(transaction)).join('');
    }

    // Utility methods
    getTimeRemaining(endDate) {
        const now = new Date();
        const diff = endDate - now;
        
        if (diff <= 0) return 'Ended';
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        if (days > 0) return `${days}d ${hours}h`;
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    }

    formatTime(date) {
        const now = new Date();
        const diff = now - date;
        
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        return 'Just now';
    }

    showMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `seller-message ${type}`;
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
        } else if (type === 'info') {
            messageDiv.style.background = '#eff6ff';
            messageDiv.style.border = '1px solid #dbeafe';
            messageDiv.style.color = '#1e40af';
        }
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }

    // Placeholder methods for future implementation
    viewAssetDetails(assetId) {
        const asset = this.listings.find(a => a.id === assetId);
        if (!asset) return;

        const modal = document.getElementById('assetDetailsModal');
        const title = document.getElementById('assetDetailsTitle');
        const content = document.getElementById('assetDetailsContent');

        if (title) title.textContent = asset.title;
        
        if (content) {
            content.innerHTML = `
                <div class="asset-gallery">
                    <div class="asset-main-image">
                        <img src="${asset.images[0]}" alt="${asset.title}" id="mainAssetImage">
                    </div>
                    <div class="asset-thumbnails">
                        ${asset.images.map((img, index) => `
                            <div class="asset-thumbnail ${index === 0 ? 'active' : ''}" onclick="sellerHandler.changeAssetImage('${img}')">
                                <img src="${img}" alt="${asset.title}">
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="asset-info">
                    <h4>${asset.title}</h4>
                    <div class="asset-details">
                        <h5>Asset Details</h5>
                        <p><strong>Category:</strong> ${asset.category}</p>
                        <p><strong>Location:</strong> ${asset.location}</p>
                        <p><strong>Condition:</strong> ${asset.condition}</p>
                        <p><strong>Starting Price:</strong> BWP ${(asset.startingBid || asset.currentBid || 0).toLocaleString()}</p>
                        <p><strong>Start Date:</strong> ${asset.startDate ? new Date(asset.startDate).toLocaleString() : 'N/A'}</p>
                        <p><strong>End Date:</strong> ${new Date(asset.endDate).toLocaleString()}</p>
                        <p><strong>View Count:</strong> ${asset.viewCount || 0}</p>
                        <p>${asset.description}</p>
                    </div>
                    
                    <div class="asset-actions" style="margin-top: 2rem; padding-top: 2rem; border-top: 1px solid #e2e8f0;">
                        <div class="action-buttons" style="display: flex; gap: 1rem;">
                            <button class="btn btn-primary" onclick="sellerHandler.manageBids('${assetId}')">
                                Manage Bids
                            </button>
                            <button class="btn btn-secondary" onclick="sellerHandler.editListing('${assetId}')">
                                Edit Listing
                            </button>
                            <button class="btn btn-secondary" onclick="sellerHandler.viewReservations('${assetId}')">
                                View Reservations
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }

        this.showModal('assetDetailsModal');
    }

    changeAssetImage(imageSrc) {
        const mainImage = document.getElementById('mainAssetImage');
        if (mainImage) {
            mainImage.src = imageSrc;
        }

        // Update active thumbnail
        document.querySelectorAll('.asset-thumbnail').forEach(thumb => {
            thumb.classList.remove('active');
        });
        event.target.closest('.asset-thumbnail').classList.add('active');
    }

    viewReservations(assetId) {
        // Switch to reservations tab and filter by asset
        this.switchTab('reservations');
    }

    viewListingDetails(listingId) {
        this.showMessage('Listing details view will be implemented', 'info');
    }

    manageReservations(listingId) {
        this.switchTab('reservations');
        // Filter reservations for this listing if needed
    }

    editListing(listingId) {
        this.showMessage('Listing edit functionality will be implemented', 'info');
    }

    viewReservationDetails(reservationId) {
        const reservation = this.reservations.find(r => r.id === reservationId);
        if (!reservation) {
            this.showMessage('Reservation not found', 'error');
            return;
        }

        const modal = document.getElementById('bidderDetailsModal') || document.getElementById('reservationDetailsModal');
        const content = document.getElementById('bidderDetailsContent') || document.getElementById('reservationDetailsContent');
        
        if (!modal || !content) {
            // If modal doesn't exist, create it dynamically or show alert
            const contactInfo = `
                User: ${reservation.userName}
                Email: ${reservation.userEmail}
                Phone: ${reservation.userPhone || 'Not provided'}
                Notes: ${reservation.notes || 'None'}
            `;
            alert(`Reservation Information:\n\n${contactInfo}`);
            return;
        }

        const listing = reservation.listing || reservation.asset;
        content.innerHTML = `
            <div class="reservation-contact-info">
                <div class="reservation-header">
                    <div class="reservation-avatar">
                        <span class="avatar-text">${reservation.userName.charAt(0).toUpperCase()}</span>
                    </div>
                    <div class="reservation-name-section">
                        <h3>${reservation.userName}</h3>
                        <p class="reservation-listing">Reserved: ${listing ? listing.title : 'Unknown Listing'}</p>
                    </div>
                </div>

                <div class="reservation-contact-details">
                    <h4>Contact Information</h4>
                    
                    <div class="contact-item">
                        <div class="contact-icon">📧</div>
                        <div class="contact-info">
                            <label>Email</label>
                            <a href="mailto:${reservation.userEmail}" class="contact-value">${reservation.userEmail}</a>
                        </div>
                    </div>

                    <div class="contact-item">
                        <div class="contact-icon">📱</div>
                        <div class="contact-info">
                            <label>Phone Number</label>
                            <a href="tel:${reservation.userPhone}" class="contact-value phone-number">${reservation.userPhone || 'Not provided'}</a>
                        </div>
                    </div>

                    ${reservation.notes ? `
                    <div class="contact-item">
                        <div class="contact-icon">📝</div>
                        <div class="contact-info">
                            <label>Notes</label>
                            <span class="contact-value">${reservation.notes}</span>
                        </div>
                    </div>
                    ` : ''}

                    <div class="contact-item">
                        <div class="contact-icon">📅</div>
                        <div class="contact-info">
                            <label>Reservation Date</label>
                            <span class="contact-value">${reservation.timestamp.toLocaleString()}</span>
                        </div>
                    </div>

                    <div class="contact-item">
                        <div class="contact-icon">📊</div>
                        <div class="contact-info">
                            <label>Status</label>
                            <span class="contact-value">
                                <span class="status-badge ${reservation.status}">${reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}</span>
                            </span>
                        </div>
                    </div>
                </div>

                <div class="reservation-actions">
                    <a href="tel:${reservation.userPhone}" class="btn btn-primary" style="display: inline-flex; align-items: center; gap: 0.5rem;">
                        <span>📞</span> Call Now
                    </a>
                    <a href="mailto:${reservation.userEmail}" class="btn btn-secondary" style="display: inline-flex; align-items: center; gap: 0.5rem;">
                        <span>📧</span> Send Email
                    </a>
                    <button class="btn btn-secondary" onclick="navigator.clipboard.writeText('${reservation.userPhone}').then(() => sellerHandler.showMessage('Phone number copied to clipboard!', 'success'))">
                        Copy Phone
                    </button>
                </div>
            </div>
        `;

        this.showModal(modal.id);
    }

    viewTransactionDetails(transactionId) {
        this.showMessage('Transaction details view will be implemented', 'info');
    }

    downloadReceipt(transactionId) {
        this.showMessage('Receipt download functionality will be implemented', 'info');
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

// Initialize Seller Dashboard Handler when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Always initialize - works in both demo mode and Firebase mode
    window.sellerHandler = new SellerDashboardHandler();
});

// Export for use in other files
window.SellerDashboardHandler = SellerDashboardHandler;
