/**
 * List users from Firestore using REST API
 */

const https = require('https');

const projectId = 'auprolis-mvp2';
const apiKey = 'AIzaSyA9VPtRDIz4m903N4r4SDzIXPfU4LScCUQ';

// Note: Firestore REST API requires authentication token
// This is a simplified approach - we'll use the verification page instead

console.log('\n=== Firestore Users Query ===\n');
console.log('Firestore REST API requires OAuth authentication.');
console.log('The easiest way to check users is:');
console.log('\n1. Use the verification page: verify-user-types.html');
console.log('   (Open it in your browser - it will show all users)');
console.log('\n2. Or use Firebase Console:');
console.log('   https://console.firebase.google.com/project/auprolis-mvp2/firestore/data/~2Fusers');
console.log('\n3. Or check the browser console output from verify-user-types.html');
console.log('\nLet me open the verification page for you...\n');

// Open the verification page
const { exec } = require('child_process');
exec('start verify-user-types.html', (error) => {
    if (error) {
        console.log('Please manually open verify-user-types.html in your browser');
    }
});





