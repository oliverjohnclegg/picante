import { useState } from 'react';
import { FlatList, View, StyleSheet, useWindowDimensions, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Screen from '@ui/components/Screen';
import Text from '@ui/components/Text';
import Button from '@ui/components/Button';
import StepHeader from '@ui/components/StepHeader';
import SetupPlayerRow from '@ui/components/SetupPlayerRow';
import PlayerFormModal from '@ui/components/PlayerFormModal';
import { colors, radii, spacing } from '@ui/theme';
import { useSetupStore, MIN_PLAYERS, MAX_PLAYERS } from '@game/setupStore';
import { strings } from '@i18n/en';
import type { PlayerDraft } from '@game/playerFactory';

export default function PlayersScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const { drafts, addDraft, updateDraft, removeDraft } = useSetupStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  function openAdd() {
    if (drafts.length >= MAX_PLAYERS) return;
    setModalMode('add');
    setEditingIndex(null);
    setModalOpen(true);
  }

  function openEdit(index: number) {
    setModalMode('edit');
    setEditingIndex(index);
    setModalOpen(true);
  }

  function handleSave(draft: PlayerDraft) {
    if (editingIndex === null) {
      addDraft(draft);
    } else {
      updateDraft(editingIndex, draft);
    }
  }

  function handleRemove() {
    if (editingIndex === null) return;
    removeDraft(editingIndex);
    setModalOpen(false);
    setEditingIndex(null);
  }

  const initialDraft =
    modalMode === 'edit' && editingIndex !== null ? (drafts[editingIndex] ?? null) : null;

  const canContinue = drafts.length >= MIN_PLAYERS && drafts.every((d) => d.name.trim() !== '');

  return (
    <Screen>
      <View style={styles.body}>
        <StepHeader step={2} title={strings.setup.stepPlayers} />
        <Text variant="labelSM" color={colors.textMuted}>
          {drafts.length}/{MAX_PLAYERS} players
        </Text>
        <FlatList
          style={styles.list}
          data={drafts}
          keyExtractor={(_, i) => String(i)}
          numColumns={isLandscape ? 4 : 1}
          key={isLandscape ? 'grid' : 'list'}
          columnWrapperStyle={isLandscape ? styles.columnWrapper : undefined}
          contentContainerStyle={[styles.listContent, isLandscape && styles.listContentLandscape]}
          renderItem={({ item, index }) => (
            <View style={isLandscape ? styles.cell : undefined}>
              <SetupPlayerRow draft={item} onConfigure={() => openEdit(index)} />
            </View>
          )}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
        />
      </View>
      <View style={styles.footer}>
        {!canContinue ? (
          <Text variant="labelSM" color={colors.yellow} style={styles.hint}>
            {strings.setup.minPlayers}
          </Text>
        ) : null}
        <View style={styles.buttons}>
          <Button label={strings.setup.back} variant="ghost" onPress={() => router.back()} />
          <View style={styles.buttonsRight}>
            {drafts.length < MAX_PLAYERS ? (
              <Pressable
                onPress={openAdd}
                style={({ pressed }) => [styles.addIcon, { opacity: pressed ? 0.65 : 1 }]}
                accessibilityRole="button"
                accessibilityLabel={strings.setup.addPlayer}
              >
                <Ionicons name="person-add-outline" size={22} color={colors.yellow} />
              </Pressable>
            ) : null}
            <Button
              label={strings.setup.next}
              variant="primary"
              disabled={!canContinue}
              onPress={() => router.push('/setup/review')}
            />
          </View>
        </View>
      </View>
      <PlayerFormModal
        visible={modalOpen}
        mode={modalMode}
        initial={initialDraft}
        parentIsLandscape={isLandscape}
        onClose={() => {
          setModalOpen(false);
          setEditingIndex(null);
        }}
        onSave={handleSave}
        onRemove={modalMode === 'edit' ? handleRemove : undefined}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    minHeight: 0,
  },
  list: {
    flex: 1,
    minHeight: 0,
  },
  listContent: {
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  listContentLandscape: {
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  columnWrapper: {
    gap: spacing.sm,
  },
  cell: {
    flex: 1,
    minWidth: 0,
  },
  footer: { paddingTop: spacing.md },
  hint: { textAlign: 'center', marginBottom: spacing.sm },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  buttonsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  addIcon: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
});
