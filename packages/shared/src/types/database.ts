export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type GameStatus = 'scheduled' | 'in_progress' | 'final' | 'postponed' | 'canceled'
export type SubmissionType = 'period_score' | 'live_update' | 'final_score' | 'event' | 'status_change'
export type SubmissionStatus = 'pending' | 'published' | 'rejected' | 'overturned'
export type UserTier = 'new' | 'standard' | 'verified' | 'elite' | 'trusted'
export type VerificationMethod = 'trusted' | 'majority' | 'timer' | 'manual'
export type SportGender = 'boys' | 'girls' | 'coed'
export type GameType = 'regular_season' | 'playoff' | 'championship' | 'tournament' | 'exhibition' | 'scrimmage'
export type BanType = 'timeout_24h' | 'ban_1week' | 'permanent'
export type ImportStatus = 'pending' | 'processing' | 'completed' | 'failed'
export type PrizeType = 'gift_card' | 'merchandise' | 'cash' | 'experience'
export type RaffleType = 'monthly' | 'season_end' | 'special'
export type RaffleStatus = 'upcoming' | 'open' | 'closed' | 'drawing' | 'completed' | 'canceled'
export type ChatPointAction = 'comment' | 'like_received' | 'mention_received'

// Tournament types
export type TournamentFormat = 'single_elimination' | 'double_elimination' | 'round_robin' | 'pool_play' | 'custom'
export type TournamentStatus = 'upcoming' | 'in_progress' | 'completed' | 'canceled'
export type TournamentRound = 'play_in' | 'round_of_32' | 'round_of_16' | 'quarterfinal' | 'semifinal' | 'third_place' | 'final' | 'pool_a' | 'pool_b' | 'pool_c' | 'pool_d'

// Periods configuration for different sport types
export interface PeriodsConfig {
  count: number
  names: string[]
  type: 'timed' | 'innings' | 'sets'
  period_length_minutes?: number
  points_to_win?: number
  points_to_win_final?: number
  win_by?: number
  sets_to_win?: number
  overtime?: {
    type: 'kansas' | 'periods' | 'golden_goal' | 'extra_innings'
    period_length_minutes?: number
    periods?: number
    unlimited?: boolean
    playoff_only?: boolean
    penalty_kicks_after?: boolean
    extra_runner?: {
      starts_from_inning: number
      position: string
    }
    description?: string
  } | null
  mercy_rule?: {
    enabled: boolean
    point_difference?: number
    effect?: string
    rules?: Array<{
      after_inning: number
      point_difference: number
    }>
  } | null
}

