import { Pressable, View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import type { Player } from '@game/types';
import { colors, radii, spacing } from '@ui/theme';
import Text from '@ui/components/Text';
import ThresholdRing from '@ui/components/ThresholdRing';
import { rawPenaltyProgressRatio, shotProgressRatio } from '@game/penaltyModel';

type Props = {
  player: Player;
  accent?: string;
  onPress?: () => void;
  size?: 'sm' | 'md';
  subtitle?: string;
  ringMetric?: 'threshold' | 'raw';
  rawProgressMax?: number;
  fullWidth?: boolean;
};

export default function PlayerChip({
  player,
  accent,
  onPress,
  size = 'md',
  subtitle,
  ringMetric = 'threshold',
  rawProgressMax,
  fullWidth,
}: Props) {
  const ringSize = size === 'sm' ? 44 : 60;
  const progress =
    ringMetric === 'raw'
      ? rawPenaltyProgressRatio(
          player.rawPenalties,
          rawProgressMax ?? Math.max(player.rawPenalties, 1),
        )
      : shotProgressRatio(player);
  const label =
    ringMetric === 'raw'
      ? String(player.rawPenalties)
      : `${player.penaltiesSinceLastShot}/${player.threshold}`;

  const widthStyle: StyleProp<ViewStyle> | undefined = fullWidth
    ? { alignSelf: 'stretch', width: '100%' }
    : undefined;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.root,
        widthStyle,
        { opacity: pressed ? 0.85 : 1 },
        size === 'sm' && { paddingVertical: spacing.xs, paddingHorizontal: spacing.sm },
      ]}
    >
      <ThresholdRing size={ringSize} progress={progress} label={label} accent={accent} />
      <View style={{ marginLeft: spacing.md, flexShrink: 1 }}>
        <Text variant={size === 'sm' ? 'labelMD' : 'displaySM'} numberOfLines={1}>
          {player.name}
        </Text>
        {subtitle ? (
          <Text variant="labelSM" color={colors.textMuted}>
            {subtitle}
          </Text>
        ) : null}
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
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
