import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { colors } from '@ui/theme';
import { MODAL_ALL_ORIENTATIONS } from '@ui/components/modalDefaults';
import { strings } from '@i18n/en';

type Props = {
  visible: boolean;
  onClose?: () => void;
  onShow?: () => void;
  dismissOnBackdropPress?: boolean;
  animationType?: 'slide' | 'fade' | 'none';
  statusBarTranslucent?: boolean;
  backdropOpacity?: 'soft' | 'strong' | 'intense';
  children: React.ReactNode;
};

const BACKDROP_COLOR = {
  soft: colors.overlay,
  strong: colors.overlayStrong,
  intense: colors.overlayIntense,
} as const;

export default function ModalChrome({
  visible,
  onClose,
  onShow,
  dismissOnBackdropPress = true,
  animationType = 'fade',
  statusBarTranslucent = true,
  backdropOpacity = 'soft',
  children,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType={animationType}
      onRequestClose={onClose}
      onShow={onShow}
      presentationStyle="overFullScreen"
      statusBarTranslucent={statusBarTranslucent}
      supportedOrientations={MODAL_ALL_ORIENTATIONS}
    >
      <KeyboardProvider statusBarTranslucent navigationBarTranslucent>
        <View style={styles.root}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={strings.common.dismiss}
            style={[styles.backdrop, { backgroundColor: BACKDROP_COLOR[backdropOpacity] }]}
            onPress={dismissOnBackdropPress ? onClose : undefined}
          />
          <View style={styles.content} pointerEvents="box-none">
            {children}
          </View>
        </View>
      </KeyboardProvider>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
  },
});
