// Google Sheets Service
// This service handles reading from and preparing data for Google Sheets
class GoogleSheetsService {
    constructor() {
        // Google Sheets ID from the URL
        // URL format: https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit
        this.sheetId = '1lMVPGTNptVxn8NS7937FtxI9NAC5VeJKlXEPL5pTwmg';
        this.sheetUrl = `https://docs.google.com/spreadsheets/d/${this.sheetId}/edit?usp=sharing`;
        
        // CSV export URLs for different tabs (if sheet is published)
        // Note: This requires the sheet to be published to the web
        // Format: gid is the tab ID (0 for first tab, 1 for second, etc.)
        // You may need to adjust these gid values based on your actual sheet structure
        this.csvExportUrls = {
            buyers: `https://docs.google.com/spreadsheets/d/${this.sheetId}/gviz/tq?tqx=out:csv&gid=0`,
            sheriffs: `https://docs.google.com/spreadsheets/d/${this.sheetId}/gviz/tq?tqx=out:csv&gid=1`
        };
        
        // Cache for sheet data
        this.cachedData = {
            buyers: null,
            sheriffs: null
        };
        this.cacheTimestamp = {
            buyers: null,
            sheriffs: null
        };
        this.cacheDuration = 5 * 60 * 1000; // 5 minutes
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
        // The tab name should match the tab name in Google Sheets
        return `${this.sheetUrl}#gid=${tabName === 'buyers' ? '0' : '1'}`;
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
            const csvUrl = this.csvExportUrls[tabName];
            if (!csvUrl) {
                console.warn(`No CSV URL configured for tab: ${tabName}`);
                return [];
            }

            // Try to fetch CSV data
            const response = await fetch(csvUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch sheet data for ${tabName}`);
            }

            const csvText = await response.text();
            const users = this.parseCSV(csvText);
            
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

        // Assume first line is header
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const users = [];

        for (let i = 1; i < lines.length; i++) {
            const values = this.parseCSVLine(lines[i]);
            if (values.length === 0) continue;

            const user = {};
            headers.forEach((header, index) => {
                if (values[index] !== undefined) {
                    user[header] = values[index].trim();
                }
            });

            // Only add if email exists
            if (user.email || user['email address']) {
                users.push({
                    firstName: user['first name'] || user.firstname || '',
                    lastName: user['last name'] || user.lastname || '',
                    email: (user.email || user['email address'] || '').toLowerCase(),
                    phone: user.phone || user['phone number'] || ''
                });
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
            
            // Check buyers tab
            const buyers = await this.readSheetData('buyers');
            const buyerUser = buyers.find(user => user.email === emailLower);
            if (buyerUser) {
                return { ...buyerUser, userType: 'buyer' };
            }
            
            // Check sheriffs tab
            const sheriffs = await this.readSheetData('sheriffs');
            const sheriffUser = sheriffs.find(user => user.email === emailLower);
            if (sheriffUser) {
                return { ...sheriffUser, userType: 'sheriff' };
            }
            
            return null;
        } catch (error) {
            console.error('Error checking user in Google Sheets:', error);
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
}

// Initialize and export
window.googleSheetsService = new GoogleSheetsService();
window.GoogleSheetsService = GoogleSheetsService;

