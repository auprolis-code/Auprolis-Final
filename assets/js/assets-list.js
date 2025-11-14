// Assets List Handler
class AssetsListHandler {
    constructor() {
        this.assets = SAMPLE_ASSETS || [];
        this.filteredAssets = [...this.assets];
        this.currentPage = 1;
        this.itemsPerPage = 12;
        this.isLoggedIn = false;
        
        // Initialize Google Sheets integration
        this.initGoogleSheetsIntegration();
        
        this.currentFilters = {
            search: '',
            category: '',
            location: '',
            condition: '',
            priceRange: '',
            ending: '',
            sort: 'newest'
        };
        
        this.init();
    }

    init() {
        this.checkAuthState();
        this.bindEvents();
        this.renderAssets();
        this.updateLoadMoreButton();
    }

    checkAuthState() {
        // Check authentication state - Firebase or localStorage
        const auth = (typeof firebase !== 'undefined' && firebase.auth) ? firebase.auth() : null;
        
        if (auth && auth.onAuthStateChanged) {
            auth.onAuthStateChanged((user) => {
                this.isLoggedIn = !!user;
                // Re-render assets to update visibility based on login status
                this.renderAssets();
            });
        } else {
            // Fallback: Check localStorage for demo user
            const storedUser = localStorage.getItem('demo_user');
            const userLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
            this.isLoggedIn = !!(storedUser || userLoggedIn);
        }
    }

    checkLoginStatus() {
        // Check if user is logged in (this would typically check Firebase auth)
        // For now, we'll simulate this
        return this.isLoggedIn || localStorage.getItem('userLoggedIn') === 'true';
    }

