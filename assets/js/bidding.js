// Bidding Interface Handler
class BiddingHandler {
    constructor() {
        this.auth = firebase.auth();
        this.db = firebase.firestore();
        this.user = null;
        this.currentAsset = null;
        this.bidHistory = [];
        this.autoBidSettings = {
            enabled: false,
            maxAmount: 0,
            increment: 1000
        };
        this.timerInterval = null;
        
        this.init();
    }

    init() {
        // Check authentication state
        this.auth.onAuthStateChanged((user) => {
            if (user) {
                this.user = user;
                this.loadUserData();
            } else {
                // Redirect to login if not authenticated
                window.location.href = 'login.html';
            }
        });

        this.bindEvents();
    }

    bindEvents() {
        // Modal close buttons
        const biddingModalClose = document.getElementById('biddingModalClose');
        const bidHistoryModalClose = document.getElementById('bidHistoryModalClose');
        const bidConfirmationModalClose = document.getElementById('bidConfirmationModalClose');
        
        if (biddingModalClose) {
            biddingModalClose.addEventListener('click', () => this.closeModal('biddingModal'));
        }
        
        if (bidHistoryModalClose) {
            bidHistoryModalClose.addEventListener('click', () => this.closeModal('bidHistoryModal'));
        }
        
        if (bidConfirmationModalClose) {
            bidConfirmationModalClose.addEventListener('click', () => this.closeModal('bidConfirmationModal'));
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
                const userData = userDoc.data();
                if (userData.userType !== 'buyer') {
                    alert('Only buyers can place bids.');
                    window.location.href = 'login.html';
                    return;
                }
            } else {
                alert('User not found. Please sign up first.');
                window.location.href = 'login.html';
                return;
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            alert('Error loading user data. Please try again.');
        }
    }

    async openBiddingModal(assetId) {
        try {
            // Load asset data (in a real app, this would come from the database)
            this.currentAsset = this.getAssetById(assetId);
            if (!this.currentAsset) {
                alert('Asset not found.');
                return;
            }

            // Load bid history
            await this.loadBidHistory(assetId);
            
            // Render bidding interface
            this.renderBiddingInterface();
            
            // Start auction timer
            this.startAuctionTimer();
            
            // Show modal
            this.showModal('biddingModal');
        } catch (error) {
            console.error('Error opening bidding modal:', error);
            alert('Error loading bidding interface. Please try again.');
        }
    }

    getAssetById(assetId) {
        // In a real app, this would fetch from the database
        // For now, we'll use sample data
        const sampleAssets = [
            {
                id: 'asset-001',
                title: 'Toyota Hilux Double Cab',
                category: 'vehicles',
                location: 'Gaborone',
                condition: 'excellent',
                startingBid: 150000,
                currentBid: 175000,
                endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
                startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
                description: 'Well-maintained Toyota Hilux in excellent condition.',
                images: ['https://via.placeholder.com/400x300/2563eb/ffffff?text=Toyota+Hilux'],
                contactInfo: {
                    name: 'John Smith',
                    email: 'john@example.com',
                    phone: '+267 123 4567'
                }
            }
        ];
        
        return sampleAssets.find(asset => asset.id === assetId);
    }

    async loadBidHistory(assetId) {
        try {
            // In a real app, this would fetch from the database
            // For now, we'll use sample data
            this.bidHistory = [
                {
                    id: 'bid-001',
                    userId: 'user-001',
                    userName: 'Alice Johnson',
                    amount: 175000,
                    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
                    status: 'winning'
                },
                {
                    id: 'bid-002',
                    userId: 'user-002',
                    userName: 'Bob Wilson',
                    amount: 170000,
                    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
                    status: 'outbid'
                },
                {
                    id: 'bid-003',
                    userId: 'user-003',
                    userName: 'Carol Davis',
                    amount: 165000,
                    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
                    status: 'outbid'
                }
            ];
        } catch (error) {
            console.error('Error loading bid history:', error);
            this.bidHistory = [];
        }
    }

