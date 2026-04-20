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
    <BottomSheet visible onClose={onCancel} dismissOnBackdropPress={false}>
      <View style={styles.header}>
        <View style={styles.titleCol}>
          <Text variant="displayLG">{title}</Text>
          <Text variant="labelSM" color={colors.textMuted}>
            {hint}
          </Text>
        </View>
        <Text variant="displayLG" color={colors.yellow}>
          {amount}
        </Text>
      </View>
      <FlatList
        data={ordered}
        keyExtractor={(p) => p.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const selected = item.id === selectedId;
          const tag = tagFor(item);
          return (
            <Pressable
              onPress={() => setSelectedId(item.id)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={item.name}
              style={({ pressed }) => [
                styles.row,
                selected && styles.rowSelected,
                pressed && !selected && styles.rowPressed,
              ]}
            >
              <View style={styles.rowText}>
                <Text variant="displaySM" numberOfLines={1}>
                  {item.name}
                </Text>
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
      <SheetFooter>
        <View style={styles.footerRow}>
          <Button label={strings.setup.back} variant="ghost" onPress={onCancel} />
          <Button
            label={strings.choose.confirm}
            variant="primary"
            disabled={selectedId === null}
            onPress={() => selectedId && onConfirm(selectedId)}
          />
        </View>
      </SheetFooter>
    </BottomSheet>
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
  rowSelected: {
    borderColor: colors.yellow,
    backgroundColor: colors.surfaceWarm,
  },
  rowPressed: {
    opacity: 0.85,
  },
  rowText: {
    flex: 1,
    minWidth: 0,
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
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
});
