import { FlatList, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Screen from '@ui/components/Screen';
import Text from '@ui/components/Text';
import Button from '@ui/components/Button';
import SectionCard from '@ui/components/SectionCard';
import { useGameStore } from '@game/gameStore';
import { useSetupStore } from '@game/setupStore';
import { colors, spacing } from '@ui/theme';
import { strings } from '@i18n/en';

export default function EndScreen() {
  const router = useRouter();
  const players = useGameStore((s) => s.players);
  const removed = useGameStore((s) => s.removedPlayers);
  const reset = useGameStore((s) => s.reset);
  const resetSetup = useSetupStore((s) => s.reset);

  const ranked = [...players, ...removed].sort((a, b) => b.rawPenalties - a.rawPenalties);

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
        <Text variant="labelSM" color={colors.textMuted} style={{ marginTop: spacing.sm }}>
          {strings.end.leaderboard.toUpperCase()}
        </Text>
      </View>
      <FlatList
        data={ranked}
        keyExtractor={(p) => p.id}
        style={styles.list}
        contentContainerStyle={{ gap: spacing.sm, paddingVertical: spacing.md }}
        renderItem={({ item, index }) => (
          <SectionCard accent={index === 0 ? colors.yellow : undefined} style={styles.row}>
            <Text variant="displayMD" color={index === 0 ? colors.yellow : colors.text}>
              #{index + 1}
            </Text>
            <View style={{ flex: 1, marginLeft: spacing.md }}>
              <Text variant="displaySM">{item.name}</Text>
              <Text variant="labelSM" color={colors.textMuted}>
                {item.rawPenalties} {strings.end.penalties} · {item.shotsTaken} {strings.end.shots}
              </Text>
            </View>
          </SectionCard>
        )}
      />
      <View style={styles.footer}>
        <Button label={strings.end.home} variant="ghost" onPress={home} fullWidth />
        <Button label={strings.end.playAgain} variant="primary" onPress={playAgain} fullWidth />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingBottom: spacing.md },
  list: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
  footer: { gap: spacing.md, paddingTop: spacing.md },
});
