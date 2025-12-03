const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

// Generate JWT secret
const jwtSecret = crypto.randomBytes(32).toString('hex');

// Connection string template - USER MUST REPLACE <db_password>
const connectionString = 'mongodb+srv://Auprolis:<db_password>@cluster0.vaz6gia.mongodb.net/auprolis?retryWrites=true&w=majority';

const envContent = `# Server Configuration
PORT=3000
NODE_ENV=production

# MongoDB Configuration (MongoDB Atlas)
# IMPORTANT: Replace <db_password> with your actual MongoDB password
MONGODB_URI=${connectionString}

# JWT Secret Key (Auto-generated secure random string)
JWT_SECRET=${jwtSecret}
JWT_EXPIRE=7d

# CORS Configuration (Update with your frontend URL)
CORS_ORIGIN=http://localhost:8000,https://yourusername.github.io
`;

const envPath = path.join(__dirname, '.env');

if (fs.existsSync(envPath)) {
  console.log('⚠️  .env file already exists!');
  console.log('   If you want to recreate it, delete the existing file first.');
  process.exit(1);
}

fs.writeFileSync(envPath, envContent);
console.log('✅ .env file created successfully!');
console.log('');
console.log('⚠️  IMPORTANT: You must edit .env and replace <db_password> with your actual MongoDB password!');
console.log('');
console.log('📝 Next steps:');
console.log('   1. Open backend/.env in a text editor');
console.log('   2. Replace <db_password> with your MongoDB Atlas password');
console.log('   3. Update CORS_ORIGIN with your frontend URL');
console.log('   4. Save the file');
console.log('');
console.log('🔒 Your JWT secret has been auto-generated and is secure.');

