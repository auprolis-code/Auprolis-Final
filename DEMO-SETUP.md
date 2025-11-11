# Auprolis Demo Setup Guide

This guide will help you run the Auprolis application locally for demonstration purposes.

## Quick Start (No Installation Required)

### Option 1: Using Python Simple HTTP Server (Recommended)

1. **Install Python** (if not already installed)
   - Download from https://www.python.org/downloads/

2. **Open Command Line/Terminal** in the project directory:
   ```bash
   cd C:\Users\Admin\Desktop\Auprolis-Final
   ```

3. **Start the server:**
   
   For Python 3:
   ```bash
   python -m http.server 8000
   ```
   
   For Python 2:
   ```bash
   python -m SimpleHTTPServer 8000
   ```

4. **Open your browser and navigate to:**
   ```
   http://localhost:8000
   ```

### Option 2: Using Node.js (if installed)

1. Install http-server globally:
   ```bash
   npm install -g http-server
   ```

2. Navigate to project directory and run:
   ```bash
   http-server
   ```

3. Open browser to the URL shown (usually `http://localhost:8080`)

### Option 3: Using VS Code Live Server

1. Install "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

## Demo Login Credentials

The application works in **demo mode** with the following accounts:

### Buyer Account
- **Email:** `buyer@demo.com`
- **Password:** Any password (leave it blank or type anything)
- **Dashboard:** Buyer Dashboard

### Seller/Sheriff Account
- **Email:** `seller@demo.com`
- **Password:** Any password (leave it blank or type anything)
- **Dashboard:** Sheriff/Seller Dashboard

### Admin Account
- **Email:** `admin@demo.com`
- **Password:** Any password (leave it blank or type anything)
- **Dashboard:** Admin Dashboard

## Features Available in Demo Mode

✅ **Browse Assets** - View available auction listings
✅ **Authentication** - Login/Logout functionality
✅ **Seller Dashboard** - Create and manage listings
✅ **Buyer Dashboard** - View bids and watchlist
✅ **Bidding System** - Place bids on assets
✅ **Filter & Search** - Search and filter assets
✅ **Demo Data** - Pre-populated with sample data

## Application Pages

1. **index.html** - Landing page
2. **login.html** - Login page
3. **assets-list.html** - Browse all assets
4. **sheriff-dashboard.html** - Seller/Sheriff dashboard
5. **buyer-dashboard.html** - Buyer dashboard
6. **admin-dashboard.html** - Admin dashboard

## Troubleshooting

### Issues with local file access
- Modern browsers may block `file://` URLs
- **Solution:** Always use an HTTP server (Options 1, 2, or 3 above)

### Authentication not working
- Demo mode uses localStorage instead of Firebase
- Clear your browser cache and try again
- Make sure demo scripts are loaded

### Assets not showing
- Check browser console for errors (F12)
- Verify JavaScript files are loading
- Try refreshing the page

## Technical Notes

- **Demo Mode:** Uses localStorage to simulate a database
- **No Internet Required:** Works completely offline after initial load
- **Data Persistence:** Demo data is stored in browser localStorage
- **Reset Demo:** Clear browser localStorage to reset to initial state

## File Structure

```
Auprolis-Final/
├── index.html                  # Main landing page
├── login.html                  # Login page
├── assets-list.html            # Browse assets
├── sheriff-dashboard.html      # Seller dashboard
├── buyer-dashboard.html         # Buyer dashboard
├── admin-dashboard.html         # Admin dashboard
├── assets/
│   ├── js/
│   │   ├── demo-data.js        # Demo data (assets, users, bids)
│   │   ├── demo-mode.js        # Demo mode authentication
│   │   ├── firebase-config.js   # Firebase configuration
│   │   └── [other JS files]
│   ├── css/
│   └── images/
├── DEMO-SETUP.md              # This file
└── README.md                   # Project documentation
```

## Demo Accounts Summary

| Role | Email | Use Case |
|------|-------|----------|
| Buyer | buyer@demo.com | Browse assets, place bids |
| Seller | seller@demo.com | Create listings, manage auctions |
| Admin | admin@demo.com | Manage users and system |

## Support

For issues or questions:
1. Check browser console for errors (F12)
2. Ensure you're using an HTTP server, not opening files directly
3. Try clearing browser cache
4. Check that all JavaScript files are loading

---

**Enjoy your demo!** 🎉
