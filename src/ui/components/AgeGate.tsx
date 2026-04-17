import { useEffect, useState } from 'react';
import { Modal, View, StyleSheet, BackHandler } from 'react-native';
import { ageGateStore } from '@game/persistence';
import { colors, radii, spacing } from '@ui/theme';
import Text from '@ui/components/Text';
import Button from '@ui/components/Button';
import { strings } from '@i18n/en';
import { MODAL_ALL_ORIENTATIONS } from '@ui/components/modalDefaults';

export default function AgeGate() {
  const [visible, setVisible] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    (async () => {
      const state = await ageGateStore.read();
      setVisible(!state.confirmed);
      setChecked(true);
    })();
  }, []);

  if (!checked) return null;

  async function confirm() {
    await ageGateStore.write({ confirmed: true });
    setVisible(false);
  }

  function decline() {
    BackHandler.exitApp();
  }

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      supportedOrientations={MODAL_ALL_ORIENTATIONS}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text variant="displayLG">{strings.legal.ageGateTitle}</Text>
          <Text variant="bodyLG" color={colors.textMuted} style={styles.body}>
            {strings.legal.ageGateBody}
          </Text>
          <View style={styles.buttons}>
            <Button label={strings.legal.decline} variant="ghost" onPress={decline} />
            <Button label={strings.legal.confirmAge} variant="primary" onPress={confirm} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.xl,
    maxWidth: 480,
    width: '100%',
    borderWidth: 1,
    borderColor: colors.border,
  },
  body: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
  },
});
