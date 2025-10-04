# 📄 Pagination Guide

## Overview

The search page now supports loading more results with a smooth pagination system.

## Features

### ✅ What's Included:

1. **Load More Button**

   - Appears at the bottom of search results
   - Shows "Loading More..." state while fetching
   - Disabled during loading to prevent duplicate requests

2. **Smart Pagination**

   - Loads 30 results per page
   - Automatically detects if more results are available
   - Appends new results to existing ones (no page refresh)

3. **End of Results Indicator**

   - Shows "🎉 You've reached the end of the results" when no more pages available
   - Provides clear feedback to users

4. **Optimized Performance**
   - Uses caching to minimize API calls
   - Batch enrichment for faster loading
   - Debounced search to avoid excessive requests

## How It Works

### User Flow:

```
1. User enters search query
   ↓
2. First page (30 results) loads
   ↓
3. "Load More Results" button appears (if more available)
   ↓
4. User clicks "Load More"
   ↓
5. Next 30 results append to existing results
   ↓
6. Repeat steps 3-5 until end
   ↓
7. "You've reached the end" message shows
```

### Technical Details:

**State Management:**

- `currentPage`: Tracks current page number
- `hasMore`: Boolean flag indicating more results available
- `loadingMore`: Loading state for pagination (different from initial load)
- `results`: Accumulated array of all loaded results

**API Integration:**

```javascript
// Search with pagination
const { results, hasMore } = await searchWithFilters(
  query, // Search query
  filters, // Applied filters
  page, // Current page number
  30 // Results per page
);
```

**Reset Behavior:**

- Pagination resets to page 1 when:
  - Search query changes
  - Filters are modified
  - "Use GitHub API" toggle changes

## User Experience

### Visual States:

1. **Initial Search**

   ```
   [Results Grid]
   [Load More Button] ← Blue, prominent
   ```

2. **Loading More**

   ```
   [Results Grid]
   [Loading spinner + "Loading More..."] ← Disabled, shows activity
   ```

3. **End of Results**
   ```
   [Results Grid]
   🎉 You've reached the end of the results
   ```

### Performance Benefits:

- **Reduced Initial Load Time**: Only 30 results loaded initially
- **Better UX**: Users can start browsing faster
- **API Efficiency**: Spreads API calls over time
- **Memory Friendly**: Loads data progressively

## API Rate Limiting

With pagination, you can search efficiently:

- **Without token**: 60 requests/hour (2 searches with pagination)
- **With token**: 5,000 requests/hour (166+ searches with pagination)

## Tips for Users

1. **Start Broad**: Begin with general search terms, then refine
2. **Use Filters**: Apply filters before loading more pages
3. **Bookmark Repos**: Save interesting repos as you scroll
4. **Clear Cache**: If seeing stale data, clear cache and refresh

## Future Enhancements

Potential improvements:

- [ ] Infinite scroll option
- [ ] Jump to page number
- [ ] Show current page / total pages
- [ ] Save scroll position
- [ ] Prefetch next page

## Troubleshooting

**Load More button not appearing?**

- Check if you have less than 30 results (no more to load)
- Verify you have a valid GitHub token configured
- Clear cache if seeing cached "no more results" state

**Loading taking too long?**

- Check your network connection
- Verify GitHub token is valid
- Consider using fewer filters for broader results

## Code Examples

### Loading More Results

```javascript
const loadMore = () => {
  const nextPage = currentPage + 1;
  setCurrentPage(nextPage);
  performSearch(query, filters, nextPage, true); // append=true
};
```

### Handling Pagination State

```javascript
// Reset pagination on new search
useEffect(() => {
  setCurrentPage(1);
  performSearch(query, filters, 1, false); // append=false
}, [query, filters]);
```

---

🎉 Happy searching! Enjoy discovering open-source repositories with smooth pagination.
