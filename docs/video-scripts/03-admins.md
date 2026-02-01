# Video 3: Admins

**Target Length:** 5-6 minutes
**Tone:** Efficient, comprehensive, authoritative
**Audience:** Site administrators, super admins, moderators

---

## Full Script

### SCENE 1: Introduction (15 sec)

**Screen:** Admin dashboard overview

**Voiceover:**
> "Welcome to the Hawaii Sports Center admin panel. This guide covers the essential tools for managing users, content, and the community. Let's dive in."

---

### SCENE 2: Dashboard Overview (45 sec)

**Screen:** /admin main page with tabs

**Voiceover:**
> "The admin dashboard is your command center. The main tabs let you manage games, create new games, review applications, generate invite codes, and manage users. Quick links at the top take you to specialized pages for tournaments, schools, rosters, and more."

**UI Highlights:**
- Tab bar: Manage Games, Create Game, Applications, Invite Codes, Manage Users
- Quick nav buttons: Tournaments, Schools, School Managers, Rosters, Moderation, Schedule, Raffles, Prizes
- Sidebar navigation (show collapse/expand on desktop)

**Voiceover (continued):**
> "Super admins have additional access to Analytics, Beta Codes, and user role management. The sidebar provides quick navigation to any section."

---

### SCENE 3: Game Management (45 sec)

**Screen:** Manage Games tab

**Voiceover:**
> "The Games tab shows all scheduled and completed games. Use filters to find specific games - search by team name, filter by status, or sort by date."

**UI Highlights:**
- Search box with placeholder text
- Status filter dropdown (All, Scheduled, In Progress, Final, Postponed)
- Sort toggle (Newest/Oldest)
- Game rows with status badges

**Voiceover (continued):**
> "Click any game's score to quick-edit it right from the list. For more options, click Edit to open the full game form, or Delete to remove a game entirely."

**UI Highlights:**
- Score display (clickable)
- Quick-edit mode: +/- buttons
- Status quick-set buttons
- Edit and Delete action buttons

---

### SCENE 4: Approving Team Managers (60 sec)

**Screen:** /admin/school-managers

**Voiceover:**
> "School managers are coaches and staff who need roster access. Navigate to School Managers to see all current assignments."

**UI Highlights:**
- Manager list table
- Role badges (Owner - pink, Manager - blue, Assistant - green)
- Permission badges (Edit Info, Roster, Schedule, Updates)
- Statistics panel (Total managers, Owners, Schools with/without managers)

**Voiceover (continued):**
> "To add a new manager, search for the user by name or email, select their school, and choose their role. Owners have full control. Managers can edit info and rosters. Assistants can only post updates."

**UI Highlights:**
- User search input with autocomplete
- School dropdown selector
- Role selector (Owner, Manager, Assistant)
- Permission checkboxes

**Voiceover (continued):**
> "Review their permissions - you can customize exactly what each person can do. Click Save to grant access. The user will immediately have their new permissions."

**UI Highlights:**
- Permission toggles
- Save button
- New manager appearing in list

---

### SCENE 5: Chat Moderation (45 sec)

**Screen:** /admin/moderation

**Voiceover:**
> "The Moderation page helps you keep chat clean and respectful. By default, you'll see reported messages - content that users have flagged."

**UI Highlights:**
- Filter tabs: Reported Messages, Hidden Messages, All Messages
- Report count badge (red number)
- Message preview with content
- User info and game context

**Voiceover (continued):**
> "For each message, you can hide it from public view, view the game context, or delete it permanently. Hidden messages can be restored if needed."

**UI Highlights:**
- Hide/Unhide toggle button
- "View Game" link
- Delete button
- Confirmation modal for delete

**Voiceover (continued):**
> "The stats at the top show your moderation overview - total reported, hidden, and all messages across the platform."

**UI Highlights:**
- Stats cards (Reported - pink, Hidden - yellow, Total - blue)

---

### SCENE 6: Raffle Management (60 sec)

**Screen:** /admin/raffles → /admin/prizes

**Voiceover:**
> "Raffles keep the community engaged. Start by setting up prizes in the Prizes section. Each prize has a name, value, type, and optional sponsor."

**UI Highlights:**
- Prize list with icons
- Add Prize button
- Prize form fields:
  - Name
  - Description
  - Value (in dollars)
  - Type dropdown (Gift Card, Merchandise, Cash, Experience)
  - Sponsor name
  - Image URL
  - Quantity
  - Active toggle

**Voiceover (continued):**
> "Now create a raffle. Give it a name, select the prize, and configure entry rules - minimum points to enter, points per entry, and maximum entries per user."

**Screen:** /admin/raffles create form

