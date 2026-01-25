import { useState, useEffect, useCallback, useRef } from 'react'
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import Constants from 'expo-constants'
import { Platform } from 'react-native'
import { useSupabase } from '../contexts/SupabaseContext'

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

interface UsePushNotificationsReturn {
  expoPushToken: string | null
  notification: Notifications.Notification | null
  isRegistered: boolean
  isLoading: boolean
  error: string | null
  registerForPushNotifications: () => Promise<boolean>
  unregister: () => Promise<boolean>
}

export function usePushNotifications(): UsePushNotificationsReturn {
  const { supabase, user } = useSupabase()
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null)
  const [notification, setNotification] = useState<Notifications.Notification | null>(null)
  const [isRegistered, setIsRegistered] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const notificationListener = useRef<Notifications.EventSubscription>()
  const responseListener = useRef<Notifications.EventSubscription>()

  // Check existing registration on mount
  useEffect(() => {
    const checkExistingToken = async () => {
      try {
        const { status } = await Notifications.getPermissionsAsync()
        if (status === 'granted') {
          const token = await getExpoPushToken()
          if (token) {
            setExpoPushToken(token)
            setIsRegistered(true)
          }
        }
      } catch (err) {
        console.error('Error checking existing token:', err)
      }
    }

    checkExistingToken()

    // Set up notification listeners
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        setNotification(notification)
      }
    )

    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        // Handle notification tap - navigate to relevant screen
        const data = response.notification.request.content.data
        console.log('Notification tapped:', data)
        // You can use router to navigate based on notification data
      }
    )

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current)
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current)
      }
    }
  }, [])

  const getExpoPushToken = async (): Promise<string | null> => {
    if (!Device.isDevice) {
      console.warn('Push notifications require a physical device')
      return null
    }

    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId

      const token = await Notifications.getExpoPushTokenAsync({
        projectId: projectId,
      })

      return token.data
    } catch (err) {
      console.error('Error getting Expo push token:', err)
      return null
    }
  }

  const registerForPushNotifications = useCallback(async (): Promise<boolean> => {
    if (!Device.isDevice) {
      setError('Push notifications require a physical device')
      return false
    }

    setIsLoading(true)
    setError(null)

    try {
      // Check/request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync()
      let finalStatus = existingStatus

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync()
        finalStatus = status
      }

      if (finalStatus !== 'granted') {
        setError('Permission not granted for push notifications')
        return false
      }

      // Get push token
      const token = await getExpoPushToken()
      if (!token) {
        setError('Failed to get push token')
        return false
      }

      setExpoPushToken(token)

      // Save token to Supabase
      const { error: dbError } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: user?.id || null,
          endpoint: token, // Using endpoint field for the expo token
          p256dh: null, // Not used for Expo
          auth: null, // Not used for Expo
          platform: 'expo', // Add platform field to distinguish from web
          device_type: Platform.OS,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'endpoint'
        })

      if (dbError) {
        console.error('Error saving push token:', dbError)
        // Don't fail - token still works
      }

      // Configure Android notification channel
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF2A6D',
        })
      }

      setIsRegistered(true)
      return true
    } catch (err) {
      console.error('Error registering for push notifications:', err)
      setError(err instanceof Error ? err.message : 'Failed to register')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [supabase, user])

  const unregister = useCallback(async (): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      if (expoPushToken) {
        // Remove from Supabase
        const { error: dbError } = await supabase
          .from('push_subscriptions')
          .delete()
          .eq('endpoint', expoPushToken)

        if (dbError) {
          console.error('Error removing push token:', dbError)
        }
      }

      setExpoPushToken(null)
      setIsRegistered(false)
      return true
    } catch (err) {
      console.error('Error unregistering:', err)
      setError(err instanceof Error ? err.message : 'Failed to unregister')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [supabase, expoPushToken])

  return {
    expoPushToken,
    notification,
    isRegistered,
    isLoading,
    error,
    registerForPushNotifications,
    unregister,
  }
}
