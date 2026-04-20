import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BackHandler,
  Platform,
  StyleSheet,
  TextInput,
  View,
  type NativeSyntheticEvent,
  type TextInputKeyPressEventData,
} from 'react-native';
import { ageGateStore } from '@game/persistence';
import { parseDobParts } from '@game/ageGate';
import Text from '@ui/components/Text';
import Button from '@ui/components/Button';
import CenterSheet from '@ui/components/sheets/CenterSheet';
import { colors, layout, radii, spacing } from '@ui/theme';
import { strings } from '@i18n/en';

type Stage = 'loading' | 'entry' | 'underage' | 'cleared';

export default function AgeGate() {
  const [stage, setStage] = useState<Stage>('loading');
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [error, setError] = useState<string | null>(null);

  const dayRef = useRef<TextInput>(null);
  const monthRef = useRef<TextInput>(null);
  const yearRef = useRef<TextInput>(null);

  useEffect(() => {
    (async () => {
      const state = await ageGateStore.read();
      setStage(state.confirmed ? 'cleared' : 'entry');
    })();
  }, []);

  const canSubmit = useMemo(
    () => day.length > 0 && month.length > 0 && year.length === 4,
    [day, month, year],
  );

  async function confirm() {
    const parsed = parseDobParts({ day, month, year });
    if (!parsed.valid) {
      if (parsed.reason === 'underage') {
        setStage('underage');
        return;
      }
      setError(strings.legal.ageGateInvalid);
      return;
    }
    await ageGateStore.write({ confirmed: true, dobIso: parsed.dobIso });
    setStage('cleared');
  }

  function decline() {
    if (Platform.OS === 'android') {
      BackHandler.exitApp();
      return;
    }
    setStage('underage');
  }

  function onMonthBackspace(e: NativeSyntheticEvent<TextInputKeyPressEventData>) {
    if (e.nativeEvent.key === 'Backspace' && month.length === 0) dayRef.current?.focus();
  }

  function onYearBackspace(e: NativeSyntheticEvent<TextInputKeyPressEventData>) {
    if (e.nativeEvent.key === 'Backspace' && year.length === 0) monthRef.current?.focus();
  }

  if (stage === 'loading' || stage === 'cleared') return null;

  return (
    <CenterSheet visible dismissOnBackdropPress={false} backdropOpacity="intense" onClose={decline}>
      <View style={styles.body}>
        {stage === 'entry' ? (
          <>
            <Text variant="displayLG">{strings.legal.ageGateTitle}</Text>
            <Text variant="bodyLG" color={colors.textMuted} style={styles.copy}>
              {strings.legal.ageGateBody}
            </Text>
            <Text variant="labelSM" color={colors.textMuted} style={styles.fieldLabel}>
              {strings.legal.ageGateDobLabel}
            </Text>
            <View style={styles.row}>
              <TextInput
                ref={dayRef}
                accessibilityLabel={strings.legal.ageGateDay}
                style={[styles.input, styles.dayInput]}
                placeholder={strings.legal.ageGateDay}
                placeholderTextColor={colors.textSubtle}
                keyboardType="number-pad"
                maxLength={2}
                value={day}
                onChangeText={(v) => {
                  const next = v.replace(/[^0-9]/g, '');
                  setDay(next);
                  setError(null);
                  if (next.length === 2) monthRef.current?.focus();
                }}
                returnKeyType="next"
              />
              <TextInput
                ref={monthRef}
                accessibilityLabel={strings.legal.ageGateMonth}
                style={[styles.input, styles.monthInput]}
                placeholder={strings.legal.ageGateMonth}
                placeholderTextColor={colors.textSubtle}
                keyboardType="number-pad"
                maxLength={2}
                value={month}
                onChangeText={(v) => {
                  const next = v.replace(/[^0-9]/g, '');
                  setMonth(next);
                  setError(null);
                  if (next.length === 2) yearRef.current?.focus();
                }}
                onKeyPress={onMonthBackspace}
                returnKeyType="next"
              />
              <TextInput
                ref={yearRef}
                accessibilityLabel={strings.legal.ageGateYear}
                style={[styles.input, styles.yearInput]}
                placeholder={strings.legal.ageGateYear}
                placeholderTextColor={colors.textSubtle}
                keyboardType="number-pad"
                maxLength={4}
                value={year}
                onChangeText={(v) => {
                  const next = v.replace(/[^0-9]/g, '');
                  setYear(next);
                  setError(null);
                }}
                onKeyPress={onYearBackspace}
                returnKeyType="done"
                onSubmitEditing={confirm}
              />
            </View>
            {error ? (
              <Text variant="bodySM" color={colors.red} style={styles.error}>
                {error}
              </Text>
            ) : null}
            <View style={styles.buttons}>
              <Button label={strings.legal.decline} variant="ghost" onPress={decline} />
              <Button
                label={strings.legal.confirmAge}
                variant="primary"
                onPress={confirm}
                disabled={!canSubmit}
              />
            </View>
          </>
        ) : (
          <>
            <Text variant="displayLG" color={colors.red}>
              {strings.legal.ageGateTitle}
            </Text>
            <Text variant="bodyLG" color={colors.textMuted} style={styles.copy}>
              {strings.legal.ageGateUnderage}
            </Text>
          </>
        )}
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
    marginBottom: spacing.lg,
  },
  fieldLabel: {
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  input: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: layout.minTapTarget,
    color: colors.text,
    fontSize: 18,
    textAlign: 'center',
  },
  dayInput: { flex: 1 },
  monthInput: { flex: 1 },
  yearInput: { flex: 1.5 },
  error: {
    marginBottom: spacing.md,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
    marginTop: spacing.md,
  },
});
