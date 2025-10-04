# Firebase Setup Guide

This guide will walk you through setting up Firebase for the OSS Discovery Engine.

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter a project name (e.g., "oss-discovery")
4. (Optional) Enable Google Analytics
5. Click "Create project"

## Step 2: Register Your Web App

1. In your Firebase project, click the web icon (</>) to add a web app
2. Enter an app nickname (e.g., "OSS Discovery Web")
3. Check "Also set up Firebase Hosting" if you want (optional)
4. Click "Register app"
5. Copy the Firebase configuration object - you'll need this later

Your config will look like this:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123",
};
```

## Step 3: Enable Authentication

### Email/Password Authentication

1. In Firebase Console, go to "Authentication" in the left sidebar
2. Click "Get started" if it's your first time
3. Go to the "Sign-in method" tab
4. Click on "Email/Password"
5. Enable the first toggle (Email/Password)
6. Click "Save"

### Google Authentication

1. In the same "Sign-in method" tab
2. Click on "Google"
3. Enable the toggle
4. Select a project support email
5. Click "Save"

## Step 4: Set Up Firestore Database

1. In Firebase Console, go to "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in production mode" (we'll set up rules next)
4. Select a location for your database (choose closest to your users)
5. Click "Enable"

## Step 5: Configure Firestore Security Rules

1. In Firestore Database, go to the "Rules" tab
2. Replace the default rules with the following:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - users can only read/write their own document
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3. Click "Publish"

## Step 6: Configure Your Application

### Option 1: Using Environment Variables (Recommended)

1. Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

2. Edit `.env` and add your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

3. Update `src/services/firebase.js` to use environment variables:

```javascript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
```

### Option 2: Direct Configuration

1. Open `src/services/firebase.js`
2. Replace the placeholder config with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "your_actual_api_key",
  authDomain: "your_actual_auth_domain",
  projectId: "your_actual_project_id",
  storageBucket: "your_actual_storage_bucket",
  messagingSenderId: "your_actual_sender_id",
  appId: "your_actual_app_id",
};
```

⚠️ **Important**: If using Option 2, never commit your Firebase credentials to a public repository!

## Step 7: Test Your Setup

1. Start the development server:

```bash
npm run dev
```

2. Navigate to `http://localhost:5173`
3. Try to sign up with email/password
4. Try to sign in with Google
5. Check Firebase Console > Authentication to see if users are being created
6. Check Firebase Console > Firestore to see if user documents are being created

## Troubleshooting

### "Firebase: Error (auth/unauthorized-domain)"

- Go to Firebase Console > Authentication > Settings > Authorized domains
- Add your domain (e.g., `localhost` for development)

### "Missing or insufficient permissions"

- Check your Firestore security rules
- Make sure you're signed in when trying to access protected data

### "Firebase configuration not found"

- Verify that all environment variables are set correctly
- Make sure `.env` file is in the root directory
- Restart the development server after changing `.env`

### Google Sign-In not working

- Make sure you've enabled Google authentication in Firebase Console
- Check that you've selected a support email
- Verify your domain is in the authorized domains list

## Additional Configuration (Optional)

### Email Templates

Customize email templates for password reset, email verification, etc.:

1. Go to Authentication > Templates
2. Customize each template as needed

### Add More Authentication Providers

Firebase supports many providers:

- GitHub
- Twitter
- Facebook
- Apple
- Microsoft
- Yahoo
- Anonymous

Follow similar steps to enable them in the "Sign-in method" tab.

## Security Best Practices

1. **Never commit Firebase credentials** to version control
2. Use environment variables for sensitive data
3. Set up proper Firestore security rules
4. Enable App Check for additional security (optional but recommended)
5. Monitor authentication activity in Firebase Console
6. Set up billing alerts to avoid unexpected charges

## Next Steps

After setting up Firebase:

1. Test all authentication flows
2. Test saving and loading repositories
3. Verify Firestore data structure
4. Consider adding indexes for better query performance
5. Set up Firebase Hosting for deployment (optional)

## Support

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Authentication Guide](https://firebase.google.com/docs/auth)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Console](https://console.firebase.google.com/)

---

If you encounter any issues, please check the Firebase Console error logs and browser console for detailed error messages.