    bindEvents() {
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(() => {
                    this.handleSearch(e.target.value);
                }, 300);
            });
        }

        const searchBtn = document.getElementById('searchBtn');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.performSearch());
        }

        // Filter controls
        const filterSelects = [
            'categoryFilter', 'locationFilter', 'conditionFilter', 
            'priceRangeFilter', 'endingFilter', 'sortFilter'
        ];
        
        filterSelects.forEach(filterId => {
            const filter = document.getElementById(filterId);
            if (filter) {
                filter.addEventListener('change', (e) => this.handleFilterChange());
            }
        });

        // Filter action buttons
        const clearFiltersBtn = document.getElementById('clearFiltersBtn');
        const applyFiltersBtn = document.getElementById('applyFiltersBtn');
        
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => this.clearAllFilters());
        }
        
        if (applyFiltersBtn) {
            applyFiltersBtn.addEventListener('click', () => this.applyFilters());
        }

        // Load more button
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => this.loadMoreAssets());
        }

        // Modal close buttons
        const modalClose = document.getElementById('modalClose');
        const assetModalClose = document.getElementById('assetModalClose');
        
        if (modalClose) {
            modalClose.addEventListener('click', () => this.closeModal('loginModal'));
        }
        
        if (assetModalClose) {
            assetModalClose.addEventListener('click', () => this.closeModal('assetModal'));
        }

        // Close modal on backdrop click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target.id);
            }
        });

        // Search suggestions
        this.bindSearchSuggestions();
    }

    async initGoogleSheetsIntegration() {
        // Check if Google Sheets service is available
        if (typeof googleSheetsService === 'undefined') {
            console.warn('Google Sheets service not available, using demo data');
            return;
        }
        
        try {
            // Load listings from Google Sheets
            await this.loadListingsFromGoogleSheets();
            
            // Start real-time polling
            googleSheetsService.startListingsPolling((listings) => {
                console.log('📥 Received updated listings from Google Sheets:', listings.length);
                this.assets = listings;
                this.filteredAssets = [...this.assets];
                this.currentPage = 1;
                this.renderAssets();
            });
        } catch (error) {
            console.error('Error initializing Google Sheets integration:', error);
        }
    }
    
    async loadListingsFromGoogleSheets() {
        try {
            const listings = await googleSheetsService.readListings();
            if (listings && listings.length > 0) {
                console.log(`✅ Loaded ${listings.length} listings from Google Sheets`);
                this.assets = listings;
                this.filteredAssets = [...this.assets];
                this.renderAssets();
            } else {
                console.log('No listings found in Google Sheets, using demo data');
            }
        } catch (error) {
            console.error('Error loading listings from Google Sheets:', error);
            // Fallback to demo data
        }
    }

    handleSearch(searchTerm) {
        this.currentFilters.search = searchTerm;
        this.applyFilters();
    }

    performSearch() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            this.handleSearch(searchInput.value);
        }
    }

    handleFilterChange() {
        this.applyFilters();
    }

    applyFilters() {
        let filtered = [...this.assets];

        // Apply search filter
        if (this.currentFilters.search) {
            const searchTerm = this.currentFilters.search.toLowerCase();
            filtered = filtered.filter(asset => 
                asset.title.toLowerCase().includes(searchTerm) ||
                asset.location.toLowerCase().includes(searchTerm) ||
                asset.description.toLowerCase().includes(searchTerm)
            );
        }

        // Apply category filter
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter && categoryFilter.value) {
            filtered = filtered.filter(asset => asset.category === categoryFilter.value);
        }

        // Apply location filter
        const locationFilter = document.getElementById('locationFilter');
        if (locationFilter && locationFilter.value) {
            filtered = filtered.filter(asset => 
                asset.location.toLowerCase().includes(locationFilter.value.toLowerCase())
            );
        }

        // Apply condition filter
        const conditionFilter = document.getElementById('conditionFilter');
        if (conditionFilter && conditionFilter.value) {
            filtered = filtered.filter(asset => asset.condition === conditionFilter.value);
        }

        // Apply price range filter
        const priceRangeFilter = document.getElementById('priceRangeFilter');
        if (priceRangeFilter && priceRangeFilter.value) {
            const priceRange = priceRangeFilter.value;
            filtered = filtered.filter(asset => {
                const price = asset.startingBid || asset.currentBid || 0;
                switch (priceRange) {
                    case '0-50000':
                        return price < 50000;
                    case '50000-100000':
                        return price >= 50000 && price < 100000;
                    case '100000-250000':
                        return price >= 100000 && price < 250000;
                    case '250000-500000':
                        return price >= 250000 && price < 500000;
                    case '500000+':
                        return price >= 500000;
                    default:
                        return true;
                }
            });
        }

        // Apply ending filter
        const endingFilter = document.getElementById('endingFilter');
        if (endingFilter && endingFilter.value) {
            const now = new Date();
            filtered = filtered.filter(asset => {
                const endDate = new Date(asset.endDate);
                const timeDiff = endDate - now;
                
                switch (endingFilter.value) {
                    case 'today':
                        return timeDiff <= (24 * 60 * 60 * 1000) && timeDiff > 0;
                    case 'tomorrow':
                        const tomorrow = new Date(now);
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        tomorrow.setHours(0, 0, 0, 0);
                        const dayAfter = new Date(tomorrow);
                        dayAfter.setDate(dayAfter.getDate() + 1);
                        return endDate >= tomorrow && endDate < dayAfter;
                    case 'week':
                        return timeDiff <= (7 * 24 * 60 * 60 * 1000) && timeDiff > 0;
                    case 'month':
                        return timeDiff <= (30 * 24 * 60 * 60 * 1000) && timeDiff > 0;
                    default:
                        return true;
                }
            });
        }

        // Apply sorting
        const sortFilter = document.getElementById('sortFilter');
        if (sortFilter && sortFilter.value) {
            filtered.sort((a, b) => {
                switch (sortFilter.value) {
                    case 'newest':
                        return new Date(b.startDate) - new Date(a.startDate);
                    case 'oldest':
                        return new Date(a.startDate) - new Date(b.startDate);
                    case 'price-low':
                        return a.currentBid - b.currentBid;
                    case 'price-high':
                        return b.currentBid - a.currentBid;
                    case 'ending-soon':
                        return new Date(a.endDate) - new Date(b.endDate);
                    case 'most-bids':
                        return (b.bidCount || 0) - (a.bidCount || 0);
                    case 'least-bids':
                        return (a.bidCount || 0) - (b.bidCount || 0);
                    default:
                        return 0;
                }
            });
        }

        this.filteredAssets = filtered;
        this.currentPage = 1;
        this.renderAssets();
        this.updateLoadMoreButton();
        this.updateActiveFilters();
    }

    clearAllFilters() {
        // Reset all filter inputs
        const filterInputs = [
            'searchInput', 'categoryFilter', 'locationFilter', 
            'conditionFilter', 'priceRangeFilter', 'endingFilter', 'sortFilter'
        ];
        
        filterInputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.value = '';
            }
        });

        // Reset filters
        this.currentFilters = {
            search: '',
            category: '',
            location: '',
            condition: '',
            priceRange: '',
            ending: '',
            sort: 'newest'
        };

        this.filteredAssets = [...this.assets];
        this.currentPage = 1;
        this.renderAssets();
        this.updateLoadMoreButton();
        this.updateActiveFilters();
    }

    updateActiveFilters() {
        const activeFiltersContainer = document.getElementById('activeFilters');
        if (!activeFiltersContainer) return;

        const activeFilters = [];
        
        // Check each filter
        const filterChecks = [
            { id: 'searchInput', label: 'Search', getValue: (el) => el.value },
            { id: 'categoryFilter', label: 'Category', getValue: (el) => el.options[el.selectedIndex].text },
            { id: 'locationFilter', label: 'Location', getValue: (el) => el.options[el.selectedIndex].text },
            { id: 'conditionFilter', label: 'Condition', getValue: (el) => el.options[el.selectedIndex].text },
            { id: 'priceRangeFilter', label: 'Price Range', getValue: (el) => el.options[el.selectedIndex].text },
            { id: 'endingFilter', label: 'Ending', getValue: (el) => el.options[el.selectedIndex].text }
        ];

        filterChecks.forEach(filter => {
            const element = document.getElementById(filter.id);
            if (element && element.value) {
                activeFilters.push({
                    id: filter.id,
                    label: filter.label,
                    value: filter.getValue(element)
                });
            }
        });

        if (activeFilters.length === 0) {
            activeFiltersContainer.innerHTML = '';
            return;
        }

        activeFiltersContainer.innerHTML = activeFilters.map(filter => `
            <div class="active-filter">
                <span>${filter.label}: ${filter.value}</span>
                <button class="active-filter-remove" onclick="assetsListHandler.removeActiveFilter('${filter.id}')">&times;</button>
            </div>
        `).join('');
    }

    removeActiveFilter(filterId) {
        const element = document.getElementById(filterId);
        if (element) {
            element.value = '';
            this.applyFilters();
        }
    }

    bindSearchSuggestions() {
        const searchInput = document.getElementById('searchInput');
        const suggestionsContainer = document.getElementById('searchSuggestions');
        
        if (!searchInput || !suggestionsContainer) return;

        searchInput.addEventListener('focus', () => {
            if (searchInput.value.length > 0) {
                this.showSearchSuggestions(searchInput.value);
            }
        });

        searchInput.addEventListener('blur', () => {
            setTimeout(() => {
                suggestionsContainer.style.display = 'none';
            }, 200);
        });

        searchInput.addEventListener('input', (e) => {
            if (e.target.value.length > 0) {
                this.showSearchSuggestions(e.target.value);
            } else {
                suggestionsContainer.style.display = 'none';
            }
        });
    }

    showSearchSuggestions(searchTerm) {
        const suggestionsContainer = document.getElementById('searchSuggestions');
        if (!suggestionsContainer) return;

        const suggestions = this.getSearchSuggestions(searchTerm);
        
        if (suggestions.length === 0) {
            suggestionsContainer.style.display = 'none';
            return;
        }

        suggestionsContainer.innerHTML = suggestions.map(suggestion => `
            <div class="search-suggestion" onclick="assetsListHandler.selectSuggestion('${suggestion}')">
                ${suggestion}
            </div>
        `).join('');

        suggestionsContainer.style.display = 'block';
    }

    getSearchSuggestions(searchTerm) {
        const suggestions = new Set();
        const term = searchTerm.toLowerCase();

        this.assets.forEach(asset => {
            if (asset.title.toLowerCase().includes(term)) {
                suggestions.add(asset.title);
            }
            if (asset.location.toLowerCase().includes(term)) {
                suggestions.add(asset.location);
            }
        });

        return Array.from(suggestions).slice(0, 5);
    }

    selectSuggestion(suggestion) {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = suggestion;
            this.handleSearch(suggestion);
        }
        
        const suggestionsContainer = document.getElementById('searchSuggestions');
        if (suggestionsContainer) {
            suggestionsContainer.style.display = 'none';
        }
    }

    handleSortChange() {
        const sortFilter = document.getElementById('sortFilter');
        const sortBy = sortFilter.value;
        
        this.filteredAssets.sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.startDate) - new Date(a.startDate);
                case 'oldest':
                    return new Date(a.startDate) - new Date(b.startDate);
                case 'price-low':
                    return (a.startingBid || a.currentBid || 0) - (b.startingBid || b.currentBid || 0);
                case 'price-high':
                    return (b.startingBid || b.currentBid || 0) - (a.startingBid || a.currentBid || 0);
                case 'ending-soon':
                    return new Date(a.endDate) - new Date(b.endDate);
                default:
                    return 0;
            }
        });
        
        this.currentPage = 1;
        this.renderAssets();
        this.updateLoadMoreButton();
    }

    renderAssets() {
        const assetsGrid = document.getElementById('assetsGrid');
        if (!assetsGrid) return;

        const startIndex = 0;
        const endIndex = this.currentPage * this.itemsPerPage;
        const assetsToShow = this.filteredAssets.slice(startIndex, endIndex);

        if (assetsToShow.length === 0) {
            assetsGrid.innerHTML = this.getEmptyStateHTML();
            return;
        }

        assetsGrid.innerHTML = assetsToShow.map(asset => this.createAssetCard(asset)).join('');
    }

    createAssetCard(asset) {
        const endDate = new Date(asset.endDate);
        const now = new Date();
        const timeRemaining = this.getTimeRemaining(endDate);
        const isEndingSoon = (endDate - now) < (24 * 60 * 60 * 1000); // Less than 24 hours

        return `
            <div class="asset-card" data-asset-id="${asset.id}">
                <div class="asset-image">
                    <img src="${asset.images[0]}" alt="${asset.title}" loading="lazy">
                    ${asset.badge ? `<div class="asset-badge ${asset.badge}">${this.getBadgeText(asset.badge)}</div>` : ''}
                </div>
                <div class="asset-content">
                    <h3 class="asset-title">${asset.title}</h3>
                    ${this.isLoggedIn ? `<div class="asset-location">${asset.location}</div>` : ''}
                    ${this.isLoggedIn ? `<div class="asset-date">Ends: ${endDate.toLocaleDateString()}</div>` : ''}
                    <div class="asset-price">
                        <div>
                            <div class="current-bid">BWP ${(asset.startingBid || asset.currentBid || 0).toLocaleString()}</div>
                            <div class="bid-label">Starting Price</div>
                        </div>
                    </div>
                    <div class="asset-actions">
                        <button class="btn-view" onclick="assetsListHandler.viewAssetDetails('${asset.id}')">
                            View Details
                        </button>
                        ${!this.isLoggedIn ? `
                            <button class="btn-login" onclick="assetsListHandler.showLoginModal()">
                                Login for More
                            </button>
                        ` : `
                            <button class="btn-view" onclick="assetsListHandler.bookItem('${asset.id}')">
                                Book Item
                            </button>
                        `}
                    </div>
                </div>
            </div>
        `;
    }

    getBadgeText(badge) {
        const badgeTexts = {
            'new': 'New',
            'ending-soon': 'Ending Soon'
        };
        return badgeTexts[badge] || badge;
    }

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

    getEmptyStateHTML() {
        return `
            <div class="empty-state">
                <h3>No Assets Found</h3>
                <p>No assets match your current filters. Try adjusting your search criteria.</p>
            </div>
        `;
    }

    viewAssetDetails(assetId) {
        // Allow visitors to view limited details
        const asset = this.assets.find(a => a.id === assetId);
        if (!asset) return;

        this.showAssetModal(asset);
    }

    showAssetModal(asset) {
        const modal = document.getElementById('assetModal');
        const title = document.getElementById('assetModalTitle');
        const content = document.getElementById('assetDetailsContent');

        if (title) title.textContent = asset.title;
        
        if (content) {
            content.innerHTML = `
                <div class="asset-details-content">
                    <div class="asset-details-image">
                        <img src="${asset.images[0]}" alt="${asset.title}">
                    </div>
                    <div class="asset-details-info">
                        <h4>${asset.title}</h4>
                        <p><strong>Starting Price:</strong> BWP ${(asset.startingBid || asset.currentBid || 0).toLocaleString()}</p>
                        ${this.isLoggedIn ? `
                            <p><strong>Location:</strong> ${asset.location}</p>
                            <p><strong>Condition:</strong> ${asset.condition}</p>
                            <p><strong>Ends:</strong> ${new Date(asset.endDate).toLocaleString()}</p>
                            <div class="price">BWP ${(asset.startingBid || asset.currentBid || 0).toLocaleString()}</div>
                            <p>${asset.description}</p>
                            <div class="contact-info">
                                <h5>Contact Information</h5>
                                <p><strong>Name:</strong> ${asset.contactInfo.name}</p>
                                <p><strong>Email:</strong> ${asset.contactInfo.email}</p>
                                <p><strong>Phone:</strong> ${asset.contactInfo.phone}</p>
                            </div>
                        ` : `
                            <div class="login-prompt" style="margin-top: 20px; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
                                <p style="margin: 0 0 10px 0;"><strong>Login required to view:</strong></p>
                                <ul style="margin: 0; padding-left: 20px;">
                                    <li>Location</li>
                                    <li>Contact Information</li>
                                    <li>Full Description</li>
                                </ul>
                                <button class="btn-login" onclick="assetsListHandler.showLoginModal(); assetsListHandler.closeModal('assetModal');" style="margin-top: 10px;">
                                    Login to View More
                                </button>
                            </div>
                        `}
                    </div>
                </div>
            `;
        }

        this.showModal('assetModal');
    }

    showLoginModal() {
        this.showModal('loginModal');
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

    loadMoreAssets() {
        this.currentPage++;
        this.renderAssets();
        this.updateLoadMoreButton();
    }

    updateLoadMoreButton() {
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (!loadMoreBtn) return;

        const totalItems = this.filteredAssets.length;
        const itemsShown = this.currentPage * this.itemsPerPage;
        
        if (itemsShown >= totalItems) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.style.display = 'block';
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.assetsListHandler = new AssetsListHandler();
});

// Export for use in other files
window.AssetsListHandler = AssetsListHandler;

