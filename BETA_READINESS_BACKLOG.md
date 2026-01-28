# Beta Readiness Backlog

## Executive Summary

Based on comprehensive codebase audit, here are the prioritized issues blocking beta release.

**Key Finding:** The infinite loader issues in admin panel and Today tab are caused by:
1. Infinite loop in admin page useEffect (sports/schools dependencies)
2. Missing `finally` blocks leaving loading states stuck
3. Auth loading timeout logic that can hang

---

## P0 - Critical (Must Fix Before Beta)

### P0-1: Admin Page Infinite Loop
**Symptoms:** Admin panel shows infinite loader on games tab
**Root Cause:** `useEffect` dependency array includes `sports.length` and `schools.length`, but these are set inside `fetchCommonData()` which is called in the same effect. This creates: dependency changes → fetch → setState → dependency changes → infinite loop.

**File:** `apps/web/src/app/(protected)/admin/page.tsx`
**Lines:** 333-364

```typescript
// PROBLEM: sports.length and schools.length in deps, but fetchCommonData sets them
useEffect(() => {
  if (!hasAdminAccess || authLoading) return
  if (sports.length === 0 || schools.length === 0) {
    fetchCommonData()  // Sets sports and schools, triggering re-run
  }
  // ...
}, [hasAdminAccess, authLoading, activeTab, sports.length, schools.length])
```

**Fix Approach:**
- Remove `sports.length` and `schools.length` from dependency array
- Use a `hasLoadedCommonData` ref to track if initial fetch happened
- Add proper initialization flag

**Estimated Risk:** Low (logic change only)

---

### P0-2: Missing Finally Blocks - Loading States Stuck
**Symptoms:** Loader spins forever after any fetch error
**Root Cause:** Four fetch functions in admin page set `setLoadingStates(true)` but only clear it at the end of try block. If error thrown mid-execution, loading never clears.

**File:** `apps/web/src/app/(protected)/admin/page.tsx`
**Functions affected:**
- `fetchGames()` - lines 212-244
- `fetchApplications()` - lines 247-275
- `fetchCodes()` - lines 277-302
- `fetchUsers()` - lines 304-330

**Fix Approach:**
```typescript
// Wrap in try/finally
const fetchGames = useCallback(async () => {
  if (!supabase) return
  setLoadingStates(prev => ({ ...prev, games: true }))
  try {
    // ... fetch logic
  } catch (err) {
    console.error('Error:', err)
    setMessage({ type: 'error', text: 'Failed to load' })
  } finally {
    setLoadingStates(prev => ({ ...prev, games: false }))  // Always runs
  }
}, [supabase])
```

**Estimated Risk:** Very low (adds safety)

---

### P0-3: Auth Provider No Timeout
**Symptoms:** App hangs on initial load if Supabase is slow/down
**Root Cause:** `AuthProvider.initAuth()` calls `supabase.auth.getUser()` without timeout. If Supabase hangs, `setIsLoading(false)` never runs.

**File:** `apps/web/src/components/providers/auth-provider.tsx`
**Lines:** 82-136

**Fix Approach:**
- Add AbortController with 10s timeout
- Or use Promise.race with timeout promise
- Show error UI if auth times out

**Estimated Risk:** Low (adds fallback behavior)

---

### P0-4: Null Date Crashes in Raffles Page
**Symptoms:** Admin raffles page crashes if dates are null
**Root Cause:** Code calls `.toLocaleDateString()` on nullable date fields without null check

**File:** `apps/web/src/app/(protected)/admin/raffles/page.tsx`
**Lines:** 502-508

**Fix Approach:**
```typescript
// Add null checks
{raffle.entries_open_at && new Date(raffle.entries_open_at).toLocaleDateString()}
```

**Estimated Risk:** Very low

---

### P0-5: Null Prize Reference Crash
**Symptoms:** Raffle display crashes if prize was deleted
**Root Cause:** No null check before accessing `raffle.prize.name`

**File:** `apps/web/src/app/(protected)/admin/raffles/page.tsx`
**Line:** ~502

**Fix Approach:**
```typescript
{raffle.prize?.name || 'No prize assigned'}
```

**Estimated Risk:** Very low

---

## P1 - High Priority (Fix in First Week)

### P1-1: Realtime Subscription Leaks
**File:** `apps/web/src/hooks/use-general-chat.ts` (lines 140-189)
**Issue:** Channel created on every supabase change, causing duplicate listeners
**Fix:** Use ref to track if subscribed, cleanup properly

### P1-2: fetchNotifications Infinite Loop
**File:** `apps/web/src/hooks/use-notifications.ts` (lines 59-100)
**Issue:** `fetchNotifications` in useEffect deps creates new function each render
**Fix:** Stabilize callback with proper deps or use ref

