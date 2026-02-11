# Bug Fix Log

Tracking all bugs fixed to prevent circular fixes.

## Session 2026-02-08 (batch 1-12, from previous session)
1. Search filter XSS via unsanitized input in PostgREST `.or()` filter
2. Push notification toggle sets state before DB confirmation
3. Reminder timer `setInterval` not cleared on unmount (memory leak)
4. Report submission fails silently when Supabase returns error
5. Cron job overwrites manually locked scores
6. Duplicate point awards on rapid submission
7. Stale live games shown after realtime disconnect
8. Daily point cap bypass via concurrent submissions
9. Chat reply threading shows wrong parent message
10. Moderation visibility: hidden messages still visible to non-admins
11. Standings season range query uses wrong date bounds
12. Game stats type mismatch between API response and component props
13. Pagination race condition: fast page changes show wrong results
14. Beta-landing redirect loses `?redirect=` query param
15. Prediction points display shows wrong value for tied games
16. Bracket tie handling incorrect in elimination rounds
17. Beta-landing redirect bypass via direct URL manipulation
18. Community delete button stuck in loading state after error
19. Offline overtime data loss when reconnecting
20. Live hero component crashes when game transitions to final
21. Profile page hides 0% accuracy instead of showing it
22. Community chat reply preview shows raw markdown
23. Leaderboard hides 0% accuracy entries incorrectly
24. Raffle Turnstile CAPTCHA bypass on rapid resubmission
25. Score API type validation missing for numeric fields
26. GIF rendering in community chat shows broken image tags
27. Push toggle state desyncs between settings and hook
28. Modal scroll lock not released on unmount

## Session 2026-02-08 (consistency hardening)
29. Standings admin dropdown hardcoded '2024-2025' instead of computed previous season
30. Legacy standings interface `season_year: number` should be `string` (migration 055)
31. Public standings page duplicated season year logic instead of using `getCurrentSeasonYear()`
32. Push hook `setIsSubscribed(true)` before DB error check (state-before-confirm)
33. Push hook `user?.id || null` dead optional chain (already guarded by early return)

## Session 2026-02-08 (deployment fix)
34. Beta-landing `useSearchParams()` missing Suspense boundary (broke Vercel build for 12h)

## Session 2026-02-08 (batch 13)
35. Games edit `handleUpdateGame` silently drops `scheduled_at` from update payload (rescheduling broken)
36. Moderation page type mismatch: query returns `home_team.school.name` but code accesses `home_team.name` (search crashes, display blank)
37. Game share `handleShare` missing `return` after native share success (falls through to clipboard, overwrites status)

## Session 2026-02-08 (batch 14)
38. Submit success `pointsEarned || calculatePoints()` treats 0 as falsy — shows client estimate when server awards 0 points (changed to `??`)
39. Game chat hooks called after conditional early return (Rules of Hooks violation) — moved `useChatLikes` above return, replaced bare `createClient()` with `useMemo`, added null guards
40. Rejected trusted reporter application permanently blocks reapplication — now allows rejected users to see the form again

## Session 2026-02-08 (batch 15)
41. `sameLeague()` returns true when both schools have null league (`null === null`) — corrupts league standings for unaffiliated schools (added null guard)
42. Profile `useEffect` depends on `profile` object reference — triggers repeated fetches every render (changed to `profile?.id`)
43. Settings page bare `createClient()` creates new Supabase client on every render — wrapped in `useMemo`

## Session 2026-02-08 (batch 16)
44. `use-security.ts` bare `createClient()` in both `useSecurity` and `useTrustScore` — useEffect re-runs every render (wrapped both in `useMemo`)
45. `use-notifications.ts` StrictMode double-fetch guard `hasFetchedRef.current && !userId` allows re-fetch when userId present (removed `&& !userId`)
46. `raffle-card.tsx` win probability shows `Infinity%`/`NaN%` when `winner_count` is 0 or undefined (added `raffle.winner_count > 0` guard)

## Session 2026-02-08 (batch 17)
47. Tournament page `|| 0` score comparisons always pick away team when scores are null — champion determination and game card winner highlighting now use `!== null` checks matching `bracket.tsx`
48. Profile `nextTier` logic falls through to `'standard'` for elite users — shows negative "points to standard" message (now returns `null` for elite, displays "Max tier reached!")
49. Raffle entry modal `Math.floor(points / points_per_entry)` divides by zero when `points_per_entry` is 0 (added `> 0` guard)