**UI Highlights:**
- Raffle name input
- Description textarea
- Type dropdown (Monthly, Season End, Special)
- Prize selector
- Entry configuration:
  - Entries Open date/time
  - Entries Close date/time
  - Drawing date/time
  - Minimum points to enter
  - Points per entry
  - Maximum entries per user
  - Winner count

**Voiceover (continued):**
> "Set the entry window - when entries open, when they close, and when the drawing happens. Save the raffle, and users will see it on the leaderboard when entries open."

---

### SCENE 7: Handling Flagged Scores (30 sec)

**Screen:** Admin games tab with edit

> **NOTE:** Formal dispute queue not built. Show standard score editing.

**Voiceover:**
> "When a score is questioned, you can correct it directly. Find the game, click to edit, and update the scores. Mark it as verified to indicate admin confirmation."

**UI Highlights:**
- Game row in list
- Edit button → Full game form
- Score input fields
- "Verified" checkbox
- Save button

---

### SCENE 8: User Management (45 sec)

**Screen:** /admin/users (or Manage Users tab for super admin)

**Voiceover:**
> "User management lets you control roles and permissions. Search for any user by name, email, or phone."

**UI Highlights:**
- Search input
- User list with columns: Name, Email, Phone, Joined, Roles
- Role badges on each row
- Pagination controls

**Voiceover (continued):**
> "Super admins can grant or revoke admin access. All admins can toggle Trusted Reporter status - these users get auto-verified submissions and a special badge. You can also grant beta access for early features."

**UI Highlights:**
- Role toggle buttons:
  - Super Admin (pink) - super admin only
  - Admin (blue) - super admin only
  - Trusted Reporter (green)
  - Beta Access (yellow)

**Voiceover (continued):**
> "Every role change is logged. Click the history button to see who made changes and when."

**UI Highlights:**
- History/Audit button
- Audit modal showing change log

---

### SCENE 9: Closing (15 sec)

**Screen:** Dashboard overview

**Voiceover:**
> "That's your admin toolkit for Hawaii Sports Center. Keep games updated, support your managers, maintain a healthy community, and make Hawaii high school sports better for everyone. Mahalo!"

---

## Screen Recording Checklist

| # | Page/Component | Duration | Recording Notes |
|---|----------------|----------|-----------------|
| 1 | /admin overview | 15s | Pan across tabs and quick links |
| 2 | Sidebar nav | 10s | Expand/collapse, show all sections |
| 3 | Manage Games tab | 20s | Search "Kahuku", filter by Final |
| 4 | Quick score edit | 15s | Click score, adjust +1, save |
| 5 | /admin/school-managers | 15s | Show existing manager list |
| 6 | Add manager flow | 30s | Search user, select school, choose Owner role |
| 7 | /admin/moderation | 20s | Show reported messages list |
| 8 | Moderate message | 15s | Hide one message, delete another |
| 9 | /admin/prizes | 15s | Show prize list |
| 10 | Add prize | 15s | Create "$25 Gift Card" prize |
| 11 | /admin/raffles | 15s | Show raffle list |
| 12 | Create raffle | 30s | Full raffle setup with all fields |
| 13 | Edit game score | 15s | Find game, edit, check Verified |
| 14 | /admin/users | 25s | Search user, toggle Trusted Reporter |
| 15 | Audit history | 10s | Click history, show change log |
| 16 | Closing | 10s | Return to dashboard, fade out |

**Estimated Total: ~5 minutes**

---

## UI Callouts to Highlight

1. **Dashboard:** Tab bar, quick nav buttons, sidebar toggle
2. **Game management:** Search box, status filter, quick-edit mode
3. **School managers:** Role badges, permission checkboxes, statistics
4. **Moderation:** Filter tabs, report count, hide/delete buttons
5. **Prizes:** Type dropdown, value field
6. **Raffles:** Date pickers, entry configuration
7. **Users:** Role toggles, history button, audit modal

---

## Test Data Needed

Before recording, ensure:
- [ ] 20+ games across various statuses
- [ ] At least 3 existing school managers with different roles
- [ ] 5+ reported chat messages for moderation demo
- [ ] 2-3 existing prizes
- [ ] 1 active raffle
- [ ] 10+ users with varying roles for user management
- [ ] Some audit history entries

---

## Super Admin vs Admin Features

| Feature | Admin | Super Admin |
|---------|-------|-------------|
| Manage Games | Yes | Yes |
| School Managers | Yes | Yes |
| Moderation | Yes | Yes |
| Raffles & Prizes | Yes | Yes |
| User - Trusted Reporter | Yes | Yes |
| User - Beta Access | Yes | Yes |
| User - Admin toggle | No | Yes |
| User - Super Admin toggle | No | Yes |
| Analytics | No | Yes |
| Beta Codes | No | Yes |

When recording, use a **super admin account** to show all features.
