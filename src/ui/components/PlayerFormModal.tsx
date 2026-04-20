import { useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import type { PlayerDraft } from '@game/playerFactory';
import type { Difficulty, Gender } from '@game/types';
import { colors, radii, spacing, typography } from '@ui/theme';
import Text from '@ui/components/Text';
import Button from '@ui/components/Button';
import { strings } from '@i18n/en';
import { MODAL_ALL_ORIENTATIONS } from '@ui/components/modalDefaults';

type Props = {
  visible: boolean;
  mode: 'add' | 'edit';
  initial: PlayerDraft | null;
  onClose: () => void;
  onSave: (draft: PlayerDraft) => void;
  onRemove?: () => void;
  parentIsLandscape?: boolean;
};

const DIFFICULTIES: Difficulty[] = ['passive', 'tradicional', 'muerte'];
const GENDERS: Gender[] = ['man', 'woman', 'nonbinary'];

export default function PlayerFormModal({
  visible,
  mode,
  initial,
  onClose,
  onSave,
  onRemove,
  parentIsLandscape,
}: Props) {
  const { width: winW, height: winH } = useWindowDimensions();
  const viewportIsLandscape = winW > winH;
  const responsiveIsLandscape = parentIsLandscape ?? viewportIsLandscape;
  const [openIsLandscape, setOpenIsLandscape] = useState(responsiveIsLandscape);
  const wasVisibleRef = useRef(false);
  const isLandscape = visible ? openIsLandscape : responsiveIsLandscape;
  const sheetMaxH = Math.min(winH * (isLandscape ? 0.9 : 0.92), isLandscape ? 540 : 720);
  const sheetW = isLandscape ? Math.min(520, Math.max(280, winW - spacing.xl * 2)) : undefined;
  const scrollPortraitMax = Math.max(200, sheetMaxH - 180);

  const nameRef = useRef<TextInput>(null);
  const [name, setName] = useState('');
  const [abvStr, setAbvStr] = useState('12');
  const [difficulty, setDifficulty] = useState<Difficulty>('tradicional');
  const [gender, setGender] = useState<Gender>('man');
  const [attractedTo, setAttractedTo] = useState<Gender[]>([]);

  useEffect(() => {
    if (visible && !wasVisibleRef.current) {
      setOpenIsLandscape(responsiveIsLandscape);
    } else if (!visible) {
      setOpenIsLandscape(responsiveIsLandscape);
    }
    wasVisibleRef.current = visible;
  }, [visible, responsiveIsLandscape]);

  useEffect(() => {
    if (!visible) return;
    if (initial) {
      setName(initial.name);
      setAbvStr(String(Math.round(initial.abv * 100)));
      setDifficulty(initial.difficulty);
      setGender(initial.gender);
      setAttractedTo([...initial.attractedTo]);
    } else {
      setName('');
      setAbvStr('12');
      setDifficulty('tradicional');
      setGender('man');
      setAttractedTo([]);
    }
  }, [visible, initial, mode]);

  function toggleAttracted(g: Gender) {
    setAttractedTo((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));
  }

  function save() {
    const trimmed = name.trim();
    if (!trimmed) return;
    const pct = Number(abvStr);
    const abv = Number.isFinite(pct) ? Math.max(0, Math.min(100, pct)) / 100 : 0;
    onSave({
      name: trimmed,
      abv,
      difficulty,
      gender,
      attractedTo,
    });
    onClose();
  }

  const sheetInner = (
    <View
      style={[
        styles.sheet,
        isLandscape && styles.sheetLandscape,
        {
          maxHeight: sheetMaxH,
          width: sheetW ?? '100%',
        },
        isLandscape && { height: sheetMaxH },
      ]}
    >
      <View style={styles.sheetHeader}>
        <Text variant="displayMD">
          {mode === 'add'
            ? strings.setup.addPlayerModalTitle
            : strings.setup.editPlayerModalTitle}
        </Text>
        <Pressable onPress={onClose} hitSlop={12}>
          <Text variant="displaySM" color={colors.textMuted}>
            ✕
          </Text>
        </Pressable>
      </View>
      <ScrollView
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}
        style={isLandscape ? styles.scroll : { maxHeight: scrollPortraitMax }}
        contentContainerStyle={styles.form}
        nestedScrollEnabled
      >
        <Text variant="labelSM" color={colors.textMuted}>
          {strings.setup.playerName.toUpperCase()}
        </Text>
        <TextInput
          ref={nameRef}
          value={name}
          onChangeText={setName}
          placeholder={strings.setup.playerName}
          placeholderTextColor={colors.textSubtle}
          style={styles.input}
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="next"
        />
        <Text variant="labelSM" color={colors.textMuted} style={styles.fieldLabel}>
          {strings.setup.abv.toUpperCase()}
        </Text>
        <TextInput
          value={abvStr}
          onChangeText={setAbvStr}
          placeholder="12"
          placeholderTextColor={colors.textSubtle}
          style={styles.input}
          keyboardType="decimal-pad"
        />
        <Text variant="labelSM" color={colors.textMuted} style={styles.fieldLabel}>
          {strings.setup.difficulty.toUpperCase()}
        </Text>
        <View style={styles.chipRow}>
          {DIFFICULTIES.map((d) => (
            <Chip
              key={d}
              label={strings.setup[d]}
              active={difficulty === d}
              onPress={() => setDifficulty(d)}
            />
          ))}
        </View>
        <Text variant="labelSM" color={colors.textMuted} style={styles.fieldLabel}>
          {strings.setup.gender.toUpperCase()}
        </Text>
        <View style={styles.chipRow}>
          {GENDERS.map((g) => (
            <Chip
              key={g}
              label={strings.setup[g]}
              active={gender === g}
              onPress={() => setGender(g)}
            />
          ))}
        </View>
        <View style={styles.interestedHeader}>
          <Text variant="labelSM" color={colors.textMuted}>
            {strings.setup.attractedTo.toUpperCase()}
          </Text>
          <Text variant="labelSM" color={colors.textSubtle}>
            {strings.setup.interestedOptional}
          </Text>
        </View>
        <View style={styles.chipRow}>
          {GENDERS.map((g) => (
            <Chip
              key={g}
              label={strings.setup[g]}
              active={attractedTo.includes(g)}
              onPress={() => toggleAttracted(g)}
            />
          ))}
        </View>
        {mode === 'edit' && onRemove ? (
          <Pressable onPress={onRemove} style={styles.remove}>
            <Text variant="labelMD" color={colors.red}>
              {strings.setup.removePlayer}
            </Text>
          </Pressable>
        ) : null}
      </ScrollView>
      <View style={styles.footer}>
        <Button label={strings.setup.back} variant="ghost" onPress={onClose} />
        <Button
          label={mode === 'add' ? strings.setup.addPlayerConfirm : strings.setup.savePlayer}
          variant="primary"
          onPress={save}
          disabled={!name.trim()}
        />
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType={isLandscape ? 'fade' : 'slide'}
      transparent
      presentationStyle="overFullScreen"
      onRequestClose={onClose}
      onShow={() => {
        if (mode !== 'add' || isLandscape) return;
        requestAnimationFrame(() => nameRef.current?.focus());
      }}
      statusBarTranslucent={Platform.OS === 'android'}
      supportedOrientations={MODAL_ALL_ORIENTATIONS}
    >
      <View style={styles.modalRoot}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheetOverlay}>
          {isLandscape ? (
            <View style={[styles.sheetWrap, styles.sheetWrapLandscape]}>{sheetInner}</View>
          ) : (
            <KeyboardAvoidingView
              style={styles.sheetWrap}
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              keyboardVerticalOffset={0}
            >
              {sheetInner}
            </KeyboardAvoidingView>
          )}
        </View>
      </View>
    </Modal>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        active && { backgroundColor: colors.orange, borderColor: colors.orange },
      ]}
    >
      <Text variant="labelMD" color={active ? colors.bg : colors.text}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
    zIndex: 0,
  },
  sheetOverlay: {
    flex: 1,
    zIndex: 1,
    pointerEvents: 'box-none',
  },
  sheetWrap: {
    flex: 1,
    justifyContent: 'flex-end',
    pointerEvents: 'box-none',
  },
  sheetWrapLandscape: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingBottom: spacing.lg,
    overflow: 'hidden',
    flexDirection: 'column',
    minHeight: 0,
  },
  sheetLandscape: {
    borderBottomLeftRadius: radii.xl,
    borderBottomRightRadius: radii.xl,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  scroll: {
    flex: 1,
    flexGrow: 1,
    flexShrink: 1,
    minHeight: 0,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    flexShrink: 0,
  },
  form: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
    gap: spacing.xs,
  },
  fieldLabel: { marginTop: spacing.md },
  interestedHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  input: {
    marginTop: spacing.xs,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    color: colors.text,
    ...typography.bodyLG,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
  },
  remove: {
    alignSelf: 'flex-start',
    marginTop: spacing.xl,
    paddingVertical: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexShrink: 0,
  },
});
