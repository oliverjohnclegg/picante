import { Modal, View, StyleSheet, FlatList, Pressable, useWindowDimensions } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useGameStore } from '@game/gameStore';
import { colors, radii, spacing } from '@ui/theme';
import Text from '@ui/components/Text';
import Button from '@ui/components/Button';
import PlayerChip from '@ui/components/PlayerChip';
import PlayerFormModal from '@ui/components/PlayerFormModal';
import { strings } from '@i18n/en';
import { MODAL_ALL_ORIENTATIONS } from '@ui/components/modalDefaults';
import type { PlayerDraft } from '@game/playerFactory';
import { MAX_PLAYERS } from '@game/setupStore';

type Props = { onClose: () => void };

export default function RosterDrawer({ onClose }: Props) {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const players = useGameStore((s) => s.players);
  const updatePlayer = useGameStore((s) => s.updatePlayer);
  const addPlayer = useGameStore((s) => s.addPlayer);
  const removePlayer = useGameStore((s) => s.removePlayer);
  const endGame = useGameStore((s) => s.endGame);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [editingId, setEditingId] = useState<string | null>(null);

  function end() {
    endGame();
    onClose();
    router.replace('/end');
  }

  function openAdd() {
    if (players.length >= MAX_PLAYERS) return;
    setFormMode('add');
    setEditingId(null);
    setFormOpen(true);
  }

  function openEdit(id: string) {
    setFormMode('edit');
    setEditingId(id);
    setFormOpen(true);
  }

  function handleSave(draft: PlayerDraft) {
    if (formMode === 'add') {
      addPlayer(draft);
    } else if (editingId) {
      updatePlayer(editingId, {
        name: draft.name,
        abv: draft.abv,
        difficulty: draft.difficulty,
        gender: draft.gender,
        attractedTo: draft.attractedTo,
      });
    }
  }

  function handleRemove() {
    if (!editingId) return;
    removePlayer(editingId);
    setFormOpen(false);
    setEditingId(null);
  }

  const editing = editingId ? players.find((p) => p.id === editingId) : undefined;
  const initialDraft: PlayerDraft | null =
    formMode === 'edit' && editing
      ? {
          name: editing.name,
          abv: editing.abv,
          difficulty: editing.difficulty,
          gender: editing.gender,
          attractedTo: editing.attractedTo,
        }
      : null;

  return (
    <>
      {!formOpen ? (
        <Modal
          visible
          transparent
          animationType={isLandscape ? 'fade' : 'slide'}
          supportedOrientations={MODAL_ALL_ORIENTATIONS}
        >
          <View style={[styles.backdrop, isLandscape && styles.backdropLandscape]}>
            <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
            <View style={[styles.sheet, isLandscape && styles.sheetLandscape]}>
              <View style={styles.header}>
                <Text variant="displayLG">{strings.game.roster}</Text>
                <Pressable onPress={onClose}>
                  <Text variant="displayMD" color={colors.textMuted}>
                    ✕
                  </Text>
                </Pressable>
              </View>
              <FlatList
                data={players}
                keyExtractor={(p) => p.id}
                style={isLandscape ? styles.listLandscape : styles.listPortrait}
                contentContainerStyle={{ gap: spacing.sm, paddingVertical: spacing.md }}
                renderItem={({ item }) => (
                  <PlayerChip
                    player={item}
                    subtitle={`${Math.round(item.abv * 100)}% · ${item.difficulty}`}
                    onPress={() => openEdit(item.id)}
                  />
                )}
              />
              {players.length < MAX_PLAYERS ? (
                <Button
                  label={`+ ${strings.setup.addPlayer}`}
                  variant="ghost"
                  fullWidth
                  onPress={openAdd}
                />
              ) : null}
              <Button
                label="End game"
                variant="destructive"
                fullWidth
                onPress={end}
                style={{ marginTop: spacing.md }}
              />
            </View>
          </View>
        </Modal>
      ) : null}
      <PlayerFormModal
        visible={formOpen}
        mode={formMode}
        initial={initialDraft}
        parentIsLandscape={isLandscape}
        onClose={() => {
          setFormOpen(false);
          setEditingId(null);
        }}
        onSave={handleSave}
        onRemove={formMode === 'edit' ? handleRemove : undefined}
      />
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  backdropLandscape: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: spacing.xl,
    maxHeight: '85%',
  },
  sheetLandscape: {
    borderRadius: radii.xl,
    width: '100%',
    maxWidth: 560,
    maxHeight: '92%',
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  listPortrait: { maxHeight: 360 },
  listLandscape: { flexGrow: 0, flexShrink: 1, minHeight: 0, maxHeight: 340 },
});
