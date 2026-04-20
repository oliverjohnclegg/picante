import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Text from '@ui/components/Text';
import { colors, layout, radii, spacing } from '@ui/theme';
import { strings } from '@i18n/en';
import type { Player } from '@game/types';

type Props = {
  drawer: Player;
  deckCount: number;
  onOpenRoster: () => void;
};

export default function GameHeader({ drawer, deckCount, onOpenRoster }: Props) {
  return (
    <View style={styles.root}>
      <Pressable
        onPress={onOpenRoster}
        accessibilityRole="button"
        accessibilityLabel={`${drawer.name} · ${strings.game.roster}`}
        style={({ pressed }) => [styles.drawer, pressed && styles.drawerPressed]}
      >
        <Text variant="labelSM" color={colors.textMuted}>
          {strings.game.roster.toUpperCase()}
        </Text>
        <Text variant="displayMD" numberOfLines={1}>
          {drawer.name}
          <Text variant="displayMD" color={colors.textMuted}>
            {strings.game.turnOf}
          </Text>
        </Text>
      </Pressable>
      <View style={styles.rightCluster}>
        <View style={styles.deckCount}>
          <Text variant="displayMD">{deckCount}</Text>
          <Text variant="labelSM" color={colors.textMuted}>
            {strings.game.cardsLeft.toUpperCase()}
          </Text>
        </View>
        <Pressable
          onPress={onOpenRoster}
          hitSlop={spacing.sm}
          accessibilityRole="button"
          accessibilityLabel={strings.game.roster}
          style={({ pressed }) => [styles.rosterButton, pressed && styles.rosterButtonPressed]}
        >
          <Ionicons name="people" size={20} color={colors.textMuted} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  drawer: {
    flexShrink: 1,
    minWidth: 0,
    paddingVertical: spacing.xs,
  },
  drawerPressed: {
    opacity: 0.7,
  },
  rightCluster: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  deckCount: {
    alignItems: 'flex-end',
  },
  rosterButton: {
    width: layout.minTapTarget,
    height: layout.minTapTarget,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rosterButtonPressed: {
    opacity: 0.7,
    backgroundColor: colors.surface,
  },
});
