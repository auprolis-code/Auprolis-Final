/**
 * Script to list all users from Firestore
 * Run with: node list-firestore-users.js
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
try {
    // Try to use application default credentials (from firebase login)
    const { execSync } = require('child_process');
    const os = require('os');
    const path = require('path');
    
    // Try to get Firebase CLI token
    let credentials;
    try {
        // Check if we can use default credentials
        admin.initializeApp({
            projectId: 'auprolis-mvp2',
            credential: admin.credential.applicationDefault()
        });
        console.log('Using application default credentials...');
    } catch (defaultError) {
        // If that fails, try without explicit credential (uses environment)
        try {
            admin.initializeApp({
                projectId: 'auprolis-mvp2'
            });
            console.log('Using Firebase project default...');
        } catch (envError) {
            console.error('Firebase Admin initialization failed.');
            console.error('Trying alternative method...');
            // Last resort: initialize without credentials (will use service account if available)
            admin.initializeApp({
                projectId: 'auprolis-mvp2'
            });
        }
    }
} catch (error) {
    console.error('Firebase Admin initialization failed:', error.message);
    console.error('\nPlease ensure you are logged in with: firebase login');
    console.error('Or set up service account credentials.');
    process.exit(1);
}

const db = admin.firestore();

async function listAllUsers() {
    try {
        console.log('\n=== Fetching users from Firestore ===\n');
        
        const usersRef = db.collection('users');
        const snapshot = await usersRef.get();
        
        if (snapshot.empty) {
            console.log('No users found in Firestore.');
            return;
        }
        
        console.log(`Found ${snapshot.size} user(s):\n`);
        console.log('─'.repeat(100));
        
        const users = [];
        snapshot.forEach(doc => {
            const userData = doc.data();
            users.push({
                uid: doc.id,
                email: userData.email || 'N/A',
                fullName: userData.fullName || 'N/A',
                userType: userData.userType || 'not set',
                status: userData.status || 'N/A',
                subscriptionStatus: userData.subscriptionStatus || 'N/A',
                paymentStatus: userData.paymentStatus || 'N/A',
                isEmailVerified: userData.isEmailVerified || false,
                createdAt: userData.createdAt ? userData.createdAt.toDate().toISOString() : 'N/A',
                updatedAt: userData.updatedAt ? userData.updatedAt.toDate().toISOString() : 'N/A'
            });
        });
        
        // Sort by email
        users.sort((a, b) => a.email.localeCompare(b.email));
        
        // Display users in a table format
        console.log('UID'.padEnd(30) + 'Email'.padEnd(35) + 'Name'.padEnd(25) + 'Type'.padEnd(10) + 'Status');
        console.log('─'.repeat(100));
        
        users.forEach((user, index) => {
            const uid = user.uid.substring(0, 28) + (user.uid.length > 28 ? '..' : '');
            const email = user.email.substring(0, 33) + (user.email.length > 33 ? '..' : '');
            const name = (user.fullName || 'N/A').substring(0, 23) + ((user.fullName || 'N/A').length > 23 ? '..' : '');
            const type = user.userType.padEnd(8);
            const status = user.status;
            
            console.log(`${uid.padEnd(30)}${email.padEnd(35)}${name.padEnd(25)}${type}${status}`);
        });
        
        console.log('\n─'.repeat(100));
        console.log(`\nTotal: ${users.length} user(s)\n`);
        
        // Summary by user type
        const typeCount = {};
        users.forEach(user => {
            const type = user.userType || 'not set';
            typeCount[type] = (typeCount[type] || 0) + 1;
        });
        
        console.log('Summary by User Type:');
        Object.entries(typeCount).forEach(([type, count]) => {
            console.log(`  ${type}: ${count}`);
        });
        
        // Check for the specific users we're looking for
        console.log('\n─'.repeat(100));
        console.log('\nChecking for specific users:');
        console.log('─'.repeat(100));
        
        const targetEmails = [
            'thegreatmayabane@gmail.com',
            'auprolis@gmail.com',
            'aivanguardd@gmail.com'
        ];
        
        const expectedTypes = {
            'thegreatmayabane@gmail.com': 'buyer',
            'auprolis@gmail.com': 'admin',
            'aivanguardd@gmail.com': 'sheriff'
        };
        
        targetEmails.forEach(email => {
            const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
            if (user) {
                const expected = expectedTypes[email];
                const actual = user.userType;
                const status = actual === expected ? '✓' : '✗';
                const color = actual === expected ? 'CORRECT' : 'INCORRECT';
                console.log(`${status} ${email}`);
                console.log(`   Expected: ${expected}, Actual: ${actual} (${color})`);
                console.log(`   UID: ${user.uid}`);
            } else {
                console.log(`✗ ${email} - NOT FOUND`);
            }
        });
        
        // Export full data as JSON
        console.log('\n─'.repeat(100));
        console.log('\nFull user data (JSON):');
        console.log(JSON.stringify(users, null, 2));
        
    } catch (error) {
        console.error('Error fetching users:', error);
        process.exit(1);
    }
}

// Run the function
listAllUsers()
    .then(() => {
        console.log('\n✓ Done');
        process.exit(0);
    })
    .catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });

