const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔐 MongoDB Password Updater');
console.log('============================\n');

// Read current .env file
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env file not found!');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const currentUri = envContent.match(/MONGODB_URI=(.+)/)?.[1];

if (!currentUri) {
  console.error('❌ MONGODB_URI not found in .env file!');
  process.exit(1);
}

console.log('Current connection string (password hidden):');
console.log(currentUri.replace(/:[^:@]+@/, ':****@'));
console.log('');

rl.question('Enter your NEW MongoDB password: ', (newPassword) => {
  if (!newPassword || newPassword.trim() === '') {
    console.error('❌ Password cannot be empty!');
    rl.close();
    process.exit(1);
  }

  // URL encode the password (handle special characters)
  const encodedPassword = encodeURIComponent(newPassword);
  
  // Update the connection string
  // Pattern: mongodb+srv://Auprolis:OLD_PASSWORD@cluster0...
  const newUri = currentUri.replace(
    /mongodb\+srv:\/\/Auprolis:[^@]+@/,
    `mongodb+srv://Auprolis:${encodedPassword}@`
  );

  // Update .env file
  const updatedContent = envContent.replace(
    /MONGODB_URI=.*/,
    `MONGODB_URI=${newUri}`
  );

  fs.writeFileSync(envPath, updatedContent);
  
  console.log('');
  console.log('✅ Password updated successfully!');
  console.log('');
  console.log('Updated connection string (password hidden):');
  console.log(newUri.replace(/:[^:@]+@/, ':****@'));
  console.log('');
  console.log('🧪 Testing connection...');
  console.log('');
  
  // Test the connection
  require('dotenv').config({ path: envPath });
  const mongoose = require('mongoose');
  
  mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
  })
  .then(() => {
    console.log('✅ SUCCESS! MongoDB connection works with new password!');
    console.log('✅ Host:', mongoose.connection.host);
    console.log('✅ Database:', mongoose.connection.name);
    mongoose.connection.close();
    rl.close();
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Connection failed:', error.message);
    console.log('');
    console.log('💡 Make sure:');
    console.log('   1. You changed the password in MongoDB Atlas');
    console.log('   2. Your IP is whitelisted in Network Access');
    console.log('   3. The password is correct');
    rl.close();
    process.exit(1);
  });
});

