# 808Scores Phase 2 Implementation Plan

**Target Launch:** February 2026
**Current Date:** January 22, 2026

---

## Week 1: UI Overhaul + Core Data

### Day 1-2: Design System & UI Foundation
- [ ] New color palette (dark-first, minimal)
- [ ] Typography system (clean, readable)
- [ ] Component library refresh (buttons, cards, inputs, badges)
- [ ] Animation system (subtle, performant)
- [ ] Layout components (consistent spacing, mobile-first)

### Day 3-4: Homepage & Game Lists
- [ ] Wire homepage to Supabase (real games)
- [ ] Today's games with real-time updates
- [ ] Live games section with auto-refresh
- [ ] Filter by sport, island, league
- [ ] Empty states and loading skeletons

### Day 5-6: Game Detail Page
- [ ] Real game data from Supabase
- [ ] Period-by-period scores
- [ ] Real-time score subscriptions
- [ ] Game status indicators (scheduled, live, final)
- [ ] Team info display

### Day 7: Score Submission Flow
- [ ] Submit score form (connected to Supabase)
- [ ] Photo upload to Supabase Storage
- [ ] Verification engine integration
- [ ] Success/error feedback
- [ ] Points earned display

---

## Week 2: Chat, Admin & Scraping

### Day 8-9: Game Chat System
- [ ] Chat messages table in database
- [ ] Real-time chat with Supabase subscriptions
- [ ] Chat UI component (clean, minimal)
- [ ] Auto-moderation:
  - Profanity filter (word list + fuzzy matching)
  - Rate limiting (max 1 msg/5 sec, 20/min)
  - Reputation gates (new users limited)
  - Report button + auto-hide at 3 reports
- [ ] Chat input with character limit

### Day 10-11: Admin Dashboard
- [ ] Admin authentication (role-based)
- [ ] Games management (CRUD)
- [ ] Bulk game import (CSV upload)
- [ ] Moderation queue:
  - Flagged chat messages
  - Disputed scores
  - Reported users
- [ ] Manual score override
- [ ] User management (ban, promote to trusted)

### Day 12-13: Schedule Scraping
- [ ] Research schedule sources:
  - HHSAA website
  - ScoringLive
  - School athletic pages
  - MaxPreps Hawaii
- [ ] Build scraper for primary source
- [ ] Schedule parser (normalize data)
- [ ] Import to database
- [ ] Daily cron job for updates

### Day 14: Integration Testing
- [ ] End-to-end submission flow
- [ ] Real-time updates verification
- [ ] Chat moderation testing
- [ ] Admin functions testing
- [ ] Mobile responsiveness check

---

## Week 3: Polish & Launch

### Day 15-16: Polish & Bug Fixes
- [ ] Error handling throughout
- [ ] Loading states everywhere
- [ ] Offline indicators
- [ ] Edge case handling
- [ ] Performance optimization

### Day 17: Production Setup
- [ ] Vercel deployment
- [ ] Environment variables
- [ ] Domain setup (808scores.com)
- [ ] SSL certificate
- [ ] Supabase production settings

### Day 18: Pre-launch
- [ ] Seed production database with schedules
- [ ] Create admin accounts
- [ ] Test on real devices
- [ ] Soft launch to small group

### Day 19-21: Buffer
- [ ] Bug fixes from soft launch
- [ ] Final adjustments
- [ ] Public launch

---

## Database Additions for Phase 2

### Chat Messages Table
```sql
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_hidden BOOLEAN DEFAULT false,
  report_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_game ON chat_messages(game_id, created_at DESC);
```

### Chat Reports Table
```sql
CREATE TABLE chat_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID REFERENCES chat_messages(id) ON DELETE CASCADE,
  reported_by UUID REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(message_id, reported_by)
);
```

### Admin Roles
```sql
ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT false;
```

---

## UI Design Principles

1. **Dark-first**: Deep grays (#0a0a0a, #1a1a1a, #2a2a2a)
2. **Accent color**: Blue (#3b82f6) for actions, Green for success, Red for live
3. **Typography**: System fonts, clear hierarchy
4. **Spacing**: Generous padding, breathing room
5. **Animations**: 150-200ms transitions, no jarring movements
6. **Mobile**: Touch targets 44px+, bottom navigation, thumb zone

---

## Tech Stack Confirmation

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend**: Supabase (Postgres, Auth, Realtime, Storage)
- **Deployment**: Vercel
- **Scraping**: Node.js scripts (cheerio/puppeteer)
- **Moderation**: Custom filters + Supabase Edge Functions

---

## Risk Mitigation

1. **Schedule scraping blocked**: Manual CSV import as backup
2. **Chat abuse**: Aggressive auto-mod, quick manual review
3. **Launch delays**: Core features first, polish later
4. **Scale issues**: Supabase handles well, monitor usage

---

## Success Metrics for Launch

- [ ] 10+ games populated for launch week
- [ ] Admin can add games in < 2 minutes
- [ ] Score submission works end-to-end
- [ ] Chat is usable without heavy moderation
- [ ] Site loads in < 2 seconds on mobile
