import { StyleSheet, View, useWindowDimensions } from 'react-native';
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
  onClose: () => void;
  onShow?: () => void;
  parentIsLandscape?: boolean;
  dismissOnBackdropPress?: boolean;
  children: React.ReactNode;
  testID?: string;
};

export default function BottomSheet({
  visible,
  onClose,
  onShow,
  parentIsLandscape,
  dismissOnBackdropPress = true,
  children,
  testID,
}: Props) {
  const insets = useSafeAreaInsets();
  const { width: winW, height: winH } = useWindowDimensions();
  const viewportIsLandscape = winW > winH;
  const isLandscape = parentIsLandscape ?? viewportIsLandscape;
  const { height: animatedKeyboardHeight } = useReanimatedKeyboardAnimation();

  const sheetAnimatedStyle = useAnimatedStyle(() => {
    const keyboardPx = Math.abs(animatedKeyboardHeight.value);
    const vertChrome = insets.top + (isLandscape ? spacing.xl * 2 : spacing.md);
    const maxRatio = isLandscape
      ? layout.sheetLandscapeMaxHeightRatio
      : layout.sheetPortraitMaxHeightRatio;
    const ratioBudget = winH * maxRatio;
    const keyboardBudget = winH - vertChrome - keyboardPx;
    const budget = Math.max(220, Math.min(ratioBudget, keyboardBudget));
    return { maxHeight: budget };
  });

  const wrapStyle = isLandscape ? styles.wrapLandscape : styles.wrapPortrait;

  return (
    <ModalChrome
      visible={visible}
      onClose={onClose}
      onShow={onShow}
      dismissOnBackdropPress={dismissOnBackdropPress}
      animationType={isLandscape ? 'fade' : 'slide'}
      backdropOpacity="strong"
    >
      <KeyboardAvoidingView
        behavior="padding"
        style={[styles.keyboardWrap, wrapStyle]}
        keyboardVerticalOffset={0}
      >
        <Animated.View
          testID={testID}
          style={[
            styles.sheet,
            isLandscape ? styles.sheetLandscape : styles.sheetPortrait,
            isLandscape && { maxWidth: layout.sheetLandscapeMaxWidth },
            { paddingBottom: insets.bottom + spacing.sm },
            sheetAnimatedStyle,
          ]}
        >
          {!isLandscape ? (
            <View style={styles.handleWrap} pointerEvents="none">
              <View style={styles.handle} />
            </View>
          ) : null}
          {children}
        </Animated.View>
      </KeyboardAvoidingView>
    </ModalChrome>
  );
}

const styles = StyleSheet.create({
  keyboardWrap: {
    flex: 1,
  },
  wrapPortrait: {
    justifyContent: 'flex-end',
  },
  wrapLandscape: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    flexDirection: 'column',
    minHeight: 0,
  },
  sheetPortrait: {
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    width: '100%',
  },
  sheetLandscape: {
    borderRadius: radii.xl,
    width: '100%',
    ...elevation.sheet,
  },
  handleWrap: {
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: radii.pill,
    backgroundColor: colors.borderStrong,
  },
});
