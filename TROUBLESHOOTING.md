# API Not Fetching Data - Troubleshooting Guide

## ✅ Fixed Issues

I've fixed several critical issues that were preventing the API from working:

### 1. **localStorage Access Error** ✅ FIXED

**Problem:** The code was trying to access `localStorage` during module initialization, which can fail in certain environments.

**Fix Applied:**

- Made `loadCacheFromStorage()` lazy (only loads on first use)
- Added checks for `window` and `localStorage` availability
- Wrapped in try-catch blocks

### 2. **Missing Environment Checks** ✅ FIXED

**Problem:** Code didn't check if `localStorage` was available before using it.

**Fix Applied:**

- Added environment checks: `typeof window !== 'undefined'`
- Added localStorage availability checks
- Made all localStorage operations safe

### 3. **Rate Limit Indicator Error** ✅ FIXED

**Problem:** Component could fail during SSR or initial render.

**Fix Applied:**

- Added environment checks
- Wrapped in try-catch
- Returns null if window is undefined

## 🔧 Configuration Issue Detected

Your `.env` file still has the placeholder token:

```
VITE_GITHUB_TOKEN=YOUR_GITHUB_TOKEN_HERE
```

### The API should still work without a real token (60 requests/hour)

But if you want full functionality (5,000 requests/hour), follow these steps:

## 🚀 How to Fix (Optional but Recommended)

### Option 1: Add Your GitHub Token (Recommended)

1. **Get a token:**

   - Go to: https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Give it a name: "OSS Discovery Engine"
   - Select scope: `public_repo` (read-only)
   - Click "Generate token"
   - **Copy the token immediately** (you won't see it again!)

2. **Update `.env`:**

   ```bash
   # Open .env file
   nano .env

   # Replace this line:
   VITE_GITHUB_TOKEN=YOUR_GITHUB_TOKEN_HERE

   # With your actual token:
   VITE_GITHUB_TOKEN=ghp_yourActualTokenHere123456789
   ```

3. **Restart dev server:**
   ```bash
   # Stop the current server (Ctrl+C)
   # Start again
   npm run dev
   ```

### Option 2: Use Without Token (Works but Limited)

The app works fine without a token, just with 60 requests/hour limit instead of 5,000.

The placeholder token is automatically detected and ignored by the app.

## 🧪 Test the API

I've created a test page for you:

```bash
# Open this file in your browser:
open /Users/pushpendraaa/Desktop/oss/API_TEST.html
```

This will:

- ✅ Test basic GitHub API connectivity
- ✅ Test search functionality
- ✅ Show your rate limit status
- ✅ Tell you if token is working

## 🔍 What to Check

### 1. Check Browser Console

Open your app and check the browser console for:

**Good Signs:**

- `✅ GitHub token configured` OR `⚠️ GitHub token is not configured` (both OK)
- `✅ Cache hit for...` (cache working)
- `📦 Loaded X cached items from localStorage` (persistence working)

**Bad Signs:**

- `Uncaught Error:` or `TypeError:` (something broke)
- `Failed to fetch` (network issue)
- CORS errors (shouldn't happen with GitHub API)

### 2. Check Network Tab

Open DevTools → Network tab → Filter by "api.github.com":

**What to look for:**

- Status 200: ✅ Working
- Status 403: ⚠️ Rate limit exceeded
- Status 401: ❌ Bad token (shouldn't happen without token)
- No requests: ❌ Code not running

### 3. Check Application State

Open DevTools → Console, type:

```javascript
// Check if service is loaded
import("../src/services/github.js").then(console.log);

// Check cache
localStorage.getItem("gh_cache_popular:6");

// Test a search manually
import("../src/services/github.js").then((gh) => {
  gh.searchRepositories("react", 5).then(console.log);
});
```

## 🐛 Common Issues & Fixes

### Issue: "No data showing up"

**Possible Causes:**

1. ✅ **Fixed:** localStorage access error
2. ✅ **Fixed:** Module initialization error
3. ⚠️ **Check:** Rate limit exceeded (unlikely if just started)
4. ⚠️ **Check:** Network blocked (firewall/proxy)

**Try:**

```bash
# Clear browser cache and localStorage
# In browser console:
localStorage.clear()
location.reload()
```

### Issue: "Rate limit exceeded"

**Solution:**

- Wait for reset (check when in API test page)
- Or add a GitHub token (5,000 req/hr)

### Issue: "CORS error"

**This shouldn't happen** with GitHub API, but if it does:

- Check if you're using HTTPS
- Make sure dev server is running
- Try in incognito mode

## 📊 Test Results Interpretation

Run the API test page and you should see:

### ✅ Expected Results (Working):

```
Test 1: SUCCESS - GitHub API is reachable
Test 2: SUCCESS - Found repositories
Test 3: Shows remaining requests (should be close to 60 or 5000)
```

### ❌ Problem Indicators:

```
Test 1: ERROR - Network issue or blocked
Test 2: ERROR 403 - Rate limit (unlikely on first try)
Test 3: ERROR - Can't check rate limit
```

## 🎯 Quick Actions

### Action 1: Clear Everything and Restart

```bash
# Stop dev server (Ctrl+C)
# Clear node modules cache
rm -rf node_modules/.vite

# Restart
npm run dev
```

### Action 2: Test API Directly

```bash
# In new terminal:
curl https://api.github.com/search/repositories?q=react&per_page=1

# Should return JSON data
# If it doesn't, you have a network issue
```

### Action 3: Check App Loading

```bash
# Open the app
open http://localhost:5173

# Watch the terminal for errors
# Watch browser console for errors
```

## ✅ Verification Checklist

After the fixes, verify:

- [ ] Dev server starts without errors
- [ ] App loads in browser
- [ ] No console errors about localStorage
- [ ] Landing page shows some repos (even if loading slowly)
- [ ] Search page loads
- [ ] Can type in search bar
- [ ] Results appear (might take a few seconds)
- [ ] Rate limit indicator appears in bottom-right (if < 1000 requests)

## 🎉 Success Indicators

You'll know it's working when you see:

1. **Landing Page:** Shows Popular and Trending repos
2. **Search Page:** Returns results when you search
3. **Console:** No red errors
4. **Network Tab:** Successful API calls (status 200)
5. **Rate Limit:** Indicator shows remaining requests

## 📞 Still Not Working?

If the API still isn't fetching after all these fixes:

1. **Run the API test page** (API_TEST.html)
2. **Check the results** - all 3 tests should pass
3. **Take a screenshot** of:
   - Browser console errors
   - Network tab
   - Test results
4. **Report which test fails** - this will help diagnose the issue

## 🔄 Recent Changes

The following files were modified to fix the API issues:

- `src/services/github.js` - Added safety checks for localStorage
- `src/components/RateLimitIndicator.jsx` - Added environment checks
- `src/pages/LandingPage.jsx` - Fixed dependency array

All changes are backward compatible and shouldn't break anything!

---

**Last Updated:** Just now  
**Status:** Fixed and ready to test!
