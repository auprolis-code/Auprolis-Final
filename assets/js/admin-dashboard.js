// Admin Dashboard Handler
class AdminDashboardHandler {
    constructor() {
        // DEMO MODE: Use demo authentication if available
        this.auth = typeof demoAuth !== 'undefined' ? demoAuth : 
                    (typeof firebase !== 'undefined' && firebase.auth ? firebase.auth() : null);
        this.db = typeof demoFirestore !== 'undefined' ? demoFirestore : 
                  (typeof firebase !== 'undefined' && firebase.firestore ? firebase.firestore() : null);
        this.realtimeDb = typeof realtimeDbService !== 'undefined' ? realtimeDbService : null;
        this.user = null;
        this.userData = null;
        this.listings = [];
        this.users = [];
        this.transactions = [];
        this.realtimeListeners = []; // Store real-time listener unsubscribe functions
        
        this.init();
    }

    init() {
        // Check authentication state
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

        // Tab switching
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.getAttribute('data-tab');
                this.switchTab(tab);
            });
        });

        // Create listing chat handler will be initialized when modal opens
        this.listingChatHandler = null;
        
        // Also bind create listing button directly
        const createListingBtn = document.getElementById('createListingBtn');
        if (createListingBtn) {
            createListingBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openCreateListingModal();
            });
        }

        // Modal close buttons
        const createListingModalClose = document.getElementById('createListingModalClose');
        if (createListingModalClose) {
            createListingModalClose.addEventListener('click', () => this.closeCreateListingModal());
        }

        // Close modals on backdrop click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target.id);
            }
        });

        // Quick action buttons
        const verifyUsersBtn = document.getElementById('verifyUsersBtn');
        const approveListingsBtn = document.getElementById('approveListingsBtn');
        const generateReportBtn = document.getElementById('generateReportBtn');
        const systemMaintenanceBtn = document.getElementById('systemMaintenanceBtn');

        if (verifyUsersBtn) {
            verifyUsersBtn.addEventListener('click', () => this.verifyPendingUsers());
        }
        if (approveListingsBtn) {
            approveListingsBtn.addEventListener('click', () => this.approvePendingListings());
        }
        if (generateReportBtn) {
            generateReportBtn.addEventListener('click', () => this.generateReport());
        }
        if (systemMaintenanceBtn) {
            systemMaintenanceBtn.addEventListener('click', () => this.systemMaintenance());
        }

        // User form
        const userForm = document.getElementById('userForm');
        if (userForm) {
            userForm.addEventListener('submit', (e) => this.handleCreateUser(e));
        }

        // Settings forms
        const platformSettingsForm = document.getElementById('platformSettingsForm');
        const emailSettingsForm = document.getElementById('emailSettingsForm');
        const securitySettingsForm = document.getElementById('securitySettingsForm');

        if (platformSettingsForm) {
            platformSettingsForm.addEventListener('submit', (e) => this.handlePlatformSettings(e));
        }
        if (emailSettingsForm) {
            emailSettingsForm.addEventListener('submit', (e) => this.handleEmailSettings(e));
        }
        if (securitySettingsForm) {
            securitySettingsForm.addEventListener('submit', (e) => this.handleSecuritySettings(e));
        }

        // User modal close
        const userModalClose = document.getElementById('userModalClose');
        if (userModalClose) {
            userModalClose.addEventListener('click', () => this.closeUserModal());
        }

        // System logs modal close
        const systemLogsModalClose = document.getElementById('systemLogsModalClose');
        if (systemLogsModalClose) {
            systemLogsModalClose.addEventListener('click', () => this.closeModal('systemLogsModal'));
        }
    }

    async loadUserData() {
        try {
            // First, check if user data is already in the user object (from localStorage or Firebase)
            if (this.user && (this.user.userType || this.user.email)) {
                // Use user data directly if available (demo mode or Firebase user with data)
                this.userData = this.user;
                console.log('Using user data from auth object:', this.user.email);
                
                // Check if user is admin (auprolis@gmail.com)
                const userEmail = (this.userData.email || '').toLowerCase();
                if (userEmail === 'auprolis@gmail.com') {
                    this.userData.userType = 'admin';
                    console.log('✓ Admin user confirmed');
                } else if (this.userData.userType && this.userData.userType !== 'admin') {
                    alert('Only admins can access this dashboard.');
                    window.location.href = 'login.html';
                    return;
                }
                
                this.updateUI();
                return;
            }

            // Try to get user data from Firestore if available
            if (this.db && this.db.collection && this.user && this.user.uid) {
                try {
                    const userDoc = await this.db.collection('users').doc(this.user.uid).get();
                    
                    if (userDoc.exists) {
                        this.userData = userDoc.data();
                        console.log('Loaded user data from Firestore:', this.userData.email);
                        
                        // Check if user is admin (auprolis@gmail.com)
                        const userEmail = (this.userData.email || '').toLowerCase();
                        if (userEmail === 'auprolis@gmail.com') {
                            this.userData.userType = 'admin';
                            console.log('✓ Admin user confirmed');
                        } else if (this.userData.userType !== 'admin') {
                            alert('Only admins can access this dashboard.');
                            window.location.href = 'login.html';
                            return;
                        }
                        
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
                        
                        // Check if user is admin (auprolis@gmail.com)
                        const userEmail = (this.userData.email || '').toLowerCase();
                        if (userEmail === 'auprolis@gmail.com') {
                            this.userData.userType = 'admin';
                            console.log('✓ Admin user confirmed');
                        } else if (this.userData.userType && this.userData.userType !== 'admin') {
                            alert('Only admins can access this dashboard.');
                            window.location.href = 'login.html';
                            return;
                        }
                        
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
                    
                    // Check admin role if userType is available
                    if (this.userData.userType && this.userData.userType !== 'admin') {
                        alert('Only admins can access this dashboard.');
                        window.location.href = 'login.html';
                        return;
                    }
                    
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
            userInfo.textContent = `Welcome, ${this.user.displayName || this.user.email || 'Admin'}!`;
        }

        // Update dashboard stats
        this.updateDashboardStats();
        
        // Load overview content
        this.loadRecentActivity();
        this.loadSystemAlerts();
    }

    async loadDashboardData() {
        // Load listings
        await this.loadListings();
        
        // Load users
        await this.loadUsers();
        
        // Load transactions
        await this.loadTransactions();
        
        // Update all dashboard components after data is loaded
        this.updateDashboardStats();
        this.loadRecentActivity();
        this.loadSystemAlerts();
        
        // Set up periodic refresh (every 30 seconds)
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        this.refreshInterval = setInterval(() => {
            this.updateDashboardStats();
            this.loadRecentActivity();
            this.loadSystemAlerts();
        }, 30000); // Refresh every 30 seconds
    }

    async loadListings() {
        // Try to load from Google Sheets first
        if (typeof googleSheetsService !== 'undefined') {
            try {
                const sheetListings = await googleSheetsService.readListings();
                if (sheetListings && sheetListings.length > 0) {
                    this.listings = sheetListings;
                    console.log(`Loaded ${this.listings.length} listings from Google Sheets`);
                    
                    // Start real-time polling for admin dashboard
                    googleSheetsService.startListingsPolling((listings) => {
                        console.log('📥 Admin: Received updated listings:', listings.length);
                        this.listings = listings;
                        this.renderListings();
                        this.updateDashboardStats();
                        this.loadRecentActivity();
                        this.loadSystemAlerts();
                    });
                    
                    // Also set up Firebase Realtime Database listeners for instant updates
                    this.setupRealtimeListeners();
                    return;
                }
            } catch (error) {
                console.warn('Could not load listings from Google Sheets, falling back to local data:', error);
            }
        }
        
        // Load from Firebase Realtime Database if available
        if (this.realtimeDb && this.realtimeDb.db) {
            try {
                const assets = await this.realtimeDb.getAllAssets();
                if (assets && assets.length > 0) {
                    // Convert assets to listings format
                    this.listings = assets.map(asset => ({
                        ...asset,
                        id: asset.assetId || asset.id || `asset-${Date.now()}`,
                        status: asset.status || 'active'
                    }));
                    console.log(`Loaded ${this.listings.length} listings from Realtime Database`);
                    
                    // Set up real-time listeners
                    this.setupRealtimeListeners();
                    return;
                }
            } catch (error) {
                console.warn('Could not load listings from Realtime Database:', error);
            }
        }
        
        // Fallback to demo data or Firebase Firestore
        if (typeof DEMO_ASSETS !== 'undefined') {
            this.listings = DEMO_ASSETS.map(asset => ({
                ...asset,
                status: asset.status || 'active'
            }));
        } else if (this.db && this.db.collection) {
            try {
                const snapshot = await this.db.collection('listings').get();
                this.listings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                
                // Set up Firestore real-time listener
                this.setupFirestoreListeners();
            } catch (error) {
                console.error('Error loading listings:', error);
                this.listings = [];
            }
        }
        
        // Set up real-time listeners if not already done
        if (!this.realtimeListeners.length) {
            this.setupRealtimeListeners();
        }
    }
    
    setupRealtimeListeners() {
        // Clean up existing listeners
        this.cleanupRealtimeListeners();
        
        // Set up Firebase Realtime Database listeners for instant updates
        if (this.realtimeDb && this.realtimeDb.db) {
            console.log('🔴 Setting up real-time listeners for listings...');
            console.log('📊 Realtime Database status:', {
                serviceAvailable: !!this.realtimeDb,
                dbAvailable: !!this.realtimeDb.db,
                dbType: typeof this.realtimeDb.db
            });
            
            // Listen for new listings
            const unsubscribeNew = this.realtimeDb.onChildAdded('assets', (asset, key) => {
                console.log('✨ New listing detected in real-time:', asset.title || key);
                
                // Check if listing already exists
                const existingIndex = this.listings.findIndex(l => 
                    (l.id === key) || (l.assetId === key) || (l.id === asset.id) || (l.assetId === asset.assetId)
                );
                
                const listingData = {
                    ...asset,
                    id: asset.assetId || asset.id || key,
                    assetId: asset.assetId || key
                };
                
                if (existingIndex >= 0) {
                    // Update existing listing
                    this.listings[existingIndex] = listingData;
                } else {
                    // Add new listing
                    this.listings.unshift(listingData); // Add to beginning
                }
                
                // Update UI immediately
                this.renderListings();
                this.updateDashboardStats();
                this.loadRecentActivity();
                this.loadSystemAlerts();
                
                // Show notification
                this.showMessage(`New listing added: ${listingData.title || 'Untitled'}`, 'success');
            });
            
            // Listen for updated listings
            const unsubscribeUpdated = this.realtimeDb.onChildChanged('assets', (asset, key) => {
                console.log('🔄 Listing updated in real-time:', asset.title || key);
                
                const existingIndex = this.listings.findIndex(l => 
                    (l.id === key) || (l.assetId === key) || (l.id === asset.id) || (l.assetId === asset.assetId)
                );
                
                if (existingIndex >= 0) {
                    this.listings[existingIndex] = {
                        ...this.listings[existingIndex],
                        ...asset,
                        id: asset.assetId || asset.id || key,
                        assetId: asset.assetId || key
                    };
                    
                    // Update UI immediately
                    this.renderListings();
                    this.updateDashboardStats();
                    this.loadRecentActivity();
                }
            });
            
            // Store unsubscribe functions
            this.realtimeListeners.push(unsubscribeNew, unsubscribeUpdated);
            console.log('✅ Real-time listeners active');
        }
    }
    
    setupFirestoreListeners() {
        // Set up Firestore real-time listeners as fallback
        if (this.db && this.db.collection) {
            try {
                // Listen for new listings
                this.db.collection('listings')
                    .orderBy('createdAt', 'desc')
                    .limit(50)
                    .onSnapshot((snapshot) => {
                        snapshot.docChanges().forEach((change) => {
                            if (change.type === 'added') {
                                const listingData = { id: change.doc.id, ...change.doc.data() };
                                
                                // Check if already exists
                                const exists = this.listings.some(l => l.id === listingData.id);
                                if (!exists) {
                                    this.listings.unshift(listingData);
                                    this.renderListings();
                                    this.updateDashboardStats();
                                    this.loadRecentActivity();
                                    this.showMessage(`New listing added: ${listingData.title || 'Untitled'}`, 'success');
                                }
                            } else if (change.type === 'modified') {
                                const listingData = { id: change.doc.id, ...change.doc.data() };
                                const index = this.listings.findIndex(l => l.id === listingData.id);
                                if (index >= 0) {
                                    this.listings[index] = listingData;
                                    this.renderListings();
                                    this.updateDashboardStats();
                                }
                            }
                        });
                    });
            } catch (error) {
                console.warn('Error setting up Firestore listeners:', error);
            }
        }
    }
    
    cleanupRealtimeListeners() {
        // Unsubscribe from all real-time listeners
        this.realtimeListeners.forEach(unsubscribe => {
            if (typeof unsubscribe === 'function') {
                unsubscribe();
            }
        });
        this.realtimeListeners = [];
    }

    async loadUsers() {
        // Try to load from Google Sheets first
        if (typeof googleSheetsService !== 'undefined') {
            try {
                const sheetUsers = await googleSheetsService.readSheetData();
                if (sheetUsers && sheetUsers.length > 0) {
                    // Convert sheet users to local format
                    this.users = sheetUsers.map((user, index) => ({
                        id: `user-${index}`,
                        uid: `user-${index}`,
                        email: user.email,
                        displayName: `${user.firstName} ${user.lastName}`.trim(),
                        firstName: user.firstName,
                        lastName: user.lastName,
                        userType: user.userType || 'buyer', // userType is added by readSheetData when combining tabs
                        status: user.status || 'active',
                        verified: user.verified !== false, // Default to verified unless explicitly false
                        phone: user.phone || '',
                        createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
                        joinDate: user.joinDate ? new Date(user.joinDate) : new Date()
                    }));
                    console.log(`Loaded ${this.users.length} users from Google Sheets`);
                    return;
                }
            } catch (error) {
                console.warn('Could not load users from Google Sheets, falling back to local data:', error);
            }
        }
        
        // Fallback to demo data or Firebase
        if (typeof DEMO_USERS !== 'undefined') {
            this.users = DEMO_USERS;
        } else if (this.db && this.db.collection) {
            try {
                const snapshot = await this.db.collection('users').get();
                this.users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            } catch (error) {
                console.error('Error loading users:', error);
                this.users = [];
            }
        }
    }

    async loadTransactions() {
        // Load from demo data or Firebase
        if (typeof DEMO_TRANSACTIONS !== 'undefined') {
            this.transactions = DEMO_TRANSACTIONS;
        } else if (this.db && this.db.collection) {
            try {
                const snapshot = await this.db.collection('transactions').get();
                this.transactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            } catch (error) {
                console.error('Error loading transactions:', error);
                this.transactions = [];
            }
        }
    }

    updateDashboardStats() {
        // Update total users count
        const totalUsersCount = document.getElementById('totalUsersCount');
        if (totalUsersCount) {
            totalUsersCount.textContent = this.users.length;
        }

        // Update active listings count
        const activeListingsCount = document.getElementById('activeListingsCount');
        if (activeListingsCount) {
            activeListingsCount.textContent = this.listings.filter(l => l.status === 'active').length;
        }

        // Update total revenue
        const totalRevenueCount = document.getElementById('totalRevenueCount');
        if (totalRevenueCount) {
            const totalRevenue = this.transactions
                .filter(t => t.status === 'completed')
                .reduce((sum, t) => sum + (t.amount || 0), 0);
            totalRevenueCount.textContent = `BWP ${totalRevenue.toLocaleString()}`;
        }

        // Update completed auctions
        const completedAuctionsCount = document.getElementById('completedAuctionsCount');
        if (completedAuctionsCount) {
            completedAuctionsCount.textContent = this.listings.filter(l => l.status === 'ended' || l.status === 'completed').length;
        }

        // Update pending approvals
        const pendingApprovalsCount = document.getElementById('pendingApprovalsCount');
        if (pendingApprovalsCount) {
            const pendingListings = this.listings.filter(l => l.status === 'pending').length;
            const pendingUsers = this.users.filter(u => u.status === 'pending' || !u.verified).length;
            pendingApprovalsCount.textContent = pendingListings + pendingUsers;
        }

        // Update platform health
        const platformHealthCount = document.getElementById('platformHealthCount');
        if (platformHealthCount) {
            const health = this.calculatePlatformHealth();
            platformHealthCount.textContent = `${health}%`;
        }
    }

    calculatePlatformHealth() {
        // Calculate platform health based on various factors
        let healthScore = 100;
        
        // Check for critical issues
        const totalListings = this.listings.length;
        const activeListings = this.listings.filter(l => l.status === 'active').length;
        const pendingListings = this.listings.filter(l => l.status === 'pending').length;
        const totalUsers = this.users.length;
        const activeUsers = this.users.filter(u => u.status !== 'suspended').length;
        
        // Deduct points for issues
        if (totalListings === 0) {
            healthScore -= 20; // No listings is a problem
        } else if (activeListings === 0 && pendingListings > 0) {
            healthScore -= 15; // All listings pending
        }
        
        if (totalUsers === 0) {
            healthScore -= 10; // No users
        } else if (activeUsers / totalUsers < 0.5) {
            healthScore -= 10; // Too many suspended users
        }
        
        // Check for system errors (if we had error tracking)
        // For now, assume system is healthy if we have data
        
        return Math.max(0, Math.min(100, healthScore));
    }

    switchTab(tabName) {
        // Hide all tabs
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });

        // Remove active class from all tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Show selected tab
        const selectedTab = document.getElementById(tabName);
        if (selectedTab) {
            selectedTab.classList.add('active');
        }

        // Add active class to selected button
        const selectedBtn = document.querySelector(`[data-tab="${tabName}"]`);
        if (selectedBtn) {
            selectedBtn.classList.add('active');
        }

        // Load tab-specific data
        if (tabName === 'listings') {
            this.renderListings();
            this.setupListingFilters();
        } else if (tabName === 'users') {
            this.renderUsers();
            this.setupUserFilters();
        } else if (tabName === 'transactions') {
            this.renderTransactions();
            this.setupTransactionFilters();
        } else if (tabName === 'analytics') {
            this.loadAnalytics();
        } else if (tabName === 'overview') {
            this.loadRecentActivity();
            this.loadSystemAlerts();
        } else if (tabName === 'settings') {
            this.setupSettingsForms();
        }
    }

    renderListings() {
        const listingsGrid = document.getElementById('listingsGrid');
        if (!listingsGrid) return;

        if (this.listings.length === 0) {
            listingsGrid.innerHTML = '<div class="empty-state"><h3>No Listings Found</h3><p>Create your first listing to get started.</p></div>';
            return;
        }

        listingsGrid.innerHTML = this.listings.map(listing => `
            <div class="listing-card">
                <div class="listing-image">
                    <img src="${listing.images && listing.images[0] ? listing.images[0] : 'assets/images/placeholder.txt'}" alt="${listing.title}">
                </div>
                <div class="listing-content">
                    <h4>${listing.title}</h4>
                    <p class="listing-location">${listing.location}</p>
                    <p class="listing-price">BWP ${(listing.startingBid || listing.currentBid || 0).toLocaleString()}</p>
                    <div class="listing-status ${listing.status}">${listing.status}</div>
                    <div class="listing-actions">
                        <button class="btn btn-secondary" onclick="adminHandler.viewListing('${listing.id}')">View</button>
                        <button class="btn btn-primary" onclick="adminHandler.approveListing('${listing.id}')">Approve</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderUsers() {
        const usersTableBody = document.getElementById('usersTableBody');
        if (!usersTableBody) return;

        if (this.users.length === 0) {
            usersTableBody.innerHTML = '<tr><td colspan="6">No users found</td></tr>';
            return;
        }

        usersTableBody.innerHTML = this.users.map(user => `
            <tr>
                <td>${user.displayName || user.email || 'N/A'}</td>
                <td>${user.userType || 'buyer'}</td>
                <td><span class="status-badge ${user.status || 'active'}">${user.status || 'active'}</span></td>
                <td>${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</td>
                <td>Active</td>
                <td>
                    <button class="btn btn-secondary" onclick="adminHandler.viewUser('${user.id || user.uid}')">View</button>
                </td>
            </tr>
        `).join('');
    }

    renderTransactions() {
        const transactionsList = document.getElementById('transactionsList');
        if (!transactionsList) return;

        if (this.transactions.length === 0) {
            transactionsList.innerHTML = '<div class="empty-state"><h3>No Transactions Found</h3></div>';
            return;
        }

        transactionsList.innerHTML = this.transactions.map(transaction => `
            <div class="transaction-item">
                <div class="transaction-header">
                    <h4>${transaction.listingTitle || 'Transaction'}</h4>
                    <span class="transaction-status ${transaction.status || 'pending'}">${transaction.status || 'pending'}</span>
                </div>
                <div class="transaction-details">
                    <p>Amount: BWP ${(transaction.amount || 0).toLocaleString()}</p>
                    <p>Date: ${transaction.date ? new Date(transaction.date).toLocaleDateString() : 'N/A'}</p>
                </div>
            </div>
        `).join('');
    }

    setupImageUpload() {
        // Setup image upload handlers
        const imageUpload = document.getElementById('imageUpload');
        const imageUploadArea = document.getElementById('imageUploadArea');
        
        if (imageUpload && imageUploadArea) {
            // Make upload area clickable
            imageUploadArea.style.cursor = 'pointer';
            
            // Remove old listeners by cloning (to avoid duplicates)
            const uploadPlaceholder = imageUploadArea.querySelector('.upload-placeholder');
            if (uploadPlaceholder) {
                uploadPlaceholder.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    imageUpload.click();
                };
            }
            
            // Setup file change handler
            imageUpload.onchange = (e) => this.handleImageUpload(e);
        }
    }

    // Create Listing functionality - Chat Interface
    openCreateListingModal() {
        console.log('Opening create listing chat interface...');
        const modal = document.getElementById('createListingModal');
        if (!modal) {
            console.error('Modal not found!');
            alert('Create listing modal not found. Please refresh the page.');
            return;
        }
        
        // Initialize chat handler
        if (!this.listingChatHandler) {
            this.listingChatHandler = new ListingChatHandler(this);
            // Make it globally accessible for onclick handlers (will also be set in start() method)
            window.listingChatHandler = this.listingChatHandler;
            console.log('Chat handler created and set to window');
        } else {
            // Re-set to window in case it was cleared
            window.listingChatHandler = this.listingChatHandler;
            console.log('Chat handler re-set to window');
        }
        
        this.showModal('createListingModal');
        
        // Start the chat flow
        setTimeout(() => {
            if (this.listingChatHandler) {
                this.listingChatHandler.start();
            }
        }, 300);
    }

    closeCreateListingModal() {
        this.closeModal('createListingModal');
        // Reset chat handler
        if (this.listingChatHandler) {
            this.listingChatHandler = null;
            window.listingChatHandler = null;
        }
    }

    async handleCreateListing(e) {
        e.preventDefault();
        
        const form = e.target;
        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonText = submitButton ? submitButton.textContent : 'Create Listing';
        
        // Show loading state
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'Creating...';
        }

        try {
            // Validate form data
            const validationResult = this.validateListingForm(form);
            if (!validationResult.isValid) {
                this.showMessage(validationResult.error, 'error');
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = originalButtonText;
                }
                return;
            }

            // Get form data
            const formData = new FormData(form);
            const listingData = this.processListingFormData(formData);
            
            // Get uploaded images
            const imageUrls = this.getUploadedImages();
            listingData.images = imageUrls.length > 0 ? imageUrls : ['assets/images/placeholder.txt'];
            
            // Add metadata
            listingData.id = `asset-${Date.now()}`;
            listingData.sellerId = this.user?.uid || 'admin';
            listingData.sellerName = this.user?.displayName || this.user?.email || 'Admin';
            listingData.sellerEmail = listingData.contactInfo?.email || this.user?.email || '';
            listingData.status = 'active'; // Admin-created listings are auto-approved
            listingData.createdAt = new Date().toISOString();
            listingData.viewCount = 0;

            // Save to multiple locations
            const saveResults = await this.saveListing(listingData);
            
            // Add to local listings array
            this.listings.push(listingData);
            
            // Show success message with Google Sheets option
            let successMessage = 'Listing created successfully!';
            if (typeof googleSheetsService !== 'undefined') {
                const copySuccess = await googleSheetsService.copyListingToClipboard(listingData);
                if (copySuccess) {
                    successMessage += ' Data copied to clipboard - paste into Google Sheets Listings tab.';
                } else {
                    successMessage += ' Open Google Sheets to manually add this listing.';
                }
            }
            
            this.showMessage(successMessage, 'success');
            
            // Close modal and refresh
            this.closeCreateListingModal();
            this.renderListings();
            this.updateDashboardStats();
            this.loadRecentActivity();
            this.loadSystemAlerts();
            
            // Open Google Sheets if available
            if (typeof googleSheetsService !== 'undefined' && saveResults.googleSheetsReady) {
                setTimeout(() => {
                    if (confirm('Open Google Sheets to add this listing?')) {
                        googleSheetsService.openSheetTab('listings');
                    }
                }, 1000);
            }
            
        } catch (error) {
            console.error('Error creating listing:', error);
            this.showMessage(`Error creating listing: ${error.message}`, 'error');
        } finally {
            // Restore button state
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            }
        }
    }

    validateListingForm(form) {
        const formData = new FormData(form);
        const title = formData.get('title')?.trim();
        const category = formData.get('category')?.trim();
        const location = formData.get('location')?.trim();
        const description = formData.get('description')?.trim();
        const startingBid = formData.get('startingBid');
        const startDate = formData.get('startDate');
        const endDate = formData.get('endDate');
        const contactName = formData.get('contactName')?.trim();
        const contactEmail = formData.get('contactEmail')?.trim();
        const contactPhone = formData.get('contactPhone')?.trim();

        // Required field validation
        if (!title) {
            return { isValid: false, error: 'Asset title is required' };
        }
        if (!category) {
            return { isValid: false, error: 'Category is required' };
        }
        if (!location) {
            return { isValid: false, error: 'Location is required' };
        }
        if (!description || description.length < 10) {
            return { isValid: false, error: 'Description must be at least 10 characters' };
        }
        if (!startingBid || parseFloat(startingBid) < 0) {
            return { isValid: false, error: 'Starting bid must be a valid positive number' };
        }
        if (!startDate) {
            return { isValid: false, error: 'Auction start date is required' };
        }
        if (!endDate) {
            return { isValid: false, error: 'Auction end date is required' };
        }
        if (!contactName) {
            return { isValid: false, error: 'Contact person name is required' };
        }
        if (!contactEmail || !this.isValidEmail(contactEmail)) {
            return { isValid: false, error: 'Valid contact email is required' };
        }
        if (!contactPhone) {
            return { isValid: false, error: 'Contact phone number is required' };
        }

        // Date validation
        const start = new Date(startDate);
        const end = new Date(endDate);
        const now = new Date();
        
        if (isNaN(start.getTime())) {
            return { isValid: false, error: 'Invalid start date format' };
        }
        if (isNaN(end.getTime())) {
            return { isValid: false, error: 'Invalid end date format' };
        }
        if (end <= start) {
            return { isValid: false, error: 'End date must be after start date' };
        }
        if (start < now) {
            return { isValid: false, error: 'Start date cannot be in the past' };
        }

        return { isValid: true };
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    processListingFormData(formData) {
        const listingData = Object.fromEntries(formData.entries());
        
        // Process dates
        listingData.startDate = listingData.startDate ? new Date(listingData.startDate) : new Date();
        listingData.endDate = listingData.endDate ? new Date(listingData.endDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        
        // Process numbers
        listingData.startingBid = parseFloat(listingData.startingBid) || 0;
        listingData.currentBid = listingData.startingBid; // For backward compatibility
        
        // Process contact info
        listingData.contactInfo = {
            name: listingData.contactName,
            phone: listingData.contactPhone,
            email: listingData.contactEmail
        };

        return listingData;
    }

    getUploadedImages() {
        const uploadedImages = document.getElementById('uploadedImages');
        if (!uploadedImages) return [];
        
        const imageElements = uploadedImages.querySelectorAll('img');
        return Array.from(imageElements)
            .map(img => img.src)
            .filter(src => src && !src.includes('placeholder'));
    }

    async saveListing(listingData) {
        const results = {
            demo: false,
            firebase: false,
            realtimeDb: false,
            googleSheetsReady: false
        };

        // Save to demo data
        if (typeof DEMO_ASSETS !== 'undefined') {
            DEMO_ASSETS.push(listingData);
            if (typeof SAMPLE_ASSETS !== 'undefined') {
                SAMPLE_ASSETS.push(listingData);
            }
            results.demo = true;
        }

        // Save to Firebase Realtime Database for instant real-time updates
        if (this.realtimeDb && this.realtimeDb.db) {
            try {
                const assetId = listingData.id || listingData.assetId || `asset-${Date.now()}`;
                console.log('💾 Saving listing to Realtime Database:', { assetId, title: listingData.title });
                await this.realtimeDb.storeAsset(assetId, listingData);
                results.realtimeDb = true;
                console.log('✅ Listing saved to Realtime Database for real-time updates');
            } catch (error) {
                console.error('❌ Error saving listing to Realtime Database:', error);
                console.error('Error details:', {
                    message: error.message,
                    code: error.code,
                    stack: error.stack
                });
            }
        } else {
            console.warn('⚠️ Realtime Database not available:', {
                realtimeDbExists: !!this.realtimeDb,
                dbExists: this.realtimeDb ? !!this.realtimeDb.db : false
            });
        }

        // Save to Firebase Firestore
        if (this.db && this.db.collection) {
            try {
                await this.db.collection('listings').add(listingData);
                results.firebase = true;
            } catch (error) {
                console.error('Error saving listing to Firebase:', error);
            }
        }

        // Prepare for Google Sheets (data is copied to clipboard)
        if (typeof googleSheetsService !== 'undefined') {
            results.googleSheetsReady = true;
        }

        return results;
    }

    handleImageUpload(e) {
        const files = Array.from(e.target.files);
        const uploadedImages = document.getElementById('uploadedImages');
        if (!uploadedImages) return;
        
        files.forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const imageDiv = document.createElement('div');
                    imageDiv.className = 'uploaded-image';
                    imageDiv.style.cssText = 'position: relative; display: inline-block; margin: 10px;';
                    imageDiv.innerHTML = `
                        <img src="${event.target.result}" alt="Uploaded image" style="max-width: 150px; max-height: 150px; border-radius: 8px;">
                        <button type="button" class="remove-image" onclick="this.parentElement.remove()" style="position: absolute; top: -5px; right: -5px; background: red; color: white; border: none; border-radius: 50%; width: 25px; height: 25px; cursor: pointer;">×</button>
                    `;
                    uploadedImages.appendChild(imageDiv);
                };
                reader.readAsDataURL(file);
            }
        });
    }

    viewListing(listingId) {
        const listing = this.listings.find(l => l.id === listingId);
        if (listing) {
            alert(`Listing: ${listing.title}\nStatus: ${listing.status}\nStarting Price: BWP ${(listing.startingBid || listing.currentBid || 0).toLocaleString()}`);
        }
    }

    approveListing(listingId) {
        const listing = this.listings.find(l => l.id === listingId);
        if (listing) {
            listing.status = 'active';
            listing.approvedAt = new Date().toISOString();
            this.showMessage(`Listing "${listing.title}" approved!`, 'success');
            this.renderListings();
            this.updateDashboardStats();
            this.loadRecentActivity();
            this.loadSystemAlerts();
        }
    }

    viewUser(userId) {
        const user = this.users.find(u => (u.id === userId || u.uid === userId));
        if (user) {
            alert(`User: ${user.displayName || user.email}\nType: ${user.userType}\nStatus: ${user.status}`);
        }
    }

    showMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `admin-message ${type}`;
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
            background: ${type === 'success' ? '#f0fdf4' : type === 'info' ? '#eff6ff' : '#fef2f2'};
            border: 1px solid ${type === 'success' ? '#bbf7d0' : type === 'info' ? '#bfdbfe' : '#fecaca'};
            color: ${type === 'success' ? '#166534' : type === 'info' ? '#1e40af' : '#dc2626'};
        `;
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        } else {
            console.error(`Modal with ID "${modalId}" not found`);
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = ''; // Restore scrolling
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
    }

    // User Management
    openUserModal() {
        this.showModal('userModal');
    }

    closeUserModal() {
        this.closeModal('userModal');
        const form = document.getElementById('userForm');
        if (form) form.reset();
    }

    async handleCreateUser(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const userData = Object.fromEntries(formData.entries());
        
        // Validate sheet tab (must be buyers or sheriffs)
        const sheetTab = userData.sheetTab;
        if (sheetTab !== 'buyers' && sheetTab !== 'sheriffs') {
            this.showMessage('Please select a tab (Buyers or Sheriffs)', 'error');
            return;
        }
        
        // Determine userType from tab selection
        const userType = sheetTab === 'sheriffs' ? 'sheriff' : 'buyer';
        
        // Create user object for Google Sheets (no status or createdAt)
        const newUser = {
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email.toLowerCase(),
            phone: userData.phone || ''
        };

        // Add to local users array for display
        const localUser = {
            id: `user-${Date.now()}`,
            uid: `user-${Date.now()}`,
            email: newUser.email,
            displayName: `${newUser.firstName} ${newUser.lastName}`,
            userType: userType,
            status: 'active',
            createdAt: new Date(),
            phone: newUser.phone,
            permissions: Array.from(document.querySelectorAll('input[name="permissions"]:checked')).map(cb => cb.value)
        };

        this.users.push(localUser);
        
        // Save to demo data
        if (typeof DEMO_USERS !== 'undefined') {
            DEMO_USERS.push(localUser);
        }

        // Add to Google Sheets
        try {
            if (typeof googleSheetsService !== 'undefined') {
                // Copy data to clipboard for easy paste into Google Sheets
                const copied = await googleSheetsService.copyUserDataToClipboard(newUser, sheetTab);
                
                if (copied) {
                    // Open Google Sheets with the specific tab selected
                    googleSheetsService.openSheetTab(sheetTab);
                    this.showMessage(`User data copied to clipboard! Please paste it into the ${sheetTab} tab. The sheet has been opened in a new tab.`, 'success');
                } else {
                    // Show data and open sheet
                    googleSheetsService.openSheetTab(sheetTab);
                    this.showMessage(`Please add the user data manually to the ${sheetTab} tab. The sheet has been opened in a new tab.`, 'info');
                }
            } else {
                // Fallback: just open the sheet
                window.open('https://docs.google.com/spreadsheets/d/1lMVPGTNptVxn8NS7937FtxI9NAC5VeJKlXEPL5pTwmg/edit?usp=sharing', '_blank');
                this.showMessage('User data prepared. Please add it manually to the Google Sheet.', 'info');
            }
        } catch (error) {
            console.error('Error adding user to Google Sheets:', error);
            this.showMessage('User data prepared. Please add it manually to the Google Sheet.', 'info');
            window.open('https://docs.google.com/spreadsheets/d/1lMVPGTNptVxn8NS7937FtxI9NAC5VeJKlXEPL5pTwmg/edit?usp=sharing', '_blank');
        }

        this.closeUserModal();
        this.renderUsers();
        this.updateDashboardStats();
    }

    viewUser(userId) {
        const user = this.users.find(u => (u.id === userId || u.uid === userId));
        if (user) {
            alert(`User Details:\n\nName: ${user.displayName}\nEmail: ${user.email}\nType: ${user.userType}\nStatus: ${user.status}\nCreated: ${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}`);
        }
    }

    openGoogleSheets() {
        if (typeof googleSheetsService !== 'undefined') {
            googleSheetsService.openSheet();
        } else {
            window.open('https://docs.google.com/spreadsheets/d/1lMVPGTNptVxn8NS7937FtxI9NAC5VeJKlXEPL5pTwmg/edit?usp=sharing', '_blank');
        }
    }

    setupUserFilters() {
        const statusFilter = document.getElementById('userStatusFilter');
        const searchInput = document.getElementById('userSearch');

        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.filterUsers());
        }
        if (searchInput) {
            searchInput.addEventListener('input', () => this.filterUsers());
        }
    }

    filterUsers() {
        const statusFilter = document.getElementById('userStatusFilter');
        const searchInput = document.getElementById('userSearch');
        
        let filtered = [...this.users];
        
        if (statusFilter && statusFilter.value) {
            if (statusFilter.value === 'buyers') {
                filtered = filtered.filter(u => u.userType === 'buyer');
            } else if (statusFilter.value === 'sheriffs') {
                filtered = filtered.filter(u => u.userType === 'sheriff');
            } else {
                filtered = filtered.filter(u => u.status === statusFilter.value);
            }
        }
        
        if (searchInput && searchInput.value) {
            const searchTerm = searchInput.value.toLowerCase();
            filtered = filtered.filter(u => 
                (u.displayName && u.displayName.toLowerCase().includes(searchTerm)) ||
                (u.email && u.email.toLowerCase().includes(searchTerm))
            );
        }
        
        this.renderFilteredUsers(filtered);
    }

    renderFilteredUsers(filteredUsers) {
        const usersTableBody = document.getElementById('usersTableBody');
        if (!usersTableBody) return;

        if (filteredUsers.length === 0) {
            usersTableBody.innerHTML = '<tr><td colspan="6">No users found</td></tr>';
            return;
        }

        usersTableBody.innerHTML = filteredUsers.map(user => `
            <tr>
                <td>${user.displayName || user.email || 'N/A'}</td>
                <td>${user.userType || 'buyer'}</td>
                <td><span class="status-badge ${user.status || 'active'}">${user.status || 'active'}</span></td>
                <td>${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</td>
                <td>Active</td>
                <td>
                    <button class="btn btn-secondary" onclick="adminHandler.viewUser('${user.id || user.uid}')">View</button>
                </td>
            </tr>
        `).join('');
    }

    // Listing Management
    setupListingFilters() {
        const statusFilter = document.getElementById('listingStatusFilter');
        const categoryFilter = document.getElementById('listingCategoryFilter');
        const searchInput = document.getElementById('listingSearch');

        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.filterListings());
        }
        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => this.filterListings());
        }
        if (searchInput) {
            searchInput.addEventListener('input', () => this.filterListings());
        }
    }

    filterListings() {
        const statusFilter = document.getElementById('listingStatusFilter');
        const categoryFilter = document.getElementById('listingCategoryFilter');
        const searchInput = document.getElementById('listingSearch');
        
        let filtered = [...this.listings];
        
        if (statusFilter && statusFilter.value) {
            filtered = filtered.filter(l => l.status === statusFilter.value);
        }
        
        if (categoryFilter && categoryFilter.value) {
            filtered = filtered.filter(l => l.category === categoryFilter.value);
        }
        
        if (searchInput && searchInput.value) {
            const searchTerm = searchInput.value.toLowerCase();
            filtered = filtered.filter(l => 
                (l.title && l.title.toLowerCase().includes(searchTerm)) ||
                (l.location && l.location.toLowerCase().includes(searchTerm))
            );
        }
        
        this.renderFilteredListings(filtered);
    }

    renderFilteredListings(filteredListings) {
        const listingsGrid = document.getElementById('listingsGrid');
        if (!listingsGrid) return;

        if (filteredListings.length === 0) {
            listingsGrid.innerHTML = '<div class="empty-state"><h3>No Listings Found</h3></div>';
            return;
        }

        listingsGrid.innerHTML = filteredListings.map(listing => `
            <div class="listing-card">
                <div class="listing-image">
                    <img src="${listing.images && listing.images[0] ? listing.images[0] : 'assets/images/placeholder.txt'}" alt="${listing.title}">
                </div>
                <div class="listing-content">
                    <h4>${listing.title}</h4>
                    <p class="listing-location">${listing.location}</p>
                    <p class="listing-price">BWP ${(listing.startingBid || listing.currentBid || 0).toLocaleString()}</p>
                    <div class="listing-status ${listing.status}">${listing.status}</div>
                    <div class="listing-actions">
                        <button class="btn btn-secondary" onclick="adminHandler.viewListing('${listing.id}')">View</button>
                        ${listing.status === 'pending' ? `<button class="btn btn-primary" onclick="adminHandler.approveListing('${listing.id}')">Approve</button>` : ''}
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Transaction Management
    setupTransactionFilters() {
        const statusFilter = document.getElementById('transactionStatusFilter');
        const dateFilter = document.getElementById('transactionDateFilter');
        const searchInput = document.getElementById('transactionSearch');

        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.filterTransactions());
        }
        if (dateFilter) {
            dateFilter.addEventListener('change', () => this.filterTransactions());
        }
        if (searchInput) {
            searchInput.addEventListener('input', () => this.filterTransactions());
        }
    }

    filterTransactions() {
        const statusFilter = document.getElementById('transactionStatusFilter');
        const dateFilter = document.getElementById('transactionDateFilter');
        const searchInput = document.getElementById('transactionSearch');
        
        let filtered = [...this.transactions];
        
        if (statusFilter && statusFilter.value) {
            filtered = filtered.filter(t => t.status === statusFilter.value);
        }
        
        if (dateFilter && dateFilter.value) {
            const now = new Date();
            filtered = filtered.filter(t => {
                if (!t.date) return false;
                const tDate = new Date(t.date);
                switch (dateFilter.value) {
                    case 'today':
                        return tDate.toDateString() === now.toDateString();
                    case 'week':
                        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                        return tDate >= weekAgo;
                    case 'month':
                        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                        return tDate >= monthAgo;
                    case 'year':
                        const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                        return tDate >= yearAgo;
                    default:
                        return true;
                }
            });
        }
        
        if (searchInput && searchInput.value) {
            const searchTerm = searchInput.value.toLowerCase();
            filtered = filtered.filter(t => 
                (t.listingTitle && t.listingTitle.toLowerCase().includes(searchTerm)) ||
                (t.buyerName && t.buyerName.toLowerCase().includes(searchTerm))
            );
        }
        
        this.renderFilteredTransactions(filtered);
    }

    renderFilteredTransactions(filteredTransactions) {
        const transactionsList = document.getElementById('transactionsList');
        if (!transactionsList) return;

        if (filteredTransactions.length === 0) {
            transactionsList.innerHTML = '<div class="empty-state"><h3>No Transactions Found</h3></div>';
            return;
        }

        transactionsList.innerHTML = filteredTransactions.map(transaction => `
            <div class="transaction-item">
                <div class="transaction-header">
                    <h4>${transaction.listingTitle || 'Transaction'}</h4>
                    <span class="transaction-status ${transaction.status || 'pending'}">${transaction.status || 'pending'}</span>
                </div>
                <div class="transaction-details">
                    <p>Amount: BWP ${(transaction.amount || 0).toLocaleString()}</p>
                    <p>Date: ${transaction.date ? new Date(transaction.date).toLocaleDateString() : 'N/A'}</p>
                </div>
            </div>
        `).join('');
    }

    // Analytics
    loadAnalytics() {
        this.updateAnalyticsMetrics();
        this.renderAnalyticsCharts();
    }

    updateAnalyticsMetrics() {
        const totalUsers = this.users.length;
        const activeListings = this.listings.filter(l => l.status === 'active').length;
        const completedTransactions = this.transactions.filter(t => t.status === 'completed');
        const successRate = this.listings.length > 0 ? 
            Math.round((completedTransactions.length / this.listings.length) * 100) : 0;
        const avgSalePrice = completedTransactions.length > 0 ?
            completedTransactions.reduce((sum, t) => sum + (t.amount || 0), 0) / completedTransactions.length : 0;

        const totalUsersMetric = document.getElementById('totalUsersMetric');
        const activeListingsMetric = document.getElementById('activeListingsMetric');
        const successRateMetric = document.getElementById('successRateMetric');
        const avgSalePriceMetric = document.getElementById('avgSalePriceMetric');

        if (totalUsersMetric) totalUsersMetric.textContent = totalUsers;
        if (activeListingsMetric) activeListingsMetric.textContent = activeListings;
        if (successRateMetric) successRateMetric.textContent = `${successRate}%`;
        if (avgSalePriceMetric) avgSalePriceMetric.textContent = `BWP ${Math.round(avgSalePrice).toLocaleString()}`;
    }

    renderAnalyticsCharts() {
        // Simple text-based charts (can be enhanced with Chart.js later)
        const userGrowthChart = document.getElementById('userGrowthChart');
        const revenueChart = document.getElementById('revenueChart');
        const listingPerformanceChart = document.getElementById('listingPerformanceChart');

        if (userGrowthChart) {
            userGrowthChart.innerHTML = `
                <div style="padding: 2rem; text-align: center;">
                    <p>User Growth: ${this.users.length} total users</p>
                    <p style="color: #64748b; font-size: 0.9rem;">Chart visualization will be implemented with Chart.js</p>
                </div>
            `;
        }

        if (revenueChart) {
            const totalRevenue = this.transactions
                .filter(t => t.status === 'completed')
                .reduce((sum, t) => sum + (t.amount || 0), 0);
            revenueChart.innerHTML = `
                <div style="padding: 2rem; text-align: center;">
                    <p>Total Revenue: BWP ${totalRevenue.toLocaleString()}</p>
                    <p style="color: #64748b; font-size: 0.9rem;">Chart visualization will be implemented with Chart.js</p>
                </div>
            `;
        }

        if (listingPerformanceChart) {
            listingPerformanceChart.innerHTML = `
                <div style="padding: 2rem; text-align: center;">
                    <p>Active Listings: ${this.listings.filter(l => l.status === 'active').length}</p>
                    <p style="color: #64748b; font-size: 0.9rem;">Chart visualization will be implemented with Chart.js</p>
                </div>
            `;
        }
    }

    exportAnalytics() {
        const analyticsData = {
            totalUsers: this.users.length,
            activeListings: this.listings.filter(l => l.status === 'active').length,
            totalRevenue: this.transactions
                .filter(t => t.status === 'completed')
                .reduce((sum, t) => sum + (t.amount || 0), 0),
            exportDate: new Date().toISOString()
        };

        const dataStr = JSON.stringify(analyticsData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `analytics-${Date.now()}.json`;
        link.click();
        
        this.showMessage('Analytics data exported successfully!', 'success');
    }

    // Settings
    setupSettingsForms() {
        // Forms are already bound in bindEvents
    }

    handlePlatformSettings(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const settings = Object.fromEntries(formData.entries());
        localStorage.setItem('platformSettings', JSON.stringify(settings));
        this.showMessage('Platform settings saved successfully!', 'success');
    }

    handleEmailSettings(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const settings = Object.fromEntries(formData.entries());
        localStorage.setItem('emailSettings', JSON.stringify(settings));
        this.showMessage('Email settings saved successfully!', 'success');
    }

    handleSecuritySettings(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const settings = Object.fromEntries(formData.entries());
        localStorage.setItem('securitySettings', JSON.stringify(settings));
        this.showMessage('Security settings saved successfully!', 'success');
    }

    // Quick Actions
    verifyPendingUsers() {
        const pendingUsers = this.users.filter(u => u.status === 'pending' || !u.verified);
        if (pendingUsers.length === 0) {
            this.showMessage('No pending users to verify.', 'info');
            return;
        }
        
        pendingUsers.forEach(user => {
            user.status = 'active';
            user.verified = true;
            user.verifiedAt = new Date().toISOString();
        });
        
        this.showMessage(`${pendingUsers.length} user(s) verified successfully!`, 'success');
        this.renderUsers();
        this.updateDashboardStats();
        this.loadRecentActivity();
        this.loadSystemAlerts();
    }

    approvePendingListings() {
        const pendingListings = this.listings.filter(l => l.status === 'pending');
        if (pendingListings.length === 0) {
            this.showMessage('No pending listings to approve.', 'info');
            return;
        }
        
        pendingListings.forEach(listing => {
            listing.status = 'active';
            listing.approvedAt = new Date().toISOString();
        });
        
        this.showMessage(`${pendingListings.length} listing(s) approved successfully!`, 'success');
        this.renderListings();
        this.updateDashboardStats();
        this.loadRecentActivity();
        this.loadSystemAlerts();
    }

    generateReport() {
        // Check if jsPDF is available
        if (typeof window.jspdf === 'undefined') {
            this.showMessage('PDF library not loaded. Please refresh the page.', 'error');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Report data
        const reportData = {
            generatedAt: new Date().toISOString(),
            generatedDate: new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }),
            totalUsers: this.users.length,
            totalListings: this.listings.length,
            activeListings: this.listings.filter(l => l.status === 'active').length,
            pendingListings: this.listings.filter(l => l.status === 'pending').length,
            totalTransactions: this.transactions.length,
            totalRevenue: this.transactions
                .filter(t => t.status === 'completed')
                .reduce((sum, t) => sum + (t.amount || 0), 0)
        };

        // Set up PDF styling
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;
        let yPos = 20;

        // Header
        doc.setFontSize(20);
        doc.setFont(undefined, 'bold');
        doc.text('Auprolis Admin Report', margin, yPos);
        
        yPos += 10;
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated: ${reportData.generatedDate}`, margin, yPos);
        
        yPos += 15;

        // Statistics Section
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text('Platform Statistics', margin, yPos);
        
        yPos += 10;
        doc.setLineWidth(0.5);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 8;

        // Statistics Table
        doc.setFontSize(11);
        doc.setFont(undefined, 'normal');
        
        const stats = [
            ['Total Users', reportData.totalUsers.toString()],
            ['Total Listings', reportData.totalListings.toString()],
            ['Active Listings', reportData.activeListings.toString()],
            ['Pending Listings', reportData.pendingListings.toString()],
            ['Total Transactions', reportData.totalTransactions.toString()],
            ['Total Revenue', `BWP ${reportData.totalRevenue.toLocaleString()}`]
        ];

        stats.forEach(([label, value]) => {
            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
            }
            
            doc.setFont(undefined, 'bold');
            doc.text(label + ':', margin, yPos);
            doc.setFont(undefined, 'normal');
            doc.text(value, margin + 80, yPos);
            yPos += 8;
        });

        yPos += 10;

        // User Breakdown Section
        if (yPos > 230) {
            doc.addPage();
            yPos = 20;
        }

        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.text('User Breakdown', margin, yPos);
        
        yPos += 10;
        doc.setLineWidth(0.5);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 8;

        // Count users by type
        const userTypes = {};
        this.users.forEach(user => {
            const type = user.userType || 'unassigned';
            userTypes[type] = (userTypes[type] || 0) + 1;
        });

        doc.setFontSize(11);
        doc.setFont(undefined, 'normal');
        
        Object.entries(userTypes).forEach(([type, count]) => {
            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
            }
            
            const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);
            doc.setFont(undefined, 'bold');
            doc.text(`${typeLabel}:`, margin, yPos);
            doc.setFont(undefined, 'normal');
            doc.text(count.toString(), margin + 80, yPos);
            yPos += 8;
        });

        yPos += 10;

        // Listing Status Breakdown
        if (yPos > 230) {
            doc.addPage();
            yPos = 20;
        }

        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.text('Listing Status Breakdown', margin, yPos);
        
        yPos += 10;
        doc.setLineWidth(0.5);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 8;

        const listingStatuses = {};
        this.listings.forEach(listing => {
            const status = listing.status || 'unknown';
            listingStatuses[status] = (listingStatuses[status] || 0) + 1;
        });

        doc.setFontSize(11);
        doc.setFont(undefined, 'normal');
        
        Object.entries(listingStatuses).forEach(([status, count]) => {
            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
            }
            
            const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);
            doc.setFont(undefined, 'bold');
            doc.text(`${statusLabel}:`, margin, yPos);
            doc.setFont(undefined, 'normal');
            doc.text(count.toString(), margin + 80, yPos);
            yPos += 8;
        });

        // Footer on last page
        const pageCount = doc.internal.pages.length - 1;
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
            `Page 1 of ${pageCount} | Auprolis Admin Dashboard`,
            pageWidth / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: 'center' }
        );

        // Save the PDF
        const fileName = `admin-report-${Date.now()}.pdf`;
        doc.save(fileName);
        
        this.showMessage('PDF report generated and downloaded successfully!', 'success');
    }

    clearCache() {
        localStorage.removeItem('platformSettings');
        localStorage.removeItem('emailSettings');
        localStorage.removeItem('securitySettings');
        this.showMessage('Cache cleared successfully!', 'success');
    }

    backupDatabase() {
        const backup = {
            users: this.users,
            listings: this.listings,
            transactions: this.transactions,
            backupDate: new Date().toISOString()
        };

        const backupStr = JSON.stringify(backup, null, 2);
        const dataBlob = new Blob([backupStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `database-backup-${Date.now()}.json`;
        link.click();
        
        this.showMessage('Database backup created and downloaded successfully!', 'success');
    }

    systemMaintenance() {
        if (confirm('Are you sure you want to perform system maintenance? This may temporarily disable some features.')) {
            this.showMessage('System maintenance mode activated. Features will be restored shortly.', 'info');
        }
    }

    viewLogs() {
        const logsContent = document.getElementById('logsContent');
        if (!logsContent) return;

        const logs = [
            { timestamp: new Date(), level: 'INFO', message: 'System initialized successfully' },
            { timestamp: new Date(Date.now() - 3600000), level: 'INFO', message: 'User login: admin@demo.com' },
            { timestamp: new Date(Date.now() - 7200000), level: 'WARNING', message: 'High number of pending listings detected' },
            { timestamp: new Date(Date.now() - 10800000), level: 'INFO', message: 'New listing created: asset-001' }
        ];

        logsContent.innerHTML = logs.map(log => `
            <div class="log-entry ${log.level.toLowerCase()}">
                <span class="log-time">${log.timestamp.toLocaleString()}</span>
                <span class="log-level">[${log.level}]</span>
                <span class="log-message">${log.message}</span>
            </div>
        `).join('');

        this.showModal('systemLogsModal');
    }

    // Activity and Alerts
    loadRecentActivity() {
        const activityFeed = document.getElementById('activityFeed');
        if (!activityFeed) return;

        const activities = this.generateActivityFeed();
        
        if (activities.length === 0) {
            activityFeed.innerHTML = '<div class="empty-state"><p>No recent activity to display</p></div>';
            return;
        }

        activityFeed.innerHTML = activities.map(activity => `
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

    generateActivityFeed() {
        const activities = [];
        const now = new Date();

        // Get recent users (last 7 days)
        const recentUsers = this.users
            .filter(user => {
                if (!user.createdAt && !user.joinDate) return false;
                const userDate = user.createdAt ? new Date(user.createdAt) : new Date(user.joinDate);
                const daysDiff = (now - userDate) / (1000 * 60 * 60 * 24);
                return daysDiff <= 7;
            })
            .sort((a, b) => {
                const dateA = a.createdAt ? new Date(a.createdAt) : new Date(a.joinDate || 0);
                const dateB = b.createdAt ? new Date(b.createdAt) : new Date(b.joinDate || 0);
                return dateB - dateA;
            })
            .slice(0, 3);

        recentUsers.forEach(user => {
            const userDate = user.createdAt ? new Date(user.createdAt) : new Date(user.joinDate);
            const userType = user.userType || 'buyer';
            const typeLabel = userType.charAt(0).toUpperCase() + userType.slice(1);
            activities.push({
                icon: '👤',
                title: 'New User Registered',
                description: `A new ${typeLabel} account was created${user.email ? ` (${user.email})` : ''}`,
                time: this.getTimeAgo(userDate),
                timestamp: userDate
            });
        });

        // Get recent listings (last 7 days)
        const recentListings = this.listings
            .filter(listing => {
                if (!listing.createdAt && !listing.startDate) return false;
                const listingDate = listing.createdAt ? new Date(listing.createdAt) : new Date(listing.startDate);
                const daysDiff = (now - listingDate) / (1000 * 60 * 60 * 24);
                return daysDiff <= 7;
            })
            .sort((a, b) => {
                const dateA = a.createdAt ? new Date(a.createdAt) : new Date(a.startDate || 0);
                const dateB = b.createdAt ? new Date(b.createdAt) : new Date(b.startDate || 0);
                return dateB - dateA;
            })
            .slice(0, 3);

        recentListings.forEach(listing => {
            const listingDate = listing.createdAt ? new Date(listing.createdAt) : new Date(listing.startDate);
            if (listing.status === 'pending') {
                activities.push({
                    icon: '📋',
                    title: 'Listing Created',
                    description: `New asset listing added: ${listing.title}`,
                    time: this.getTimeAgo(listingDate),
                    timestamp: listingDate
                });
            } else if (listing.status === 'active') {
                activities.push({
                    icon: '✅',
                    title: 'Listing Approved',
                    description: `Listing approved and activated: ${listing.title}`,
                    time: this.getTimeAgo(listingDate),
                    timestamp: listingDate
                });
            }
        });

        // Get recent transactions (last 7 days)
        const recentTransactions = this.transactions
            .filter(transaction => {
                if (!transaction.createdAt && !transaction.date) return false;
                const transDate = transaction.createdAt ? new Date(transaction.createdAt) : new Date(transaction.date);
                const daysDiff = (now - transDate) / (1000 * 60 * 60 * 24);
                return daysDiff <= 7 && transaction.status === 'completed';
            })
            .sort((a, b) => {
                const dateA = a.createdAt ? new Date(a.createdAt) : new Date(a.date || 0);
                const dateB = b.createdAt ? new Date(b.createdAt) : new Date(b.date || 0);
                return dateB - dateA;
            })
            .slice(0, 2);

        recentTransactions.forEach(transaction => {
            const transDate = transaction.createdAt ? new Date(transaction.createdAt) : new Date(transaction.date);
            activities.push({
                icon: '💰',
                title: 'Transaction Completed',
                description: `Payment processed: BWP ${(transaction.amount || 0).toLocaleString()}`,
                time: this.getTimeAgo(transDate),
                timestamp: transDate
            });
        });

        // Sort all activities by timestamp (most recent first) and limit to 10
        return activities
            .sort((a, b) => (b.timestamp || new Date(0)) - (a.timestamp || new Date(0)))
            .slice(0, 10);
    }

    getTimeAgo(date) {
        if (!date) return 'Unknown';
        
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        
        return date.toLocaleDateString();
    }

    loadSystemAlerts() {
        const alertsList = document.getElementById('alertsList');
        if (!alertsList) return;

        const alerts = this.generateSystemAlerts();

        if (alerts.length === 0) {
            alertsList.innerHTML = '<div class="empty-state"><p>No alerts at this time</p></div>';
            return;
        }

        alertsList.innerHTML = alerts.map(alert => `
            <div class="alert-item ${alert.type}">
                <div class="alert-icon">${alert.icon}</div>
                <div class="alert-content">
                    <h4>${alert.title}</h4>
                    <p>${alert.description}</p>
                </div>
            </div>
        `).join('');
    }

    generateSystemAlerts() {
        const alerts = [];
        
        // Pending Approvals Alert
        const pendingListings = this.listings.filter(l => l.status === 'pending').length;
        if (pendingListings > 0) {
            alerts.push({
                icon: '⚠️',
                type: 'warning',
                title: 'Pending Approvals',
                description: `${pendingListings} listing${pendingListings > 1 ? 's' : ''} awaiting approval`,
                priority: 1
            });
        } else {
            alerts.push({
                icon: '✅',
                type: 'success',
                title: 'Pending Approvals',
                description: '0 listings awaiting approval',
                priority: 3
            });
        }

        // System Health Alert
        const platformHealth = this.calculatePlatformHealth();
        if (platformHealth >= 90) {
            alerts.push({
                icon: '📊',
                type: 'info',
                title: 'System Health',
                description: `All systems operational (${platformHealth}% health)`,
                priority: 3
            });
        } else if (platformHealth >= 70) {
            alerts.push({
                icon: '⚠️',
                type: 'warning',
                title: 'System Health',
                description: `System health at ${platformHealth}% - review recommended`,
                priority: 2
            });
        } else {
            alerts.push({
                icon: '🔴',
                type: 'error',
                title: 'System Health',
                description: `Critical: System health at ${platformHealth}% - immediate attention required`,
                priority: 1
            });
        }

        // User Activity Alert
        const pendingUsers = this.users.filter(u => u.status === 'pending' || !u.verified).length;
        if (pendingUsers > 0) {
            alerts.push({
                icon: '👥',
                type: 'warning',
                title: 'User Activity',
                description: `${pendingUsers} user${pendingUsers > 1 ? 's' : ''} pending verification`,
                priority: 2
            });
        } else {
            alerts.push({
                icon: '👥',
                type: 'info',
                title: 'User Activity',
                description: '0 users pending verification',
                priority: 3
            });
        }

        // Low Activity Alert
        const activeListings = this.listings.filter(l => l.status === 'active').length;
        if (activeListings === 0 && this.listings.length > 0) {
            alerts.push({
                icon: '📉',
                type: 'warning',
                title: 'Low Activity',
                description: 'No active listings on platform',
                priority: 2
            });
        }

        // Revenue Alert (if significant)
        const totalRevenue = this.transactions
            .filter(t => t.status === 'completed')
            .reduce((sum, t) => sum + (t.amount || 0), 0);
        
        if (totalRevenue > 0) {
            const recentRevenue = this.transactions
                .filter(t => {
                    if (!t.createdAt && !t.date) return false;
                    const transDate = t.createdAt ? new Date(t.createdAt) : new Date(t.date);
                    const daysDiff = (new Date() - transDate) / (1000 * 60 * 60 * 24);
                    return daysDiff <= 7 && t.status === 'completed';
                })
                .reduce((sum, t) => sum + (t.amount || 0), 0);

            if (recentRevenue > 0) {
                alerts.push({
                    icon: '💰',
                    type: 'success',
                    title: 'Recent Revenue',
                    description: `BWP ${recentRevenue.toLocaleString()} in last 7 days`,
                    priority: 3
                });
            }
        }

        // Sort by priority (1 = highest, 3 = lowest) and return
        return alerts.sort((a, b) => a.priority - b.priority);
    }

    async handleLogout() {
        try {
            // Clean up real-time listeners before logout
            this.cleanupRealtimeListeners();
            
            localStorage.removeItem('demo_user');
            
            if (this.auth && this.auth.signOut) {
                await this.auth.signOut();
            }
            
            window.location.href = 'login.html';
        } catch (error) {
            console.error('Error signing out:', error);
            this.cleanupRealtimeListeners();
            localStorage.removeItem('demo_user');
            window.location.href = 'login.html';
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.adminHandler = new AdminDashboardHandler();
});

// Export for use in other files
window.AdminDashboardHandler = AdminDashboardHandler;
