import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  BackHandler,
  TextInput,
  Platform,
  type NativeSyntheticEvent,
  type TextInputKeyPressEventData,
} from 'react-native';
import { ageGateStore } from '@game/persistence';
import { colors, radii, spacing } from '@ui/theme';
import Text from '@ui/components/Text';
import Button from '@ui/components/Button';
import { strings } from '@i18n/en';
import { MODAL_ALL_ORIENTATIONS } from '@ui/components/modalDefaults';
import { parseDobParts } from '@game/ageGate';

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

  function handleDayKeyPress(e: NativeSyntheticEvent<TextInputKeyPressEventData>) {
    if (e.nativeEvent.key === 'Backspace' && day.length === 0) {
      dayRef.current?.blur();
    }
  }

  function handleMonthKeyPress(e: NativeSyntheticEvent<TextInputKeyPressEventData>) {
    if (e.nativeEvent.key === 'Backspace' && month.length === 0) {
      dayRef.current?.focus();
    }
  }

  function handleYearKeyPress(e: NativeSyntheticEvent<TextInputKeyPressEventData>) {
    if (e.nativeEvent.key === 'Backspace' && year.length === 0) {
      monthRef.current?.focus();
    }
  }

  if (stage === 'loading' || stage === 'cleared') return null;

  return (
    <Modal
      visible
      animationType="fade"
      transparent
      supportedOrientations={MODAL_ALL_ORIENTATIONS}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          {stage === 'entry' ? (
            <>
              <Text variant="displayLG">{strings.legal.ageGateTitle}</Text>
              <Text variant="bodyLG" color={colors.textMuted} style={styles.body}>
                {strings.legal.ageGateBody}
              </Text>
              <Text variant="labelSM" color={colors.textMuted} style={styles.fieldLabel}>
                {strings.legal.ageGateDobLabel}
              </Text>
              <View style={styles.row}>
                <TextInput
                  ref={dayRef}
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
                  onKeyPress={handleDayKeyPress}
                  returnKeyType="next"
                />
                <TextInput
                  ref={monthRef}
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
                  onKeyPress={handleMonthKeyPress}
                  returnKeyType="next"
                />
                <TextInput
                  ref={yearRef}
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
                  onKeyPress={handleYearKeyPress}
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
              <Text variant="bodyLG" color={colors.textMuted} style={styles.body}>
                {strings.legal.ageGateUnderage}
              </Text>
            </>
          )}
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
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
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
