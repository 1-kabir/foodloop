import { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useAuthStore } from '../store/authStore';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  const { user } = useAuthStore();
  const segments: string[] = useSegments() as any;
  const router = useRouter();

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    if (!fontsLoaded) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inDonorGroup = segments[0] === '(donor)';
    const inNgoGroup = segments[0] === '(ngo)';
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
  }, [user, segments, fontsLoaded]);

  if (!fontsLoaded) return null;

  return <Slot />;
}
