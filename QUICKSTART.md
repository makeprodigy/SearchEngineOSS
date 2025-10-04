# Quick Start Guide

Get the OSS Discovery Engine up and running in 5 minutes!

## 1. Install Dependencies

```bash
npm install
```

## 2. Firebase Setup (Quick Version)

### Create Firebase Project

1. Go to https://console.firebase.google.com/
2. Click "Add project"
3. Name it and follow the prompts

### Get Configuration

1. Click the web icon (</>) in your Firebase project
2. Register your app
3. Copy the `firebaseConfig` object

### Enable Authentication

1. Go to Authentication → Get started
2. Enable "Email/Password"
3. Enable "Google" and select a support email

### Create Firestore Database

1. Go to Firestore Database → Create database
2. Start in production mode
3. Choose a location

### Set Firestore Rules

Go to Rules tab and paste:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 3. Configure Your App

### Update Firebase Config

Open `src/services/firebase.js` and replace the placeholder config (lines 12-18) with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};
```

## 4. Run the Application

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

## 5. Test It Out!

1. **Sign Up**: Click "Sign In" → "Sign up" and create an account
2. **Complete Onboarding**: Select your tech stack interests
3. **Explore**: Browse repositories on the landing page
4. **Search**: Use the search bar to find specific projects
5. **Filter**: Try different filters on the search page
6. **Save**: Click the bookmark icon to save repositories
7. **Profile**: Update your profile with bio and tech stack
8. **Theme**: Toggle between light and dark modes

## Troubleshooting

### "Firebase configuration not found"

Make sure you've replaced the placeholder values in `src/services/firebase.js`

### Can't sign in

1. Check Firebase Console → Authentication to see if providers are enabled
2. Make sure localhost is in authorized domains (Authentication → Settings)

### Build errors

Try deleting `node_modules` and reinstalling:

```bash
rm -rf node_modules package-lock.json
npm install
```

## What's Next?

- See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for detailed Firebase configuration
- See [README.md](./README.md) for full documentation
- Explore the codebase and customize to your needs!

## Key Files to Know

- `src/App.jsx` - Main app with routing
- `src/components/RepoCard.jsx` - Repository card component
- `src/pages/LandingPage.jsx` - Home page
- `src/services/firebase.js` - Firebase configuration
- `src/data/mockRepos.js` - Mock repository data (replace with API later)
- `src/utils/searchUtils.js` - Search and filter logic

Happy coding! 🚀