export interface Database {
  public: {
    Tables: {
      schools: {
        Row: {
          id: string
          name: string
          short_name: string
          mascot: string | null
          island: string
          league: string | null
          division: string | null
          colors: Json | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['schools']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['schools']['Insert']>
      }
      sports: {
        Row: {
          id: string
          name: string
          code: string
          periods_config: Json
          season: string | null
          active: boolean
          gender: SportGender
          display_name: string | null
          sort_order: number
        }
        Insert: Omit<Database['public']['Tables']['sports']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['sports']['Insert']>
      }
      games: {
        Row: {
          id: string
          sport_id: string
          home_team_id: string
          away_team_id: string
          scheduled_at: string
          venue: string | null
          status: GameStatus
          current_period: string | null
          time_remaining: string | null
          home_score: number
          away_score: number
          is_overtime: boolean
          is_verified: boolean
          verification_method: VerificationMethod | null
          golden_game: boolean
          game_type: GameType
          overtime_count: number
          // Tournament fields
          tournament_id: string | null
          tournament_round: TournamentRound | null
          bracket_position: number | null
          winner_advances_to: string | null
          loser_drops_to: string | null
          // Media fields
          photos_url: string | null
          instagram_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['games']['Row'], 'id' | 'created_at' | 'updated_at' | 'home_score' | 'away_score' | 'is_overtime' | 'is_verified' | 'golden_game' | 'game_type' | 'overtime_count' | 'tournament_id' | 'tournament_round' | 'bracket_position' | 'winner_advances_to' | 'loser_drops_to'>
        Update: Partial<Database['public']['Tables']['games']['Insert']>
      }
      game_scores: {
        Row: {
          id: string
          game_id: string
          period: string
          home_score: number
          away_score: number
          reported_at: string
          verified: boolean
        }
        Insert: Omit<Database['public']['Tables']['game_scores']['Row'], 'id' | 'reported_at'>
        Update: Partial<Database['public']['Tables']['game_scores']['Insert']>
      }
      users: {
        Row: {
          id: string
          phone: string | null
          email: string | null
          display_name: string | null
          avatar_url: string | null
          reputation_score: number
          tier: UserTier
          is_super_admin: boolean
          is_admin: boolean
          is_trusted_reporter: boolean
          trusted_reporter_approved_at: string | null
          total_points: number
          season_points: number
          accuracy_rate: number | null
          submission_count: number
          verified_count: number
          strike_count: number
          is_banned: boolean
          ban_expires_at: string | null
          onboarding_completed: boolean
          accepted_terms: boolean
          terms_accepted_at: string | null
          terms_version: string | null
          accepted_raffle_terms: boolean
          raffle_terms_accepted_at: string | null
          notifications_enabled: boolean
          regular_season_notifications: boolean
          marketing_opt_in: boolean
          has_beta_access: boolean
          beta_granted_at: string | null
          created_at: string
        }
        Insert: {
          phone?: string | null
          email?: string | null
          display_name?: string | null
          avatar_url?: string | null
          is_super_admin?: boolean
          is_admin?: boolean
          trusted_reporter_approved_at?: string | null
          accuracy_rate?: number | null
          ban_expires_at?: string | null
          terms_accepted_at?: string | null
          terms_version?: string | null
          raffle_terms_accepted_at?: string | null
        }
        Update: {
          phone?: string | null
          email?: string | null
          display_name?: string | null
          avatar_url?: string | null
          reputation_score?: number
          tier?: UserTier
          is_super_admin?: boolean
          is_admin?: boolean
          is_trusted_reporter?: boolean
          trusted_reporter_approved_at?: string | null
          total_points?: number
          season_points?: number
          accuracy_rate?: number | null
          submission_count?: number
          verified_count?: number
          strike_count?: number
          is_banned?: boolean
          ban_expires_at?: string | null
          onboarding_completed?: boolean
          accepted_terms?: boolean
          terms_accepted_at?: string | null
          terms_version?: string | null
          accepted_raffle_terms?: boolean
          raffle_terms_accepted_at?: string | null
          notifications_enabled?: boolean
          regular_season_notifications?: boolean
          marketing_opt_in?: boolean
          has_beta_access?: boolean
          beta_granted_at?: string | null
        }
      }
      submissions: {
        Row: {
          id: string
          game_id: string
          user_id: string
          submission_type: SubmissionType
          period: string | null
          home_score: number | null
          away_score: number | null
          time_remaining: string | null
          event_type: string | null
          event_description: string | null
          photo_url: string | null
          latitude: number | null
          longitude: number | null
          at_game: boolean
          status: SubmissionStatus
          verification_method: VerificationMethod | null
          points_earned: number
          created_at: string
          verified_at: string | null
          ip_address: string | null
        }
        Insert: {
          game_id: string
          user_id: string
          submission_type: SubmissionType
          period?: string | null
          home_score?: number | null
          away_score?: number | null
          time_remaining?: string | null
          event_type?: string | null
          event_description?: string | null
          photo_url?: string | null
          latitude?: number | null
          longitude?: number | null
          at_game?: boolean
          status?: SubmissionStatus
          verification_method?: VerificationMethod | null
          points_earned?: number
          ip_address?: string | null
        }
        Update: Partial<Database['public']['Tables']['submissions']['Insert']>
      }
      disputes: {
        Row: {
          id: string
          game_id: string
          submission_id: string | null
          disputed_by: string
          proposed_home_score: number | null
          proposed_away_score: number | null
          reason: string | null
          status: 'open' | 'resolved' | 'rejected'
          resolution: string | null
          resolved_by: string | null
          created_at: string
          resolved_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['disputes']['Row'], 'id' | 'created_at' | 'status'>
        Update: Partial<Database['public']['Tables']['disputes']['Insert']>
      }
      badges: {
        Row: {
          id: string
          code: string
          name: string
          description: string | null
          icon_url: string | null
          category: string | null
        }
        Insert: Omit<Database['public']['Tables']['badges']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['badges']['Insert']>
      }
      user_badges: {
        Row: {
          user_id: string
          badge_id: string
          earned_at: string
        }
        Insert: Omit<Database['public']['Tables']['user_badges']['Row'], 'earned_at'>
        Update: Partial<Database['public']['Tables']['user_badges']['Insert']>
      }
      team_follows: {
        Row: {
          user_id: string
          school_id: string
          notify: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['team_follows']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['team_follows']['Insert']>
      }
      sport_follows: {
        Row: {
          user_id: string
          sport_id: string
          notify: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['sport_follows']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['sport_follows']['Insert']>
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          body: string | null
          data: Json | null
          read: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at' | 'read'>
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>
      }
      trusted_reporter_applications: {
        Row: {
          id: string
          user_id: string
          full_name: string
          role: string
          school_affiliation: string | null
          id_verification_url: string | null
          reason: string | null
          status: 'pending' | 'approved' | 'rejected'
          reviewed_by: string | null
          reviewed_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['trusted_reporter_applications']['Row'], 'id' | 'created_at' | 'status'>
        Update: Partial<Database['public']['Tables']['trusted_reporter_applications']['Insert']>
      }
      audit_log: {
        Row: {
          id: string
          user_id: string | null
          action_type: string
          entity_type: string
          entity_id: string | null
          old_data: Json | null
          new_data: Json | null
          ip_address: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['audit_log']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['audit_log']['Insert']>
      }
      chat_messages: {
        Row: {
          id: string
          game_id: string
          user_id: string
          content: string
          is_hidden: boolean
          report_count: number
          reply_to_id: string | null
          mentions: string[]
          like_count: number
          created_at: string
          message_type: 'text' | 'gif'
          gif_url: string | null
          gif_id: string | null
        }
        Insert: Omit<Database['public']['Tables']['chat_messages']['Row'], 'id' | 'created_at' | 'is_hidden' | 'report_count' | 'like_count' | 'message_type' | 'gif_url' | 'gif_id'> & { reply_to_id?: string | null; mentions?: string[]; message_type?: 'text' | 'gif'; gif_url?: string | null; gif_id?: string | null }
        Update: Partial<Database['public']['Tables']['chat_messages']['Insert']>
      }
      chat_likes: {
        Row: {
          id: string
          message_id: string
          user_id: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['chat_likes']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['chat_likes']['Insert']>
      }
      chat_point_logs: {
        Row: {
          id: string
          user_id: string
          action_type: ChatPointAction
          points_earned: number
          source_id: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['chat_point_logs']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['chat_point_logs']['Insert']>
      }
      chat_reports: {
        Row: {
          id: string
          message_id: string
          reported_by: string
          reason: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['chat_reports']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['chat_reports']['Insert']>
      }
      players: {
        Row: {
          id: string
          school_id: string
          first_name: string
          last_name: string
          jersey_number: number | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['players']['Row'], 'id' | 'created_at' | 'updated_at' | 'is_active'>
        Update: Partial<Database['public']['Tables']['players']['Insert']>
      }
      player_seasons: {
        Row: {
          id: string
          player_id: string
          sport_id: string
          season_year: number
          jersey_number: number | null
          position: string | null
          grade: string | null
          is_captain: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['player_seasons']['Row'], 'id' | 'created_at' | 'is_captain'>
        Update: Partial<Database['public']['Tables']['player_seasons']['Insert']>
      }
      game_rosters: {
        Row: {
          id: string
          game_id: string
          player_id: string
          is_starter: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['game_rosters']['Row'], 'id' | 'created_at' | 'is_starter'>
        Update: Partial<Database['public']['Tables']['game_rosters']['Insert']>
      }
      user_strikes: {
        Row: {
          id: string
          user_id: string
          reason: string
          details: string | null
          issued_by: string | null
          submission_id: string | null
          active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['user_strikes']['Row'], 'id' | 'created_at' | 'active'>
        Update: Partial<Database['public']['Tables']['user_strikes']['Insert']>
      }
      user_bans: {
        Row: {
          id: string
          user_id: string
          ban_type: BanType
          reason: string
          strike_count: number
          issued_by: string | null
          starts_at: string
          expires_at: string | null
          active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['user_bans']['Row'], 'id' | 'created_at' | 'active' | 'starts_at'>
        Update: Partial<Database['public']['Tables']['user_bans']['Insert']>
      }
      scraped_scores: {
        Row: {
          id: string
          game_id: string | null
          source: string
          home_score: number
          away_score: number
          game_status: string
          scraped_at: string
          raw_data: Json | null
          matched: boolean
          match_confidence: number | null
        }
        Insert: Omit<Database['public']['Tables']['scraped_scores']['Row'], 'id' | 'scraped_at' | 'matched'>
        Update: Partial<Database['public']['Tables']['scraped_scores']['Insert']>
      }
      schedule_imports: {
        Row: {
          id: string
          imported_by: string | null
          source: string
          filename: string | null
          games_created: number
          games_updated: number
          games_skipped: number
          errors: Json
          status: ImportStatus
          started_at: string | null
          completed_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['schedule_imports']['Row'], 'id' | 'created_at' | 'games_created' | 'games_updated' | 'games_skipped' | 'status'>
        Update: Partial<Database['public']['Tables']['schedule_imports']['Insert']>
      }
      prizes: {
        Row: {
          id: string
          name: string
          description: string | null
          value_cents: number
          prize_type: PrizeType
          sponsor: string | null
          image_url: string | null
          quantity: number
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['prizes']['Row'], 'id' | 'created_at' | 'updated_at' | 'active' | 'quantity'>
        Update: Partial<Database['public']['Tables']['prizes']['Insert']>
      }
      raffles: {
        Row: {
          id: string
          name: string
          description: string | null
          raffle_type: RaffleType
          prize_id: string | null
          entries_open_at: string
          entries_close_at: string
          drawing_at: string
          winner_count: number
          min_points_to_enter: number
          points_per_entry: number
          max_entries_per_user: number | null
          status: RaffleStatus
          legal_disclaimer: string | null
          season: string | null
          month: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['raffles']['Row'], 'id' | 'created_at' | 'updated_at' | 'status' | 'winner_count' | 'min_points_to_enter' | 'points_per_entry' | 'is_active'>
        Update: Partial<Database['public']['Tables']['raffles']['Insert']>
      }
      raffle_prizes: {
        Row: {
          id: string
          raffle_id: string
          prize_id: string | null
          position: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['raffle_prizes']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['raffle_prizes']['Insert']>
      }
      raffle_entries: {
        Row: {
          id: string
          raffle_id: string
          user_id: string
          entry_count: number
          points_used: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['raffle_entries']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['raffle_entries']['Insert']>
      }
      raffle_winners: {
        Row: {
          id: string
          raffle_id: string
          user_id: string
          prize_id: string | null
          position: number
          winning_entry_number: number | null
          claimed: boolean
          claimed_at: string | null
          claim_notes: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['raffle_winners']['Row'], 'id' | 'created_at' | 'claimed'>
        Update: Partial<Database['public']['Tables']['raffle_winners']['Insert']>
      }
      trusted_reporter_codes: {
        Row: {
          id: string
          code: string
          created_by: string | null
          redeemed_by: string | null
          redeemed_at: string | null
          expires_at: string | null
          max_uses: number
          use_count: number
          note: string | null
          active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['trusted_reporter_codes']['Row'], 'id' | 'created_at' | 'use_count' | 'active'>
        Update: Partial<Database['public']['Tables']['trusted_reporter_codes']['Insert']>
      }
      tournaments: {
        Row: {
          id: string
          name: string
          sport_id: string
          format: TournamentFormat
          status: TournamentStatus
          description: string | null
          start_date: string
          end_date: string | null
          venue: string | null
          island: string | null
          num_teams: number | null
          current_round: TournamentRound | null
          season: string | null
          league: string | null
          division: string | null
          external_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['tournaments']['Row'], 'id' | 'created_at' | 'updated_at' | 'status'> & { status?: TournamentStatus }
        Update: Partial<Database['public']['Tables']['tournaments']['Insert']>
      }
      tournament_teams: {
        Row: {
          id: string
          tournament_id: string
          school_id: string
          seed: number | null
          pool: string | null
          eliminated: boolean
          eliminated_round: TournamentRound | null
          final_placement: number | null
          wins: number
          losses: number
          points_for: number
          points_against: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['tournament_teams']['Row'], 'id' | 'created_at' | 'eliminated' | 'wins' | 'losses' | 'points_for' | 'points_against'>
        Update: Partial<Database['public']['Tables']['tournament_teams']['Insert']>
      }
      beta_codes: {
        Row: {
          id: string
          code: string
          name: string | null
          description: string | null
          max_uses: number
          use_count: number
          expires_at: string | null
          created_by: string | null
          created_at: string
          is_active: boolean
          notes: string | null
        }
        Insert: Omit<Database['public']['Tables']['beta_codes']['Row'], 'id' | 'created_at' | 'use_count'>
        Update: Partial<Database['public']['Tables']['beta_codes']['Insert']>
      }
      beta_access: {
        Row: {
          id: string
          user_id: string
          beta_code_id: string | null
          granted_by: string | null
          granted_at: string
          notes: string | null
        }
        Insert: Omit<Database['public']['Tables']['beta_access']['Row'], 'id' | 'granted_at'>
        Update: Partial<Database['public']['Tables']['beta_access']['Insert']>
      }
      teams: {
        Row: {
          id: string
          school_id: string
          sport_id: string
          gender: SportGender
          division: string | null
          league: string | null
          season_year: string
          is_active: boolean
          is_beta: boolean
          beta_features: Json
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['teams']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['teams']['Insert']>
      }
      team_managers: {
        Row: {
          id: string
          user_id: string
          team_id: string
          role: 'owner' | 'head_coach' | 'assistant_coach' | 'manager' | 'assistant'
          can_edit_roster: boolean
          can_edit_schedule: boolean
          can_submit_scores: boolean
          can_post_updates: boolean
          can_manage_coaches: boolean
          granted_by: string | null
          granted_at: string
          is_active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['team_managers']['Row'], 'id' | 'granted_at' | 'created_at'>
        Update: Partial<Database['public']['Tables']['team_managers']['Insert']>
      }
      team_rosters: {
        Row: {
          id: string
          team_id: string
          player_id: string
          jersey_number: number | null
          position: string | null
          grade: string | null
          is_captain: boolean
          is_starter: boolean
          season_year: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['team_rosters']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['team_rosters']['Insert']>
      }
    }
  }
}

// Convenience types
export type School = Database['public']['Tables']['schools']['Row']
export type Sport = Database['public']['Tables']['sports']['Row']
export type Game = Database['public']['Tables']['games']['Row']
export type GameScore = Database['public']['Tables']['game_scores']['Row']
export type User = Database['public']['Tables']['users']['Row']
export type Submission = Database['public']['Tables']['submissions']['Row']
export type Dispute = Database['public']['Tables']['disputes']['Row']
export type Badge = Database['public']['Tables']['badges']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']
export type ChatMessage = Database['public']['Tables']['chat_messages']['Row']
export type ChatReport = Database['public']['Tables']['chat_reports']['Row']
export type ChatLike = Database['public']['Tables']['chat_likes']['Row']
export type ChatPointLog = Database['public']['Tables']['chat_point_logs']['Row']
export type Player = Database['public']['Tables']['players']['Row']
export type PlayerSeason = Database['public']['Tables']['player_seasons']['Row']
export type GameRoster = Database['public']['Tables']['game_rosters']['Row']
export type UserStrike = Database['public']['Tables']['user_strikes']['Row']
export type UserBan = Database['public']['Tables']['user_bans']['Row']
export type ScrapedScore = Database['public']['Tables']['scraped_scores']['Row']
export type ScheduleImport = Database['public']['Tables']['schedule_imports']['Row']
export type BetaCode = Database['public']['Tables']['beta_codes']['Row']
export type BetaAccess = Database['public']['Tables']['beta_access']['Row']
export type Team = Database['public']['Tables']['teams']['Row']
export type TeamManager = Database['public']['Tables']['team_managers']['Row']
export type TeamRoster = Database['public']['Tables']['team_rosters']['Row']
export type Prize = Database['public']['Tables']['prizes']['Row']
export type Raffle = Database['public']['Tables']['raffles']['Row']
export type RaffleEntry = Database['public']['Tables']['raffle_entries']['Row']
export type RaffleWinner = Database['public']['Tables']['raffle_winners']['Row']
export type RafflePrize = Database['public']['Tables']['raffle_prizes']['Row']
export type SportFollow = Database['public']['Tables']['sport_follows']['Row']
export type TrustedReporterCode = Database['public']['Tables']['trusted_reporter_codes']['Row']
export type Tournament = Database['public']['Tables']['tournaments']['Row']
export type TournamentTeam = Database['public']['Tables']['tournament_teams']['Row']

// Extended types with relations
export interface GameWithTeams extends Game {
  home_team: School
  away_team: School
  sport: Sport
  scores?: GameScore[]
  tournament?: Tournament | null
}

export interface SubmissionWithUser extends Submission {
  user: Pick<User, 'id' | 'display_name' | 'tier' | 'is_trusted_reporter'>
}

export interface UserWithBadges extends User {
  badges: Badge[]
}

// Roster-related extended types
export interface PlayerWithSchool extends Player {
  school: School
}

export interface PlayerSeasonWithDetails extends PlayerSeason {
  player: Player
  sport: Sport
}

export interface TeamRoster {
  school: School
  players: Array<{
    player: Player
    season: PlayerSeason
    effectiveJerseyNumber: number | null // season jersey or player default
  }>
}

export interface GameWithRosters extends GameWithTeams {
  home_roster?: TeamRoster
  away_roster?: TeamRoster
}

// Strike/Ban extended types
export interface UserStrikeWithDetails extends UserStrike {
  user?: Pick<User, 'id' | 'display_name' | 'email'>
  issued_by_user?: Pick<User, 'id' | 'display_name'>
  submission?: Submission
}

export interface UserBanWithDetails extends UserBan {
  user?: Pick<User, 'id' | 'display_name' | 'email'>
  issued_by_user?: Pick<User, 'id' | 'display_name'>
}

// Raffle extended types
export interface RaffleWithPrize extends Raffle {
  prize: Prize | null
}

export interface RaffleEntryWithUser extends RaffleEntry {
  user: Pick<User, 'id' | 'display_name' | 'avatar_url'>
}

export interface RaffleWinnerWithDetails extends RaffleWinner {
  user: Pick<User, 'id' | 'display_name' | 'avatar_url'>
  prize: Prize | null
  raffle?: Raffle
}

export interface RafflePrizeWithDetails extends RafflePrize {
  prize: Prize | null
}

export interface RaffleWithPrizes extends Raffle {
  prize: Prize | null
  raffle_prizes: RafflePrizeWithDetails[]
}

// Chat extended types
export interface ChatMessageWithUser extends ChatMessage {
  user?: {
    id: string
    display_name: string | null
    avatar_url: string | null
    tier: string
    is_trusted_reporter: boolean
  }
  reply_to?: {
    id: string
    content: string
    message_type?: 'text' | 'gif'
    user?: {
      display_name: string | null
    }
  }
  user_has_liked?: boolean
}

// Ban status for checking user access
export interface BanStatus {
  isBanned: boolean
  banType?: BanType
  reason?: string
  expiresAt?: string
  isPermanent?: boolean
}

// Tournament extended types
export interface TournamentWithSport extends Tournament {
  sport: Sport
}

export interface TournamentTeamWithSchool extends TournamentTeam {
  school: School
}

export interface TournamentWithDetails extends Tournament {
  sport: Sport
  teams: TournamentTeamWithSchool[]
  games?: GameWithTeams[]
}

export interface GameWithTournament extends GameWithTeams {
  tournament?: Tournament | null
}

// Bracket visualization types
export interface BracketGame {
  id: string
  round: TournamentRound
  position: number
  homeTeam: School | null
  awayTeam: School | null
  homeScore: number | null
  awayScore: number | null
  homeSeed: number | null
  awaySeed: number | null
  status: GameStatus
  scheduledAt: string
  winnerAdvancesTo: string | null
  loserDropsTo: string | null
}

export interface BracketRound {
  round: TournamentRound
  label: string
  games: BracketGame[]
}

export interface TournamentBracket {
  tournament: TournamentWithDetails
  rounds: BracketRound[]
}
