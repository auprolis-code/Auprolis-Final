# Quick Start Guide

Follow these steps to get your backend up and running:

## Step 1: Install Dependencies

```bash
cd backend
npm install
```

## Step 2: Set Up MongoDB

### Option A: Local MongoDB
1. Install MongoDB from https://www.mongodb.com/try/download/community
2. Start MongoDB service:
   - Windows: `net start MongoDB`
   - macOS/Linux: `sudo systemctl start mongod`

### Option B: MongoDB Atlas (Cloud - Recommended)
1. Create a free account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in `.env`

## Step 3: Configure Environment Variables

1. Create a `.env` file in the `backend` directory
2. Copy the content from `ENV_SETUP.md` or use:

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/auprolis
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:5500,http://127.0.0.1:5500
```

3. Generate a secure JWT secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   Copy the output and replace `your-super-secret-jwt-key-change-this`

## Step 4: Start the Server

```bash
# Development mode (auto-reload on changes)
npm run dev

# Production mode
npm start
```

You should see:
```
MongoDB Connected: localhost:27017
Server running in development mode on port 3000
```

## Step 5: Test the API

### Test Health Endpoint
```bash
curl http://localhost:3000/api/health
```

### Test User Registration
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "fullName": "Test User",
    "userType": "buyer"
  }'
```

### Test User Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## Next Steps

1. Update your frontend to use the new API endpoints
2. Replace Firebase authentication calls with API calls to `/api/auth/*`
3. Store the JWT token from login response
4. Include the token in Authorization header: `Bearer <token>`

## Troubleshooting

### MongoDB Connection Error
- Make sure MongoDB is running
- Check your `MONGODB_URI` in `.env`
- For MongoDB Atlas, ensure your IP is whitelisted

### Port Already in Use
- Change `PORT` in `.env` to a different port (e.g., 3001)
- Or stop the process using port 3000

### Module Not Found
- Run `npm install` again
- Delete `node_modules` and `package-lock.json`, then run `npm install`









