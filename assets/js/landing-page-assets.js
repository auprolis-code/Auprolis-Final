// Landing Page Assets Handler
// Displays 10 assets with even distribution across categories (2 per category)
class LandingPageAssets {
    constructor() {
        this.assets = SAMPLE_ASSETS || [];
        this.categories = ['vehicles', 'property', 'equipment', 'furniture', 'electronics'];
        this.itemsPerCategory = 2; // 10 total items / 5 categories = 2 per category
        this.init();
    }

    init() {
        this.renderFeaturedAssets();
    }

    /**
     * Selects assets with even distribution across categories
     * Returns 2 items from each category
     */
    selectFeaturedAssets() {
        const selectedAssets = [];
        
        // Group assets by category
        const assetsByCategory = {};
        this.categories.forEach(category => {
            assetsByCategory[category] = this.assets.filter(asset => 
                asset.category === category && asset.isActive !== false
            );
        });

        // Select 2 items from each category
        this.categories.forEach(category => {
            const categoryAssets = assetsByCategory[category] || [];
            
            // Shuffle to get variety (so it's not always the same items)
            const shuffled = this.shuffleArray([...categoryAssets]);
            
            // Take up to itemsPerCategory items
            const selected = shuffled.slice(0, this.itemsPerCategory);
            selectedAssets.push(...selected);
        });

        // If we don't have enough items, fill with remaining assets
        if (selectedAssets.length < 10) {
            const remaining = this.assets.filter(asset => 
                !selectedAssets.find(selected => selected.id === asset.id) && asset.isActive !== false
            );
            selectedAssets.push(...remaining.slice(0, 10 - selectedAssets.length));
        }

        return selectedAssets.slice(0, 10);
    }

    /**
     * Shuffle array to randomize selection
     */
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    /**
     * Creates HTML for a single asset card
     */
    createAssetCard(asset) {
        const price = (asset.startingBid || asset.currentBid || 0).toLocaleString();
        const imageSrc = asset.images && asset.images.length > 0 ? asset.images[0] : 'assets/images/placeholder.png';
        
        return `
            <div class="asset-card">
                <div class="asset-image">
                    <img src="${imageSrc}" alt="${asset.title}">
                </div>
                <div class="asset-content">
                    <h3>${asset.title}</h3>
                    <div class="asset-price" style="margin: 1rem 0;">
                        <div>
                            <div style="font-size: 1.1rem; font-weight: 600; color: #1e293b;">BWP ${price}</div>
                            <div style="font-size: 0.8rem; color: #64748b;">Starting Price</div>
                        </div>
                    </div>
                    <a href="login.html" class="btn btn-outline">View Details</a>
                </div>
            </div>
        `;
    }

    /**
     * Renders featured assets to the page
     */
    renderFeaturedAssets() {
        const assetsGrid = document.getElementById('featuredAssetsGrid');
        if (!assetsGrid) return;

        const featuredAssets = this.selectFeaturedAssets();
        
        if (featuredAssets.length === 0) {
            assetsGrid.innerHTML = '<p>No assets available at the moment.</p>';
            return;
        }

        assetsGrid.innerHTML = featuredAssets.map(asset => this.createAssetCard(asset)).join('');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Wait for SAMPLE_ASSETS to be available
    if (typeof SAMPLE_ASSETS !== 'undefined') {
        window.landingPageAssets = new LandingPageAssets();
    } else {
        // If assets data isn't loaded yet, wait a bit and try again
        setTimeout(() => {
            if (typeof SAMPLE_ASSETS !== 'undefined') {
                window.landingPageAssets = new LandingPageAssets();
            }
        }, 100);
    }
});

// Export for use in other files
window.LandingPageAssets = LandingPageAssets;

