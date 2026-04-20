import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Text from '@ui/components/Text';
import Button from '@ui/components/Button';
import SectionCard from '@ui/components/SectionCard';
import CenterSheet from '@ui/components/sheets/CenterSheet';
import { colors, layout, radii, spacing } from '@ui/theme';
import { strings } from '@i18n/en';
import { iap, DIABLO_PRICE } from '@platform/iap';
import { useUnlocks } from '@platform/unlocksStore';

type Props = {
  visible: boolean;
  onClose: () => void;
  onUnlocked?: () => void;
};

type Feedback = { kind: 'success' | 'info' | 'error'; message: string } | null;

function feedbackColor(kind: NonNullable<Feedback>['kind']) {
  if (kind === 'success') return colors.green;
  if (kind === 'error') return colors.red;
  return colors.yellow;
}

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
        return;
      }
      setFeedback({
        kind: 'error',
        message: result.error ?? strings.settings.purchaseFailed,
      });
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
        return;
      }
      setFeedback({ kind: 'info', message: strings.settings.restoreNothing });
    } catch {
      setFeedback({ kind: 'error', message: strings.settings.restoreFailed });
    } finally {
      setBusy(false);
    }
  }

  const buyLabel = strings.purchase.buy.replace('{price}', DIABLO_PRICE);

  return (
    <CenterSheet visible={visible} onClose={onClose} dismissOnBackdropPress={!busy}>
      <View style={styles.body}>
        <Pressable
          onPress={onClose}
          hitSlop={spacing.md}
          disabled={busy}
          accessibilityRole="button"
          accessibilityLabel={strings.common.close}
          style={({ pressed }) => [styles.close, pressed && styles.closePressed]}
        >
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
          <SectionCard accent={feedbackColor(feedback.kind)} style={styles.feedback}>
            <Text variant="bodyMD" color={feedbackColor(feedback.kind)}>
              {feedback.message}
            </Text>
          </SectionCard>
        ) : null}
        <View style={styles.actions}>
          {busy ? (
            <View style={styles.spinner}>
              <ActivityIndicator color={colors.text} />
              <Text variant="bodySM" color={colors.textMuted} style={styles.spinnerLabel}>
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
              <Button label={strings.purchase.cancel} variant="ghost" fullWidth onPress={onClose} />
            </>
          )}
        </View>
      </View>
    </CenterSheet>
  );
}

function Bullet({ text }: { text: string }) {
  return (
    <View style={styles.bullet}>
      <Ionicons name="flame" size={16} color={colors.purple} style={styles.bulletIcon} />
      <Text variant="bodyMD" color={colors.text} style={styles.bulletText}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    padding: spacing.xl,
    gap: spacing.sm,
  },
  close: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: layout.minTapTarget,
    height: layout.minTapTarget,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceElevated,
    zIndex: 1,
  },
  closePressed: {
    opacity: 0.7,
  },
  subtitle: {
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  bullets: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  bullet: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  bulletIcon: { marginTop: 3 },
  bulletText: { flex: 1 },
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
  spinnerLabel: { marginTop: spacing.sm },
});
