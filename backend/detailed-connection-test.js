require('dotenv').config();
const mongoose = require('mongoose');

console.log('🔍 Detailed MongoDB Connection Test');
console.log('====================================\n');

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('❌ MONGODB_URI not found in .env file!');
  process.exit(1);
}

// Show connection string (hide password)
const safeUri = uri.replace(/:[^:@]+@/, ':****@');
console.log('📝 Connection String:', safeUri);
console.log('');

// Parse connection string to verify format
const uriMatch = uri.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@([^/]+)\/([^?]+)/);
if (uriMatch) {
  console.log('✅ Connection String Format: Valid');
  console.log('   Username:', uriMatch[1]);
  console.log('   Password:', uriMatch[2].length > 0 ? '***' + uriMatch[2].slice(-2) : 'EMPTY!');
  console.log('   Host:', uriMatch[3]);
  console.log('   Database:', uriMatch[4]);
  console.log('');
} else {
  console.error('❌ Connection String Format: Invalid!');
  process.exit(1);
}

console.log('🔄 Attempting connection...');
console.log('');

mongoose.connect(uri, {
  serverSelectionTimeoutMS: 15000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000,
})
.then(() => {
  console.log('✅ SUCCESS! MongoDB Connected!');
  console.log('✅ Host:', mongoose.connection.host);
  console.log('✅ Database:', mongoose.connection.name);
  console.log('✅ Ready State:', mongoose.connection.readyState === 1 ? 'Connected' : 'Not Connected');
  console.log('');
  
  // Test ping
  return mongoose.connection.db.admin().ping();
})
.then(() => {
  console.log('✅ Database ping successful!');
  console.log('');
  console.log('🎉 Database is fully set up and working!');
  mongoose.connection.close();
  process.exit(0);
})
.catch((error) => {
  console.error('❌ Connection Error Details:');
  console.error('   Message:', error.message);
  console.error('   Code:', error.code || 'N/A');
  console.log('');
  
  if (error.message.includes('authentication')) {
    console.error('💡 Authentication Error:');
    console.error('   - Check your username and password in MongoDB Atlas');
    console.error('   - Verify the password was changed correctly');
    console.error('   - Make sure the user has proper permissions');
  } else if (error.message.includes('whitelist') || error.message.includes('ENOTFOUND')) {
    console.error('💡 Network/Whitelist Error:');
    console.error('   - IP whitelist might need a few minutes to propagate');
    console.error('   - Try waiting 2-3 minutes and test again');
    console.error('   - Verify 0.0.0.0/0 is active in Network Access');
  } else {
    console.error('💡 Other Error:');
    console.error('   - Check your internet connection');
    console.error('   - Verify MongoDB Atlas cluster is running');
  }
  
  process.exit(1);
});