    renderBiddingInterface() {
        const content = document.getElementById('biddingContent');
        if (!content || !this.currentAsset) return;

        const endDate = new Date(this.currentAsset.endDate);
        const now = new Date();
        const isEnded = endDate <= now;

        content.innerHTML = `
            <div class="asset-summary">
                <h4>${this.currentAsset.title}</h4>
                <div class="asset-image">
                    <img src="${this.currentAsset.images[0]}" alt="${this.currentAsset.title}">
                </div>
                <div class="asset-details">
                    <div class="asset-detail">
                        <span class="asset-detail-label">Location:</span>
                        <span class="asset-detail-value">${this.currentAsset.location}</span>
                    </div>
                    <div class="asset-detail">
                        <span class="asset-detail-label">Condition:</span>
                        <span class="asset-detail-value">${this.currentAsset.condition}</span>
                    </div>
                    <div class="asset-detail">
                        <span class="asset-detail-label">Starting Bid:</span>
                        <span class="asset-detail-value">BWP ${this.currentAsset.startingBid.toLocaleString()}</span>
                    </div>
                    <div class="asset-detail">
                        <span class="asset-detail-label">Current Bid:</span>
                        <span class="asset-detail-value current-bid">BWP ${this.currentAsset.currentBid.toLocaleString()}</span>
                    </div>
                    <div class="asset-detail">
                        <span class="asset-detail-label">Ends:</span>
                        <span class="asset-detail-value">${endDate.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <div class="bidding-form">
                <div class="auction-timer">
                    <h4>Auction Status</h4>
                    <div class="timer-display" id="timerDisplay">
                        ${this.getTimeRemaining(endDate)}
                    </div>
                    <div class="timer-status" id="timerStatus">
                        ${isEnded ? 'Auction Ended' : 'Auction Active'}
                    </div>
                </div>

                <div class="bidding-section">
                    <h4>Place Your Bid</h4>
                    <div class="bid-amount-group">
                        <span class="currency-symbol">BWP</span>
                        <input type="number" 
                               id="bidAmount" 
                               class="bid-amount-input" 
                               placeholder="Enter bid amount"
                               min="${this.currentAsset.currentBid + 1000}"
                               step="1000"
                               ${isEnded ? 'disabled' : ''}>
                    </div>
                    
                    <div class="quick-bid-buttons">
                        <button class="quick-bid-btn" onclick="biddingHandler.setQuickBid(${this.currentAsset.currentBid + 1000})">
                            +BWP 1,000
                        </button>
                        <button class="quick-bid-btn" onclick="biddingHandler.setQuickBid(${this.currentAsset.currentBid + 5000})">
                            +BWP 5,000
                        </button>
                        <button class="quick-bid-btn" onclick="biddingHandler.setQuickBid(${this.currentAsset.currentBid + 10000})">
                            +BWP 10,000
                        </button>
                    </div>

                    <div id="bidValidation" class="bid-validation" style="display: none;"></div>

                    <div class="auto-bid-section">
                        <div class="auto-bid-toggle">
                            <input type="checkbox" id="autoBidToggle" onchange="biddingHandler.toggleAutoBid()">
                            <label for="autoBidToggle">Enable Auto-Bid</label>
                        </div>
                        <div class="auto-bid-settings" id="autoBidSettings">
                            <input type="number" 
                                   id="autoBidMax" 
                                   class="auto-bid-input" 
                                   placeholder="Maximum bid amount"
                                   min="${this.currentAsset.currentBid + 1000}">
                            <input type="number" 
                                   id="autoBidIncrement" 
                                   class="auto-bid-input" 
                                   placeholder="Bid increment"
                                   value="1000"
                                   min="1000"
                                   step="1000">
                        </div>
                    </div>

                    <div class="bid-actions">
                        <button class="btn btn-primary" 
                                id="placeBidBtn" 
                                onclick="biddingHandler.placeBid()"
                                ${isEnded ? 'disabled' : ''}>
                            ${isEnded ? 'Auction Ended' : 'Place Bid'}
                        </button>
                        <button class="btn btn-secondary" onclick="biddingHandler.showBidHistory()">
                            View Bid History
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Bind input events
        this.bindBiddingEvents();
    }

    bindBiddingEvents() {
        const bidAmountInput = document.getElementById('bidAmount');
        if (bidAmountInput) {
            bidAmountInput.addEventListener('input', () => this.validateBidAmount());
        }
    }

    setQuickBid(amount) {
        const bidAmountInput = document.getElementById('bidAmount');
        if (bidAmountInput) {
            bidAmountInput.value = amount;
            this.validateBidAmount();
        }
    }

    validateBidAmount() {
        const bidAmountInput = document.getElementById('bidAmount');
        const validationDiv = document.getElementById('bidValidation');
        
        if (!bidAmountInput || !validationDiv) return;

        const bidAmount = parseFloat(bidAmountInput.value);
        const currentBid = this.currentAsset.currentBid;
        const minBid = currentBid + 1000;

        validationDiv.style.display = 'block';
        bidAmountInput.classList.remove('error');

        if (!bidAmount || bidAmount < minBid) {
            validationDiv.className = 'bid-validation error';
            validationDiv.innerHTML = `Minimum bid is BWP ${minBid.toLocaleString()}`;
            bidAmountInput.classList.add('error');
            return false;
        }

        if (bidAmount > currentBid * 2) {
            validationDiv.className = 'bid-validation warning';
            validationDiv.innerHTML = 'This bid is significantly higher than the current bid. Are you sure?';
            return true;
        }

        validationDiv.className = 'bid-validation success';
        validationDiv.innerHTML = 'Bid amount is valid';
        return true;
    }

    toggleAutoBid() {
        const autoBidToggle = document.getElementById('autoBidToggle');
        const autoBidSettings = document.getElementById('autoBidSettings');
        
        if (autoBidToggle && autoBidSettings) {
            if (autoBidToggle.checked) {
                autoBidSettings.classList.add('active');
            } else {
                autoBidSettings.classList.remove('active');
            }
        }
    }

    async placeBid() {
        const bidAmountInput = document.getElementById('bidAmount');
        if (!bidAmountInput) return;

        const bidAmount = parseFloat(bidAmountInput.value);
        if (!this.validateBidAmount()) return;

        // Show confirmation modal
        this.showBidConfirmation(bidAmount);
    }

    showBidConfirmation(bidAmount) {
        const content = document.getElementById('bidConfirmationContent');
        if (!content) return;

        const autoBidToggle = document.getElementById('autoBidToggle');
        const autoBidMax = document.getElementById('autoBidMax');
        const autoBidIncrement = document.getElementById('autoBidIncrement');

        content.innerHTML = `
            <h4>Confirm Your Bid</h4>
            <div class="bid-confirmation-details">
                <div class="bid-confirmation-detail">
                    <span class="bid-confirmation-detail-label">Asset:</span>
                    <span class="bid-confirmation-detail-value">${this.currentAsset.title}</span>
                </div>
                <div class="bid-confirmation-detail">
                    <span class="bid-confirmation-detail-label">Your Bid:</span>
                    <span class="bid-confirmation-detail-value">BWP ${bidAmount.toLocaleString()}</span>
                </div>
                <div class="bid-confirmation-detail">
                    <span class="bid-confirmation-detail-label">Current Bid:</span>
                    <span class="bid-confirmation-detail-value">BWP ${this.currentAsset.currentBid.toLocaleString()}</span>
                </div>
                ${autoBidToggle && autoBidToggle.checked ? `
                    <div class="bid-confirmation-detail">
                        <span class="bid-confirmation-detail-label">Auto-Bid Max:</span>
                        <span class="bid-confirmation-detail-value">BWP ${parseFloat(autoBidMax.value || 0).toLocaleString()}</span>
                    </div>
                ` : ''}
                <div class="bid-confirmation-detail">
                    <span class="bid-confirmation-detail-label">Bid Increment:</span>
                    <span class="bid-confirmation-detail-value">BWP ${(autoBidToggle && autoBidToggle.checked ? parseFloat(autoBidIncrement.value || 1000) : 1000).toLocaleString()}</span>
                </div>
                <div class="bid-confirmation-detail bid-confirmation-total">
                    <span>Total Potential Bid:</span>
                    <span>BWP ${bidAmount.toLocaleString()}</span>
                </div>
            </div>
            <div class="bid-actions">
                <button class="btn btn-primary" onclick="biddingHandler.confirmBid(${bidAmount})">
                    Confirm Bid
                </button>
                <button class="btn btn-secondary" onclick="biddingHandler.closeModal('bidConfirmationModal')">
                    Cancel
                </button>
            </div>
        `;

        this.showModal('bidConfirmationModal');
    }

    async confirmBid(bidAmount) {
        try {
            // Show loading state
            this.showLoadingState();

            // In a real app, this would submit to the database
            // For now, we'll simulate the bid placement
            await this.simulateBidPlacement(bidAmount);

            // Update the interface
            this.currentAsset.currentBid = bidAmount;
            this.renderBiddingInterface();

            // Show success message
            this.showMessage('Bid placed successfully!', 'success');

            // Close confirmation modal
            this.closeModal('bidConfirmationModal');

        } catch (error) {
            console.error('Error placing bid:', error);
            this.showMessage('Error placing bid. Please try again.', 'error');
        }
    }

    async simulateBidPlacement(bidAmount) {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Add bid to history
        const newBid = {
            id: `bid-${Date.now()}`,
            userId: this.user.uid,
            userName: this.user.displayName || this.user.email,
            amount: bidAmount,
            timestamp: new Date(),
            status: 'winning'
        };

        this.bidHistory.unshift(newBid);
    }

    showBidHistory() {
        const content = document.getElementById('bidHistoryContent');
        if (!content) return;

        if (this.bidHistory.length === 0) {
            content.innerHTML = `
                <div class="bidding-empty">
                    <h4>No Bids Yet</h4>
                    <p>Be the first to place a bid on this asset.</p>
                </div>
            `;
        } else {
            content.innerHTML = `
                <div class="bid-history-list">
                    ${this.bidHistory.map(bid => `
                        <div class="bid-history-item ${bid.userId === this.user.uid ? 'current-user' : ''}">
                            <div class="bid-history-info">
                                <div class="bid-history-amount">BWP ${bid.amount.toLocaleString()}</div>
                                <div class="bid-history-time">${this.formatTime(bid.timestamp)}</div>
                                <div class="bid-history-user">${bid.userName}</div>
                            </div>
                            <div class="bid-history-status ${bid.status}">
                                ${bid.status === 'winning' ? 'Winning' : 
                                  bid.status === 'outbid' ? 'Outbid' : 'Pending'}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        this.showModal('bidHistoryModal');
    }

    startAuctionTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }

        this.timerInterval = setInterval(() => {
            this.updateAuctionTimer();
        }, 1000);
    }

    updateAuctionTimer() {
        const timerDisplay = document.getElementById('timerDisplay');
        const timerStatus = document.getElementById('timerStatus');
        
        if (!timerDisplay || !timerStatus || !this.currentAsset) return;

        const endDate = new Date(this.currentAsset.endDate);
        const now = new Date();
        const timeRemaining = endDate - now;

        if (timeRemaining <= 0) {
            timerDisplay.textContent = '00:00:00';
            timerStatus.textContent = 'Auction Ended';
            timerStatus.className = 'timer-status ended';
            
            // Disable bidding
            const placeBidBtn = document.getElementById('placeBidBtn');
            const bidAmountInput = document.getElementById('bidAmount');
            
            if (placeBidBtn) placeBidBtn.disabled = true;
            if (bidAmountInput) bidAmountInput.disabled = true;
            
            clearInterval(this.timerInterval);
            return;
        }

        const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
        const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

        timerDisplay.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        if (timeRemaining <= (60 * 60 * 1000)) { // Less than 1 hour
            timerStatus.textContent = 'Auction Ending Soon!';
            timerStatus.className = 'timer-status ending-soon';
        } else {
            timerStatus.textContent = 'Auction Active';
            timerStatus.className = 'timer-status';
        }
    }

    getTimeRemaining(endDate) {
        const now = new Date();
        const timeRemaining = endDate - now;
        
        if (timeRemaining <= 0) return '00:00:00';
        
        const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
        const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    formatTime(timestamp) {
        const now = new Date();
        const diff = now - timestamp;
        
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)} minutes ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
        return timestamp.toLocaleDateString();
    }

    showLoadingState() {
        const content = document.getElementById('biddingContent');
        if (content) {
            content.innerHTML = `
                <div class="bidding-loading">
                    <div class="bidding-spinner"></div>
                    <p>Processing your bid...</p>
                </div>
            `;
        }
    }

    showMessage(message, type) {
        // Create and show a temporary message
        const messageDiv = document.createElement('div');
        messageDiv.className = `bidding-message ${type}`;
        messageDiv.textContent = message;
        
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
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if Firebase is loaded
    if (typeof firebase !== 'undefined') {
        window.biddingHandler = new BiddingHandler();
    } else {
        console.error('Firebase not loaded. Please check your Firebase configuration.');
    }
});

// Export for use in other files
window.BiddingHandler = BiddingHandler;
