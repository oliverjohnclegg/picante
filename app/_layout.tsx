import { useEffect, useState, type ComponentType } from 'react';
import { StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
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
      <GestureHandlerRootView style={styles.root}>
        <SafeAreaProvider>
          <KeyboardProvider statusBarTranslucent navigationBarTranslucent>
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
          </KeyboardProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </Boundary>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
});
