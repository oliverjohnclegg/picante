import { View, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';
import { colors, radii, spacing, elevation } from '@ui/theme';

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  accent?: string;
};

export default function SectionCard({ children, style, accent }: Props) {
  return (
    <View style={[styles.root, accent ? { borderColor: accent } : null, style]}>{children}</View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    ...elevation.soft,
  },
});
