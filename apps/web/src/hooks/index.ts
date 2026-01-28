export { useAuth, useRequireAuth } from './use-auth'
export { useRealtimeGame, useRealtimeLiveGames, useRealtimeSubmissions } from './use-realtime'
export { useGames, useLiveGames, useGame, type GameWithTeamsAndCount } from './use-games'
export { useSports } from './use-sports'
export { useLeaderboard } from './use-leaderboard'
export { usePushNotifications } from './use-push-notifications'
export { useGameReminders, type GameReminder } from './use-game-reminders'
export { useSchools } from './use-schools'
export { useFavoriteTeams } from './use-favorite-teams'
export { useFavoriteSports } from './use-favorite-sports'
export {
  useTournaments,
  useTournament,
  useTournamentBracket,
  useActiveTournaments,
  useUpcomingTournaments,
} from './use-tournaments'
export { useChatLikes } from './use-chat-likes'
export {
  useRaffles,
  useUserRaffleEntries,
  usePastWinners,
  useEnterRaffle,
} from './use-raffles'
export { useSecurity, useTrustScore } from './use-security'
export { useNotifications, type Notification } from './use-notifications'
export { useBadges, useUserBadges, type Badge, type UserBadge } from './use-badges'
export { useOfflineQueue } from './use-offline-queue'
export { useOnlineStatus } from './use-online-status'

// React Query hooks (with caching)
export { useQueryGames, useQueryLiveGames, useQueryGame } from './use-query-games'
export { useQuerySchools, useQuerySchool, useQuerySchoolsByLeague } from './use-query-schools'

// Admin stat entry
export {
  useGameStats,
  useGameStatsMutations,
  type GameWithDetails,
  type PlayerWithStats,
  type TeamRosterWithStats,
} from './use-game-stats'
