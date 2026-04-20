import { useEffect, useState } from 'react';
import { View, StyleSheet, useWindowDimensions, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Screen from '@ui/components/Screen';
import Text from '@ui/components/Text';
import Wordmark from '@ui/svg/Wordmark';
import {
  HomeBlazeButton,
  HomeOutlineButton,
  HomePulseButton,
  HomeEmberButton,
} from '@ui/components/HomeSpicyActions';
import { colors, layout, radii, spacing } from '@ui/theme';
import { sessionStore } from '@game/persistence';
import { useGameStore } from '@game/gameStore';
import { strings } from '@i18n/en';
import { markDrinkResponsiblyPending } from '@ui/components/DrinkResponsiblyModal';

export default function HomeScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const [hasResume, setHasResume] = useState(false);
  const hydrate = useGameStore((s) => s.hydrateFromSnapshot);
  const reset = useGameStore((s) => s.reset);

  useEffect(() => {
    sessionStore.read().then((stored) => {
      setHasResume(Boolean(stored && stored.players.length > 0 && stored.deck.length > 0));
    });
  }, []);

  function startNew() {
    reset();
    router.push('/setup/mode');
  }

  async function resume() {
    const stored = await sessionStore.read();
    if (stored) {
      hydrate(stored);
      markDrinkResponsiblyPending();
      router.push('/game');
    }
  }

  async function discard() {
    await sessionStore.clear();
    setHasResume(false);
  }

  return (
    <Screen>
      <View style={[styles.root, isLandscape && styles.rootLandscape]}>
        <Pressable
          onPress={() => router.push('/settings')}
          style={({ pressed }) => [styles.settingsGear, pressed && styles.settingsGearPressed]}
          hitSlop={spacing.md}
          accessibilityRole="button"
          accessibilityLabel={strings.home.openSettings}
        >
          <Ionicons name="settings-outline" size={24} color={colors.textMuted} />
        </Pressable>
        <View style={[styles.hero, isLandscape && styles.heroLandscape]}>
          <Wordmark size={isLandscape ? 56 : 64} align="center" />
          <Text
            variant="bodyLG"
            color={colors.textMuted}
            style={[styles.tagline, isLandscape && styles.taglineLandscape]}
          >
            {strings.app.tagline}
          </Text>
        </View>
        <View style={[styles.actions, isLandscape && styles.actionsLandscape]}>
          <View style={[styles.actionStack, isLandscape && styles.actionStackLandscape]}>
            {hasResume ? (
              <>
                <HomePulseButton
                  label={strings.home.resume}
                  icon="play-forward"
                  onPress={resume}
                  fullWidth
                />
                <HomeEmberButton
                  label={strings.home.discard}
                  icon="trash-outline"
                  onPress={discard}
                  fullWidth
                />
              </>
            ) : (
              <>
                <HomeBlazeButton
                  label={strings.home.startGame}
                  icon="flame"
                  onPress={startNew}
                  fullWidth
                />
                <HomeOutlineButton
                  label={strings.home.howToPlay}
                  icon="book-outline"
                  onPress={() => router.push('/how-to-play')}
                  fullWidth
                />
              </>
            )}
          </View>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  rootLandscape: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsGear: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: layout.minTapTarget,
    height: layout.minTapTarget,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  settingsGearPressed: {
    opacity: 0.6,
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroLandscape: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  tagline: {
    marginTop: spacing.md,
    textAlign: 'center',
    alignSelf: 'stretch',
  },
  taglineLandscape: {
    alignSelf: 'center',
    textAlign: 'center',
    maxWidth: 420,
  },
  actions: {
    paddingBottom: spacing.xl,
  },
  actionsLandscape: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 0,
  },
  actionStack: {
    width: '100%',
    gap: spacing.md,
  },
  actionStackLandscape: {
    maxWidth: 300,
    alignSelf: 'center',
  },
});
