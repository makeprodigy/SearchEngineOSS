# GitHub API Setup Guide

## Overview

The application now uses the GitHub REST API to fetch real-time repository data. You can use it with or without an authentication token.

## Rate Limits

- **Without token**: 60 requests per hour (per IP address)
- **With token**: 5,000 requests per hour

## How to Add a GitHub Token (Optional)

Adding a token is recommended for better performance and higher rate limits.

### Step 1: Create a GitHub Personal Access Token

1. Go to [GitHub Settings → Tokens](https://github.com/settings/tokens)
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a descriptive name (e.g., "OSS Discovery Engine")
4. Select scopes:
   - For public repositories only: Select `public_repo`
   - For all repositories: Select `repo`
5. Click "Generate token"
6. **Important**: Copy the token immediately (you won't see it again!)

### Step 2: Add Token to Your Project

1. Create a `.env` file in the project root (next to `package.json`)
2. Add your token:
   ```
   VITE_GITHUB_TOKEN=your_token_here
   ```
3. Save the file
4. Restart your development server

### Step 3: Verify It Works

The application will automatically use the token if it's present. You can verify by:

- Checking the browser console for any rate limit errors
- Making multiple searches without hitting rate limits

## Security Note

⚠️ **Never commit your `.env` file or share your token publicly!**

The `.env` file is already in `.gitignore` to prevent accidental commits.

## Features

### Real-Time Search

- Search updates automatically as you type (debounced to avoid excessive API calls)
- Results are cached for 5 minutes to reduce API usage
- Rate limiting ensures we don't exceed GitHub's limits

### Filtering

All filters work in real-time:

- **Language**: JavaScript, Python, TypeScript, etc.
- **License**: MIT, Apache-2.0, GPL, etc.
- **Stars**: Minimum star count
- **Health Score**: Repository health (calculated)
- **Good First Issues**: Beginner-friendly issues
- **Sort By**: Stars, forks, recently updated, etc.

### Landing Page

- **Popular Projects**: Top starred repositories
- **Trending**: Recently popular repositories
- **Recommended**: Based on your tech stack preferences

## Troubleshooting

### Rate Limit Errors

If you see "GitHub API rate limit exceeded":

1. Wait for the rate limit to reset (shown in error message)
2. Add a GitHub token (see above) for higher limits
3. Toggle "Use GitHub API" off to use cached/mock data

### No Results

If searches return no results:

1. Check your internet connection
2. Verify GitHub.com is accessible
3. Try a broader search query
4. Check browser console for errors

### Slow Performance

To improve performance:

1. Add a GitHub token (increases rate limits)
2. Use more specific search queries
3. Apply filters to narrow results
4. Clear cache if needed (refresh the page)

## Development Mode

The search page includes a toggle to switch between:

- **GitHub API**: Live data from GitHub
- **Mock Data**: Cached data for development

This is useful when developing offline or to avoid rate limits during testing.

## API Endpoints Used

The application uses these GitHub API endpoints:

- `/search/repositories` - Search repositories
- `/repos/{owner}/{repo}` - Repository details
- `/repos/{owner}/{repo}/contributors` - Contributors count
- `/repos/{owner}/{repo}/stats/commit_activity` - Commit statistics
- `/search/issues` - Good first issues count

## Cache Management

The application automatically caches API responses for 5 minutes to:

- Reduce API usage
- Improve performance
- Avoid rate limits

Cache is stored in memory and clears on page refresh.
