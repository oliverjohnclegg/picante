import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import type { Player, PlayerId } from '@game/types';
import Text from '@ui/components/Text';
import Button from '@ui/components/Button';
import BottomSheet from '@ui/components/sheets/BottomSheet';
import SheetFooter from '@ui/components/sheets/SheetFooter';
import { colors, layout, radii, spacing } from '@ui/theme';
import { strings } from '@i18n/en';

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
    <BottomSheet visible onClose={onCancel} dismissOnBackdropPress={false}>
      <View style={styles.header}>
        <View style={styles.titleCol}>
          <Text variant="displayLG">{strings.distribute.title}</Text>
          <Text variant="labelSM" color={colors.textMuted}>
            {strings.distribute.remaining.toUpperCase()} · TOTAL {amount}
          </Text>
        </View>
        <Text
          variant="displayLG"
          color={remaining === 0 ? colors.green : colors.yellow}
          accessibilityLabel={`${remaining} ${strings.distribute.remaining}`}
        >
          {remaining}
        </Text>
      </View>
      <FlatList
        data={players}
        keyExtractor={(p) => p.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const value = assignments[item.id] ?? 0;
          const isDrawer = item.id === drawer.id;
          return (
            <View style={[styles.row, isDrawer && styles.rowDrawer]}>
              <View style={styles.rowText}>
                <Text variant="displaySM" numberOfLines={1}>
                  {item.name}
                </Text>
                {isDrawer ? (
                  <Text variant="labelSM" color={colors.orange}>
                    {strings.choose.tagDrawer}
                  </Text>
                ) : null}
              </View>
              <Stepper
                onPress={() => bump(item.id, -1)}
                label="−"
                accessibilityLabel={`Decrease ${item.name}`}
                disabled={value === 0}
              />
              <Text variant="displaySM" style={styles.value}>
                {value}
              </Text>
              <Stepper
                onPress={() => bump(item.id, 1)}
                label="+"
                accessibilityLabel={`Increase ${item.name}`}
                disabled={remaining === 0}
              />
            </View>
          );
        }}
      />
      <SheetFooter>
        <View style={styles.footerRow}>
          <Button label={strings.setup.back} variant="ghost" onPress={onCancel} />
          <Button
            label={strings.distribute.confirm}
            variant="primary"
            disabled={remaining !== 0}
            onPress={() => onConfirm(assignments)}
          />
        </View>
      </SheetFooter>
    </BottomSheet>
  );
}

function Stepper({
  onPress,
  label,
  accessibilityLabel,
  disabled,
}: {
  onPress: () => void;
  label: string;
  accessibilityLabel: string;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.stepper,
        pressed && !disabled && styles.stepperPressed,
        disabled && styles.stepperDisabled,
      ]}
    >
      <Text variant="displaySM" color={disabled ? colors.textSubtle : colors.text}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  titleCol: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xs,
  },
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
    minHeight: layout.minTapTarget + spacing.md,
  },
  rowDrawer: {
    borderColor: colors.orange,
  },
  rowText: {
    flex: 1,
    minWidth: 0,
  },
  stepper: {
    width: layout.minTapTarget,
    height: layout.minTapTarget,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  stepperPressed: {
    opacity: 0.7,
  },
  stepperDisabled: {
    opacity: 0.4,
  },
  value: {
    minWidth: 36,
    textAlign: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
});
