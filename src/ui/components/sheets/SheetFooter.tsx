import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, spacing } from '@ui/theme';

type Props = {
  children: React.ReactNode;
  divider?: boolean;
  style?: StyleProp<ViewStyle>;
};

export default function SheetFooter({ children, divider = true, style }: Props) {
  return <View style={[styles.root, divider && styles.divider, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  root: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
    gap: spacing.md,
    flexShrink: 0,
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
