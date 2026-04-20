import { useMemo } from 'react';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Text from '@ui/components/Text';
import { colors, elevation, gradients, layout, radii, spacing } from '@ui/theme';

type Variant = 'primary' | 'ghost' | 'destructive' | 'success' | 'purple';
type Size = 'sm' | 'md' | 'lg';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  accessibilityLabel?: string;
  accessibilityHint?: string;
};

function gradientForVariant(variant: Variant): readonly [string, string, string] {
  switch (variant) {
    case 'primary':
      return gradients.primary;
    case 'success':
      return gradients.success;
    case 'destructive':
      return gradients.destructive;
    case 'purple':
      return gradients.purple;
    case 'ghost':
    default:
      return [colors.surface, colors.surface, colors.surface];
  }
}

function sizeTokens(size: Size) {
  switch (size) {
    case 'sm':
      return {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.lg,
        variant: 'labelMD' as const,
      };
    case 'lg':
      return {
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.xxl,
        variant: 'labelLG' as const,
      };
    case 'md':
    default:
      return {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
        variant: 'labelLG' as const,
      };
  }
}

export default function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled,
  fullWidth,
  style,
  accessibilityLabel,
  accessibilityHint,
}: Props) {
  const gradient = useMemo(() => gradientForVariant(variant), [variant]);
  const { paddingVertical, paddingHorizontal, variant: textVariant } = sizeTokens(size);
  const isGhost = variant === 'ghost';
  const isDisabled = Boolean(disabled);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.pressable,
        {
          width: fullWidth ? '100%' : undefined,
          opacity: isDisabled ? 0.45 : pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.985 : 1 }],
        },
        style,
      ]}
    >
      {isGhost ? (
        <View style={[styles.ghost, { paddingVertical, paddingHorizontal }]}>
          <Text variant={textVariant} color={colors.text}>
            {label.toUpperCase()}
          </Text>
        </View>
      ) : (
        <LinearGradient
          colors={gradient as unknown as [string, string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.filled, { paddingVertical, paddingHorizontal }]}
        >
          <Text variant={textVariant} color={colors.bg}>
            {label.toUpperCase()}
          </Text>
        </LinearGradient>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    minHeight: layout.minTapTarget,
  },
  filled: {
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: layout.minTapTarget,
    ...elevation.soft,
  },
  ghost: {
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: layout.minTapTarget,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
});
