// Google Sheets Service
// This service handles reading from and preparing data for Google Sheets
class GoogleSheetsService {
    constructor() {
        // Google Sheets ID from the URL
        // URL format: https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit
        this.sheetId = '1lMVPGTNptVxn8NS7937FtxI9NAC5VeJKlXEPL5pTwmg';
        this.sheetUrl = `https://docs.google.com/spreadsheets/d/${this.sheetId}/edit?usp=sharing`;
        
        // Published sheet ID (from the published iframe URL)
        this.publishId = '2PACX-1vR8AZwbrIMdHniji0S-V_ycya87sIzLijqWA8VvAiq4DzqugeZPjc4FxYd7L2dENddUZiuiRr99fshK';
        
        // CSV export URLs for different tabs (if sheet is published)
        // Note: This requires the sheet to be published to the web
        // Format: gid is the tab ID from the URL when you click on each tab
        // Buyers tab gid: 0 (verified from URL)
        // Sheriff tab gid: 2054246567 (verified from URL)
        // Listings tab gid: 845839268 (verified from URL)
        this.csvExportUrls = {
            buyers: `https://docs.google.com/spreadsheets/d/${this.sheetId}/gviz/tq?tqx=out:csv&gid=0`,
            sheriffs: `https://docs.google.com/spreadsheets/d/${this.sheetId}/gviz/tq?tqx=out:csv&gid=2054246567`,
            listings: `https://docs.google.com/spreadsheets/d/${this.sheetId}/gviz/tq?tqx=out:csv&gid=845839268`
        };
        
        // Alternative: Published CSV URLs (if the above doesn't work, try these)
        // Using the same gid values
        this.publishedCsvUrls = {
            buyers: `https://docs.google.com/spreadsheets/d/e/${this.publishId}/pub?output=csv&gid=0`,
            sheriffs: `https://docs.google.com/spreadsheets/d/e/${this.publishId}/pub?output=csv&gid=2054246567`,
            listings: `https://docs.google.com/spreadsheets/d/e/${this.publishId}/pub?output=csv&gid=845839268`
        };
        
        // Cache for sheet data
        this.cachedData = {
            buyers: null,
            sheriffs: null,
            listings: null
        };
        this.cacheTimestamp = {
            buyers: null,
            sheriffs: null,
            listings: null
        };
        this.cacheDuration = 5 * 60 * 1000; // 5 minutes
        
        // Real-time polling interval (30 seconds)
        this.pollingInterval = 30 * 1000;
        this.pollingTimer = null;
    }

    /**
     * Get the Google Sheets URL for manual editing
     */
    getSheetUrl() {
        return this.sheetUrl;
    }

    /**
     * Open Google Sheets in a new tab
     */
    openSheet() {
        window.open(this.sheetUrl, '_blank');
    }

    /**
     * Prepare user data for adding to Google Sheets
     * Returns a formatted string that can be copied or used to open Google Sheets
     * @param {Object} userData - User data object
     * @param {string} tabName - 'buyers' or 'sheriffs' - which tab to add to
     */
    prepareUserDataForSheet(userData, tabName) {
        const {
            firstName,
            lastName,
            email,
            phone
        } = userData;

        // Format: First Name, Last Name, Email, Phone
        const rowData = [
            firstName || '',
            lastName || '',
            email || '',
            phone || ''
        ];

        return rowData.join('\t'); // Tab-separated for easy paste into Google Sheets
    }

    /**
     * Get the URL to open a specific tab in Google Sheets
     */
    getTabUrl(tabName) {
        // Google Sheets URL with tab parameter
        // Using the actual gid values from the sheet
        const gidMap = {
            'buyers': '0',
            'sheriffs': '2054246567',
            'listings': '845839268'
        };
        const gid = gidMap[tabName] || '0';
        return `${this.sheetUrl}#gid=${gid}`;
    }

