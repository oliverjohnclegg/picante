import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { spacing } from '@ui/theme';

type Props = {
  children: React.ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  bottomOffset?: number;
};

export default function SheetScroll({
  children,
  contentContainerStyle,
  bottomOffset = spacing.xl,
}: Props) {
  return (
    <KeyboardAwareScrollView
      keyboardShouldPersistTaps="always"
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
      bottomOffset={bottomOffset}
      style={styles.scroll}
      contentContainerStyle={[styles.content, contentContainerStyle]}
    >
      {children}
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    flexGrow: 1,
    flexShrink: 1,
    minHeight: 0,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
    gap: spacing.xs,
  },
});
