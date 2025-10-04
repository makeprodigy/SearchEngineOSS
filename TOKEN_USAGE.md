# GitHub Token Usage Documentation

## Overview

The `VITE_GITHUB_TOKEN` from your `.env` file is automatically used throughout the application to authenticate all GitHub API requests.

---

## 🔑 Token Configuration

### Location: `.env` file

```bash
VITE_GITHUB_TOKEN=ghp_yourActualTokenHere123456789
```

### How it's loaded:

```javascript
// src/services/github.js (Line 3)
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;
```

---

## ✅ Token Usage in the App

### 1. **Main API Request Handler** (`fetchWithRateLimit`)

**Location:** `src/services/github.js` (Lines 25-54)

```javascript
const fetchWithRateLimit = async (url, options = {}) => {
  // Rate limiting logic...

  const headers = {
    Accept: "application/vnd.github.v3+json",
    ...options.headers,
  };

  if (GITHUB_TOKEN) {
    headers["Authorization"] = `token ${GITHUB_TOKEN}`; // ✅ TOKEN USED HERE
    // Token is being used - you have 5,000 requests/hour
  } else {
    console.warn(
      "⚠️ Making API request WITHOUT token - limited to 60 requests/hour"
    );
  }

  const response = await fetch(url, { ...options, headers });
  // ...
};
```

**Used by:**

- `searchRepositories()` - Search for repositories
- `getRepository()` - Get repository details
- `getGoodFirstIssues()` - Get good first issues count
- `getActivePRsCount()` - Get active PR count
- `getCommitActivity()` - Get commit statistics

---

### 2. **Contributors Count Handler** (`getContributorsCount`)

**Location:** `src/services/github.js` (Lines 127-200)

```javascript
export const getContributorsCount = async (owner, repo) => {
  // Cache check...

  try {
    // Rate limiting...

    const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/contributors?per_page=1&anon=true`;

    const headers = {
      'Accept': 'application/vnd.github.v3+json',
    };

    if (GITHUB_TOKEN) {
      headers['Authorization'] = `token ${GITHUB_TOKEN}`;  // ✅ TOKEN USED HERE
    }

    const response = await fetch(url, { headers });
    // ...
  }
};
```

This function has a separate implementation because it needs to read pagination headers directly from the response.

---

## 🔍 Token Validation

### Startup Validation

**Location:** `src/services/github.js` (Lines 5-13)

```javascript
// Validate GitHub token configuration
if (!GITHUB_TOKEN || GITHUB_TOKEN === "YOUR_GITHUB_TOKEN_HERE") {
  console.warn("⚠️ GitHub token is not configured!");
  console.warn(
    "📝 Add your token to .env file: VITE_GITHUB_TOKEN=your_token_here"
  );
  console.warn("📖 See GITHUB_API_SETUP.md for instructions.");
  console.warn("⚡ Rate limit: 60 requests/hour (5,000 with token)");
} else {
  console.log("✅ GitHub token configured - you have 5,000 requests/hour!");
}
```

**What you'll see in console:**

**Without token:**

```
⚠️ GitHub token is not configured!
📝 Add your token to .env file: VITE_GITHUB_TOKEN=your_token_here
📖 See GITHUB_API_SETUP.md for instructions.
⚡ Rate limit: 60 requests/hour (5,000 with token)
```

**With valid token:**

```
✅ GitHub token configured - you have 5,000 requests/hour!
```

---

## 📊 API Endpoints Using Token

All these GitHub API endpoints automatically use your token:

1. **Repository Search**

   - `GET https://api.github.com/search/repositories`
   - Used by: Landing page, Search page

2. **Repository Details**

   - `GET https://api.github.com/repos/{owner}/{repo}`
   - Used by: All repository cards

3. **Contributors Count**

   - `GET https://api.github.com/repos/{owner}/{repo}/contributors`
   - Used by: Repository cards (contributors stat)

4. **Active PRs Count**

   - `GET https://api.github.com/search/issues?q=repo:{owner}/{repo}+is:pr+is:open`
   - Used by: Repository cards (active PRs stat)

5. **Good First Issues**

   - `GET https://api.github.com/search/issues?q=repo:{owner}/{repo}+is:issue+is:open+label:...`
   - Used by: Repository cards (beginner-friendly badge)

6. **Commit Activity**
   - `GET https://api.github.com/repos/{owner}/{repo}/stats/commit_activity`
   - Used by: Health score calculation

---

## 🚦 Rate Limiting

### Without Token:

- **Limit:** 60 requests per hour
- **Per:** IP address
- **Reset:** Every hour

### With Token:

- **Limit:** 5,000 requests per hour
- **Per:** Token
- **Reset:** Every hour

### Built-in Protection:

The app includes automatic rate limiting:

- Minimum 1 second between requests
- 5-minute caching of responses
- Automatic fallback to estimates on errors

---

## 🔒 Security

### What's Protected:

- ✅ `.env` file is in `.gitignore` (never committed)
- ✅ Token only used client-side (not exposed in public builds)
- ✅ Token never logged in console
- ✅ Token transmitted via HTTPS only

### Best Practices:

1. **Never** commit `.env` file
2. **Never** share your token publicly
3. **Never** push token to GitHub
4. Rotate tokens regularly (every 90 days recommended)
5. Use minimal scopes (`public_repo` only)

---

## 🐛 Troubleshooting

### Issue: "GitHub API rate limit exceeded"

**Check 1: Is token configured?**

```bash
# Check your .env file
cat .env | grep VITE_GITHUB_TOKEN

# Should show:
VITE_GITHUB_TOKEN=ghp_yourtoken...  # ✅ Good
# NOT:
VITE_GITHUB_TOKEN=YOUR_GITHUB_TOKEN_HERE  # ❌ Bad
```

**Check 2: Did you restart the dev server?**

```bash
# Stop server (Ctrl+C)
npm run dev
```

**Check 3: Is token valid?**

- Go to https://github.com/settings/tokens
- Check if your token is still active
- If expired, generate a new one

---

### Issue: "Making API request WITHOUT token"

This warning appears when:

1. No token in `.env` file
2. Token is set to `YOUR_GITHUB_TOKEN_HERE`
3. Token is empty or undefined

**Solution:**

1. Open `.env` file
2. Add your actual token:
   ```
   VITE_GITHUB_TOKEN=ghp_yourActualToken123
   ```
3. Save file
4. Restart dev server

---

## 📈 Monitoring Token Usage

### Check Rate Limit Status:

The GitHub API includes rate limit headers in every response:

```
X-RateLimit-Limit: 5000
X-RateLimit-Remaining: 4999
X-RateLimit-Reset: 1617181200
```

### In Browser DevTools:

1. Open Network tab
2. Filter by `github.com`
3. Click any request
4. Check Response Headers
5. Look for `X-RateLimit-Remaining`

---

## ✨ Summary

**Your GitHub token is automatically used for:**

- ✅ All repository searches
- ✅ All repository details
- ✅ All contributor counts
- ✅ All PR counts
- ✅ All issue counts
- ✅ All commit activity

**You don't need to:**

- ❌ Manually add it to requests
- ❌ Pass it as a prop
- ❌ Import it in components
- ❌ Configure it anywhere else

**Just add it to `.env` and it works everywhere!** 🎉

---

## 📝 Quick Reference

```bash
# View your token
cat .env | grep VITE_GITHUB_TOKEN

# Test if token is working
npm run dev
# Check console for: ✅ GitHub token configured

# Generate new token
open https://github.com/settings/tokens

# View documentation
cat ENV_SETUP.md
cat GITHUB_API_SETUP.md
```
