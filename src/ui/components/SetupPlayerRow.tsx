import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { PlayerDraft } from '@game/playerFactory';
import Text from '@ui/components/Text';
import { colors, layout, radii, spacing } from '@ui/theme';
import { strings } from '@i18n/en';

type Props = {
  draft: PlayerDraft;
  onConfigure: () => void;
};

export default function SetupPlayerRow({ draft, onConfigure }: Props) {
  const abvPct = Math.round(draft.abv * 100);
  const subtitle = `${abvPct}% · ${draft.difficulty} · ${draft.gender}`;
  return (
    <Pressable
      onPress={onConfigure}
      accessibilityRole="button"
      accessibilityLabel={`${draft.name} · ${subtitle}`}
      accessibilityHint={strings.game.settings}
      style={({ pressed }) => [styles.root, pressed && styles.rootPressed]}
    >
      <View style={styles.meta}>
        <Text variant="displaySM" numberOfLines={1}>
          {draft.name}
        </Text>
        <Text variant="labelSM" color={colors.textMuted} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
      <View style={styles.gear} pointerEvents="none">
        <Ionicons name="settings-sharp" size={22} color={colors.yellow} />
      </View>
    </Pressable>
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
    minHeight: layout.minTapTarget + spacing.md,
  },
  rootPressed: {
    opacity: 0.85,
    borderColor: colors.borderStrong,
  },
  meta: {
    flex: 1,
    minWidth: 0,
  },
  gear: {
    width: layout.minTapTarget,
    height: layout.minTapTarget,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
});
