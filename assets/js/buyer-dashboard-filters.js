// Buyer Dashboard Filters Handler
class BuyerDashboardFilters {
    constructor() {
        this.assets = SAMPLE_ASSETS || [];
        this.filteredAssets = [...this.assets];
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
        this.bindEvents();
    }

    bindEvents() {
        // Search functionality
        const searchInput = document.getElementById('buyerSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(() => {
                    this.handleSearch(e.target.value);
                }, 300);
            });
        }

        const searchBtn = document.getElementById('buyerSearchBtn');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.performSearch());
        }

        // Filter controls
        const filterSelects = [
            'buyerCategoryFilter', 'buyerLocationFilter', 'buyerConditionFilter', 
            'buyerPriceRangeFilter', 'buyerEndingFilter', 'buyerSortFilter'
        ];
        
        filterSelects.forEach(filterId => {
            const filter = document.getElementById(filterId);
            if (filter) {
                filter.addEventListener('change', (e) => this.handleFilterChange());
            }
        });

        // Filter action buttons
        const clearFiltersBtn = document.getElementById('buyerClearFiltersBtn');
        const applyFiltersBtn = document.getElementById('buyerApplyFiltersBtn');
        
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => this.clearAllFilters());
        }
        
        if (applyFiltersBtn) {
            applyFiltersBtn.addEventListener('click', () => this.applyFilters());
        }
    }

    handleSearch(searchTerm) {
        this.currentFilters.search = searchTerm;
        this.applyFilters();
    }

    performSearch() {
        const searchInput = document.getElementById('buyerSearchInput');
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
        const categoryFilter = document.getElementById('buyerCategoryFilter');
        if (categoryFilter && categoryFilter.value) {
            filtered = filtered.filter(asset => asset.category === categoryFilter.value);
        }

        // Apply location filter
        const locationFilter = document.getElementById('buyerLocationFilter');
        if (locationFilter && locationFilter.value) {
            filtered = filtered.filter(asset => 
                asset.location.toLowerCase().includes(locationFilter.value.toLowerCase())
            );
        }

        // Apply condition filter
        const conditionFilter = document.getElementById('buyerConditionFilter');
        if (conditionFilter && conditionFilter.value) {
            filtered = filtered.filter(asset => asset.condition === conditionFilter.value);
        }

        // Apply price range filter
        const priceRangeFilter = document.getElementById('buyerPriceRangeFilter');
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
        const endingFilter = document.getElementById('buyerEndingFilter');
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
        const sortFilter = document.getElementById('buyerSortFilter');
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
                    case 'most-reservations':
                        return (b.reservationCount || 0) - (a.reservationCount || 0);
                    case 'least-reservations':
                        return (a.reservationCount || 0) - (b.reservationCount || 0);
                    default:
                        return 0;
                }
            });
        }

        this.filteredAssets = filtered;
        this.updateActiveFilters();
        
        // Redirect to assets-list with filters applied (or show results in dashboard)
        // For now, we'll just update the active filters display
    }

    clearAllFilters() {
        // Reset all filter inputs
        const filterInputs = [
            'buyerSearchInput', 'buyerCategoryFilter', 'buyerLocationFilter', 
            'buyerConditionFilter', 'buyerPriceRangeFilter', 'buyerEndingFilter', 'buyerSortFilter'
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
        this.updateActiveFilters();
    }

    updateActiveFilters() {
        const activeFiltersContainer = document.getElementById('buyerActiveFilters');
        if (!activeFiltersContainer) return;

        const activeFilters = [];
        
        // Check each filter
        const filterChecks = [
            { id: 'buyerSearchInput', label: 'Search', getValue: (el) => el.value },
            { id: 'buyerCategoryFilter', label: 'Category', getValue: (el) => el.options[el.selectedIndex].text },
            { id: 'buyerLocationFilter', label: 'Location', getValue: (el) => el.options[el.selectedIndex].text },
            { id: 'buyerConditionFilter', label: 'Condition', getValue: (el) => el.options[el.selectedIndex].text },
            { id: 'buyerPriceRangeFilter', label: 'Price Range', getValue: (el) => el.options[el.selectedIndex].text },
            { id: 'buyerEndingFilter', label: 'Ending', getValue: (el) => el.options[el.selectedIndex].text }
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
                <button class="active-filter-remove" onclick="buyerDashboardFilters.removeActiveFilter('${filter.id}')">&times;</button>
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
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('buyerSearchInput')) {
        window.buyerDashboardFilters = new BuyerDashboardFilters();
    }
});

// Export for use in other files
window.BuyerDashboardFilters = BuyerDashboardFilters;

