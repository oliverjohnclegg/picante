import { Pressable, StyleSheet, View } from 'react-native';
import Text from '@ui/components/Text';
import { colors, spacing } from '@ui/theme';
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
      <View style={styles.deckCount}>
        <Text variant="displayMD">{deckCount}</Text>
        <Text variant="labelSM" color={colors.textMuted}>
          {strings.game.cardsLeft.toUpperCase()}
        </Text>
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
  deckCount: {
    alignItems: 'flex-end',
  },
});
