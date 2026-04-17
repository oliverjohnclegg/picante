import { Modal, View, StyleSheet, FlatList, Pressable, useWindowDimensions } from 'react-native';
import { useGameStore } from '@game/gameStore';
import { colors, radii, spacing } from '@ui/theme';
import Text from '@ui/components/Text';
import Button from '@ui/components/Button';
import PlayerChip from '@ui/components/PlayerChip';
import PlayerDraftEditor from '@ui/components/PlayerDraftEditor';
import { strings } from '@i18n/en';
import { MODAL_ALL_ORIENTATIONS } from '@ui/components/modalDefaults';
import { useState } from 'react';
import type { PlayerDraft } from '@game/playerFactory';
import { useRouter } from 'expo-router';

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

  const [editingId, setEditingId] = useState<string | null>(null);

  function end() {
    endGame();
    onClose();
    router.replace('/end');
  }

  function addBlank() {
    const draft: PlayerDraft = {
      name: `Player ${players.length + 1}`,
      abv: 0.12,
      difficulty: 'tradicional',
      gender: 'man',
      attractedTo: [],
    };
    addPlayer(draft);
  }

  const editing = players.find((p) => p.id === editingId);

  return (
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
          {editing ? (
            <View style={styles.editorStack}>
              <PlayerDraftEditor
                draft={{
                  name: editing.name,
                  abv: editing.abv,
                  difficulty: editing.difficulty,
                  gender: editing.gender,
                  attractedTo: editing.attractedTo,
                }}
                onChange={(updates) => updatePlayer(editing.id, updates)}
                onRemove={() => {
                  removePlayer(editing.id);
                  setEditingId(null);
                }}
              />
              <Button label="Done" variant="primary" fullWidth onPress={() => setEditingId(null)} />
            </View>
          ) : (
            <>
              <FlatList
                data={players}
                keyExtractor={(p) => p.id}
                style={isLandscape ? styles.listLandscape : styles.listPortrait}
                contentContainerStyle={{ gap: spacing.sm, paddingVertical: spacing.md }}
                renderItem={({ item }) => (
                  <PlayerChip
                    player={item}
                    subtitle={`${Math.round(item.abv * 100)}% · ${item.difficulty}`}
                    onPress={() => setEditingId(item.id)}
                  />
                )}
              />
              <Button
                label={`+ ${strings.setup.addPlayer}`}
                variant="ghost"
                fullWidth
                onPress={addBlank}
              />
              <Button
                label="End game"
                variant="destructive"
                fullWidth
                onPress={end}
                style={{ marginTop: spacing.md }}
              />
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
  editorStack: { gap: spacing.md },
  listPortrait: { maxHeight: 360 },
  listLandscape: { flexGrow: 0, flexShrink: 1, minHeight: 0, maxHeight: 340 },
});