    /**
     * Read data from a specific tab in Google Sheets (if published)
     * Note: This requires the sheet to be published to the web as CSV
     * @param {string} tabName - 'buyers' or 'sheriffs'
     */
    async readSheetData(tabName = null) {
        try {
            // If no tab specified, read from both tabs
            if (!tabName) {
                const buyers = await this.readSheetData('buyers');
                const sheriffs = await this.readSheetData('sheriffs');
                // Combine and add userType
                const allUsers = [
                    ...buyers.map(u => ({ ...u, userType: 'buyer' })),
                    ...sheriffs.map(u => ({ ...u, userType: 'sheriff' }))
                ];
                return allUsers;
            }

            // Check cache first
            if (this.cachedData[tabName] && this.cacheTimestamp[tabName]) {
                const now = Date.now();
                if (now - this.cacheTimestamp[tabName] < this.cacheDuration) {
                    return this.cachedData[tabName];
                }
            }

            // Get the CSV export URL for the specific tab
            // Try the sheet ID method first, then fallback to published URL
            let csvUrl = this.csvExportUrls[tabName];
            let usePublished = false;
            
            if (!csvUrl) {
                console.warn(`No CSV URL configured for tab: ${tabName}`);
                return [];
            }

            // Try to fetch CSV data
            let response = await fetch(csvUrl);
            
            // If the first method fails, try the published URL method
            if (!response.ok && this.publishedCsvUrls[tabName]) {
                console.log(`Trying published URL for ${tabName} tab...`);
                csvUrl = this.publishedCsvUrls[tabName];
                response = await fetch(csvUrl);
                usePublished = true;
            }
            
            if (!response.ok) {
                throw new Error(`Failed to fetch sheet data for ${tabName} (tried both methods)`);
            }

            const csvText = await response.text();
            console.log(`📥 CSV data received for ${tabName} tab (${csvText.length} characters)`);
            console.log('CSV preview (first 500 chars):', csvText.substring(0, 500));
            
            const users = this.parseCSV(csvText);
            console.log(`✓ Parsed ${users.length} users from ${tabName} tab`);
            if (users.length > 0) {
                console.log(`Sample user from ${tabName}:`, users[0]);
            }
            
            // Cache the data
            this.cachedData[tabName] = users;
            this.cacheTimestamp[tabName] = Date.now();
            
            return users;
        } catch (error) {
            console.error(`Error reading Google Sheets tab ${tabName}:`, error);
            // Return empty array if sheet is not published or accessible
            return [];
        }
    }

    /**
     * Parse CSV text into user objects
     */
    parseCSV(csvText) {
        const lines = csvText.split('\n').filter(line => line.trim());
        if (lines.length === 0) return [];

        // Parse header line - handle quoted values
        const headerLine = this.parseCSVLine(lines[0]);
        const headers = headerLine.map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());
        console.log('📋 CSV Headers detected:', headers);
        
        const users = [];

        for (let i = 1; i < lines.length; i++) {
            const values = this.parseCSVLine(lines[i]);
            if (values.length === 0) continue;

            const user = {};
            headers.forEach((header, index) => {
                if (values[index] !== undefined) {
                    // Remove quotes and trim
                    const value = values[index].trim().replace(/^"|"$/g, '');
                    user[header] = value;
                }
            });

            console.log(`  Row ${i + 1} parsed:`, user);

            // Find email field - try multiple variations
            let email = null;
            const emailVariations = ['email', 'email address', 'e-mail', 'e mail'];
            for (const emailKey of emailVariations) {
                if (user[emailKey] && user[emailKey].trim()) {
                    email = user[emailKey].trim().toLowerCase();
                    break;
                }
            }

            // Only add if email exists
            if (email) {
                // Find first name - try multiple variations
                const firstNameVariations = ['first name', 'firstname', 'first', 'fname', 'given name'];
                let firstName = '';
                for (const key of firstNameVariations) {
                    if (user[key] && user[key].trim()) {
                        firstName = user[key].trim();
                        break;
                    }
                }

                // Find last name - try multiple variations
                const lastNameVariations = ['last name', 'lastname', 'last', 'lname', 'surname', 'family name'];
                let lastName = '';
                for (const key of lastNameVariations) {
                    if (user[key] && user[key].trim()) {
                        lastName = user[key].trim();
                        break;
                    }
                }

                // Find phone - try multiple variations
                const phoneVariations = ['phone', 'phone number', 'phonenumber', 'mobile', 'cell', 'telephone'];
                let phone = '';
                for (const key of phoneVariations) {
                    if (user[key] && user[key].trim()) {
                        phone = user[key].trim();
                        break;
                    }
                }

                const parsedUser = {
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    phone: phone
                };
                users.push(parsedUser);
                console.log(`  ✅ Parsed user: ${parsedUser.email} (${parsedUser.firstName} ${parsedUser.lastName})`);
            } else {
                console.warn(`  ⚠ Skipping row ${i + 1}: No email found.`);
                console.warn(`     Headers:`, headers);
                console.warn(`     Values:`, values);
                console.warn(`     Parsed user object:`, user);
            }
        }

