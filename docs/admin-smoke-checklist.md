# Admin Portal Smoke Test Checklist

Use this checklist to verify all admin functionality works after a deployment.

## Pre-Handoff Verification Checklist

### Authentication & Access
- [ ] Can log in to admin portal
- [ ] Non-admin users cannot access admin routes
- [ ] Admin users see correct navigation items
- [ ] Super admin users see additional items (Analytics, Beta Codes, Admin toggle)

### Seasons Management (`/admin/seasons`)
- [ ] Can view list of seasons
- [ ] Can create new season with year, dates, and sports selection
- [ ] Can edit existing season
- [ ] Can set a season as current
- [ ] Can generate teams for a season
- [ ] Teams are created correctly for all schools x selected sports

### User Management (`/admin/users`)
- [ ] Can search users by name
- [ ] Can search users by email
- [ ] Can search users by phone
- [ ] Can grant/revoke Trusted Reporter role
- [ ] Can grant/revoke Beta Access
- [ ] Super admin can grant/revoke Admin role
- [ ] Super admin can grant/revoke Super Admin role
- [ ] Role changes show success message
- [ ] Can view audit log for a user
- [ ] Audit log shows role change history

### Game Management (`/admin` Dashboard)
- [ ] Games list loads correctly
- [ ] Can filter games by status
- [ ] Can search games
- [ ] Can sort games by date (newest/oldest)
- [ ] Can create new game
- [ ] Can edit existing game
- [ ] Can delete a game (with confirmation)
- [ ] Quick score entry works (click on score)
- [ ] Can change scores with +/- buttons
- [ ] Can mark game as final from quick edit
- [ ] Changes save successfully

### Standings (`/admin/standings`)
- [ ] Can view teams by sport
- [ ] Can assign league to a team
- [ ] Can assign division to a team
- [ ] Can edit overall record (wins/losses/ties)
- [ ] Can edit league record (wins/losses/ties)
- [ ] Changes save successfully

### Rosters (`/admin/rosters`)
- [ ] Can select school and sport
- [ ] Can view roster
- [ ] Can add player to roster
- [ ] Can remove player from roster

### Trusted Reporter Applications (`/admin` > Applications tab)
- [ ] Can view pending applications
- [ ] Can view all applications
- [ ] Can approve application
- [ ] Can reject application

### Invite Codes (`/admin` > Invite Codes tab)
- [ ] Can generate new code with note
- [ ] Can copy code to clipboard
- [ ] Can deactivate code

### Other Admin Pages
- [ ] `/admin/schools` - Can view/edit schools
- [ ] `/admin/school-managers` - Can assign managers
- [ ] `/admin/moderation` - Can moderate content
- [ ] `/admin/schedule` - Can view weekly calendar
- [ ] `/admin/tournaments` - Can manage tournaments
- [ ] `/admin/raffles` - Can manage raffles
- [ ] `/admin/prizes` - Can manage prizes

## Error Handling Verification

- [ ] Failed mutations show error toast (not silent failure)
- [ ] Network errors show appropriate message
- [ ] Loading states show spinner
- [ ] Empty states show helpful message

## Full Workflow Test

Complete these workflows end-to-end:

### Workflow 1: New Season Setup
1. Create new season "2026-2027"
2. Enable all sports
3. Generate teams
4. Verify teams were created in database

### Workflow 2: Game Entry and Scoring
1. Create a new game (any sport)
2. Set status to "in_progress"
3. Use quick edit to update score
4. Mark as final
5. Verify standings updated

### Workflow 3: User Role Management
1. Search for a test user
2. Grant trusted reporter role
3. Verify audit log shows the change
4. Revoke the role
5. Verify audit log shows both changes

### Workflow 4: Standings Configuration
1. Go to standings for basketball
2. Assign a team to OIA West
3. Edit their record to 5-2
4. Save and verify changes persisted

## Post-Deployment Checklist

- [ ] All admin routes accessible
- [ ] No console errors on page load
- [ ] Mobile responsive (sidebar works)
- [ ] All buttons clickable and functional
- [ ] Forms submit correctly
- [ ] Success/error messages display
