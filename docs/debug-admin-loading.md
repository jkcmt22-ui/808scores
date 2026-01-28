# Debug Admin Loading Issues

## Quick Start

Enable debug logging in browser console:
```javascript
__navDebug.enable()  // Enables and reloads page
```

Or set environment variable:
```bash
NEXT_PUBLIC_DEBUG_NAV=1 npm run dev
```

## Repro Script

### Scenario 1: Admin Tab Navigation
Starting state: Logged in as admin at `/admin`

| Step | Action | Expected | Actual (before fix) |
|------|--------|----------|---------------------|
| 1 | Click "Schools" in sidebar | Page loads < 1s | Infinite loading |
| 2 | Click "Dashboard" in sidebar | Page loads < 1s | Infinite loading |
| 3 | Click "Analytics" in sidebar | Page loads < 1s | Infinite loading |

### Scenario 2: Admin ↔ User View
Starting state: Logged in as admin at `/admin`

| Step | Action | Expected | Actual (before fix) |
|------|--------|----------|---------------------|
| 1 | Click home icon to go to `/` | Home loads < 1s | Works |
| 2 | Click Admin in menu to go to `/admin` | Admin loads < 1s | Infinite loading |
| 3 | Repeat steps 1-2 | Same | Gets worse |

## Debug Commands

```javascript
// Get full summary
__navDebug.getSummary()

// Check for infinite loading states
__navDebug.checkInfinite()

// Get all events
__navDebug.getEvents()

// Get active loading states
__navDebug.getLoadingStates()

// Get active subscriptions
__navDebug.getSubscriptions()

// Disable debug mode
__navDebug.disable()
```

## What to Look For

### 1. Duplicate Auth Checks
Look for multiple `[NAV-DEBUG] AUTH:` logs for the same navigation:
```
[NAV-DEBUG] AUTH: Auth state in AdminLayout
[NAV-DEBUG] AUTH: Auth state in AdminPage  <-- DUPLICATE!
```

### 2. Loading State Never Ends
Look for `START` without matching `END`:
```
[NAV-DEBUG] LOADING: START: AdminLayout - auth check
// ... no END log = infinite loading
```

### 3. Fetch Loops
Look for high fetch count in single navigation:
```
[NAV-DEBUG] FETCH: AuthProvider: profile  fetchCount: 1
[NAV-DEBUG] FETCH: AuthProvider: profile  fetchCount: 2  <-- LOOP!
[NAV-DEBUG] FETCH: AuthProvider: profile  fetchCount: 3  <-- LOOP!
```

### 4. Subscription Leaks
Look for high subscription count:
```
[NAV-DEBUG] SUBSCRIPTION: CREATE: auth totalActive: 1
[NAV-DEBUG] SUBSCRIPTION: CREATE: auth totalActive: 2  <-- LEAK!
```

## Root Cause Analysis

### Current Issues Found:

1. **Duplicate Auth Checks** (CONFIRMED)
   - `admin/layout.tsx` lines 55-113: checks authLoading, user, profile, hasAdminAccess
   - `admin/page.tsx` lines 794-838: checks THE SAME THINGS
   - Each check can show loading state, causing confusion

2. **Render-time Redirects** (CONFIRMED)
   - `admin/layout.tsx` line 70-72: `router.push()` during render
   - `admin/page.tsx` line 805-807: `router.push()` during render
   - This is a React anti-pattern causing re-render loops

3. **Multiple Loading UI Sources**
   - Layout shows loading spinner (lines 55-67)
   - Page shows loading spinner (lines 794-802)
   - User sees double loading or flicker

## Fix Verification Checklist

After applying fixes, verify:

- [ ] Navigate `/admin` → `/admin/schools` → `/admin` (no infinite load)
- [ ] Navigate `/admin` → `/` → `/admin` (no infinite load)
- [ ] Check `__navDebug.checkInfinite()` returns `{ isInfinite: false }`
- [ ] Check `__navDebug.getSummary().activeLoadingStates` is empty after page loads
- [ ] Auth fetch count per navigation is exactly 1
- [ ] No duplicate `AUTH:` logs for same navigation

## Before/After Metrics

| Metric | Before | After |
|--------|--------|-------|
| Profile fetches per tab change | TBD | Target: 0 |
| Auth checks per tab change | TBD | Target: 1 (layout only) |
| Time to render admin tab | TBD | Target: < 500ms |
| Active subscriptions | TBD | Target: 1 (AuthProvider only) |
