import { View, StyleSheet } from 'react-native';
import Text from '@ui/components/Text';
import { colors, radii, spacing } from '@ui/theme';

type Props = {
  step: 1 | 2 | 3;
  title: string;
};

export default function StepHeader({ step, title }: Props) {
  return (
    <View style={styles.root}>
      <View style={styles.pills}>
        {[1, 2, 3].map((s) => (
          <View
            key={s}
            style={[styles.pill, s === step && styles.pillActive, s < step && styles.pillDone]}
          />
        ))}
      </View>
      <Text variant="displayLG" style={{ marginTop: spacing.md }}>
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingBottom: spacing.lg,
  },
  pills: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  pill: {
    height: 4,
    flex: 1,
    borderRadius: radii.pill,
    backgroundColor: colors.border,
  },
  pillActive: {
    backgroundColor: colors.orange,
  },
  pillDone: {
    backgroundColor: colors.green,
  },
});
