import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import type { Player } from '@game/types';
import Text from '@ui/components/Text';
import Button from '@ui/components/Button';
import ModalChrome from '@ui/components/sheets/ModalChrome';
import { colors, spacing } from '@ui/theme';
import { strings } from '@i18n/en';
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
    <ModalChrome
      visible
      onClose={onDismiss}
      dismissOnBackdropPress={false}
      backdropOpacity="intense"
    >
      <View style={styles.wrap}>
        <View style={styles.content}>
          <Text variant="labelSM" color={colors.yellow}>
            {strings.shotTakeover.salud.toUpperCase()}
          </Text>
          <Text variant="displayXL" style={styles.name} numberOfLines={2}>
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
    </ModalChrome>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
  },
  content: {
    alignItems: 'center',
    gap: spacing.lg,
    maxWidth: 560,
    width: '100%',
  },
  name: { textAlign: 'center' },
  count: {
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
});
