import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import { useAuthStore } from '../store/authStore';
import { apiService } from '../lib/api';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';

SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Best-effort push registration — wrapped defensively since Expo push tokens
// require a physical device and (for EAS builds) a projectId, neither of
// which is guaranteed in every dev environment. A failure here should never
// block the rest of the app.
async function registerForPushNotifications(userId: string) {
  try {
    if (Platform.OS === 'web') return;
    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;
    if (existing !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') return;

    const tokenData = await Notifications.getExpoPushTokenAsync();
    await apiService.registerPushToken(userId, tokenData.data);
  } catch (err) {
    console.warn('Push notification registration skipped:', err);
  }
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  const { user, isInitializing, initialize } = useAuthStore();
  const segments: string[] = useSegments() as any;
  const router = useRouter();

  // Restores any existing Supabase session on cold start (persisted via the
  // AsyncStorage adapter wired into src/lib/supabase.ts) before the router
  // makes its first routing decision, so a logged-in user never bounces
  // through the login screen on relaunch.
  useEffect(() => {
    initialize();
  }, []);

  // Registers this device's push token once the user is fully set up — not
  // during onboarding/verification, so we're not asking for a permission
  // before the user has any reason to trust the app yet.
  useEffect(() => {
    if (user?.onboarded && user.verificationStatus === 'approved') {
      registerForPushNotifications(user.id);
    }
  }, [user?.id, user?.onboarded, user?.verificationStatus]);

  const ready = fontsLoaded && !isInitializing;

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync();
    }
  }, [ready]);

  useEffect(() => {
    if (!ready) return;

    const inAuthGroup = segments[0] === '(auth)';
    const currentScreen = segments[1] ?? '';

    if (!user) {
      // No user — go to login
      if (!inAuthGroup) router.replace('/(auth)');
      return;
    }

    if (!user.onboarded) {
      // Needs onboarding
      if (user.type === 'donor' && currentScreen !== 'donor-onboard') {
        router.replace('/(auth)/donor-onboard');
      } else if (user.type === 'ngo' && currentScreen !== 'ngo-onboard') {
        router.replace('/(auth)/ngo-onboard');
      }
      return;
    }

    if (user.verificationStatus === 'unsubmitted' || user.verificationStatus === 'pending') {
      // Needs verification
      if (currentScreen !== 'verify') {
        router.replace('/(auth)/verify');
      }
      return;
    }

    if (user.verificationStatus === 'approved') {
      // Fully set up — go to dashboard if still in auth
      if (inAuthGroup) {
        router.replace(user.type === 'donor' ? '/(donor)' : '/(ngo)');
      }
    }
  }, [user, segments, ready]);

  if (!ready) return null;

  return <Slot />;
}
