import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Text from '@ui/components/Text';
import { colors, elevation, gradients, layout, radii, spacing } from '@ui/theme';

type IonName = ComponentProps<typeof Ionicons>['name'];

type BaseProps = {
  label: string;
  icon: IonName;
  onPress: () => void;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
};

function pressFeel(pressed: boolean, restOpacity = 1, pressedOpacity = 0.9) {
  return {
    opacity: pressed ? pressedOpacity : restOpacity,
    transform: [{ scale: pressed ? 0.985 : 1 }],
  };
}

export function HomeBlazeButton({ label, icon, onPress, fullWidth, style }: BaseProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.blazeOuter,
        fullWidth && styles.fullWidth,
        style,
        pressFeel(pressed, 1, 0.92),
      ]}
    >
      <LinearGradient
        colors={gradients.blaze as unknown as [string, string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.blazeGradient}
      >
        <View style={styles.blazeInner}>
          <Ionicons name={icon} size={26} color={colors.bg} />
          <Text variant="labelLG" color={colors.bg} style={styles.blazeLabel}>
            {label}
          </Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

export function HomeOutlineButton({ label, icon, onPress, fullWidth, style }: BaseProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.outlineOuter,
        fullWidth && styles.fullWidth,
        style,
        pressFeel(pressed),
      ]}
    >
      <LinearGradient
        colors={gradients.rainbow as unknown as [string, string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.outlineRing}
      >
        <View style={styles.outlineInner}>
          <Ionicons name={icon} size={22} color={colors.yellow} />
          <Text variant="labelLG" color={colors.text} style={styles.outlineLabel}>
            {label}
          </Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

export function HomePulseButton({ label, icon, onPress, fullWidth, style }: BaseProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.pulseOuter,
        fullWidth && styles.fullWidth,
        style,
        pressFeel(pressed, 1, 0.92),
      ]}
    >
      <LinearGradient
        colors={gradients.pulse as unknown as [string, string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.pulseGradient}
      >
        <View style={styles.pulseInner}>
          <Ionicons name={icon} size={24} color={colors.bg} />
          <Text variant="labelLG" color={colors.bg} style={styles.pulseLabel}>
            {label}
          </Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

export function HomeEmberButton({ label, icon, onPress, fullWidth, style }: BaseProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.emberOuter,
        fullWidth && styles.fullWidth,
        style,
        pressFeel(pressed),
      ]}
    >
      <LinearGradient
        colors={gradients.ember as unknown as [string, string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.emberGradient}
      >
        <View style={styles.emberInner}>
          <Ionicons name={icon} size={22} color={colors.red} />
          <Text variant="labelLG" color={colors.text} style={styles.emberLabel}>
            {label}
          </Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fullWidth: { width: '100%' },
  blazeOuter: {
    borderRadius: radii.xl,
    overflow: 'hidden',
    minHeight: layout.minTapTarget,
    ...elevation.prominent,
  },
  blazeGradient: { borderRadius: radii.xl },
  blazeInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg + 2,
    paddingHorizontal: spacing.xxl,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.white22,
  },
  blazeLabel: { letterSpacing: 0.8 },
  outlineOuter: {
    borderRadius: radii.xl,
    padding: 2,
    minHeight: layout.minTapTarget,
    ...elevation.soft,
  },
  outlineRing: { borderRadius: radii.xl - 1 },
  outlineInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
    borderRadius: radii.xl - 2,
    backgroundColor: colors.bg,
    margin: 2,
  },
  outlineLabel: { letterSpacing: 0.6 },
  pulseOuter: {
    borderRadius: radii.xl,
    overflow: 'hidden',
    minHeight: layout.minTapTarget,
    ...elevation.prominent,
  },
  pulseGradient: { borderRadius: radii.xl },
  pulseInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.white18,
  },
  pulseLabel: { letterSpacing: 0.6 },
  emberOuter: {
    borderRadius: radii.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.red45,
    minHeight: layout.minTapTarget,
  },
  emberGradient: { borderRadius: radii.xl },
  emberInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
    borderRadius: radii.xl,
  },
  emberLabel: { letterSpacing: 0.5 },
});
