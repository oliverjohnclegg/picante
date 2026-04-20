import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Text from '@ui/components/Text';
import { colors, layout, radii, spacing } from '@ui/theme';

type Props = {
  title: string;
  onClose?: () => void;
  accent?: string;
  closeAccessibilityLabel?: string;
};

export default function SheetHeader({
  title,
  onClose,
  accent,
  closeAccessibilityLabel = 'Close',
}: Props) {
  return (
    <View style={styles.root}>
      <Text
        variant="displayMD"
        color={accent ?? colors.text}
        numberOfLines={1}
        style={styles.title}
      >
        {title}
      </Text>
      {onClose ? (
        <Pressable
          onPress={onClose}
          hitSlop={spacing.md}
          accessibilityRole="button"
          accessibilityLabel={closeAccessibilityLabel}
          style={({ pressed }) => [styles.close, pressed && styles.closePressed]}
        >
          <Ionicons name="close" size={22} color={colors.textMuted} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.md,
    flexShrink: 0,
  },
  title: {
    flex: 1,
    minWidth: 0,
  },
  close: {
    width: layout.minTapTarget,
    height: layout.minTapTarget,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceElevated,
  },
  closePressed: {
    opacity: 0.7,
  },
});
