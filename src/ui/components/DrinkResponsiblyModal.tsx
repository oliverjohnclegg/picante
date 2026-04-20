import { useEffect, useState } from 'react';
import { Modal, View, StyleSheet, Pressable } from 'react-native';
import { create } from 'zustand';
import { useRouter } from 'expo-router';
import { colors, radii, spacing } from '@ui/theme';
import Text from '@ui/components/Text';
import Button from '@ui/components/Button';
import { strings } from '@i18n/en';
import { MODAL_ALL_ORIENTATIONS } from '@ui/components/modalDefaults';

type SessionAck = {
  acknowledged: boolean;
  acknowledge: () => void;
};

const useSessionAck = create<SessionAck>((set) => ({
  acknowledged: false,
  acknowledge: () => set({ acknowledged: true }),
}));

export function markDrinkResponsiblyPending() {
  useSessionAck.setState({ acknowledged: false });
}

export default function DrinkResponsiblyModal() {
  const router = useRouter();
  const acknowledged = useSessionAck((s) => s.acknowledged);
  const acknowledge = useSessionAck((s) => s.acknowledge);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(!acknowledged);
  }, [acknowledged]);

  if (!visible) return null;

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      supportedOrientations={MODAL_ALL_ORIENTATIONS}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text variant="displayLG" color={colors.orange}>
            {strings.legal.disclaimerTitle}
          </Text>
          <Text variant="bodyLG" color={colors.textMuted} style={styles.body}>
            {strings.legal.disclaimerBody}
          </Text>
          <Button
            label={strings.legal.continue}
            variant="primary"
            fullWidth
            onPress={() => {
              acknowledge();
              setVisible(false);
            }}
          />
          <Pressable
            onPress={() => {
              acknowledge();
              setVisible(false);
              router.push('/tos');
            }}
            style={styles.tosLink}
            accessibilityRole="link"
          >
            <Text variant="labelSM" color={colors.textMuted}>
              {strings.legal.readTos}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
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
  tosLink: {
    marginTop: spacing.md,
    alignItems: 'center',
    padding: spacing.sm,
  },
});
