import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useAppFonts } from '@ui/useFonts';
import AgeGate from '@ui/components/AgeGate';
import { colors } from '@ui/theme';
import { useSettings } from '@platform/settingsStore';
import { useUnlocks } from '@platform/unlocksStore';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout() {
  const [fontsLoaded] = useAppFonts();
  const hydrateSettings = useSettings((s) => s.hydrate);
  const hydrateUnlocks = useUnlocks((s) => s.hydrate);

  useEffect(() => {
    hydrateSettings();
    hydrateUnlocks();
  }, [hydrateSettings, hydrateUnlocks]);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
          animation: 'fade',
          orientation: 'all',
        }}
      />
      <AgeGate />
    </SafeAreaProvider>
  );
}
