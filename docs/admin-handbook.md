# HawaiiSportsCenter Admin Handbook

A practical guide for managing the admin portal day-to-day.

## Accessing the Admin Portal

1. Go to `yourdomain.com/admin`
2. Log in with your admin account
3. You'll see the admin sidebar with all available sections

## Common Tasks

### Entering Game Scores (Most Common)

1. Go to **Dashboard** (default page)
2. Find the game in the list (use search or filters)
3. **Quick Score Entry**: Click directly on the score to open quick edit mode
4. Use the +/- buttons or type the scores
5. Click the "final" button to mark the game as complete
6. Click the green save button

### Creating a New Game

1. Go to **Dashboard** > click "Create Game" tab
2. Select the sport
3. Select away team and home team
4. Set the date/time and venue
5. Click "Create Game"

### Managing Standings

1. Go to **Standings** in the sidebar
2. Select a sport to view teams
3. **Assign Divisions**: Use the dropdown next to each team to assign their league/division
4. **Edit Records**: Click "Edit Records" to manually adjust wins/losses/ties

### Managing Rosters

1. Go to **Rosters** in the sidebar
2. Select a school, then a sport
3. View, add, or remove players from teams

### Managing Seasons

1. Go to **Seasons** in the sidebar
2. View all seasons and their status
3. **Create New Season**: Click "New Season" and fill in the year and dates
4. **Generate Teams**: Click "Generate Teams" to automatically create team entries for all schools
5. **Set Current Season**: Click "Set Current" to make a season the active one

### Managing Users

1. Go to **Users** in the sidebar
2. Search for a user by name, email, or phone
3. Click the role buttons to grant/revoke:
   - **Trusted**: Auto-verified scores, badge on comments
   - **Beta**: Access to beta features
   - **Admin**: Backend access (super admin only)
   - **Super**: Full access (super admin only)
4. Click the clock icon to view role change history

### Reviewing Trusted Reporter Applications

1. Go to **Dashboard** > "Applications" tab
2. Review pending applications
3. Click "Approve" or "Reject" for each

### Generating Trusted Reporter Codes

1. Go to **Dashboard** > "Invite Codes" tab
2. Add an optional note (e.g., "For Coach Smith")
3. Click "Generate Code"
4. Share the code with the person - they can enter it on the site to become a trusted reporter

## Admin Sidebar Navigation

| Section | Purpose |
|---------|---------|
| Dashboard | Games CRUD, applications, invite codes |
| Seasons | Create/manage competitive seasons |
| Users | User search and role management |
| Standings | Team league/division assignment |
| Tournaments | Tournament management |
| Schools | School information |
| School Managers | Assign school managers |
| Rosters | Player roster management |
| Moderation | Chat/comment moderation |
| Schedule | Weekly game calendar view |
| Raffles | Raffle campaigns |
| Prizes | Prize inventory |

## Role Hierarchy

- **Super Admin**: Full access, can manage all users and other admins
- **Admin**: Backend access to manage content (games, schools, etc.)
- **Trusted Reporter**: Auto-verified scores, badge on comments
- **Beta Access**: Access to beta features before public release

## Troubleshooting

### "Profile Not Found" Error
1. Try a hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. This clears cached JavaScript and reloads fresh code

### Actions Not Saving
1. Check for error messages (red banners at top of page)
2. Make sure you're connected to the internet
3. Try refreshing the page and attempting again

### User Role Changes Not Working
1. Only super admins can grant/revoke Admin and Super Admin roles
2. Any admin can grant/revoke Trusted Reporter and Beta Access

## Quick Reference: Game Status

- **Scheduled**: Upcoming game, not yet started
- **In Progress**: Game is currently being played
- **Final**: Game is complete, scores are official
- **Postponed**: Game delayed to future date
- **Canceled**: Game will not be played
