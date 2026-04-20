import { useState } from 'react';
import { Modal, View, StyleSheet, Pressable, FlatList } from 'react-native';
import type { Player, PlayerId } from '@game/types';
import { colors, radii, spacing } from '@ui/theme';
import Text from '@ui/components/Text';
import Button from '@ui/components/Button';
import { strings } from '@i18n/en';
import { MODAL_ALL_ORIENTATIONS } from '@ui/components/modalDefaults';

type Props = {
  amount: number;
  drawer: Player;
  players: Player[];
  biasedPlayer?: Player | null;
  drawerAutoShare?: number;
  onCancel: () => void;
  onConfirm: (playerId: PlayerId) => void;
};

export default function ChoosePenaltyModal({
  amount,
  drawer,
  players,
  biasedPlayer,
  drawerAutoShare,
  onCancel,
  onConfirm,
}: Props) {
  const [selectedId, setSelectedId] = useState<PlayerId | null>(null);

  const isSplit = typeof drawerAutoShare === 'number' && drawerAutoShare > 0;

  function tagFor(p: Player): string | null {
    if (p.id === drawer.id) {
      return isSplit ? strings.choose.tagCopOut : strings.choose.tagDrawer;
    }
    if (biasedPlayer && p.id === biasedPlayer.id) return strings.choose.tagBias;
    return null;
  }

  const ordered = [drawer, ...players.filter((p) => p.id !== drawer.id)];

  const title = isSplit ? strings.choose.splitTitle : strings.choose.title;
  const hint = isSplit
    ? strings.choose.splitHint(drawer.name, drawerAutoShare!)
    : strings.choose.hint;

  return (
    <Modal visible transparent animationType="slide" supportedOrientations={MODAL_ALL_ORIENTATIONS}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text variant="displayLG">{title}</Text>
            <Text variant="displayLG" color={colors.yellow}>
              {amount}
            </Text>
          </View>
          <Text variant="labelSM" color={colors.textMuted}>
            {hint}
          </Text>
          <FlatList
            data={ordered}
            keyExtractor={(p) => p.id}
            contentContainerStyle={{ gap: spacing.sm, paddingVertical: spacing.md }}
            renderItem={({ item }) => {
              const selected = item.id === selectedId;
              const tag = tagFor(item);
              return (
                <Pressable
                  onPress={() => setSelectedId(item.id)}
                  style={[styles.row, selected && styles.rowSelected]}
                >
                  <View style={{ flex: 1 }}>
                    <Text variant="displaySM">{item.name}</Text>
                    {tag ? (
                      <Text variant="labelSM" color={selected ? colors.yellow : colors.textMuted}>
                        {tag}
                      </Text>
                    ) : null}
                  </View>
                  <View style={[styles.radio, selected && styles.radioOn]} />
                </Pressable>
              );
            }}
          />
          <View style={styles.footer}>
            <Button label={strings.setup.back} variant="ghost" onPress={onCancel} />
            <Button
              label={strings.choose.confirm}
              variant="primary"
              disabled={selectedId === null}
              onPress={() => selectedId && onConfirm(selectedId)}
            />
          </View>
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
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: spacing.xl,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  rowSelected: {
    borderColor: colors.yellow,
    backgroundColor: '#1E1A0E',
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.borderStrong,
  },
  radioOn: {
    borderColor: colors.yellow,
    backgroundColor: colors.yellow,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingTop: spacing.md,
  },
});