### P1-3: Admin Layout Timeout Hangs Forever
**File:** `apps/web/src/app/(protected)/admin/layout.tsx` (lines 82-99)
**Issue:** After 10s timeout, shows "Loading Timeout" but never recovers
**Fix:** Add retry button, or auto-retry with backoff

### P1-4: Chat User Lookups N+1
**File:** `apps/web/src/components/chat/game-chat.tsx` (lines 155-173)
**Issue:** Fetches user data individually for each new message
**Fix:** Batch user lookups, or prefetch common users

### P1-5: Home Page No Error State
**File:** `apps/web/src/app/page.tsx` (lines 145-149)
**Issue:** If games fetch fails, shows blank page
**Fix:** Add error state handling from useGames hook

### P1-6: Missing Empty States
**File:** `apps/web/src/app/page.tsx`
**Issue:** Live/scheduled/final game sections show nothing when empty
**Fix:** Add "No games" placeholder cards

### P1-7: Chat Send Errors Not Shown
**File:** `apps/web/src/components/chat/game-chat.tsx`
**Issue:** Error state stored but never displayed to user
**Fix:** Show error toast with retry option

---

## P2 - Medium Priority (Fix Before Public Launch)

### P2-1: Double Game Fetch
**File:** `apps/web/src/app/(public)/game/[id]/page.tsx`
**Issue:** Game fetched server-side for metadata AND client-side in component
**Fix:** Pass server data as prop to client component

### P2-2: Admin Games Query Overfetching
**File:** `apps/web/src/app/(protected)/admin/page.tsx` (lines 220-229)
**Issue:** Uses `select('*')` on related tables
**Fix:** Specify only needed columns

### P2-3: Moderation Pagination Missing
**File:** `apps/web/src/app/(protected)/admin/moderation/page.tsx`
**Issue:** Fetches 200 messages with full relations at once
**Fix:** Add pagination, reduce limit

### P2-4: Missing Toast Notifications
**Files:** Multiple admin pages
**Issue:** CRUD operations succeed/fail silently
**Fix:** Add toast notification system

### P2-5: Form Validation Gaps
**File:** `apps/web/src/app/(protected)/admin/raffles/page.tsx`
**Issue:** No validation that close date > open date
**Fix:** Add inline validation

### P2-6: Search Index Missing
**File:** `apps/web/src/hooks/use-search.ts`
**Issue:** Text search on schools uses ILIKE without index
**Fix:** Add GIN trigram index

### P2-7: TypeScript Type Gaps
**File:** `apps/web/src/types/database.ts`
**Issue:** Missing `TeamManager`, `Team` types
**Fix:** Add missing type definitions

---

## Recommended Fix Order

### Phase 1: Stop the Crashes (Day 1)
1. **P0-1:** Fix admin page infinite loop
2. **P0-2:** Add finally blocks to all fetch functions
3. **P0-4 + P0-5:** Add null checks in raffles page

### Phase 2: Auth Stability (Day 2)
4. **P0-3:** Add timeout to auth initialization
5. **P1-3:** Fix admin layout timeout recovery

### Phase 3: Realtime Stability (Day 3)
6. **P1-1:** Fix chat subscription leak
7. **P1-2:** Fix notifications infinite loop

### Phase 4: User Feedback (Day 4-5)
8. **P1-5 + P1-6:** Add error/empty states to home page
9. **P1-7:** Show chat errors with retry

---

## Verification Checklist

After each fix:
- [ ] Admin panel loads without infinite spinner
- [ ] Switching admin tabs works
- [ ] Today tab loads games
- [ ] Chat messages send and appear
- [ ] Raffles page displays without crash
- [ ] Error scenarios show user-friendly messages
- [ ] Network errors don't freeze the UI

---

## Files Most Changed

| File | Changes Needed |
|------|----------------|
| `apps/web/src/app/(protected)/admin/page.tsx` | P0-1, P0-2 |
| `apps/web/src/app/(protected)/admin/raffles/page.tsx` | P0-4, P0-5 |
| `apps/web/src/components/providers/auth-provider.tsx` | P0-3 |
| `apps/web/src/app/(protected)/admin/layout.tsx` | P1-3 |
| `apps/web/src/hooks/use-general-chat.ts` | P1-1 |
| `apps/web/src/hooks/use-notifications.ts` | P1-2 |
| `apps/web/src/app/page.tsx` | P1-5, P1-6 |
| `apps/web/src/components/chat/game-chat.tsx` | P1-4, P1-7 |
