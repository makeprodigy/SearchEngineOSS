# 🔥 Firebase Configuration - Complete Setup Guide

## Step-by-Step Instructions to Get Your Firebase Config

### Step 1: Create a Firebase Account

1. Go to [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Sign in with your Google account
3. If you don't have a Google account, create one first

---

### Step 2: Create a New Firebase Project

1. **Click "Add project" or "Create a project"**

   - You'll see a big blue button on the Firebase Console home page

2. **Enter Project Name**

   - Example: `oss-discovery-app` or `my-repo-finder`
   - Firebase will auto-generate a unique Project ID
   - Click **Continue**

3. **Google Analytics (Optional)**

   - You can disable this for now by toggling it OFF
   - Or leave it enabled (recommended for production)
   - Click **Continue** or **Create project**

4. **Wait for Project Creation**
   - Takes about 30-60 seconds
   - Click **Continue** when ready

---

### Step 3: Set Up a Web App

1. **On your Project Overview page, click the Web icon `</>`**

   - It's in the center of the page under "Get started by adding Firebase to your app"
   - Icon looks like: `</>`

2. **Register Your App**

   - **App nickname**: Enter something like `OSS Discovery Web App`
   - **Firebase Hosting**: You can leave this UNCHECKED for now
   - Click **Register app**

3. **You'll See Your Firebase Config! 🎉**
   - A code snippet will appear with your configuration
   - It looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:xxxxxxxxxxxxx",
};
```

4. **Copy These Values** - You'll need them in Step 5!

---

### Step 4: Enable Authentication

1. **In the left sidebar, click "Build" → "Authentication"**

2. **Click "Get Started"**

3. **Enable Sign-in Methods:**

   **For Email/Password:**

   - Click on "Email/Password"
   - Toggle **Enable** to ON
   - Click **Save**

   **For Google Sign-In (Recommended):**

   - Click on "Google"
   - Toggle **Enable** to ON
   - Select a support email from dropdown
   - Click **Save**

---

### Step 5: Enable Firestore Database

1. **In the left sidebar, click "Build" → "Firestore Database"**

2. **Click "Create database"**

3. **Choose Location:**

   - Select a location close to your users
   - Example: `us-central` or `europe-west`
   - Click **Next**

4. **Choose Security Rules:**

   - Select **"Start in production mode"** (we'll customize later)
   - Click **Enable**

5. **Wait for Database Creation** (takes 30-60 seconds)

---

### Step 6: Set Up Firestore Security Rules

1. **Go to "Firestore Database" → "Rules" tab**

2. **Replace the default rules with these:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3. **Click "Publish"**

---

### Step 7: Add Config to Your .env File

1. **Open your `.env` file** in the project root

2. **Replace the placeholder values** with your actual Firebase config:

```bash
# ====================================
# Firebase Configuration
# ====================================
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:xxxxxxxxxxxxx
```

3. **Save the file**

---

### Step 8: Restart Your Development Server

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

You should see:

```
✅ Firebase configured successfully!
```

---

## 🎯 Quick Reference: Where to Find Config Values

If you need to find your config again:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click the **⚙️ gear icon** → **Project settings**
4. Scroll down to **"Your apps"** section
5. Find your web app (the `</>` icon)
6. Click on it to see the config
7. Or click **"Config"** radio button to see just the values

---

## 📋 Checklist

Before you start coding, make sure you have:

- ✅ Created a Firebase project
- ✅ Added a web app to your project
- ✅ Copied all 6 configuration values
- ✅ Enabled Authentication (Email/Password and/or Google)
- ✅ Created a Firestore database
- ✅ Set up Firestore security rules
- ✅ Added values to `.env` file
- ✅ Restarted your dev server

---

## 🚨 Troubleshooting

### "Firebase not configured" warning in console?

- Check that `.env` file has actual values (not `YOUR_API_KEY`)
- Make sure you restarted the dev server after editing `.env`
- Verify all 6 values are present and correct

### Authentication not working?

- Verify you enabled the sign-in method in Firebase Console
- Check that `authDomain` is correct in `.env`
- Make sure you're using `https` or `localhost` (Firebase requirement)

### Can't save data to Firestore?

- Verify Firestore is created in Firebase Console
- Check that security rules are published
- Ensure user is logged in before trying to save

### Need to find your config again?

- Firebase Console → Project Settings → Your apps → Config

---

## 🔐 Security Notes

1. **Never commit `.env` to Git** - It's already in `.gitignore`
2. **Firebase API keys are safe to expose** - They're meant for public use
3. **Security comes from Firestore Rules** - Not from hiding the API key
4. **Use environment variables** - Never hardcode credentials

---

## 🌟 What You Can Do After Setup

Once Firebase is configured, your app will support:

- ✅ **User Registration** - Email/password signup
- ✅ **User Login** - Email/password and Google sign-in
- ✅ **Save Repositories** - Bookmark favorite repos
- ✅ **User Profiles** - Display name, bio, tech stack
- ✅ **Persistent Data** - Your saved repos sync across devices

---

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Firebase Web Setup](https://firebase.google.com/docs/web/setup)

---

## 💡 Pro Tips

1. **Use Different Projects for Dev/Production**

   - Create `oss-app-dev` and `oss-app-prod`
   - Use different `.env` files for each environment

2. **Enable Billing (Optional)**

   - Free tier is generous (50K reads/day)
   - Billing unlocks higher limits if needed

3. **Monitor Usage**

   - Firebase Console → Analytics
   - Check authentication and database usage

4. **Backup Your Config**
   - Save your Firebase config in a password manager
   - You'll need it if you lose the `.env` file

---

🎉 **You're all set!** Once you complete these steps, your app will have full authentication and database capabilities.

Need help? Check `TROUBLESHOOTING.md` or open an issue on GitHub.
