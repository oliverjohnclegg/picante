import { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Switch,
  View,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Screen from '@ui/components/Screen';
import Text from '@ui/components/Text';
import Button from '@ui/components/Button';
import SectionCard from '@ui/components/SectionCard';
import { colors, spacing, radii } from '@ui/theme';
import { strings } from '@i18n/en';
import { useSettings } from '@platform/settingsStore';
import { useUnlocks } from '@platform/unlocksStore';
import { iap, DIABLO_PRICE } from '@platform/iap';
import { lightTap } from '@platform/haptics';

type Feedback = { kind: 'success' | 'info' | 'error'; message: string } | null;

export default function SettingsScreen() {
  const router = useRouter();
  const soundEnabled = useSettings((s) => s.soundEnabled);
  const hapticsEnabled = useSettings((s) => s.hapticsEnabled);
  const hydrateSettings = useSettings((s) => s.hydrate);
  const setSoundEnabled = useSettings((s) => s.setSoundEnabled);
  const setHapticsEnabled = useSettings((s) => s.setHapticsEnabled);
  const diablo = useUnlocks((s) => s.diablo);
  const hydrateUnlocks = useUnlocks((s) => s.hydrate);
  const setDiablo = useUnlocks((s) => s.setDiablo);

  const [restoring, setRestoring] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  useEffect(() => {
    hydrateSettings();
    hydrateUnlocks();
  }, [hydrateSettings, hydrateUnlocks]);

  async function handleRestore() {
    setFeedback(null);
    setRestoring(true);
    try {
      const unlocks = await iap.restorePurchases();
      await setDiablo(unlocks.diablo);
      setFeedback({
        kind: unlocks.diablo ? 'success' : 'info',
        message: unlocks.diablo ? strings.settings.restoreSuccess : strings.settings.restoreNothing,
      });
    } catch {
      setFeedback({ kind: 'error', message: strings.settings.restoreFailed });
    } finally {
      setRestoring(false);
    }
  }

  async function handlePurchase() {
    setFeedback(null);
    setPurchasing(true);
    try {
      const result = await iap.purchaseDiablo();
      if (result.success) {
        await setDiablo(true);
        setFeedback({ kind: 'success', message: strings.settings.purchaseSuccess });
      } else {
        setFeedback({
          kind: 'error',
          message: result.error ?? strings.settings.purchaseFailed,
        });
      }
    } catch {
      setFeedback({ kind: 'error', message: strings.settings.purchaseFailed });
    } finally {
      setPurchasing(false);
    }
  }

  const version = Constants.expoConfig?.version ?? '0.0.0';
  const build =
    (Constants.expoConfig?.ios?.buildNumber as string | undefined) ??
    String(Constants.expoConfig?.android?.versionCode ?? '—');

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} accessibilityRole="button">
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </Pressable>
        <Text variant="displayLG">{strings.settings.title}</Text>
        <View style={{ width: 28 }} />
      </View>
      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <SectionLabel text={strings.settings.audioSection} />
        <SectionCard style={styles.section}>
          <ToggleRow
            label={strings.settings.soundLabel}
            description={strings.settings.soundDesc}
            value={soundEnabled}
            onChange={async (v) => {
              lightTap();
              await setSoundEnabled(v);
            }}
          />
          <Divider />
          <ToggleRow
            label={strings.settings.hapticsLabel}
            description={strings.settings.hapticsDesc}
            value={hapticsEnabled}
            onChange={async (v) => {
              lightTap();
              await setHapticsEnabled(v);
            }}
          />
        </SectionCard>

        <SectionLabel text={strings.settings.purchasesSection} />
        <SectionCard style={styles.section}>
          <View style={styles.purchaseRow}>
            <View style={{ flex: 1 }}>
              <Text variant="labelLG">{strings.setup.modeDiablo}</Text>
              <Text variant="bodySM" color={colors.textMuted}>
                {diablo ? strings.settings.purchaseSuccess : `${DIABLO_PRICE} · one-time`}
              </Text>
            </View>
            {diablo ? (
              <Ionicons name="checkmark-circle" size={24} color={colors.green} />
            ) : (
              <Button
                label={purchasing ? strings.settings.purchaseInFlight : strings.settings.purchaseDiablo}
                variant="purple"
                size="sm"
                disabled={purchasing}
                onPress={handlePurchase}
              />
            )}
          </View>
          <Divider />
          <View style={styles.purchaseRow}>
            <View style={{ flex: 1 }}>
              <Text variant="labelLG">{strings.settings.restorePurchases}</Text>
              <Text variant="bodySM" color={colors.textMuted}>
                {strings.purchase.restore}
              </Text>
            </View>
            {restoring ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <Button
                label={strings.settings.restorePurchases}
                variant="ghost"
                size="sm"
                onPress={handleRestore}
              />
            )}
          </View>
        </SectionCard>

        {feedback ? (
          <SectionCard
            style={styles.section}
            accent={
              feedback.kind === 'success'
                ? colors.green
                : feedback.kind === 'error'
                  ? colors.red
                  : colors.yellow
            }
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

        <SectionLabel text={strings.settings.legalSection} />
        <SectionCard style={styles.section}>
          <LinkRow label={strings.settings.tos} onPress={() => router.push('/tos')} />
          <Divider />
          <LinkRow label={strings.settings.privacy} onPress={() => router.push('/privacy')} />
        </SectionCard>

        <SectionLabel text={strings.settings.appSection} />
        <SectionCard style={styles.section}>
          <View style={styles.versionRow}>
            <Text variant="labelLG">{strings.settings.version}</Text>
            <Text variant="bodyMD" color={colors.textMuted}>
              {version} ({build})
            </Text>
          </View>
        </SectionCard>
      </ScrollView>
    </Screen>
  );
}

function SectionLabel({ text }: { text: string }) {
  return (
    <Text variant="labelSM" color={colors.textMuted} style={styles.sectionLabel}>
      {text}
    </Text>
  );
}

function ToggleRow({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.toggleRow}>
      <View style={{ flex: 1, paddingRight: spacing.md }}>
        <Text variant="labelLG">{label}</Text>
        <Text variant="bodySM" color={colors.textMuted}>
          {description}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.border, true: colors.orange }}
        thumbColor={colors.text}
        ios_backgroundColor={colors.border}
      />
    </View>
  );
}

function LinkRow({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.linkRow} accessibilityRole="button">
      <Text variant="labelLG">{label}</Text>
      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
    </Pressable>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.md,
  },
  body: {
    paddingBottom: spacing.xxl,
    gap: spacing.xs,
  },
  sectionLabel: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  section: {
    gap: 0,
    padding: 0,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  purchaseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  versionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginHorizontal: spacing.lg,
  },
});
