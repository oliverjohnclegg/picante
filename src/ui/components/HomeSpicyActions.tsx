import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Text from '@ui/components/Text';
import { colors, radii, spacing, elevation } from '@ui/theme';

type IonName = ComponentProps<typeof Ionicons>['name'];

type BlazeProps = {
  label: string;
  icon: IonName;
  onPress: () => void;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function HomeBlazeButton({ label, icon, onPress, fullWidth, style }: BlazeProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.blazeOuter,
        fullWidth && styles.fullWidth,
        style,
        { opacity: pressed ? 0.92 : 1, transform: [{ scale: pressed ? 0.985 : 1 }] },
      ]}
    >
      <LinearGradient
        colors={[colors.orange, '#FF8A4A', colors.yellow]}
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

type OutlineProps = {
  label: string;
  icon: IonName;
  onPress: () => void;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function HomeOutlineButton({ label, icon, onPress, fullWidth, style }: OutlineProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.outlineOuter,
        fullWidth && styles.fullWidth,
        style,
        { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.985 : 1 }] },
      ]}
    >
      <LinearGradient
        colors={[colors.purple, colors.orange, colors.yellow]}
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

type PulseProps = {
  label: string;
  icon: IonName;
  onPress: () => void;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function HomePulseButton({ label, icon, onPress, fullWidth, style }: PulseProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.pulseOuter,
        fullWidth && styles.fullWidth,
        style,
        { opacity: pressed ? 0.92 : 1, transform: [{ scale: pressed ? 0.985 : 1 }] },
      ]}
    >
      <LinearGradient
        colors={[colors.green, '#4FD68E', colors.purple]}
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

type EmberProps = {
  label: string;
  icon: IonName;
  onPress: () => void;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function HomeEmberButton({ label, icon, onPress, fullWidth, style }: EmberProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.emberOuter,
        fullWidth && styles.fullWidth,
        style,
        { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.985 : 1 }] },
      ]}
    >
      <LinearGradient
        colors={['rgba(229,62,62,0.35)', 'rgba(255,107,53,0.2)', colors.surface]}
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
    borderColor: 'rgba(255,255,255,0.22)',
  },
  blazeLabel: { letterSpacing: 0.8 },
  outlineOuter: {
    borderRadius: radii.xl,
    padding: 2,
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
    borderColor: 'rgba(255,255,255,0.18)',
  },
  pulseLabel: { letterSpacing: 0.6 },
  emberOuter: {
    borderRadius: radii.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(229,62,62,0.45)',
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
