import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Text from '@ui/components/Text';
import { colors, spacing } from '@ui/theme';

type Props = {
  label: string;
  hint?: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export default function FormField({ label, hint, children, style }: Props) {
  return (
    <View style={[styles.root, style]}>
      <View style={styles.header}>
        <Text variant="labelSM" color={colors.textMuted}>
          {label.toUpperCase()}
        </Text>
        {hint ? (
          <Text variant="labelSM" color={colors.textSubtle}>
            {hint}
          </Text>
        ) : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
});
