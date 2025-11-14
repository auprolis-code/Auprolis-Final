// Admin Dashboard Handler
class AdminDashboardHandler {
    constructor() {
        // DEMO MODE: Use demo authentication if available
        this.auth = typeof demoAuth !== 'undefined' ? demoAuth : 
                    (typeof firebase !== 'undefined' && firebase.auth ? firebase.auth() : null);
        this.db = typeof demoFirestore !== 'undefined' ? demoFirestore : 
                  (typeof firebase !== 'undefined' && firebase.firestore ? firebase.firestore() : null);
        this.user = null;
        this.userData = null;
        this.listings = [];
        this.users = [];
        this.transactions = [];
        
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

        // Create listing form
        const createListingForm = document.getElementById('createListingForm');
        if (createListingForm) {
            createListingForm.addEventListener('submit', (e) => this.handleCreateListing(e));
        }

        // Image upload - setup initially
        this.setupImageUpload();
        
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
    }

    async loadListings() {
        // Load from demo data or Firebase
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
                        status: 'active', // Default status
                        phone: user.phone || '',
                        createdAt: new Date() // Default creation date
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
            completedAuctionsCount.textContent = this.listings.filter(l => l.status === 'ended').length;
        }

        // Update pending approvals
        const pendingApprovalsCount = document.getElementById('pendingApprovalsCount');
        if (pendingApprovalsCount) {
            pendingApprovalsCount.textContent = this.listings.filter(l => l.status === 'pending').length;
        }
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
                    <p class="listing-price">BWP ${(listing.currentBid || listing.startingBid || 0).toLocaleString()}</p>
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

    // Create Listing functionality
    openCreateListingModal() {
        console.log('Opening create listing modal...');
        const modal = document.getElementById('createListingModal');
        if (!modal) {
            console.error('Modal not found!');
            alert('Create listing modal not found. Please refresh the page.');
            return;
        }
        this.setupImageUpload(); // Setup image upload when opening modal
        this.showModal('createListingModal');
    }

    closeCreateListingModal() {
        this.closeModal('createListingModal');
        // Reset form
        const form = document.getElementById('createListingForm');
        if (form) {
            form.reset();
            // Clear uploaded images
            const uploadedImages = document.getElementById('uploadedImages');
            if (uploadedImages) {
                uploadedImages.innerHTML = '';
            }
        }
    }

    handleCreateListing(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const listingData = Object.fromEntries(formData.entries());
        
        // Get uploaded images
        const uploadedImages = document.getElementById('uploadedImages');
        const imageElements = uploadedImages ? uploadedImages.querySelectorAll('img') : [];
        const imageUrls = Array.from(imageElements).map(img => img.src);
        
        // Add additional fields
        listingData.id = `asset-${Date.now()}`;
        listingData.sellerId = this.user?.uid || 'admin';
        listingData.sellerName = this.user?.displayName || this.user?.email || 'Admin';
        listingData.status = 'active'; // Admin-created listings are auto-approved
        listingData.createdAt = new Date();
        listingData.startDate = listingData.startDate ? new Date(listingData.startDate) : new Date();
        listingData.endDate = listingData.endDate ? new Date(listingData.endDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        listingData.bidCount = 0;
        listingData.viewCount = 0;
        listingData.currentBid = parseInt(listingData.startingBid) || 0;
        listingData.startingBid = parseInt(listingData.startingBid) || 0;
        listingData.images = imageUrls.length > 0 ? imageUrls : ['assets/images/placeholder.txt'];
        
        // Add contact info
        listingData.contactInfo = {
            name: listingData.contactName,
            phone: listingData.contactPhone,
            email: listingData.contactEmail
        };

        // Save to demo data or Firebase
        if (typeof DEMO_ASSETS !== 'undefined') {
            DEMO_ASSETS.push(listingData);
            // Also update SAMPLE_ASSETS if it exists
            if (typeof SAMPLE_ASSETS !== 'undefined') {
                SAMPLE_ASSETS.push(listingData);
            }
        }

        if (this.db && this.db.collection) {
            try {
                this.db.collection('listings').add(listingData);
            } catch (error) {
                console.error('Error saving listing to database:', error);
            }
        }

        // Add to local listings array
        this.listings.push(listingData);
        
        this.showMessage('Listing created successfully!', 'success');
        this.closeCreateListingModal();
        
        // Refresh listings display
        this.renderListings();
        this.updateDashboardStats();
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
            alert(`Listing: ${listing.title}\nStatus: ${listing.status}\nPrice: BWP ${(listing.currentBid || listing.startingBid || 0).toLocaleString()}`);
        }
    }

