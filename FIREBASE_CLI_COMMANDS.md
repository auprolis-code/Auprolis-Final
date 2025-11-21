# Firebase CLI Commands for Auprolis Project

This guide provides all the necessary Firebase CLI commands to initialize, deploy, and manage your Firebase backend components for the Auprolis application.

## Prerequisites

1. **Install Firebase CLI globally:**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase:**
   ```bash
   firebase login
   ```

3. **Verify your login:**
   ```bash
   firebase projects:list
   ```

## Initial Setup

### 1. Initialize Firebase in Your Project

If you haven't initialized Firebase yet, run:

```bash
firebase init
```

**Select the following options:**
- ✅ **Functions**: Configure a Cloud Functions directory and files
- ✅ **Firestore**: Configure security rules and indexes files
- ✅ **Realtime Database**: Configure a security rules file
- ❌ **Hosting**: Skip (using GitHub Pages)

**When prompted:**
- Select your Firebase project: `auprolis-mvp2`
- For Functions:
  - Language: **TypeScript**
  - ESLint: Yes (optional)
  - Install dependencies: Yes
- For Firestore:
  - Use existing `firestore.rules`: Yes
  - Use existing `firestore.indexes.json`: Yes
- For Realtime Database:
  - Use existing `database.rules.json`: Yes

### 2. Install Functions Dependencies

Navigate to the functions directory and install dependencies:

```bash
cd functions
npm install
cd ..
```

## Development Commands

### Build Functions Locally

```bash
cd functions
npm run build
cd ..
```

Or from the root directory:

```bash
npm --prefix functions run build
```

### Test Functions Locally with Emulator

```bash
# Start all emulators (Firestore, Realtime DB, Functions, Auth)
firebase emulators:start

# Start only Functions emulator
firebase emulators:start --only functions

# Start specific emulators
firebase emulators:start --only functions,firestore,database
```

The emulators will be available at:
- Functions: `http://localhost:5001`
- Firestore: `http://localhost:8080`
- Realtime Database: `http://localhost:9000`
- Auth: `http://localhost:9099`

### View Function Logs Locally

```bash
# View logs in real-time
firebase functions:log

# View logs for a specific function
firebase functions:log --only onNewBid
firebase functions:log --only syncGoogleSheetUser
```

## Deployment Commands

### Deploy All Components

```bash
# Deploy everything (Firestore rules, Realtime DB rules, Functions)
firebase deploy
```

### Deploy Specific Components

#### Deploy Only Firestore Rules

```bash
firebase deploy --only firestore:rules
```

#### Deploy Only Firestore Indexes

```bash
firebase deploy --only firestore:indexes
```

#### Deploy Only Realtime Database Rules

```bash
firebase deploy --only database
```

#### Deploy Only Functions

```bash
firebase deploy --only functions
```

#### Deploy Specific Functions

```bash
# Deploy only onNewBid function
firebase deploy --only functions:onNewBid

# Deploy only syncGoogleSheetUser function
firebase deploy --only functions:syncGoogleSheetUser

# Deploy multiple specific functions
firebase deploy --only functions:onNewBid,functions:syncGoogleSheetUser
```

### Deploy Multiple Components Together

```bash
# Deploy Firestore rules and Functions
firebase deploy --only firestore:rules,functions

# Deploy Realtime DB rules and Functions
firebase deploy --only database,functions

# Deploy all rules (Firestore + Realtime DB)
firebase deploy --only firestore:rules,database
```

## Management Commands

### View Deployed Functions

```bash
firebase functions:list
```

### View Function Details

```bash
# View details of a specific function
firebase functions:describe onNewBid
firebase functions:describe syncGoogleSheetUser
```

### Delete a Function

```bash
# Delete a specific function
firebase functions:delete onNewBid

# Delete multiple functions
firebase functions:delete onNewBid syncGoogleSheetUser
```

### View Project Configuration

```bash
# View current Firebase project
firebase use

# List all projects
firebase projects:list

# Switch to a different project
firebase use <project-id>

# View project aliases
firebase use --add
```

## Testing Commands

### Test Functions Locally

