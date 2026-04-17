import { View, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '@ui/theme';

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
};

export default function Screen({ children, style, padded = true }: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.root, padded && styles.padded, style]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  root: {
    flex: 1,
  },
  padded: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
});
