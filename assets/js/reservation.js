// Reservation/Booking Interface Handler
class ReservationHandler {
    constructor() {
        this.auth = typeof demoAuth !== 'undefined' ? demoAuth : 
                    (typeof firebase !== 'undefined' && firebase.auth ? firebase.auth() : null);
        this.db = typeof demoFirestore !== 'undefined' ? demoFirestore : 
                  (typeof firebase !== 'undefined' && firebase.firestore ? firebase.firestore() : null);
        this.user = null;
        this.currentAsset = null;
        this.reservationHistory = [];
        
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
    }

    bindEvents() {
        // Modal close buttons
        const reservationModalClose = document.getElementById('reservationModalClose');
        const reservationHistoryModalClose = document.getElementById('reservationHistoryModalClose');
        const reservationConfirmationModalClose = document.getElementById('reservationConfirmationModalClose');
        
        if (reservationModalClose) {
            reservationModalClose.addEventListener('click', () => this.closeModal('reservationModal'));
        }
        
        if (reservationHistoryModalClose) {
            reservationHistoryModalClose.addEventListener('click', () => this.closeModal('reservationHistoryModal'));
        }
        
        if (reservationConfirmationModalClose) {
            reservationConfirmationModalClose.addEventListener('click', () => this.closeModal('reservationConfirmationModal'));
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
            if (this.db && this.db.collection) {
                const userDoc = await this.db.collection('users').doc(this.user.uid).get();
                
                if (userDoc.exists) {
                    const userData = userDoc.data();
                    if (userData.userType !== 'buyer') {
                        alert('Only buyers can make reservations.');
                        window.location.href = 'login.html';
                        return;
                    }
                }
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            // In demo mode, continue anyway
        }
    }

    async openReservationModal(assetId) {
        try {
            // Load asset data
            this.currentAsset = this.getAssetById(assetId);
            if (!this.currentAsset) {
                alert('Asset not found.');
                return;
            }

            // Check if already reserved
            await this.checkExistingReservation(assetId);
            
            // Render reservation interface
            this.renderReservationInterface();
            
            // Show modal
            this.showModal('reservationModal');
        } catch (error) {
            console.error('Error opening reservation modal:', error);
            alert('Error loading reservation interface. Please try again.');
        }
    }

    getAssetById(assetId) {
        // Get from sample assets or demo data
        if (typeof SAMPLE_ASSETS !== 'undefined') {
            return SAMPLE_ASSETS.find(asset => asset.id === assetId);
        }
        if (typeof DEMO_ASSETS !== 'undefined') {
            return DEMO_ASSETS.find(asset => asset.id === assetId);
        }
        return null;
    }

    async checkExistingReservation(assetId) {
        try {
            // Check if user already has a reservation for this asset
            if (typeof DEMO_RESERVATIONS !== 'undefined') {
                const existingReservation = DEMO_RESERVATIONS.find(
                    r => r.assetId === assetId && 
                    r.userId === this.user.uid && 
                    (r.status === 'pending' || r.status === 'confirmed')
                );
                if (existingReservation) {
                    alert('You already have a reservation for this item.');
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.error('Error checking existing reservation:', error);
            return false;
        }
    }

    renderReservationInterface() {
        const content = document.getElementById('reservationContent');
        if (!content || !this.currentAsset) return;

        const isReserved = this.currentAsset.isReserved || false;

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
                        <span class="asset-detail-label">Price:</span>
                        <span class="asset-detail-value">BWP ${(this.currentAsset.startingBid || this.currentAsset.currentBid || 0).toLocaleString()}</span>
                    </div>
                    ${this.currentAsset.endDate ? `
                    <div class="asset-detail">
                        <span class="asset-detail-label">Available Until:</span>
                        <span class="asset-detail-value">${new Date(this.currentAsset.endDate).toLocaleString()}</span>
                    </div>
                    ` : ''}
                </div>
            </div>

            <div class="reservation-form">
                <div class="reservation-section">
                    <h4>Book This Item</h4>
                    <p class="reservation-description">Make a reservation for this item. Your booking information will be recorded and the seller will be notified.</p>
                    
                    <div class="reservation-info">
                        <div class="info-item">
                            <label>Your Name:</label>
                            <input type="text" 
                                   id="reservationName" 
                                   class="reservation-input" 
                                   value="${this.user.displayName || this.user.email || ''}"
                                   required>
                        </div>
                        
                        <div class="info-item">
                            <label>Email:</label>
                            <input type="email" 
                                   id="reservationEmail" 
                                   class="reservation-input" 
                                   value="${this.user.email || ''}"
                                   required>
                        </div>
                        
                        <div class="info-item">
                            <label>Phone Number:</label>
                            <input type="tel" 
                                   id="reservationPhone" 
                                   class="reservation-input" 
                                   placeholder="+267 XXX XXX XXX"
                                   required>
                        </div>
                        
                        <div class="info-item">
                            <label>Additional Notes (Optional):</label>
                            <textarea id="reservationNotes" 
                                      class="reservation-textarea" 
                                      rows="4"
                                      placeholder="Any additional information or questions..."></textarea>
                        </div>
                    </div>

                    <div id="reservationValidation" class="reservation-validation" style="display: none;"></div>

                    <div class="reservation-actions">
                        <button class="btn btn-primary" 
                                id="bookItemBtn" 
                                onclick="reservationHandler.createReservation()"
                                ${isReserved ? 'disabled' : ''}>
                            ${isReserved ? 'Already Reserved' : 'Book Item'}
                        </button>
                        <button class="btn btn-secondary" onclick="reservationHandler.showReservationHistory()">
                            View My Reservations
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    validateReservationForm() {
        const name = document.getElementById('reservationName')?.value.trim();
        const email = document.getElementById('reservationEmail')?.value.trim();
        const phone = document.getElementById('reservationPhone')?.value.trim();
        const validationDiv = document.getElementById('reservationValidation');
        
        if (!validationDiv) return false;

        validationDiv.style.display = 'block';
        validationDiv.classList.remove('error', 'success');

        if (!name) {
            validationDiv.className = 'reservation-validation error';
            validationDiv.innerHTML = 'Please enter your name.';
            return false;
        }

        if (!email || !email.includes('@')) {
            validationDiv.className = 'reservation-validation error';
            validationDiv.innerHTML = 'Please enter a valid email address.';
            return false;
        }

        if (!phone) {
            validationDiv.className = 'reservation-validation error';
            validationDiv.innerHTML = 'Please enter your phone number.';
            return false;
        }

        validationDiv.className = 'reservation-validation success';
        validationDiv.innerHTML = 'Form is valid. Ready to book!';
        return true;
    }

    async createReservation() {
        if (!this.validateReservationForm()) return;

        const name = document.getElementById('reservationName').value.trim();
        const email = document.getElementById('reservationEmail').value.trim();
        const phone = document.getElementById('reservationPhone').value.trim();
        const notes = document.getElementById('reservationNotes')?.value.trim() || '';

        // Show confirmation modal
        this.showReservationConfirmation(name, email, phone, notes);
    }

    showReservationConfirmation(name, email, phone, notes) {
        const content = document.getElementById('reservationConfirmationContent');
        if (!content) return;

        content.innerHTML = `
            <h4>Confirm Your Reservation</h4>
            <div class="reservation-confirmation-details">
                <div class="reservation-confirmation-detail">
                    <span class="reservation-confirmation-detail-label">Item:</span>
                    <span class="reservation-confirmation-detail-value">${this.currentAsset.title}</span>
                </div>
                <div class="reservation-confirmation-detail">
                    <span class="reservation-confirmation-detail-label">Price:</span>
                    <span class="reservation-confirmation-detail-value">BWP ${(this.currentAsset.startingBid || this.currentAsset.currentBid || 0).toLocaleString()}</span>
                </div>
                <div class="reservation-confirmation-detail">
                    <span class="reservation-confirmation-detail-label">Your Name:</span>
                    <span class="reservation-confirmation-detail-value">${name}</span>
                </div>
                <div class="reservation-confirmation-detail">
                    <span class="reservation-confirmation-detail-label">Email:</span>
                    <span class="reservation-confirmation-detail-value">${email}</span>
                </div>
                <div class="reservation-confirmation-detail">
                    <span class="reservation-confirmation-detail-label">Phone:</span>
                    <span class="reservation-confirmation-detail-value">${phone}</span>
                </div>
                ${notes ? `
                <div class="reservation-confirmation-detail">
                    <span class="reservation-confirmation-detail-label">Notes:</span>
                    <span class="reservation-confirmation-detail-value">${notes}</span>
                </div>
                ` : ''}
            </div>
            <div class="reservation-actions">
                <button class="btn btn-primary" onclick="reservationHandler.confirmReservation('${name}', '${email}', '${phone}', '${notes.replace(/'/g, "\\'")}')">
                    Confirm Reservation
                </button>
                <button class="btn btn-secondary" onclick="reservationHandler.closeModal('reservationConfirmationModal')">
                    Cancel
                </button>
            </div>
        `;

        this.showModal('reservationConfirmationModal');
    }

    async confirmReservation(name, email, phone, notes) {
        try {
            // Show loading state
            this.showLoadingState();

            // Create reservation object
            const reservation = {
                id: `reservation-${Date.now()}`,
                assetId: this.currentAsset.id,
                listingId: this.currentAsset.id,
                userId: this.user.uid,
                userName: name,
                userEmail: email,
                userPhone: phone,
                notes: notes,
                timestamp: new Date(),
                status: 'pending',
                isActive: true,
                asset: this.currentAsset
            };

            // In a real app, this would save to the database
            await this.saveReservation(reservation);

            // Show success message
            this.showMessage('Reservation created successfully! The seller will be notified.', 'success');

            // Close confirmation modal
            this.closeModal('reservationConfirmationModal');
            
            // Close reservation modal
            this.closeModal('reservationModal');

        } catch (error) {
            console.error('Error creating reservation:', error);
            this.showMessage('Error creating reservation. Please try again.', 'error');
        }
    }

    async saveReservation(reservation) {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // In demo mode, add to DEMO_RESERVATIONS if it exists
        if (typeof DEMO_RESERVATIONS !== 'undefined') {
            DEMO_RESERVATIONS.push(reservation);
        }

        // In a real app, this would save to Firebase
        if (this.db && this.db.collection) {
            try {
                await this.db.collection('reservations').add(reservation);
            } catch (error) {
                console.error('Error saving reservation to database:', error);
            }
        }
    }

    showReservationHistory() {
        const content = document.getElementById('reservationHistoryContent');
        if (!content) return;

        // Load user's reservations
        const userReservations = this.getUserReservations();

        if (userReservations.length === 0) {
            content.innerHTML = `
                <div class="reservation-empty">
                    <h4>No Reservations Yet</h4>
                    <p>You haven't made any reservations yet. Browse items to book them.</p>
                </div>
            `;
        } else {
            content.innerHTML = `
                <div class="reservation-history-list">
                    ${userReservations.map(reservation => `
                        <div class="reservation-history-item">
                            <div class="reservation-history-info">
                                <div class="reservation-history-asset">${reservation.asset?.title || 'Unknown Item'}</div>
                                <div class="reservation-history-time">${this.formatTime(reservation.timestamp)}</div>
                                <div class="reservation-history-status ${reservation.status}">
                                    ${reservation.status === 'pending' ? 'Pending' : 
                                      reservation.status === 'confirmed' ? 'Confirmed' : 
                                      reservation.status === 'cancelled' ? 'Cancelled' : 'Completed'}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        this.showModal('reservationHistoryModal');
    }

    getUserReservations() {
        if (typeof DEMO_RESERVATIONS !== 'undefined') {
            return DEMO_RESERVATIONS.filter(r => r.userId === this.user.uid);
        }
        return [];
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
        const content = document.getElementById('reservationContent');
        if (content) {
            content.innerHTML = `
                <div class="reservation-loading">
                    <div class="reservation-spinner"></div>
                    <p>Processing your reservation...</p>
                </div>
            `;
        }
    }

    showMessage(message, type) {
        // Create and show a temporary message
        const messageDiv = document.createElement('div');
        messageDiv.className = `reservation-message ${type}`;
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
    window.reservationHandler = new ReservationHandler();
});

// Export for use in other files
window.ReservationHandler = ReservationHandler;





