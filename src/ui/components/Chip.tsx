import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import Text from '@ui/components/Text';
import { colors, layout, radii, spacing } from '@ui/theme';

type Props = {
  label: string;
  active: boolean;
  onPress: () => void;
  accent?: string;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

export default function Chip({ label, active, onPress, accent, accessibilityLabel, style }: Props) {
  const activeColor = accent ?? colors.orange;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={accessibilityLabel ?? label}
      style={({ pressed }) => [
        styles.root,
        active && { backgroundColor: activeColor, borderColor: activeColor },
        { opacity: pressed ? 0.85 : 1 },
        style,
      ]}
    >
      <Text variant="labelMD" color={active ? colors.bg : colors.text}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    minHeight: layout.minTapTarget,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