        return users;
    }

    /**
     * Parse a CSV line handling quoted values
     */
    parseCSVLine(line) {
        const values = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        values.push(current);
        
        return values;
    }

    /**
     * Check if a user exists in Google Sheets (checks both buyers and sheriffs tabs)
     * @returns {Object|null} User object with userType property, or null if not found
     */
    async checkUserExists(email) {
        try {
            const emailLower = email.toLowerCase();
            console.log('🔍 Checking Google Sheets for user:', emailLower);
            
            // Check buyers tab
            console.log('📊 Reading Buyers tab...');
            const buyers = await this.readSheetData('buyers');
            console.log(`✓ Found ${buyers.length} users in Buyers tab`);
            if (buyers.length > 0) {
                console.log('Buyers tab users:', buyers.map(u => u.email));
            }
            
            const buyerUser = buyers.find(user => user.email === emailLower);
            if (buyerUser) {
                console.log('✅ User found in Buyers tab:', buyerUser);
                return { ...buyerUser, userType: 'buyer' };
            }
            
            // Check sheriffs tab
            console.log('📊 Reading Sheriffs tab...');
            const sheriffs = await this.readSheetData('sheriffs');
            console.log(`✓ Found ${sheriffs.length} users in Sheriffs tab`);
            if (sheriffs.length > 0) {
                console.log('Sheriffs tab users:', sheriffs.map(u => u.email));
            }
            
            const sheriffUser = sheriffs.find(user => user.email === emailLower);
            if (sheriffUser) {
                console.log('✅ User found in Sheriffs tab:', sheriffUser);
                return { ...sheriffUser, userType: 'sheriff' };
            }
            
            console.warn('❌ User not found in either tab. Searched for:', emailLower);
            console.log('Available emails in Buyers:', buyers.map(u => u.email));
            console.log('Available emails in Sheriffs:', sheriffs.map(u => u.email));
            return null;
        } catch (error) {
            console.error('❌ Error checking user in Google Sheets:', error);
            console.error('Error details:', error.message, error.stack);
            return null;
        }
    }

    /**
     * Get all users of a specific type from Google Sheets
     */
    async getUsersByType(userType) {
        try {
            const tabName = userType.toLowerCase() === 'sheriff' ? 'sheriffs' : 'buyers';
            return await this.readSheetData(tabName);
        } catch (error) {
            console.error('Error getting users by type:', error);
            return [];
        }
    }

    /**
     * Generate a Google Sheets URL with pre-filled data (using Google Forms approach)
     * Since we can't directly write, we'll prepare the data for manual entry
     */
    generateAddUserUrl(userData) {
        // Return the sheet URL - admin can manually add
        // In a production environment, you'd use Google Apps Script or API
        return this.sheetUrl;
    }

    /**
     * Copy user data to clipboard in a format ready for Google Sheets
     * @param {Object} userData - User data object
     * @param {string} tabName - 'buyers' or 'sheriffs' - which tab to add to
     */
    async copyUserDataToClipboard(userData, tabName) {
        const formattedData = this.prepareUserDataForSheet(userData, tabName);
        try {
            await navigator.clipboard.writeText(formattedData);
            return true;
        } catch (error) {
            console.error('Error copying to clipboard:', error);
            // Fallback: show data in alert
            alert(`Copy this data to the ${tabName} tab in Google Sheets:\n\n${formattedData}`);
            return false;
        }
    }

    /**
     * Open Google Sheets with a specific tab selected
     * @param {string} tabName - 'buyers' or 'sheriffs'
     */
    openSheetTab(tabName) {
        const tabUrl = this.getTabUrl(tabName);
        window.open(tabUrl, '_blank');
    }

    /**
     * Get the published iframe URL for embedding
     * @returns {string} Published iframe URL
     */
    getPublishedIframeUrl() {
        return `https://docs.google.com/spreadsheets/d/e/${this.publishId}/pubhtml?widget=true&headers=false`;
    }

    /**
     * Helper method to find the correct gid (tab ID) values
     * To find the correct gid values:
     * 1. Open your Google Sheet
     * 2. Click on the tab you want (e.g., "Buyers")
     * 3. Look at the URL - it will have #gid=XXXXX at the end
     * 4. The XXXXX is your gid value
     * 5. Update the csvExportUrls in the constructor with the correct gid values
     */
    getTabGidInstructions() {
        return {
            buyers: 'Open the Buyers tab and check the URL for #gid=XXXXX',
            sheriffs: 'Open the Sheriffs tab and check the URL for #gid=XXXXX',
            note: 'Update the gid values in csvExportUrls in the constructor'
        };
    }

    /**
     * Read listings from Google Sheets
     * @returns {Array} Array of listing objects
     */
    async readListings() {
        try {
            // Check cache first
            if (this.cachedData.listings && this.cacheTimestamp.listings) {
                const now = Date.now();
                if (now - this.cacheTimestamp.listings < this.cacheDuration) {
                    return this.cachedData.listings;
                }
            }

            let csvUrl = this.csvExportUrls.listings;
            let usePublished = false;
            
            if (!csvUrl) {
                console.warn('Listings tab URL not configured.');
                return [];
            }

            // Try to fetch CSV data
            let response = await fetch(csvUrl);
            
            // If the first method fails, try the published URL method
            if (!response.ok && this.publishedCsvUrls.listings) {
                console.log('Trying published URL for listings tab...');
                csvUrl = this.publishedCsvUrls.listings;
                response = await fetch(csvUrl);
                usePublished = true;
            }
            
            if (!response.ok) {
                throw new Error(`Failed to fetch listings from Google Sheets`);
            }

            const csvText = await response.text();
            console.log(`📥 CSV data received for listings tab (${csvText.length} characters)`);
            
            const listings = this.parseListingsCSV(csvText);
            console.log(`✓ Parsed ${listings.length} listings from Google Sheets`);
            
            // Cache the data
            this.cachedData.listings = listings;
            this.cacheTimestamp.listings = Date.now();
            
            return listings;
        } catch (error) {
            console.error('Error reading listings from Google Sheets:', error);
            return [];
        }
    }

    /**
     * Parse listings CSV into listing objects
     */
    parseListingsCSV(csvText) {
        const lines = csvText.split('\n').filter(line => line.trim());
        if (lines.length === 0) return [];

        // Parse header line
        const headerLine = this.parseCSVLine(lines[0]);
        const headers = headerLine.map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());
        console.log('📋 Listings CSV Headers detected:', headers);
        
        const listings = [];

        for (let i = 1; i < lines.length; i++) {
            const values = this.parseCSVLine(lines[i]);
            if (values.length === 0) continue;

            const listing = {};
            headers.forEach((header, index) => {
                if (values[index] !== undefined) {
                    const value = values[index].trim().replace(/^"|"$/g, '');
                    listing[header] = value;
                }
            });

            // Map CSV columns to listing object structure
            // Columns: Title, Category, Location, Description, Starting Bid, Current Bid, End date, Images, Seller ID, Seller Name, Seller Email, Status, Condition
            // Note: Only Starting Bid is used (platform is for reservations, not bidding)
            const mappedListing = {
                id: listing.id || `listing-${Date.now()}-${i}`,
                title: listing.title || '',
                category: listing.category || '',
                location: listing.location || '',
                description: listing.description || '',
                startingBid: parseFloat(listing['starting bid'] || listing.startingbid || listing.price || 0),
                // Keep currentBid for backward compatibility, but it equals startingBid
                currentBid: parseFloat(listing['starting bid'] || listing.startingbid || listing.price || 0),
                endDate: listing['end date'] || listing.enddate || listing['auction end'] || '',
                images: listing.images ? listing.images.split(',').map(img => img.trim()).filter(img => img) : (listing.image ? [listing.image] : ['assets/images/placeholder.jpg']),
                sellerId: listing['seller id'] || listing.sellerid || '',
                sellerName: listing['seller name'] || listing.sellername || '',
                sellerEmail: listing['seller email'] || listing.selleremail || '',
                sellerType: listing['seller type'] || listing.sellertype || 'sheriff',
                status: (listing.status || 'active').toLowerCase(),
                condition: listing.condition || 'used',
                // Use seller info for contact (no separate contact fields)
                contactInfo: {
                    name: listing['seller name'] || listing.sellername || '',
                    email: listing['seller email'] || listing.selleremail || '',
                    phone: '' // Phone not in sheet, can be added later if needed
                },
                viewCount: parseInt(listing['view count'] || listing.viewcount || 0),
                createdAt: listing['created at'] || listing.createdat || new Date().toISOString()
            };

            // Validate required fields
            if (mappedListing.title && mappedListing.location) {
                listings.push(mappedListing);
                console.log(`  ✅ Parsed listing: ${mappedListing.title}`);
            } else {
                console.warn(`  ⚠ Skipping row ${i + 1}: Missing required fields (title or location)`);
            }
        }

        return listings;
    }

    /**
     * Start real-time polling for listings
     * @param {Function} callback - Function to call when listings are updated
     * @param {number} interval - Polling interval in milliseconds (default: 30 seconds)
     */
    startListingsPolling(callback, interval = null) {
        const pollInterval = interval || this.pollingInterval;
        
        // Clear existing timer if any
        if (this.pollingTimer) {
            clearInterval(this.pollingTimer);
        }
        
        // Initial fetch
        this.readListings().then(listings => {
            if (callback) callback(listings);
        });
        
        // Set up polling
        this.pollingTimer = setInterval(async () => {
            console.log('🔄 Polling for new listings...');
            const listings = await this.readListings();
            if (callback) callback(listings);
        }, pollInterval);
        
        console.log(`✅ Started real-time listings polling (every ${pollInterval / 1000} seconds)`);
    }

    /**
     * Stop real-time polling
     */
    stopListingsPolling() {
        if (this.pollingTimer) {
            clearInterval(this.pollingTimer);
            this.pollingTimer = null;
            console.log('⏹ Stopped listings polling');
        }
    }

    /**
     * Prepare listing data for Google Sheets
     * Formats listing data to match the Google Sheets structure
     * @param {Object} listingData - Listing data object
     * @returns {Object} Formatted listing data ready for Google Sheets
     */
    prepareListingForSheet(listingData) {
        // Format dates for Google Sheets (ISO format or readable format)
        const formatDate = (date) => {
            if (!date) return '';
            const d = date instanceof Date ? date : new Date(date);
            if (isNaN(d.getTime())) return '';
            // Format as YYYY-MM-DD HH:MM:SS for Google Sheets
            return d.toISOString().replace('T', ' ').substring(0, 19);
        };

        // Format images as comma-separated string
        const imagesStr = Array.isArray(listingData.images) 
            ? listingData.images.join(', ') 
            : (listingData.images || '');

        // Map to Google Sheets column structure
        // Expected columns: Title, Category, Location, Description, Starting Bid, Current Bid, End date, Images, Seller ID, Seller Name, Seller Email, Status, Condition
        return {
            'Title': listingData.title || '',
            'Category': listingData.category || '',
            'Location': listingData.location || '',
            'Description': listingData.description || '',
            'Starting Bid': listingData.startingBid || listingData.currentBid || 0,
            'Current Bid': listingData.currentBid || listingData.startingBid || 0,
            'End date': formatDate(listingData.endDate),
            'Images': imagesStr,
            'Seller ID': listingData.sellerId || '',
            'Seller Name': listingData.sellerName || listingData.contactInfo?.name || '',
            'Seller Email': listingData.sellerEmail || listingData.contactInfo?.email || '',
            'Status': listingData.status || 'active',
            'Condition': listingData.condition || '',
            'Created at': formatDate(listingData.createdAt || new Date())
        };
    }

    /**
     * Copy listing data to clipboard in Google Sheets format
     * @param {Object} listingData - Listing data object
     * @returns {Promise<boolean>} Success status
     */
    async copyListingToClipboard(listingData) {
        try {
            const formatted = this.prepareListingForSheet(listingData);
            // Convert to tab-separated values for easy paste into Google Sheets
            const rowData = Object.values(formatted).join('\t');
            
            await navigator.clipboard.writeText(rowData);
            console.log('✅ Listing data copied to clipboard');
            return true;
        } catch (error) {
            console.error('Error copying listing to clipboard:', error);
            // Fallback: show data in alert
            const formatted = this.prepareListingForSheet(listingData);
            const rowData = Object.entries(formatted)
                .map(([key, value]) => `${key}: ${value}`)
                .join('\n');
            alert(`Copy this data to the Listings tab in Google Sheets:\n\n${rowData}`);
            return false;
        }
    }

    /**
     * Get Google Sheets URL for listings tab
     * @returns {string} URL to listings tab
     */
    getListingsTabUrl() {
        return this.getTabUrl('listings');
    }
}

// Initialize and export
window.googleSheetsService = new GoogleSheetsService();
window.GoogleSheetsService = GoogleSheetsService;

