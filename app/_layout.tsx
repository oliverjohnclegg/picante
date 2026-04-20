import { useEffect, useState, type ComponentType } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useAppFonts } from '@ui/useFonts';
import AgeGate from '@ui/components/AgeGate';
import { colors } from '@ui/theme';
import { useSettings } from '@platform/settingsStore';
import { useUnlocks } from '@platform/unlocksStore';
import { iap } from '@platform/iap';
import { initTelemetry, getErrorBoundary } from '@platform/telemetry';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

type BoundaryProps = { children: React.ReactNode };

function Passthrough({ children }: BoundaryProps) {
  return <>{children}</>;
}

export default function RootLayout() {
  const [fontsLoaded] = useAppFonts();
  const hydrateSettings = useSettings((s) => s.hydrate);
  const hydrateUnlocks = useUnlocks((s) => s.hydrate);
  const [Boundary, setBoundary] = useState<ComponentType<BoundaryProps>>(() => Passthrough);

  useEffect(() => {
    hydrateSettings();
    hydrateUnlocks();
    iap.init().catch(() => undefined);
    initTelemetry()
      .then(() => {
        const Candidate = getErrorBoundary();
        if (Candidate) setBoundary(() => Candidate as ComponentType<BoundaryProps>);
      })
      .catch(() => undefined);
    return () => {
      iap.teardown().catch(() => undefined);
    };
  }, [hydrateSettings, hydrateUnlocks]);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <Boundary>
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
    </Boundary>
  );
}