```bash
# Start emulator and test
firebase emulators:start --only functions

# In another terminal, test the callable function
curl -X POST http://localhost:5001/auprolis-mvp2/us-central1/syncGoogleSheetUser \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "email": "test@example.com",
      "userType": "buyer",
      "verifiedInSheets": true
    }
  }'
```

### Test Firestore Rules Locally

```bash
# Start Firestore emulator
firebase emulators:start --only firestore

# Use the Firebase Console emulator UI at http://localhost:4000
# Or use the Admin SDK in your test scripts
```

### Test Realtime Database Rules Locally

```bash
# Start Realtime Database emulator
firebase emulators:start --only database

# Test rules using Firebase SDK in your application
```

## Monitoring and Debugging

### View Function Logs (Production)

```bash
# View all function logs
firebase functions:log

# View logs for last 10 minutes
firebase functions:log --limit 50

# View logs for a specific function
firebase functions:log --only onNewBid

# Follow logs in real-time
firebase functions:log --follow
```

### View Function Metrics

```bash
# View function execution metrics
firebase functions:metrics
```

### Debug Functions

```bash
# Enable debug mode
firebase functions:config:get

# View function configuration
firebase functions:config:get
```

## Common Workflows

### Complete Setup Workflow

```bash
# 1. Login to Firebase
firebase login

# 2. Initialize (if not done)
firebase init

# 3. Install dependencies
cd functions && npm install && cd ..

# 4. Build functions
npm --prefix functions run build

# 5. Test locally
firebase emulators:start

# 6. Deploy everything
firebase deploy
```

### Development Workflow

```bash
# 1. Make changes to functions/src/index.ts

# 2. Build functions
npm --prefix functions run build

# 3. Test locally
firebase emulators:start --only functions

# 4. Deploy when ready
firebase deploy --only functions
```

### Rules Update Workflow

```bash
# 1. Update firestore.rules or database.rules.json

# 2. Test rules locally (optional)
firebase emulators:start --only firestore,database

# 3. Deploy rules
firebase deploy --only firestore:rules,database
```

### Function Update Workflow

```bash
# 1. Update functions/src/index.ts

# 2. Build
npm --prefix functions run build

# 3. Test locally
firebase emulators:start --only functions

# 4. Deploy specific function
firebase deploy --only functions:onNewBid
```

## Environment Configuration

### Set Environment Variables for Functions

```bash
# Set a config variable
firebase functions:config:set someservice.key="THE API KEY"

# Get all config variables
firebase functions:config:get

# Remove a config variable
firebase functions:config:unset someservice.key
```

**Note:** For newer Firebase projects, use `.env` files or Firebase's built-in environment configuration instead of `functions:config:set`.

## Troubleshooting

### Functions Won't Deploy

```bash
# Check for TypeScript errors
cd functions
npm run build
cd ..

# Check Firebase CLI version
firebase --version

# Update Firebase CLI
npm install -g firebase-tools@latest
```

### Rules Won't Deploy

```bash
# Validate Firestore rules syntax
firebase deploy --only firestore:rules --dry-run

# Validate Realtime DB rules syntax
firebase deploy --only database --dry-run
```

### Clear Firebase Cache

```bash
# Clear Firebase CLI cache
firebase cache:clear
```

## Quick Reference

| Command | Description |
|---------|-------------|
| `firebase login` | Login to Firebase |
| `firebase init` | Initialize Firebase in project |
| `firebase deploy` | Deploy all components |
| `firebase deploy --only functions` | Deploy only functions |
| `firebase deploy --only firestore:rules` | Deploy Firestore rules |
| `firebase deploy --only database` | Deploy Realtime DB rules |
| `firebase emulators:start` | Start local emulators |
| `firebase functions:log` | View function logs |
| `firebase functions:list` | List all functions |
| `firebase use` | View current project |

## Next Steps

After deploying your Firebase backend:

1. **Test your functions** using the Firebase Console or your application
2. **Monitor function logs** for any errors
3. **Set up alerts** in Firebase Console for function errors
4. **Configure billing** if you exceed free tier limits
5. **Set up CI/CD** to automate deployments (optional)

For more information, visit:
- [Firebase CLI Documentation](https://firebase.google.com/docs/cli)
- [Cloud Functions Documentation](https://firebase.google.com/docs/functions)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Realtime Database Security Rules](https://firebase.google.com/docs/database/security)

