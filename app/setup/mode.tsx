import { useEffect } from 'react';
import { View, StyleSheet, Pressable, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Screen from '@ui/components/Screen';
import Text from '@ui/components/Text';
import Button from '@ui/components/Button';
import StepHeader from '@ui/components/StepHeader';
import { colors, radii, spacing } from '@ui/theme';
import { useSetupStore } from '@game/setupStore';
import { useUnlocks } from '@platform/unlocksStore';
import { strings } from '@i18n/en';

export default function ModeScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const mode = useSetupStore((s) => s.mode);
  const setMode = useSetupStore((s) => s.setMode);
  const hydrate = useUnlocks((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <Screen>
      <StepHeader step={1} title={strings.setup.stepMode} />
      <View style={[styles.cards, isLandscape && styles.cardsLandscape]}>
        <ModeCard
          label={strings.setup.modeTradicional}
          desc={strings.setup.modeTradicionalDesc}
          accent={colors.orange}
          selected={mode === 'tradicional'}
          isLandscape={isLandscape}
          onPress={() => setMode('tradicional')}
        />
        <ModeCard
          label={strings.setup.modeDiablo}
          desc={strings.setup.modeDiabloDesc}
          accent={colors.purple}
          selected={mode === 'diablo'}
          isLandscape={isLandscape}
          onPress={() => setMode('diablo')}
        />
      </View>
      <View style={styles.footer}>
        <Button
          label={strings.setup.next}
          variant="primary"
          fullWidth
          onPress={() => router.push('/setup/players')}
        />
      </View>
    </Screen>
  );
}

type CardProps = {
  label: string;
  desc: string;
  accent: string;
  selected: boolean;
  isLandscape: boolean;
  onPress: () => void;
};

function ModeCard({ label, desc, accent, selected, isLandscape, onPress }: CardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.cardWrap, isLandscape && styles.cardWrapLandscape]}
    >
      <LinearGradient
        colors={[accent, colors.surface]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.card,
          isLandscape && styles.cardLandscape,
          selected && { borderColor: accent, borderWidth: 2 },
        ]}
      >
        <Text variant="displayLG">{label}</Text>
        <Text variant="bodyLG" color={colors.textMuted} style={{ marginTop: spacing.sm }}>
          {desc}
        </Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cards: { flex: 1, gap: spacing.md, paddingTop: spacing.md },
  cardsLandscape: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  cardWrap: { flex: 1 },
  cardWrapLandscape: {
    minWidth: 0,
  },
  card: {
    flex: 1,
    borderRadius: radii.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'flex-end',
  },
  cardLandscape: {
    justifyContent: 'center',
  },
  footer: { paddingTop: spacing.lg },
});
