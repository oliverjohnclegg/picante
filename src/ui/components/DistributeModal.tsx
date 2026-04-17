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
  onCancel: () => void;
  onConfirm: (assignments: Record<PlayerId, number>) => void;
};

export default function DistributeModal({ amount, drawer, players, onCancel, onConfirm }: Props) {
  const [assignments, setAssignments] = useState<Record<PlayerId, number>>({});

  const allocated = Object.values(assignments).reduce((a, b) => a + b, 0);
  const remaining = amount - allocated;

  function bump(id: PlayerId, delta: number) {
    const current = assignments[id] ?? 0;
    const next = Math.max(0, current + delta);
    const cap = current + remaining;
    const final = delta > 0 ? Math.min(next, cap) : next;
    setAssignments({ ...assignments, [id]: final });
  }

  return (
    <Modal
      visible
      transparent
      animationType="slide"
      supportedOrientations={MODAL_ALL_ORIENTATIONS}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text variant="displayLG">{strings.distribute.title}</Text>
            <Text variant="displayLG" color={remaining === 0 ? colors.green : colors.yellow}>
              {remaining}
            </Text>
          </View>
          <Text variant="labelSM" color={colors.textMuted}>
            {strings.distribute.remaining.toUpperCase()} · TOTAL {amount}
          </Text>
          <FlatList
            data={players}
            keyExtractor={(p) => p.id}
            contentContainerStyle={{ gap: spacing.sm, paddingVertical: spacing.md }}
            renderItem={({ item }) => {
              const value = assignments[item.id] ?? 0;
              const isDrawer = item.id === drawer.id;
              return (
                <View style={[styles.row, isDrawer && { borderColor: colors.orange }]}>
                  <View style={{ flex: 1 }}>
                    <Text variant="displaySM">{item.name}</Text>
                    {isDrawer ? (
                      <Text variant="labelSM" color={colors.orange}>
                        DRAWER
                      </Text>
                    ) : null}
                  </View>
                  <Pressable onPress={() => bump(item.id, -1)} style={styles.stepper}>
                    <Text variant="displaySM">−</Text>
                  </Pressable>
                  <Text variant="displaySM" style={styles.value}>
                    {value}
                  </Text>
                  <Pressable
                    onPress={() => bump(item.id, 1)}
                    style={[styles.stepper, remaining === 0 && { opacity: 0.4 }]}
                    disabled={remaining === 0}
                  >
                    <Text variant="displaySM">+</Text>
                  </Pressable>
                </View>
              );
            }}
          />
          <View style={styles.footer}>
            <Button label={strings.setup.back} variant="ghost" onPress={onCancel} />
            <Button
              label={strings.distribute.confirm}
              variant="primary"
              disabled={remaining !== 0}
              onPress={() => onConfirm(assignments)}
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
  stepper: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  value: { minWidth: 36, textAlign: 'center' },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingTop: spacing.md,
  },
});