    approveListing(listingId) {
        const listing = this.listings.find(l => l.id === listingId);
        if (listing) {
            listing.status = 'active';
            this.showMessage(`Listing "${listing.title}" approved!`, 'success');
            this.renderListings();
            this.updateDashboardStats();
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
                    <p class="listing-price">BWP ${(listing.currentBid || listing.startingBid || 0).toLocaleString()}</p>
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
        const pendingUsers = this.users.filter(u => u.status === 'pending');
        if (pendingUsers.length === 0) {
            this.showMessage('No pending users to verify.', 'info');
            return;
        }
        
        pendingUsers.forEach(user => {
            user.status = 'active';
        });
        
        this.showMessage(`${pendingUsers.length} user(s) verified successfully!`, 'success');
        this.renderUsers();
        this.updateDashboardStats();
    }

    approvePendingListings() {
        const pendingListings = this.listings.filter(l => l.status === 'pending');
        if (pendingListings.length === 0) {
            this.showMessage('No pending listings to approve.', 'info');
            return;
        }
        
        pendingListings.forEach(listing => {
            listing.status = 'active';
        });
        
        this.showMessage(`${pendingListings.length} listing(s) approved successfully!`, 'success');
        this.renderListings();
        this.updateDashboardStats();
    }

    generateReport() {
        const report = {
            generatedAt: new Date().toISOString(),
            totalUsers: this.users.length,
            totalListings: this.listings.length,
            activeListings: this.listings.filter(l => l.status === 'active').length,
            totalTransactions: this.transactions.length,
            totalRevenue: this.transactions
                .filter(t => t.status === 'completed')
                .reduce((sum, t) => sum + (t.amount || 0), 0)
        };

        const reportStr = JSON.stringify(report, null, 2);
        const dataBlob = new Blob([reportStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `admin-report-${Date.now()}.json`;
        link.click();
        
        this.showMessage('Report generated and downloaded successfully!', 'success');
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

        const activities = [
            { icon: '👤', title: 'New User Registered', description: 'A new buyer account was created', time: '2 hours ago' },
            { icon: '📋', title: 'Listing Created', description: 'New asset listing added to platform', time: '4 hours ago' },
            { icon: '✅', title: 'Listing Approved', description: 'Pending listing was approved', time: '6 hours ago' },
            { icon: '💰', title: 'Transaction Completed', description: 'Payment processed successfully', time: '1 day ago' }
        ];

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

    loadSystemAlerts() {
        const alertsList = document.getElementById('alertsList');
        if (!alertsList) return;

        const alerts = [
            { icon: '⚠️', type: 'warning', title: 'Pending Approvals', description: `${this.listings.filter(l => l.status === 'pending').length} listings awaiting approval` },
            { icon: '📊', type: 'info', title: 'System Health', description: 'All systems operational' },
            { icon: '👥', type: 'info', title: 'User Activity', description: `${this.users.filter(u => u.status === 'pending').length} users pending verification` }
        ];

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

    async handleLogout() {
        try {
            localStorage.removeItem('demo_user');
            
            if (this.auth && this.auth.signOut) {
                await this.auth.signOut();
            }
            
            window.location.href = 'login.html';
        } catch (error) {
            console.error('Error signing out:', error);
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
