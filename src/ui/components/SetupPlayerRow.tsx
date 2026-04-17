import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { PlayerDraft } from '@game/playerFactory';
import { colors, radii, spacing } from '@ui/theme';
import Text from '@ui/components/Text';
import { strings } from '@i18n/en';

type Props = {
  draft: PlayerDraft;
  onConfigure: () => void;
};

export default function SetupPlayerRow({ draft, onConfigure }: Props) {
  const abvPct = Math.round(draft.abv * 100);
  return (
    <View style={styles.root}>
      <View style={styles.meta}>
        <Text variant="displaySM" numberOfLines={1}>
          {draft.name}
        </Text>
        <Text variant="labelSM" color={colors.textMuted} numberOfLines={1}>
          {abvPct}% · {draft.difficulty} · {draft.gender}
        </Text>
      </View>
      <Pressable
        onPress={onConfigure}
        style={({ pressed }) => [styles.gear, { opacity: pressed ? 0.65 : 1 }]}
        accessibilityRole="button"
        accessibilityLabel={strings.game.settings}
      >
        <Ionicons name="settings-sharp" size={22} color={colors.yellow} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  meta: { flex: 1, minWidth: 0 },
  gear: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
});
