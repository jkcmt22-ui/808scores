'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Camera,
  Loader2,
  Check,
  X,
  Bell,
  BellOff,
  Search,
  AlertCircle,
} from 'lucide-react'
import { Button, Card, Input, Avatar } from '@/components/ui'
import { useRequireAuth, useSchools, useSports, useFavoriteTeams, useFavoriteSports } from '@/hooks'
import { getSportEmoji } from '@/lib/sport-utils'
import { validateUsername } from '@/lib/username-validation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import {
  isPushSupported,
  getNotificationPermission,
  requestNotificationPermission,
  subscribeToPush,
  unsubscribeFromPush,
  getCurrentSubscription,
  extractSubscriptionData,
} from '@/lib/push-notifications'
import type { School, Sport } from '@/types/database'

export default function ProfileSettingsPage() {
  const router = useRouter()
  const { user, profile, isLoading: authLoading, isProfileLoading, updateProfile } = useRequireAuth()
  const { schools, isLoading: schoolsLoading } = useSchools()
  const { sports, isLoading: sportsLoading } = useSports()
  const { favoriteTeams, addFavorite, removeFavorite, toggleNotify, isFavorite } = useFavoriteTeams(user?.id)
  const {
    favoriteSports,
    addFavorite: addSportFavorite,
    removeFavorite: removeSportFavorite,
    toggleNotify: toggleSportNotify,
    isFavorite: isSportFavorite,
  } = useFavoriteSports(user?.id)

  // Username state
  const [username, setUsername] = useState('')
  const [usernameError, setUsernameError] = useState<string | null>(null)
  const [isSavingUsername, setIsSavingUsername] = useState(false)
  const [usernameSaved, setUsernameSaved] = useState(false)

  // Avatar state
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Team search state
  const [teamSearch, setTeamSearch] = useState('')
  const [isAddingTeam, setIsAddingTeam] = useState<string | null>(null)

  // Sport toggle state
  const [isAddingSport, setIsAddingSport] = useState<string | null>(null)

  // Notification preferences state
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [regularSeasonNotifications, setRegularSeasonNotifications] = useState(false)
  const [marketingOptIn, setMarketingOptIn] = useState(false)
  const [isSavingNotifications, setIsSavingNotifications] = useState(false)
  const [notificationsSaved, setNotificationsSaved] = useState(false)
  const [notificationsError, setNotificationsError] = useState(false)

  // Push notification browser state
  const [pushSupported, setPushSupported] = useState(false)
  const [pushPermission, setPushPermission] = useState<NotificationPermission | 'unsupported'>('default')
  const [pushSubscribed, setPushSubscribed] = useState(false)
  const [isTogglingPush, setIsTogglingPush] = useState(false)
  const [pushError, setPushError] = useState<string | null>(null)

  const supabase = createClient()

  // Initialize from profile
  useEffect(() => {
    if (profile) {
      setUsername(profile.display_name || '')
      setAvatarUrl(profile.avatar_url)
      // Load notification preferences
      setNotificationsEnabled((profile as { notifications_enabled?: boolean }).notifications_enabled ?? true)
      setRegularSeasonNotifications((profile as { regular_season_notifications?: boolean }).regular_season_notifications ?? false)
      setMarketingOptIn((profile as { marketing_opt_in?: boolean }).marketing_opt_in ?? false)
    }
  }, [profile])

  // Check push notification status on mount
  useEffect(() => {
    const checkPushStatus = async () => {
      const supported = isPushSupported()
      setPushSupported(supported)

      if (supported) {
        setPushPermission(getNotificationPermission())

        try {
          const subscription = await getCurrentSubscription()
          setPushSubscribed(!!subscription)
        } catch {
          // Service worker not yet registered
          setPushSubscribed(false)
        }
      }
    }

    checkPushStatus()
  }, [])

  // Validate username on change
  const handleUsernameChange = (value: string) => {
    setUsername(value)
    setUsernameSaved(false)

    if (value.trim()) {
      const result = validateUsername(value)
      setUsernameError(result.valid ? null : result.error || null)
    } else {
      setUsernameError(null)
    }
  }

  // Save username
  const handleSaveUsername = async () => {
    if (!username.trim()) return

    const result = validateUsername(username)
    if (!result.valid) {
      setUsernameError(result.error || 'Invalid username')
      return
    }

    setIsSavingUsername(true)
    try {
      const updated = await updateProfile({ display_name: username.trim() })
      if (updated) {
        setUsernameSaved(true)
        setTimeout(() => setUsernameSaved(false), 2000)
      }
    } catch {
      setUsernameError('Failed to save username')
    } finally {
      setIsSavingUsername(false)
    }
  }

  // Save notification preferences
  const handleSaveNotificationPreferences = async () => {
    if (!user) return

    setIsSavingNotifications(true)
    setNotificationsError(false)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('users')
        .update({
          notifications_enabled: notificationsEnabled,
          regular_season_notifications: regularSeasonNotifications,
          marketing_opt_in: marketingOptIn,
        })
        .eq('id', user.id)

      if (error) throw error

      setNotificationsSaved(true)
      setTimeout(() => setNotificationsSaved(false), 2000)
    } catch (err) {
      console.error('Failed to save notification preferences:', err)
      setNotificationsError(true)
      setTimeout(() => setNotificationsError(false), 3000)
    } finally {
      setIsSavingNotifications(false)
    }
  }

  // Toggle push notifications
  const handleTogglePush = async () => {
    if (!pushSupported || !user) return

    setIsTogglingPush(true)
    setPushError(null)

    try {
      if (pushSubscribed) {
        // Unsubscribe — get current endpoint first so we only delete this device
        const currentSub = await getCurrentSubscription()
        const success = await unsubscribeFromPush()
        if (success) {
          setPushSubscribed(false)

          // Remove only this device's subscription from database
          if (currentSub) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase as any)
              .from('push_subscriptions')
              .delete()
              .eq('endpoint', currentSub.endpoint)
          }
        }
      } else {
        // Request permission if needed
        if (pushPermission === 'default') {
          const permission = await requestNotificationPermission()
          setPushPermission(permission)

          if (permission !== 'granted') {
            setPushError('Please allow notifications in your browser settings')
            return
          }
        } else if (pushPermission === 'denied') {
          setPushError('Notifications are blocked. Please enable them in your browser settings.')
          return
        }

        // Subscribe
        const subscription = await subscribeToPush()
        if (subscription) {
          setPushSubscribed(true)

          // Save subscription to database
          const subData = extractSubscriptionData(subscription)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { error: upsertError } = await (supabase as any)
            .from('push_subscriptions')
            .upsert({
              user_id: user.id,
              endpoint: subData.endpoint,
              p256dh: subData.p256dh,
              auth: subData.auth,
              updated_at: new Date().toISOString(),
            }, {
              onConflict: 'endpoint'
            })

          if (upsertError) {
            console.error('Error saving push subscription:', upsertError)
            setPushError('Notifications enabled locally but failed to save to server')
          }
        }
      }
    } catch (err) {
      console.error('Failed to toggle push notifications:', err)
      setPushError('Failed to update notification settings')
    } finally {
      setIsTogglingPush(false)
    }
  }

  // Handle avatar upload
  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    if (!file.type.startsWith('image/')) {
      setAvatarError('Please select an image file')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      setAvatarError('Image must be less than 2MB')
      return
    }

    if (!supabase) {
      setAvatarError('Database connection not available')
      return
    }

    setIsUploadingAvatar(true)
    setAvatarError(null)

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // Update profile
      const updated = await updateProfile({ avatar_url: publicUrl })
      if (updated) {
        setAvatarUrl(publicUrl)
      }
    } catch (err) {
      console.error('Avatar upload error:', err)
      setAvatarError('Failed to upload image. Make sure storage is configured.')
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  // Filter schools for search
  const filteredSchools = schools.filter((school) =>
    school.name.toLowerCase().includes(teamSearch.toLowerCase()) ||
    school.short_name.toLowerCase().includes(teamSearch.toLowerCase())
  )

  // Handle adding/removing team favorite
  const handleToggleFavorite = async (school: School) => {
    setIsAddingTeam(school.id)
    try {
      if (isFavorite(school.id)) {
        await removeFavorite(school.id)
      } else {
        await addFavorite(school.id)
      }
    } finally {
      setIsAddingTeam(null)
    }
  }

  // Handle adding/removing sport favorite
  const handleToggleSportFavorite = async (sport: Sport) => {
    setIsAddingSport(sport.id)
    try {
      if (isSportFavorite(sport.id)) {
        await removeSportFavorite(sport.id)
      } else {
        await addSportFavorite(sport.id)
      }
    } finally {
      setIsAddingSport(null)
    }
  }

  // Wait for both auth AND profile to finish loading
  if (authLoading || isProfileLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-neon-blue" />
      </div>
    )
  }

  // Show loading state instead of blank screen during redirect
  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-neon-yellow" />
        <span className="ml-3 font-display text-sm text-foreground-muted uppercase tracking-wider">
          Redirecting to login...
        </span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background grid-bg">
      {/* Header */}
      <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b-2 border-border bg-background-secondary px-4">
        <Link href="/profile" className="text-foreground-muted hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-lg font-bold text-foreground">Profile Settings</h1>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* Avatar Section */}
        <Card className="border-2 border-border">
          <div className="p-6">
            <h2 className="mb-4 font-display text-sm font-bold uppercase tracking-wider text-foreground-muted">
              Profile Picture
            </h2>

            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar
                  src={avatarUrl}
                  alt={username || 'Profile'}
                  fallback={username?.slice(0, 2) || 'U'}
                  size="lg"
                  className="h-20 w-20 rounded-full border-2 border-border"
                />
                <button
                  onClick={handleAvatarClick}
                  disabled={isUploadingAvatar}
                  className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-neon-blue text-background transition-opacity hover:opacity-80 disabled:opacity-50"
                >
                  {isUploadingAvatar ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>

              <div className="flex-1">
                <p className="text-sm text-foreground">
                  Upload a profile picture
                </p>
                <p className="text-xs text-foreground-muted">
                  JPG, PNG, or GIF. Max 2MB.
                </p>
                {avatarError && (
                  <p className="mt-1 text-xs text-neon-pink">{avatarError}</p>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Username Section */}
        <Card className="border-2 border-border">
          <div className="p-6">
            <h2 className="mb-4 font-display text-sm font-bold uppercase tracking-wider text-foreground-muted">
              Username
            </h2>

            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  placeholder="Enter a username"
                  className={cn(
                    'flex-1',
                    usernameError && 'border-neon-pink focus:border-neon-pink'
                  )}
                />
                <Button
                  onClick={handleSaveUsername}
                  disabled={isSavingUsername || !!usernameError || !username.trim() || username === profile.display_name}
                  className="min-w-[80px]"
                >
                  {isSavingUsername ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : usernameSaved ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    'Save'
                  )}
                </Button>
              </div>

              {usernameError && (
                <div className="flex items-center gap-2 text-sm text-neon-pink">
                  <AlertCircle className="h-4 w-4" />
                  <span>{usernameError}</span>
                </div>
              )}

              <p className="text-xs text-foreground-muted">
                3-20 characters. Letters, numbers, and underscores only.
              </p>
            </div>
          </div>
        </Card>

        {/* Push Notifications Section */}
        <Card className="border-2 border-border">
          <div className="p-6">
            <h2 className="mb-4 font-display text-sm font-bold uppercase tracking-wider text-foreground-muted">
              Push Notifications
            </h2>

            <div className="space-y-4">
              {/* Browser push status */}
              {!pushSupported ? (
                <div className="flex items-center gap-3 rounded-lg bg-background-secondary p-4">
                  <BellOff className="h-5 w-5 text-foreground-muted" />
                  <div>
                    <p className="font-medium text-foreground">Not Supported</p>
                    <p className="text-xs text-foreground-muted">
                      Your browser doesn&apos;t support push notifications
                    </p>
                  </div>
                </div>
              ) : pushPermission === 'denied' ? (
                <div className="flex items-center gap-3 rounded-lg bg-neon-pink/10 border border-neon-pink/30 p-4">
                  <AlertCircle className="h-5 w-5 text-neon-pink" />
                  <div>
                    <p className="font-medium text-foreground">Blocked</p>
                    <p className="text-xs text-foreground-muted">
                      Notifications are blocked. Enable them in your browser settings.
                    </p>
                  </div>
                </div>
              ) : (
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-3">
                    {pushSubscribed ? (
                      <Bell className="h-5 w-5 text-neon-green" />
                    ) : (
                      <BellOff className="h-5 w-5 text-foreground-muted" />
                    )}
                    <div>
                      <p className="font-medium text-foreground">Browser Notifications</p>
                      <p className="text-xs text-foreground-muted">
                        {pushSubscribed
                          ? 'Receiving notifications on this device'
                          : 'Enable to receive game alerts on this device'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleTogglePush}
                    disabled={isTogglingPush}
                    className={cn(
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                      pushSubscribed ? 'bg-neon-green' : 'bg-border'
                    )}
                  >
                    {isTogglingPush ? (
                      <Loader2 className="absolute left-1/2 -translate-x-1/2 h-4 w-4 animate-spin text-foreground" />
                    ) : (
                      <span
                        className={cn(
                          'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                          pushSubscribed ? 'translate-x-6' : 'translate-x-1'
                        )}
                      />
                    )}
                  </button>
                </label>
              )}

              {pushError && (
                <div className="flex items-center gap-2 text-sm text-neon-pink">
                  <AlertCircle className="h-4 w-4" />
                  <span>{pushError}</span>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Notification Preferences Section */}
        <Card className="border-2 border-border">
          <div className="p-6">
            <h2 className="mb-4 font-display text-sm font-bold uppercase tracking-wider text-foreground-muted">
              Notification Preferences
            </h2>

            <div className="space-y-4">
              {/* Global notifications toggle */}
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="font-medium text-foreground">Game Updates</p>
                  <p className="text-xs text-foreground-muted">Receive updates for your favorite teams</p>
                </div>
                <button
                  onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                  className={cn(
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                    notificationsEnabled ? 'bg-neon-green' : 'bg-border'
                  )}
                >
                  <span
                    className={cn(
                      'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                      notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                    )}
                  />
                </button>
              </label>

              {/* Regular season notifications toggle */}
              <label className={cn(
                'flex items-center justify-between cursor-pointer',
                !notificationsEnabled && 'opacity-50 pointer-events-none'
              )}>
                <div>
                  <p className="font-medium text-foreground">Regular Season Games</p>
                  <p className="text-xs text-foreground-muted">Get notified for all games, not just playoffs</p>
                </div>
                <button
                  onClick={() => setRegularSeasonNotifications(!regularSeasonNotifications)}
                  disabled={!notificationsEnabled}
                  className={cn(
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                    regularSeasonNotifications ? 'bg-neon-green' : 'bg-border'
                  )}
                >
                  <span
                    className={cn(
                      'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                      regularSeasonNotifications ? 'translate-x-6' : 'translate-x-1'
                    )}
                  />
                </button>
              </label>

              <div className="border-t border-border my-4" />

              {/* Marketing opt-in toggle */}
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="font-medium text-foreground">Newsletter & Updates</p>
                  <p className="text-xs text-foreground-muted">Receive promotional emails and announcements</p>
                </div>
                <button
                  onClick={() => setMarketingOptIn(!marketingOptIn)}
                  className={cn(
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                    marketingOptIn ? 'bg-neon-green' : 'bg-border'
                  )}
                >
                  <span
                    className={cn(
                      'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                      marketingOptIn ? 'translate-x-6' : 'translate-x-1'
                    )}
                  />
                </button>
              </label>

              <Button
                onClick={handleSaveNotificationPreferences}
                disabled={isSavingNotifications}
                className="w-full mt-4"
              >
                {isSavingNotifications ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : notificationsSaved ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Saved
                  </>
                ) : notificationsError ? (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    Failed to save — try again
                  </>
                ) : (
                  'Save Preferences'
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Favorite Teams Section */}
        <Card className="border-2 border-border">
          <div className="p-6">
            <h2 className="mb-4 font-display text-sm font-bold uppercase tracking-wider text-foreground-muted">
              Favorite Teams
            </h2>

            {/* Current favorites */}
            {favoriteTeams.length > 0 && (
              <div className="mb-4 space-y-2">
                {favoriteTeams.map((follow) => (
                  <div
                    key={follow.school_id}
                    className="flex items-center justify-between rounded-lg border border-border bg-background-secondary p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neon-blue/10 font-display text-sm font-bold text-neon-blue">
                        {follow.school.short_name.slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{follow.school.name}</p>
                        <p className="text-xs text-foreground-muted">{follow.school.league}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleNotify(follow.school_id, !follow.notify)}
                        className={cn(
                          'rounded-lg p-2 transition-colors',
                          follow.notify
                            ? 'bg-neon-green/10 text-neon-green'
                            : 'bg-background text-foreground-muted hover:text-foreground'
                        )}
                        title={follow.notify ? 'Notifications on' : 'Notifications off'}
                      >
                        {follow.notify ? (
                          <Bell className="h-4 w-4" />
                        ) : (
                          <BellOff className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => removeFavorite(follow.school_id)}
                        className="rounded-lg bg-neon-pink/10 p-2 text-neon-pink transition-colors hover:bg-neon-pink/20"
                        title="Remove favorite"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Search teams */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
              <Input
                value={teamSearch}
                onChange={(e) => setTeamSearch(e.target.value)}
                placeholder="Search for a team..."
                className="pl-10"
              />
            </div>

            {/* Team list */}
            {schoolsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-neon-blue" />
              </div>
            ) : teamSearch ? (
              <div className="max-h-64 space-y-1 overflow-y-auto">
                {filteredSchools.length === 0 ? (
                  <p className="py-4 text-center text-sm text-foreground-muted">
                    No teams found matching &ldquo;{teamSearch}&rdquo;
                  </p>
                ) : (
                  filteredSchools.map((school) => (
                    <button
                      key={school.id}
                      onClick={() => handleToggleFavorite(school)}
                      disabled={isAddingTeam === school.id}
                      className={cn(
                        'flex w-full items-center justify-between rounded-lg p-3 text-left transition-colors',
                        isFavorite(school.id)
                          ? 'bg-neon-blue/10 border border-neon-blue/30'
                          : 'hover:bg-background-secondary'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded bg-background-tertiary font-display text-xs font-bold text-foreground-muted">
                          {school.short_name.slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{school.name}</p>
                          <p className="text-xs text-foreground-muted">
                            {school.league} &bull; {school.island}
                          </p>
                        </div>
                      </div>

                      {isAddingTeam === school.id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-neon-blue" />
                      ) : isFavorite(school.id) ? (
                        <Check className="h-4 w-4 text-neon-blue" />
                      ) : null}
                    </button>
                  ))
                )}
              </div>
            ) : (
              <p className="text-center text-sm text-foreground-muted">
                Type to search for teams to add
              </p>
            )}
          </div>
        </Card>

        {/* Favorite Sports Section */}
        <Card className="border-2 border-border">
          <div className="p-6">
            <h2 className="mb-4 font-display text-sm font-bold uppercase tracking-wider text-foreground-muted">
              Favorite Sports
            </h2>

            {/* Current sport favorites */}
            {favoriteSports.length > 0 && (
              <div className="mb-4 space-y-2">
                {favoriteSports.map((follow) => (
                  <div
                    key={follow.sport_id}
                    className="flex items-center justify-between rounded-lg border border-border bg-background-secondary p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neon-pink/10 text-xl">
                        {getSportEmoji(follow.sport.code)}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {follow.sport.display_name || follow.sport.name}
                        </p>
                        <p className="text-xs text-foreground-muted capitalize">
                          {follow.sport.gender}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleSportNotify(follow.sport_id, !follow.notify)}
                        className={cn(
                          'rounded-lg p-2 transition-colors',
                          follow.notify
                            ? 'bg-neon-green/10 text-neon-green'
                            : 'bg-background text-foreground-muted hover:text-foreground'
                        )}
                        title={follow.notify ? 'Notifications on' : 'Notifications off'}
                      >
                        {follow.notify ? (
                          <Bell className="h-4 w-4" />
                        ) : (
                          <BellOff className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => removeSportFavorite(follow.sport_id)}
                        className="rounded-lg bg-neon-pink/10 p-2 text-neon-pink transition-colors hover:bg-neon-pink/20"
                        title="Remove favorite"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Sports list */}
            <p className="mb-3 text-sm text-foreground-muted">
              Add sports to follow
            </p>
            {sportsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-neon-blue" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {sports
                  .filter((sport) => !isSportFavorite(sport.id))
                  .map((sport) => (
                    <button
                      key={sport.id}
                      onClick={() => handleToggleSportFavorite(sport)}
                      disabled={isAddingSport === sport.id}
                      className={cn(
                        'flex items-center gap-2 rounded-lg border border-border p-3 text-left transition-colors hover:border-neon-pink hover:bg-neon-pink/5'
                      )}
                    >
                      <span className="text-xl">{getSportEmoji(sport.code)}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {sport.display_name || sport.name}
                        </p>
                        <p className="text-xs text-foreground-muted capitalize">
                          {sport.gender}
                        </p>
                      </div>
                      {isAddingSport === sport.id && (
                        <Loader2 className="h-4 w-4 animate-spin text-neon-pink" />
                      )}
                    </button>
                  ))}
              </div>
            )}
          </div>
        </Card>

        {/* Back button */}
        <Button
          variant="outline"
          className="w-full"
          onClick={() => router.push('/profile')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Profile
        </Button>
      </main>
    </div>
  )
}
