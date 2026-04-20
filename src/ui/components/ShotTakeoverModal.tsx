import { useEffect } from 'react';
import { Modal, View, StyleSheet } from 'react-native';
import type { Player } from '@game/types';
import { colors, spacing } from '@ui/theme';
import Text from '@ui/components/Text';
import Button from '@ui/components/Button';
import { strings } from '@i18n/en';
import { MODAL_ALL_ORIENTATIONS } from '@ui/components/modalDefaults';
import { sfx } from '@platform/sfx';

type Props = {
  player: Player;
  shots: number;
  onDismiss: () => void;
};

export default function ShotTakeoverModal({ player, shots, onDismiss }: Props) {
  useEffect(() => {
    sfx.play('salud_chime').catch(() => undefined);
  }, []);

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      supportedOrientations={MODAL_ALL_ORIENTATIONS}
    >
      <View style={styles.backdrop}>
        <View style={styles.content}>
          <Text variant="labelSM" color={colors.yellow}>
            {strings.shotTakeover.salud.toUpperCase()}
          </Text>
          <Text variant="displayXL" style={styles.name}>
            {player.name}
          </Text>
          <Text variant="displayXL" color={colors.orange} style={styles.count}>
            {strings.shotTakeover.takeNShots(shots)}
          </Text>
          <Button
            label={strings.shotTakeover.continue}
            variant="primary"
            size="lg"
            onPress={onDismiss}
            fullWidth
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  content: {
    alignItems: 'center',
    gap: spacing.lg,
    maxWidth: 560,
    width: '100%',
  },
  name: { textAlign: 'center' },
  count: { textAlign: 'center', marginTop: spacing.md, marginBottom: spacing.lg },
});
