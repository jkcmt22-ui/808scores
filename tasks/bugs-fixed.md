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
