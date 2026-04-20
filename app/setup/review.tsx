import { FlatList, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Screen from '@ui/components/Screen';
import Text from '@ui/components/Text';
import Button from '@ui/components/Button';
import SectionCard from '@ui/components/SectionCard';
import StepHeader from '@ui/components/StepHeader';
import { colors, spacing } from '@ui/theme';
import { useSetupStore } from '@game/setupStore';
import { useGameStore } from '@game/gameStore';
import { markDrinkResponsiblyPending } from '@ui/components/DrinkResponsiblyModal';
import { computeThreshold } from '@game/penaltyModel';
import { strings } from '@i18n/en';

export default function ReviewScreen() {
  const router = useRouter();
  const { mode, drafts } = useSetupStore();
  const startGame = useGameStore((s) => s.startGame);
  const numPlayers = drafts.length;

  function begin() {
    startGame(mode, drafts);
    markDrinkResponsiblyPending();
    router.replace('/game');
  }

  return (
    <Screen>
      <StepHeader step={3} title={strings.setup.stepReview} />
      <SectionCard
        accent={mode === 'diablo' ? colors.purple : colors.orange}
        style={styles.modeCard}
      >
        <Text variant="labelSM" color={colors.textMuted}>
          {strings.setup.modeHeading.toUpperCase()}
        </Text>
        <Text variant="displayMD" style={{ marginTop: spacing.xs }}>
          {mode === 'diablo' ? strings.setup.modeDiablo : strings.setup.modeTradicional}
        </Text>
      </SectionCard>
      <FlatList
        data={drafts}
        keyExtractor={(_, i) => String(i)}
        style={styles.list}
        contentContainerStyle={{ gap: spacing.sm, paddingVertical: spacing.md }}
        renderItem={({ item }) => {
          const threshold = computeThreshold(item.abv, numPlayers, item.difficulty);
          return (
            <SectionCard>
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text variant="displaySM">{item.name}</Text>
                  <Text variant="labelSM" color={colors.textMuted}>
                    {Math.round(item.abv * 100)}% · {item.difficulty}
                  </Text>
                </View>
                <View style={styles.threshold}>
                  <Text variant="displayMD" color={colors.orange}>
                    {threshold}
                  </Text>
                  <Text variant="labelSM" color={colors.textMuted}>
                    {strings.setup.penaltyPerShotLabel.toUpperCase()}
                  </Text>
                </View>
              </View>
            </SectionCard>
          );
        }}
      />
      <View style={styles.footer}>
        <Button label={strings.setup.back} variant="ghost" onPress={() => router.back()} />
        <Button label={strings.setup.begin} variant="primary" onPress={begin} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  modeCard: { marginBottom: spacing.md },
  list: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
  threshold: { alignItems: 'flex-end' },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingTop: spacing.md,
  },
});
