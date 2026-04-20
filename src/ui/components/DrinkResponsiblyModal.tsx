import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { create } from 'zustand';
import { useRouter } from 'expo-router';
import Text from '@ui/components/Text';
import Button from '@ui/components/Button';
import CenterSheet from '@ui/components/sheets/CenterSheet';
import { colors, spacing } from '@ui/theme';
import { strings } from '@i18n/en';

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

  function confirm() {
    acknowledge();
    setVisible(false);
  }

  function openTos() {
    acknowledge();
    setVisible(false);
    router.push('/tos');
  }

  if (!visible) return null;

  return (
    <CenterSheet
      visible={visible}
      onClose={confirm}
      dismissOnBackdropPress={false}
      backdropOpacity="intense"
    >
      <View style={styles.body}>
        <Text variant="displayLG" color={colors.orange}>
          {strings.legal.disclaimerTitle}
        </Text>
        <Text variant="bodyLG" color={colors.textMuted} style={styles.copy}>
          {strings.legal.disclaimerBody}
        </Text>
        <Button label={strings.legal.continue} variant="primary" fullWidth onPress={confirm} />
        <Pressable
          onPress={openTos}
          accessibilityRole="link"
          accessibilityLabel={strings.legal.readTos}
          hitSlop={spacing.sm}
          style={styles.tosLink}
        >
          <Text variant="labelSM" color={colors.textMuted}>
            {strings.legal.readTos}
          </Text>
        </Pressable>
      </View>
    </CenterSheet>
  );
}

const styles = StyleSheet.create({
  body: {
    padding: spacing.xl,
  },
  copy: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  tosLink: {
    marginTop: spacing.md,
    alignItems: 'center',
    padding: spacing.sm,
  },
});
