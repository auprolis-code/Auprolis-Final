require('dotenv').config();
const mongoose = require('mongoose');

console.log('🔍 Testing MongoDB Connection...');
console.log('📝 Connection String:', process.env.MONGODB_URI ? process.env.MONGODB_URI.replace(/:[^:@]+@/, ':****@') : 'NOT FOUND');
console.log('');

mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
})
.then(() => {
  console.log('✅ SUCCESS! MongoDB Connected!');
  console.log('✅ Host:', mongoose.connection.host);
  console.log('✅ Database:', mongoose.connection.name);
  console.log('✅ Connection State:', mongoose.connection.readyState === 1 ? 'Connected' : 'Not Connected');
  console.log('');
  console.log('🎉 Database is fully set up and ready to use!');
  
  // Test a simple operation
  return mongoose.connection.db.admin().ping();
})
.then(() => {
  console.log('✅ Database ping successful - connection is working!');
  mongoose.connection.close();
  process.exit(0);
})
.catch((error) => {
  console.error('❌ Connection Error:', error.message);
  console.log('');
  if (error.message.includes('authentication')) {
    console.error('💡 This might be a password issue.');
    console.error('   Check your MongoDB Atlas password in the .env file.');
  } else if (error.message.includes('whitelist')) {
    console.error('💡 Your IP address might not be whitelisted.');
    console.error('   Go to MongoDB Atlas → Network Access → Add your IP.');
  } else if (error.message.includes('ENOTFOUND')) {
    console.error('💡 DNS resolution failed. Check your connection string.');
  }
  process.exit(1);
});

