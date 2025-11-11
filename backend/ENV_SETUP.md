# Environment Variables Setup

Create a `.env` file in the `backend` directory with the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/auprolis
# For MongoDB Atlas (cloud), use:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/auprolis?retryWrites=true&w=majority

# JWT Secret Key (generate a strong random string for production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:5500,http://127.0.0.1:5500
```

## Quick Setup

1. Copy this content to a new file named `.env` in the `backend` directory
2. Update `MONGODB_URI` with your MongoDB connection string
3. Generate a strong random string for `JWT_SECRET` (you can use: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
4. Update `CORS_ORIGIN` with your frontend URL(s)

