import { useState } from 'react';
import { Modal, View, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing } from '@ui/theme';
import Text from '@ui/components/Text';
import Button from '@ui/components/Button';
import SectionCard from '@ui/components/SectionCard';
import { strings } from '@i18n/en';
import { iap, DIABLO_PRICE } from '@platform/iap';
import { useUnlocks } from '@platform/unlocksStore';
import { MODAL_ALL_ORIENTATIONS } from '@ui/components/modalDefaults';

type Props = {
  visible: boolean;
  onClose: () => void;
  onUnlocked?: () => void;
};

type Feedback = { kind: 'success' | 'info' | 'error'; message: string } | null;

export default function PurchaseModal({ visible, onClose, onUnlocked }: Props) {
  const setDiablo = useUnlocks((s) => s.setDiablo);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  async function handleBuy() {
    setBusy(true);
    setFeedback(null);
    try {
      const result = await iap.purchaseDiablo();
      if (result.success) {
        await setDiablo(true);
        onUnlocked?.();
        onClose();
      } else {
        setFeedback({
          kind: 'error',
          message: result.error ?? strings.settings.purchaseFailed,
        });
      }
    } catch {
      setFeedback({ kind: 'error', message: strings.settings.purchaseFailed });
    } finally {
      setBusy(false);
    }
  }

  async function handleRestore() {
    setBusy(true);
    setFeedback(null);
    try {
      const unlocks = await iap.restorePurchases();
      await setDiablo(unlocks.diablo);
      if (unlocks.diablo) {
        onUnlocked?.();
        onClose();
      } else {
        setFeedback({ kind: 'info', message: strings.settings.restoreNothing });
      }
    } catch {
      setFeedback({ kind: 'error', message: strings.settings.restoreFailed });
    } finally {
      setBusy(false);
    }
  }

  const buyLabel = strings.purchase.buy.replace('{price}', DIABLO_PRICE);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      supportedOrientations={MODAL_ALL_ORIENTATIONS}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Pressable onPress={onClose} style={styles.close} hitSlop={12}>
            <Ionicons name="close" size={22} color={colors.textMuted} />
          </Pressable>
          <Text variant="displayLG" color={colors.purple}>
            {strings.purchase.title}
          </Text>
          <Text variant="bodyLG" color={colors.textMuted} style={styles.subtitle}>
            {strings.purchase.subtitle}
          </Text>
          <View style={styles.bullets}>
            <Bullet text={strings.purchase.bulletContent} />
            <Bullet text={strings.purchase.bulletMechanics} />
            <Bullet text={strings.purchase.bulletOneTime} />
          </View>
          {feedback ? (
            <SectionCard
              accent={
                feedback.kind === 'success'
                  ? colors.green
                  : feedback.kind === 'error'
                    ? colors.red
                    : colors.yellow
              }
              style={styles.feedback}
            >
              <Text
                variant="bodyMD"
                color={
                  feedback.kind === 'success'
                    ? colors.green
                    : feedback.kind === 'error'
                      ? colors.red
                      : colors.yellow
                }
              >
                {feedback.message}
              </Text>
            </SectionCard>
          ) : null}
          <View style={styles.actions}>
            {busy ? (
              <View style={styles.spinner}>
                <ActivityIndicator color={colors.text} />
                <Text variant="bodySM" color={colors.textMuted} style={{ marginTop: spacing.sm }}>
                  {strings.purchase.processing}
                </Text>
              </View>
            ) : (
              <>
                <Button label={buyLabel} variant="purple" fullWidth onPress={handleBuy} />
                <Button
                  label={strings.purchase.restore}
                  variant="ghost"
                  fullWidth
                  onPress={handleRestore}
                />
                <Button
                  label={strings.purchase.cancel}
                  variant="ghost"
                  fullWidth
                  onPress={onClose}
                />
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

function Bullet({ text }: { text: string }) {
  return (
    <View style={styles.bullet}>
      <Ionicons name="flame" size={16} color={colors.purple} style={{ marginTop: 3 }} />
      <Text variant="bodyMD" color={colors.text} style={styles.bulletText}>
        {text}
      </Text>
    </View>
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
  close: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    padding: spacing.xs,
    zIndex: 1,
  },
  subtitle: {
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  bullets: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  bullet: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  bulletText: {
    flex: 1,
  },
  feedback: {
    marginBottom: spacing.md,
  },
  actions: {
    gap: spacing.sm,
  },
  spinner: {
    alignItems: 'center',
    padding: spacing.xl,
  },
});
