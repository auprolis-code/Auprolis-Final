# Auprolis Backend API

Backend API server for the Auprolis auction platform, built with Node.js, Express, and MongoDB.

## Features

- User authentication (email/password and Google OAuth)
- User management (CRUD operations)
- JWT-based authentication
- Role-based access control (buyer, seller, admin, sheriff)
- MongoDB database with Mongoose ODM
- RESTful API design

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn

## Installation

1. **Clone the repository and navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and update the following:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A strong random string for JWT token signing
   - `PORT`: Server port (default: 3000)
   - `CORS_ORIGIN`: Frontend URL(s) for CORS

4. **Start MongoDB** (if using local MongoDB)
   ```bash
   # On Windows
   net start MongoDB
   
   # On macOS/Linux
   sudo systemctl start mongod
   ```

5. **Run the server**
   ```bash
   # Development mode (with auto-reload)
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/google` - Google OAuth authentication
- `GET /api/auth/me` - Get current user (Protected)
- `PUT /api/auth/update` - Update current user profile (Protected)

### Users

- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID (Protected)
- `PUT /api/users/:id` - Update user (Protected - self or admin)
- `DELETE /api/users/:id` - Delete user (Admin only)

### Health Check

- `GET /api/health` - Server health check

## API Usage Examples

### Register a User

```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "phone": "+267 712 345 678",
  "userType": "buyer"
}
```

### Login

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Get Current User (Protected)

```bash
GET /api/auth/me
Authorization: Bearer <token>
```

### Update Profile (Protected)

```bash
PUT /api/auth/update
Authorization: Bearer <token>
Content-Type: application/json

{
  "fullName": "John Smith",
  "phone": "+267 712 345 679"
}
```

## User Model

The User model includes the following fields:

- **Authentication**: email, password, googleId
- **Profile**: fullName, firstName, lastName, displayName, phone
- **Role**: userType (buyer, seller, admin, sheriff)
- **Subscription**: subscriptionStatus, paymentStatus
- **Status**: status (active, inactive, suspended, deleted)
- **Permissions**: Array of permission strings
- **Timestamps**: createdAt, updatedAt, lastActivity

## Security

- Passwords are hashed using bcryptjs
- JWT tokens for authentication
- Role-based access control
- Input validation using express-validator
- CORS configuration for frontend access

## Development

The server uses `nodemon` for development, which automatically restarts the server when files change.

```bash
npm run dev
```

## Production Deployment

1. Set `NODE_ENV=production` in your `.env` file
2. Use a strong `JWT_SECRET`
3. Configure proper CORS origins
4. Use MongoDB Atlas or a managed MongoDB service
5. Consider using a process manager like PM2

## Error Handling

All errors are returned in a consistent format:

```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error (development only)"
}
```

## License

ISC









