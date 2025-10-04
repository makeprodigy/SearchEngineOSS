# Environment Variables Setup Guide

## Quick Start

1. **Copy the example file:**

   ```bash
   cp .env.example .env
   ```

2. **Add your credentials to `.env` file**

3. **Restart your development server**
   ```bash
   npm run dev
   ```

---

## 🔑 GitHub Token (Required for API access)

### Why do I need this?

- **Without token**: 60 requests/hour → You'll hit rate limits quickly! ⚠️
- **With token**: 5,000 requests/hour → Smooth experience! ✅

### How to get it:

1. Go to [GitHub Settings → Tokens](https://github.com/settings/tokens)
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Set these options:
   - **Name**: `OSS Discovery Engine`
   - **Expiration**: Choose your preference (90 days recommended)
   - **Scopes**: Select ☑️ **`public_repo`**
4. Click **"Generate token"**
5. **Copy the token immediately!** (You won't see it again)
6. Add to your `.env` file:
   ```
   VITE_GITHUB_TOKEN=ghp_yourActualTokenHere123456789
   ```

### Verification:

After adding the token and restarting the server, check the browser console:

- ✅ Success: `✅ GitHub token configured - you have 5,000 requests/hour!`
- ⚠️ Not configured: `⚠️ GitHub token is not configured!`

---

## 🔥 Firebase Configuration (Required for authentication & data)

### Why do I need this?

Firebase handles:

- User authentication (email/password, Google sign-in)
- User profiles and preferences
- Saved repositories

### How to set it up:

1. **Go to [Firebase Console](https://console.firebase.google.com/)**

2. **Create or select a project**

   - Click "Add project" or select an existing one
   - Follow the setup wizard

3. **Add a web app**

   - In Project Overview, click the web icon (</>)
   - Register your app with a nickname (e.g., "OSS Discovery")
   - Don't enable Firebase Hosting (unless you want to)

4. **Copy your config**

   - You'll see a `firebaseConfig` object with these values:

   ```javascript
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "your-app.firebaseapp.com",
     projectId: "your-app",
     storageBucket: "your-app.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123def456",
   };
   ```

5. **Add to your `.env` file**

   ```
   VITE_FIREBASE_API_KEY=AIza...
   VITE_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-app
   VITE_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abc123def456
   ```

6. **Enable Authentication**

   - In Firebase Console, go to **Authentication**
   - Click **"Get Started"**
   - Enable **Email/Password** sign-in method
   - Enable **Google** sign-in method (optional)

7. **Set up Firestore Database**
   - In Firebase Console, go to **Firestore Database**
   - Click **"Create database"**
   - Choose **"Start in test mode"** (for development)
   - Select a location closest to you

### Verification:

After configuration, check the browser console:

- ✅ Success: No warnings about Firebase
- ⚠️ Not configured: `⚠️ Firebase is not configured. Please add your Firebase credentials to .env file.`

---

## 📁 File Structure

```
/your-project
├── .env                  # Your actual credentials (NEVER commit!)
├── .env.example          # Template file (safe to commit)
├── .gitignore           # Contains .env (prevents accidental commits)
├── ENV_SETUP.md         # This file
├── FIREBASE_SETUP.md    # Detailed Firebase instructions
└── GITHUB_API_SETUP.md  # Detailed GitHub API instructions
```

---

## 🔒 Security Notes

### ⚠️ IMPORTANT:

- **NEVER** commit your `.env` file to git!
- **NEVER** share your tokens/keys publicly
- The `.env` file is already in `.gitignore` for your protection
- If you accidentally expose a token, revoke it immediately and generate a new one

### What's safe to commit?

- ✅ `.env.example` (template with placeholders)
- ✅ Documentation files
- ❌ `.env` (contains actual credentials)

---

## 🐛 Troubleshooting

### "GitHub API rate limit exceeded"

- **Cause**: No token or token is invalid
- **Solution**: Add or verify your `VITE_GITHUB_TOKEN` in `.env`

### "Firebase is not configured"

- **Cause**: Missing or invalid Firebase credentials
- **Solution**: Add all Firebase variables to `.env`

### "Failed to load resource: 403"

- **Cause**: GitHub rate limit hit or invalid token
- **Solution**:
  1. Wait for rate limit to reset (shown in error)
  2. Add/update GitHub token
  3. Restart dev server

### Changes not taking effect?

- **Solution**: Restart your development server after changing `.env`:
  ```bash
  # Stop server (Ctrl+C)
  npm run dev
  ```

---

## 🎯 Quick Check

Your `.env` file should look like this:

```bash
# GitHub
VITE_GITHUB_TOKEN=ghp_yourActualToken123xyz

# Firebase
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

**No placeholder text like "YOUR_API_KEY" should remain!**

---

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] Created `.env` file from `.env.example`
- [ ] Added GitHub token
- [ ] Added all 6 Firebase configuration values
- [ ] Restarted development server
- [ ] Browser console shows: `✅ GitHub token configured`
- [ ] No Firebase warnings in console
- [ ] Can search for repositories without rate limit errors
- [ ] Can sign up/login with email
- [ ] Can save repositories

---

## 📚 More Information

- [GitHub API Setup Guide](./GITHUB_API_SETUP.md)
- [Firebase Setup Guide](./FIREBASE_SETUP.md)
- [Project Documentation](./README.md)
