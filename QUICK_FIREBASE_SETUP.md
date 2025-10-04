# ⚡ Quick Firebase Setup (5 Minutes)

## TL;DR - Fast Track Setup

### 1️⃣ Create Project (2 min)

```
1. Go to: https://console.firebase.google.com/
2. Click "Add project"
3. Name it: "oss-discovery-app"
4. Disable Google Analytics (toggle OFF)
5. Click "Create project"
```

### 2️⃣ Add Web App (1 min)

```
1. Click the "</>" (web) icon
2. Nickname: "OSS Discovery Web"
3. Click "Register app"
4. COPY the config that appears (see below)
```

### 3️⃣ Enable Auth (1 min)

```
1. Sidebar: "Authentication" → "Get Started"
2. Click "Email/Password" → Enable → Save
3. Click "Google" → Enable → Select email → Save
```

### 4️⃣ Create Database (1 min)

```
1. Sidebar: "Firestore Database" → "Create database"
2. Choose location (e.g., us-central)
3. Start in "Production mode" → Enable
4. Go to "Rules" tab
5. Paste this:

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}

6. Click "Publish"
```

### 5️⃣ Update .env File

```bash
# Open .env and replace with YOUR values from Step 2:

VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-app-id
VITE_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123...
```

### 6️⃣ Restart Server

```bash
# Stop server (Ctrl+C), then:
npm run dev
```

✅ Done! Look for: `✅ Firebase configured successfully!`

---

## 🎯 Visual Guide

```
Firebase Console
├── 1. Create Project
│   └── "oss-discovery-app"
│
├── 2. Add Web App (</> icon)
│   ├── Register app
│   └── 📋 Copy config values
│
├── 3. Build → Authentication
│   ├── Get Started
│   ├── Email/Password (Enable)
│   └── Google (Enable)
│
├── 4. Build → Firestore Database
│   ├── Create database
│   ├── Choose location
│   ├── Production mode
│   └── Set Rules
│
└── 5. Project Settings (⚙️)
    └── Your apps → Config
```

---

## 📍 Where to Find Config Again

Can't find your config? Here's how:

```
Firebase Console
  → Click ⚙️ (gear icon)
  → Project settings
  → Scroll to "Your apps"
  → Click on your web app
  → See config values
```

---

## ✅ Verification Checklist

- [ ] Firebase project created
- [ ] Web app registered
- [ ] Config copied to .env
- [ ] Email/Password auth enabled
- [ ] Google auth enabled (optional)
- [ ] Firestore database created
- [ ] Security rules published
- [ ] Dev server restarted
- [ ] See "✅ Firebase configured successfully!" in console

---

## 🚨 Common Issues

**"Firebase not configured" warning?**
→ Make sure you restarted dev server after editing .env

**Can't login?**
→ Check that Email/Password is enabled in Firebase Console

**Can't save repos?**
→ Verify Firestore rules are published

---

## 📚 Full Guide

For detailed explanations, screenshots, and troubleshooting:
→ See `FIREBASE_CONFIG_GUIDE.md`

---

🎉 **That's it!** Your app now has authentication and database support.
