import { useRef } from 'react';
import { Platform, TextInput, View, StyleSheet, useWindowDimensions } from 'react-native';
import type { PlayerDraft } from '@game/playerFactory';
import Button from '@ui/components/Button';
import BottomSheet from '@ui/components/sheets/BottomSheet';
import SheetFooter from '@ui/components/sheets/SheetFooter';
import SheetHeader from '@ui/components/sheets/SheetHeader';
import PlayerFormBody from '@ui/components/playerForm/PlayerFormBody';
import { usePlayerDraftForm } from '@ui/components/playerForm/usePlayerDraftForm';
import { strings } from '@i18n/en';
import { spacing } from '@ui/theme';

type Props = {
  visible: boolean;
  mode: 'add' | 'edit';
  initial: PlayerDraft | null;
  onClose: () => void;
  onSave: (draft: PlayerDraft) => void;
  onRemove?: () => void;
  parentIsLandscape?: boolean;
};

export default function PlayerFormModal({
  visible,
  mode,
  initial,
  onClose,
  onSave,
  onRemove,
  parentIsLandscape,
}: Props) {
  const nameRef = useRef<TextInput>(null);
  const form = usePlayerDraftForm({ active: visible, initial });
  const { width: winW, height: winH } = useWindowDimensions();
  const viewportIsLandscape = winW > winH;
  const isLandscape = parentIsLandscape ?? viewportIsLandscape;

  function save() {
    const draft = form.toDraft();
    if (!draft) return;
    onSave(draft);
    onClose();
  }

  function handleShow() {
    if (mode !== 'add' || isLandscape || Platform.OS === 'web') return;
    requestAnimationFrame(() => nameRef.current?.focus());
  }

  const title =
    mode === 'add' ? strings.setup.addPlayerModalTitle : strings.setup.editPlayerModalTitle;
  const primaryLabel = mode === 'add' ? strings.setup.addPlayerConfirm : strings.setup.savePlayer;

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      onShow={handleShow}
      parentIsLandscape={parentIsLandscape}
    >
      <SheetHeader title={title} onClose={onClose} closeAccessibilityLabel={strings.setup.back} />
      <View style={styles.body}>
        <PlayerFormBody ref={nameRef} form={form} mode={mode} onRemove={onRemove} />
      </View>
      <SheetFooter>
        <View style={styles.footerRow}>
          <Button label={strings.setup.back} variant="ghost" onPress={onClose} />
          <Button
            label={primaryLabel}
            variant="primary"
            onPress={save}
            disabled={!form.name.trim()}
          />
        </View>
      </SheetFooter>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    flexGrow: 1,
    flexShrink: 1,
    minHeight: 0,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
});