## Session 2026-02-08 (raffle system bugs)
50. Multi-prize drawing assigns same `prize_id` to all winners — `executeRaffleDrawing` only received first prize; added `prizeMap` param to map position→prize_id
51. Submit page shows old 10/5/5 point badges and phantom +3/+2 photo/location bonuses — updated type badges to use `calculatePoints()`, changed photo/location to "Boosts trust"
52. First-to-report bonus never calculated in API route — added `priorSubmissionCount` query and `firstToReportBonus` (+1) to `submit-score/route.ts`

## Session 2026-02-08 (security & fairness)
53. Trusted reporter / beta code generation uses `Math.random()` (predictable) — replaced with `crypto.getRandomValues()` in `admin/codes/page.tsx` and `admin/beta-codes/page.tsx`; also fixed duplicate `useAuth()` call in codes page
54. PostgREST filter injection unfixed in 3 files — bug #1 sanitization (`.replace(/[,()]/g, '')`) was only applied to `use-search.ts`; now patched in `admin/users/page.tsx`, `admin/school-managers/page.tsx`, `use-schools.ts`
55. Biased golden game selection using `.sort(() => Math.random() - 0.5)` — replaced with Fisher-Yates shuffle + `crypto.getRandomValues()` in `lib/points/calculator.ts`

## Session 2026-02-08 (batch 18)
56. Settings page `useEffect([profile])` resets unsaved form state on every profile object reference change — changed dependency to `[profile?.id]` (same pattern as bug #42, different file)
57. Notification send route silently swallows `followError` — logs error but returns `{success: true, sent: 0}` indistinguishable from "no subscribers"; now returns 500 with error message
58. `use-realtime.ts` three bare `createClient()` calls (lines 15, 90, 162) cause realtime subscriptions to be torn down and recreated every render — wrapped all three in `useMemo`

## Session 2026-02-10 (admin console errors + new bugs)
59. `use-chat-likes.ts` bare `createClient()` (line 21) causes `fetchLikes` callback to change every render → infinite re-fetch + realtime subscription torn down and recreated every render — wrapped in `useMemo`
60. `use-push-notifications.ts` bare `createClient()` (line 34) causes `subscribe`/`unsubscribe` callbacks to be recreated every render — wrapped in `useMemo`
61. `chat-message.tsx` `message.reply_to.content.substring()` (line 152) crashes with TypeError when reply parent content is null/undefined — added `|| ''` fallback
62. Middleware matcher catches `/manifest.json` requests, runs auth/beta checks, returns HTML redirect → browser shows "Manifest: Line 1, column 1, Syntax error" — added `manifest\\.json` to exclusion pattern
63. Admin users page queries `is_banned` column that was never migrated — created migration 093 to add `is_banned`, `ban_expires_at`, `ban_reason` columns
64. School managers page `user:users(...)` join fails with "Could not embed because more than one relationship was found" (two FKs: `user_id` and `granted_by`) — specified FK explicitly: `user:users!school_managers_user_id_fkey(...)`

## Session 2026-02-10 (batch 19)
65. `admin/prizes/page.tsx` bare `createClient()` (line 63) causes `fetchPrizes` callback to change every render → useEffect triggers infinite re-fetch of prizes — wrapped in `useMemo`
66. `admin/raffles/page.tsx` raffle_prizes delete (lines 394-398) has no error check — if delete fails, insert proceeds creating duplicate prize assignments — added error check + early return
67. `submit/[gameId]/page.tsx` bare `createClient()` (line 39) creates new Supabase client on every render of high-traffic submit page — wrapped in `useMemo`

## Session 2026-02-10 (batch 20)
68. `community/page.tsx` `message.reply_to.content.substring()` (line 79) crashes with TypeError when reply parent content is null — added `|| ''` fallback (same pattern as bug #61, different file)
69. `game-chat.tsx` `replyingTo.content.substring()` (line 500) crashes with TypeError when reply content is null — added `|| ''` fallback (same pattern as bug #61, different file)
70. `use-predictions.ts` four fetch functions (`fetchPrediction`, `fetchExpectation`, `fetchResults`, `checkOpen`) all call `setIsLoading(true)` with no try-catch-finally — if API throws, UI stuck in loading state forever — wrapped all four in try-catch-finally

## Session 2026-02-10 (batch 21)
71. `verification-badge.tsx` `toLocaleString()` (line 98) displays verification time in user's browser timezone instead of Hawaii time — added `{ timeZone: 'Pacific/Honolulu' }`
72. `admin/schedule/page.tsx` `toLocaleTimeString()` (line 1123) displays game times in admin schedule in user's browser timezone instead of Hawaii time — added `timeZone: 'Pacific/Honolulu'`
73. `use-leaderboard.ts` `createClient()` (line 48) called inside useEffect creates a new Supabase client on every re-fetch — hoisted to `useMemo` at hook level
