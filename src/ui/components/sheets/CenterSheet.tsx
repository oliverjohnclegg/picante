import { StyleSheet, useWindowDimensions } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  KeyboardAvoidingView,
  useReanimatedKeyboardAnimation,
} from 'react-native-keyboard-controller';
import ModalChrome from '@ui/components/sheets/ModalChrome';
import { colors, elevation, layout, radii, spacing } from '@ui/theme';

type Props = {
  visible: boolean;
  onClose?: () => void;
  dismissOnBackdropPress?: boolean;
  backdropOpacity?: 'soft' | 'strong' | 'intense';
  maxWidth?: number;
  children: React.ReactNode;
  testID?: string;
};

export default function CenterSheet({
  visible,
  onClose,
  dismissOnBackdropPress = true,
  backdropOpacity = 'strong',
  maxWidth = layout.centerSheetMaxWidth,
  children,
  testID,
}: Props) {
  const insets = useSafeAreaInsets();
  const { height: winH } = useWindowDimensions();
  const { height: animatedKeyboardHeight } = useReanimatedKeyboardAnimation();

  const sheetAnimatedStyle = useAnimatedStyle(() => {
    const keyboardPx = Math.abs(animatedKeyboardHeight.value);
    const vertChrome = insets.top + insets.bottom + spacing.xl * 2;
    const budget = Math.max(220, winH - vertChrome - keyboardPx);
    return { maxHeight: budget };
  });

  return (
    <ModalChrome
      visible={visible}
      onClose={onClose}
      dismissOnBackdropPress={dismissOnBackdropPress}
      animationType="fade"
      backdropOpacity={backdropOpacity}
    >
      <KeyboardAvoidingView
        behavior="padding"
        style={[styles.wrap, { paddingHorizontal: spacing.xl, paddingVertical: spacing.xl }]}
        keyboardVerticalOffset={0}
      >
        <Animated.View testID={testID} style={[styles.sheet, { maxWidth }, sheetAnimatedStyle]}>
          {children}
        </Animated.View>
      </KeyboardAvoidingView>
    </ModalChrome>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    width: '100%',
    overflow: 'hidden',
    ...elevation.sheet,
  },
});
