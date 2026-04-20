import { useMemo } from 'react';
import { FlatList, ScrollView, View, StyleSheet, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Screen from '@ui/components/Screen';
import Text from '@ui/components/Text';
import Button from '@ui/components/Button';
import SectionCard from '@ui/components/SectionCard';
import { useGameStore } from '@game/gameStore';
import { useSetupStore } from '@game/setupStore';
import { computeAwards, type Award } from '@game/awards';
import { colors, spacing } from '@ui/theme';
import { strings } from '@i18n/en';

const AWARD_GRID_BREAKPOINTS = {
  stack: 380,
  quad: 920,
} as const;

const AWARD_ACCENT: Record<Award['id'], string> = {
  topDrinker: colors.orange,
  ironLiver: colors.yellow,
  glassSlipper: colors.green,
  snowball: colors.purple,
};

const AWARD_ICON: Record<Award['id'], React.ComponentProps<typeof Ionicons>['name']> = {
  topDrinker: 'flame',
  ironLiver: 'shield',
  glassSlipper: 'sparkles',
  snowball: 'snow',
};

export default function EndScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const players = useGameStore((s) => s.players);
  const removed = useGameStore((s) => s.removedPlayers);
  const reset = useGameStore((s) => s.reset);
  const resetSetup = useSetupStore((s) => s.reset);

  const awardFlexBasis =
    width >= AWARD_GRID_BREAKPOINTS.quad
      ? '23%'
      : width < AWARD_GRID_BREAKPOINTS.stack
        ? '100%'
        : '47%';

  const ranked = useMemo(
    () => [...players, ...removed].sort((a, b) => b.rawPenalties - a.rawPenalties),
    [players, removed],
  );

  const awards = useMemo(() => computeAwards([...players, ...removed]), [players, removed]);

  function playAgain() {
    reset();
    resetSetup();
    router.replace('/setup/mode');
  }

  function home() {
    reset();
    resetSetup();
    router.replace('/home');
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Text variant="displayXL">{strings.end.title}</Text>
      </View>
      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
      >
        {awards.length > 0 ? (
          <View style={styles.awardsGrid}>
            {awards.map((award) => (
              <SectionCard
                key={award.id}
                accent={AWARD_ACCENT[award.id]}
                style={[styles.awardCard, { flexBasis: awardFlexBasis }]}
              >
                <View style={styles.awardHeader}>
                  <Ionicons name={AWARD_ICON[award.id]} size={18} color={AWARD_ACCENT[award.id]} />
                  <Text variant="labelSM" color={AWARD_ACCENT[award.id]}>
                    {award.title}
                  </Text>
                </View>
                <Text variant="displaySM" style={styles.awardName} numberOfLines={1}>
                  {award.player.name}
                </Text>
                <Text variant="bodySM" color={colors.textMuted}>
                  {award.subtitle}
                </Text>
              </SectionCard>
            ))}
          </View>
        ) : null}
        <Text variant="labelSM" color={colors.textMuted} style={styles.sectionLabel}>
          {strings.end.leaderboard.toUpperCase()}
        </Text>
        <FlatList
          data={ranked}
          keyExtractor={(p) => p.id}
          scrollEnabled={false}
          contentContainerStyle={{ gap: spacing.sm, paddingVertical: spacing.md }}
          renderItem={({ item, index }) => (
            <SectionCard accent={index === 0 ? colors.yellow : undefined} style={styles.row}>
              <Text variant="displayMD" color={index === 0 ? colors.yellow : colors.text}>
                #{index + 1}
              </Text>
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <Text variant="displaySM">{item.name}</Text>
                <Text variant="labelSM" color={colors.textMuted}>
                  {item.rawPenalties} {strings.end.penalties} · {item.shotsTaken}{' '}
                  {strings.end.shots}
                </Text>
              </View>
            </SectionCard>
          )}
        />
      </ScrollView>
      <View style={styles.footer}>
        <Button label={strings.end.home} variant="ghost" onPress={home} fullWidth />
        <Button label={strings.end.playAgain} variant="primary" onPress={playAgain} fullWidth />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingBottom: spacing.md },
  body: { flex: 1 },
  bodyContent: { paddingBottom: spacing.md },
  awardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  awardCard: {
    flexGrow: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  awardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  awardName: {
    marginTop: spacing.xs,
  },
  sectionLabel: {
    marginTop: spacing.xl,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  footer: { gap: spacing.md, paddingTop: spacing.md },
});
