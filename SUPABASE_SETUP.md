# Supabase Setup Guide for 808Scores

This guide walks you through setting up Supabase for the 808Scores application.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in:
   - **Name:** `808scores`
   - **Database Password:** (save this somewhere secure)
   - **Region:** Choose closest to Hawaii (e.g., `West US`)
4. Click "Create new project" and wait for it to initialize

## 2. Get Your API Keys

1. Go to **Project Settings** → **API**
2. Copy the following values:
   - `Project URL` → This is your `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` `secret` key → This is your `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

## 3. Update Environment Variables

Edit `/home/jeffr/808scores/.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 4. Run Database Migrations

### Option A: Using Supabase Dashboard (Recommended for first setup)

1. Go to **SQL Editor** in your Supabase dashboard
2. Copy the contents of `supabase/migrations/001_initial_schema.sql`
3. Paste and run it
4. Then copy and run `supabase/migrations/002_seed_data.sql`

### Option B: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref your-project-id

# Run migrations
supabase db push
```

## 5. Configure Phone Authentication (Twilio)

### 5.1 Create a Twilio Account

1. Go to [twilio.com](https://www.twilio.com) and sign up
2. Get a phone number that can send SMS
3. Note your:
   - Account SID
   - Auth Token
   - Messaging Service SID (or phone number)

### 5.2 Configure Supabase Auth

1. Go to **Authentication** → **Providers** in Supabase
2. Find **Phone** and enable it
3. Enter your Twilio credentials:
   - **Twilio Account SID:** Your Account SID
   - **Twilio Auth Token:** Your Auth Token
   - **Twilio Message Service SID:** Your Messaging Service SID
   - **SMS Sender ID:** (optional, e.g., "808Scores")
4. Click **Save**

### 5.3 Configure SMS Templates (Optional)

Go to **Authentication** → **Email Templates** → **Phone** and customize:

```
Your 808Scores verification code is: {{ .Token }}
```

## 6. Configure Auth Settings

1. Go to **Authentication** → **Settings**
2. Set:
   - **Site URL:** `http://localhost:3000` (or your production URL)
   - **Redirect URLs:** Add:
     - `http://localhost:3000/**`
     - `https://your-domain.com/**` (for production)

## 7. Enable Realtime

1. Go to **Database** → **Replication**
2. Enable replication for these tables:
   - `games`
   - `game_scores`
   - `submissions`

Or run this SQL:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE games;
ALTER PUBLICATION supabase_realtime ADD TABLE game_scores;
ALTER PUBLICATION supabase_realtime ADD TABLE submissions;
```

## 8. Set Up Storage (for photo uploads)

1. Go to **Storage** → **Buckets**
2. Create a new bucket:
   - **Name:** `scoreboards`
   - **Public:** Yes (or configure policies)
3. Set up policies:

```sql
-- Allow authenticated users to upload
CREATE POLICY "Users can upload scoreboard photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'scoreboards'
  AND auth.role() = 'authenticated'
);

-- Allow public read access
CREATE POLICY "Public can view scoreboard photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'scoreboards');
```

## 9. Test the Setup

1. Start the development server:
   ```bash
   cd /home/jeffr/808scores
   npm run dev
   ```

2. Open `http://localhost:3000`

3. Test authentication:
   - Click "Sign In"
   - Enter a phone number
   - Check for SMS code
   - Enter code to verify

4. Check the database:
   - Go to Supabase → Table Editor
   - You should see a new user in the `users` table

## 10. Production Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect to Vercel
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy

### Update Supabase Settings

1. Add your production URL to **Authentication** → **Settings** → **Redirect URLs**
2. Update **Site URL** to your production URL

## Troubleshooting

### "Invalid API key" error
- Double-check your environment variables
- Make sure you're using the `anon` key, not `service_role` key for client-side

### SMS not sending
- Check Twilio account balance
- Verify Twilio credentials in Supabase
- Check Twilio logs for errors

### User profile not created
- Check if the trigger function exists:
  ```sql
  SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
  ```
- Manually run the trigger creation SQL if missing

### Realtime not working
- Check replication settings in Database → Replication
- Verify RLS policies allow SELECT

## Quick SQL Commands

### Check tables exist
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';
```

### Count schools
```sql
SELECT COUNT(*) FROM schools;
-- Should return 50+
```

### Check user creation trigger
```sql
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

### Create a test game
```sql
INSERT INTO games (sport_id, home_team_id, away_team_id, scheduled_at, venue, status)
SELECT
  s.id,
  h.id,
  a.id,
  NOW() + INTERVAL '2 hours',
  'Test Stadium',
  'scheduled'
FROM
  sports s,
  schools h,
  schools a
WHERE
  s.code = 'football'
  AND h.short_name = 'Kahuku'
  AND a.short_name = 'Mililani'
LIMIT 1;
```

## Next Steps

After completing this setup:

1. ✅ Database schema created
2. ✅ Schools and badges seeded
3. ✅ Phone auth configured
4. ✅ Realtime enabled
5. ✅ Storage bucket created

You can now:
- Create games in the database
- Test the full submission flow
- Deploy to production
