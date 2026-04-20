import { useState } from 'react';
import { FlatList, StyleSheet, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import BottomSheet from '@ui/components/sheets/BottomSheet';
import SheetFooter from '@ui/components/sheets/SheetFooter';
import SheetHeader from '@ui/components/sheets/SheetHeader';
import PlayerChip from '@ui/components/PlayerChip';
import PlayerFormModal from '@ui/components/PlayerFormModal';
import Button from '@ui/components/Button';
import { useGameStore } from '@game/gameStore';
import { spacing } from '@ui/theme';
import { strings } from '@i18n/en';
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
      return;
    }
    if (!editingId) return;
    updatePlayer(editingId, {
      name: draft.name,
      abv: draft.abv,
      difficulty: draft.difficulty,
      gender: draft.gender,
      attractedTo: draft.attractedTo,
    });
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
        <BottomSheet visible onClose={onClose} parentIsLandscape={isLandscape}>
          <SheetHeader title={strings.game.roster} onClose={onClose} />
          <FlatList
            data={players}
            keyExtractor={(p) => p.id}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <PlayerChip
                player={item}
                subtitle={`${Math.round(item.abv * 100)}% · ${item.difficulty}`}
                onPress={() => openEdit(item.id)}
              />
            )}
          />
          <SheetFooter>
            {players.length < MAX_PLAYERS ? (
              <Button
                label={`+ ${strings.setup.addPlayer}`}
                variant="ghost"
                fullWidth
                onPress={openAdd}
              />
            ) : null}
            <Button label={strings.game.endGame} variant="destructive" fullWidth onPress={end} />
          </SheetFooter>
        </BottomSheet>
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
  list: {
    flexGrow: 0,
    flexShrink: 1,
    minHeight: 0,
  },
  listContent: {
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
});
