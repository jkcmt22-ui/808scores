# Video 2: Team Managers (Coaches & Booster Clubs)

**Target Length:** 4-5 minutes
**Tone:** Professional, empowering, efficient
**Audience:** Coaches, athletic directors, booster club members, school staff

---

## Full Script

### SCENE 1: Introduction (15 sec)

**Screen:** Admin dashboard glimpse

**Voiceover:**
> "As a team manager on Hawaii Sports Center, you have special tools to keep your team's information accurate and up-to-date. This guide covers everything you need to know."

---

### SCENE 2: Getting Manager Access (30 sec)

**Screen:** Contact information / Admin assignment graphic

> **NOTE:** Self-service claiming is NOT built. Show a "Contact Admin" graphic.

**Voiceover:**
> "To become a team manager, contact the Hawaii Sports Center admin team. Once approved, you'll have access to manage your school's rosters and player statistics. Your admin will assign you as an Owner, Manager, or Assistant based on your role."

**Visual:** Display a simple graphic with:
- Email: admin@Hawaii Sports Center.com (or actual contact)
- Text: "Request manager access for your school"

---

### SCENE 3: Roster Management (75 sec)

**Screen:** /admin/rosters page

**Voiceover:**
> "Let's start with roster management. From the admin panel, navigate to Rosters. Select your school, then choose the sport, gender, and season."

**UI Highlights:**
- School dropdown
- Sport selector
- Gender selector (Boys/Girls)
- Season selector (2025-2026)

**Voiceover (continued):**
> "You'll see all players currently on the roster. To add a new player, click 'Add Player' and fill in their information - name, jersey number, position, and grade level. Mark team captains with the captain toggle."

**UI Highlights:**
- Add Player button
- Player form fields:
  - First Name / Last Name
  - Jersey Number
  - Position dropdown
  - Grade dropdown (Freshman, Sophomore, Junior, Senior)
- Captain toggle (star icon)
- Save button

**Voiceover (continued):**
> "To edit a player, click the edit icon next to their name. Need to remove someone? Click delete and confirm. Changes save immediately."

**UI Highlights:**
- Edit icon (pencil) on player row
- Delete icon (trash)
- Delete confirmation modal

---

### SCENE 4: Entering Player Stats (75 sec)

**Screen:** /admin/games/[gameId]/stats page

**Voiceover:**
> "After a game ends, you can enter detailed player statistics. Find the game in the admin panel and click 'Enter Stats'."

**UI Highlights:**
- Game row in admin list
- "Enter Stats" button
- Stats page header showing game matchup and date

**Voiceover (continued):**
> "The stats form is organized by team - use the tabs to switch between home and away. For each player, enter their key statistics. The form adapts to each sport - basketball shows points, rebounds, and assists; football shows passing yards, touchdowns, and tackles."

**UI Highlights:**
- Home/Away team tabs
- Player rows with jersey # and name
- Stat input fields (numeric)
- Sport-specific fields visible

**Voiceover (continued):**
> "Click the expand arrow to see additional stat fields. When you're done, hit Save. Stats will appear on the game page for fans to see."

**UI Highlights:**
- Expand chevron button
- Additional stat fields revealed
- Save button
- "Saving..." → "Saved!" state transition

---

### SCENE 5: Verifying Scores (45 sec)

**Screen:** Admin game management - quick edit

> **NOTE:** Formal dispute UI not built. Show basic score editing.

**Voiceover:**
> "If a submitted score needs correction, you can update it directly. Find the game in the admin panel and click to edit. Update the scores and save. Your changes take effect immediately."

**UI Highlights:**
- Game row in list
- Click on score to enter edit mode
- +/- buttons for score adjustment
- Status buttons (Scheduled, In Progress, Final)
- Save/Cancel buttons

---

### SCENE 6: Permission Levels (30 sec)

**Screen:** Role hierarchy graphic

**Voiceover:**
> "Your permissions depend on your role. Owners have full control and can add other managers. Managers can edit school info and rosters. Assistants can post team updates and news. Check with your admin if you need additional access."

**Graphic Elements:**
```
OWNER (Pink badge)
├── Full control
├── Add/remove managers
├── Edit school info
├── Manage rosters
└── Post updates

MANAGER (Blue badge)
├── Edit school info
├── Manage rosters
└── Post updates

ASSISTANT (Green badge)
└── Post updates only
```

---

### SCENE 7: Closing (15 sec)

**Screen:** Admin dashboard

**Voiceover:**
> "That's everything you need to manage your team on Hawaii Sports Center. Keep your roster current, enter stats after games, and help fans stay connected to your program. Mahalo for being part of the community!"

---

## Screen Recording Checklist

| # | Page/Component | Duration | Recording Notes |
|---|----------------|----------|-----------------|
| 1 | Admin overview | 5s | Brief dashboard view |
| 2 | Contact graphic | 15s | Static graphic or placeholder |
| 3 | /admin/rosters | 20s | Select school → sport → gender → season |
| 4 | Roster list | 15s | Show populated player list |
| 5 | Add Player modal | 25s | Fill out all fields slowly |
| 6 | Edit player | 15s | Click edit, change a field, save |
| 7 | /admin (games tab) | 10s | Find game, click Enter Stats |
| 8 | /admin/games/[id]/stats | 40s | Enter stats for 3-4 players |
| 9 | Stats - expanded | 15s | Click expand, show more fields |
| 10 | Save stats | 10s | Save and show confirmation |
| 11 | Quick score edit | 20s | Click score, adjust, save |
| 12 | Role graphic | 20s | Static graphic |
| 13 | Closing | 10s | Dashboard view, fade out |

**Estimated Total: ~4 minutes**

---

## Graphics to Create

### Graphic 1: Contact Admin
Simple graphic showing how to request manager access:
- Hawaii Sports Center logo
- "Request Team Manager Access"
- Contact email or form link
- Brief description of what managers can do

### Graphic 2: Role Hierarchy
Visual hierarchy showing three permission levels:
- Owner → Manager → Assistant
- Color-coded badges (pink, blue, green)
- List of permissions for each level

---

## UI Callouts to Highlight

1. **Roster page:** School/sport/gender/season selectors
2. **Add Player:** Required fields (name), optional fields (jersey)
3. **Captain toggle:** Star icon
4. **Stats page:** Home/Away tabs
5. **Stats input:** Numeric fields, expand button
6. **Quick edit:** Score +/- buttons, status buttons

---

## Test Data Needed

Before recording, ensure:
- [ ] Test school with existing roster (5+ players)
- [ ] At least one "Final" game for stat entry
- [ ] Test account has "Manager" or "Owner" role for a school
- [ ] Players have varied positions and grades
