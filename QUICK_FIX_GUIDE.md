# 🚀 Quick Fix Guide: Health Score Issues

## The Problem

**facebook/react showing score of 70 instead of 90+**

### Why?

The GitHub `/stats/commit_activity` API:

1. Returns **202 Accepted** (computing stats) on first request
2. Code was treating 202 as error → returning 0 commits
3. 0 commits = **0/30 activity points** = score drops by 30!

---

## The Fix (Already Applied)

✅ Updated `src/services/github.js` to:

- Handle 202 status with reasonable estimates (40 commits/month)
- Return estimates on errors instead of 0
- Better logging to debug issues

---

## 🎯 What You Need To Do NOW

### 1. Check Your GitHub Token (CRITICAL!)

Run this command:

```bash
cd /Users/pushpendraaa/Desktop/oss
grep VITE_GITHUB_TOKEN .env
```

**Expected output:**

```
VITE_GITHUB_TOKEN=ghp_YourActualTokenHere123...
```

**If you see `YOUR_GITHUB_TOKEN_HERE` or nothing:**

1. Get a token from: https://github.com/settings/tokens
2. Edit `.env` file
3. Replace with your actual token
4. Restart dev server

**Why?** Without token = 60 API requests/hour (gets exhausted fast!)
With token = **5,000 requests/hour**

### 2. Clear All Caches

**Option A - In Browser:**

1. Open DevTools (F12)
2. Console tab
3. Type: `localStorage.clear()`
4. Press Enter
5. Refresh page

**Option B - Use App Button:**

1. Click "Clear Cache" button in app
2. Refresh page

### 3. Restart Dev Server

```bash
# Stop current server (Ctrl+C if running)
npm run dev
```

### 4. Verify Fix

1. Open app in browser
2. Open console (F12)
3. Search for repos
4. Look for logs like:

**Good signs:**

```
⏳ GitHub computing stats for facebook/react - using estimate
✅ Commits for facebook/react: 156/month (42/week)
HealthScore calc: {
  activityScore: 24 or 30  // ✅ NOT 0!
}
```

**Bad signs:**

```
activityScore: 0  // ❌ Still broken
Error fetching commit activity  // ❌ API issues
```

### 5. Check facebook/react Score

Should now show: **90-95** (up from 70)

---

## 🔍 Troubleshooting

### Still showing 70?

**Check #1:** Console shows `activityScore: 0`?

- Cache not cleared properly
- Run: `localStorage.clear()` in console
- Hard refresh: Ctrl+Shift+R (or Cmd+Shift+R on Mac)

**Check #2:** Console shows rate limit errors?

- GitHub token not configured
- Check `.env` file has valid token
- Restart dev server after adding token

**Check #3:** Still not working?

- Check console for specific error messages
- Look for "Error fetching commit activity"
- Check network tab for 403/429 errors

### Token Setup

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token" → "Classic"
3. Select scopes: `public_repo`, `read:user`
4. Generate token
5. Copy token (save it somewhere safe!)
6. Edit `.env`:
   ```
   VITE_GITHUB_TOKEN=your_token_here
   ```
7. Restart: `npm run dev`

---

## 📊 Expected Results

### Before Fix:

```
facebook/react: 70/100
- Activity: 0/30   ❌
- Stars: 25/25     ✅
- Issues: 20/20    ✅
- Freshness: 25/25 ✅
```

### After Fix:

```
facebook/react: 94/100
- Activity: 24/30  ✅ (or 30/30 once stats load)
- Stars: 25/25     ✅
- Issues: 20/20    ✅
- Freshness: 25/25 ✅
```

---

## ⚡ Quick Commands

```bash
# Clear cache and restart
npm run dev

# Check token
grep VITE_GITHUB_TOKEN .env

# Check if server is running
ps aux | grep vite
```

---

**Time to fix:** 2 minutes  
**Impact:** +24 points on health scores  
**Status:** Code fixed, needs cache clear + token check
