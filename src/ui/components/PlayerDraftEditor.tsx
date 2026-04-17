import { useState } from 'react';
import { View, StyleSheet, TextInput, Pressable } from 'react-native';
import type { PlayerDraft } from '@game/playerFactory';
import type { Difficulty, Gender } from '@game/types';
import { colors, radii, spacing, typography } from '@ui/theme';
import Text from '@ui/components/Text';
import SectionCard from '@ui/components/SectionCard';
import { strings } from '@i18n/en';

type Props = {
  draft: PlayerDraft;
  onChange: (updates: Partial<PlayerDraft>) => void;
  onRemove: () => void;
};

const DIFFICULTIES: Difficulty[] = ['passive', 'tradicional', 'muerte'];
const GENDERS: Gender[] = ['man', 'woman', 'nonbinary'];
const ABV_PRESETS: Array<{ label: string; value: number }> = [
  { label: 'Beer 5%', value: 0.05 },
  { label: 'Wine 12%', value: 0.12 },
  { label: 'Spirit 40%', value: 0.4 },
];

export default function PlayerDraftEditor({ draft, onChange, onRemove }: Props) {
  const [expanded, setExpanded] = useState(false);
  const abvPct = Math.round(draft.abv * 100);

  function toggleAttracted(g: Gender) {
    const has = draft.attractedTo.includes(g);
    onChange({
      attractedTo: has ? draft.attractedTo.filter((x) => x !== g) : [...draft.attractedTo, g],
    });
  }

  return (
    <SectionCard>
      <Pressable onPress={() => setExpanded((v) => !v)} style={styles.row}>
        <TextInput
          style={styles.nameInput}
          value={draft.name}
          onChangeText={(name) => onChange({ name })}
          placeholder="Name"
          placeholderTextColor={colors.textSubtle}
        />
        <Text variant="labelSM" color={colors.textMuted}>
          {abvPct}% · {draft.difficulty}
        </Text>
      </Pressable>
      {expanded ? (
        <View style={styles.expanded}>
          <Text variant="labelSM" color={colors.textMuted}>
            {strings.setup.abv}
          </Text>
          <View style={styles.chipRow}>
            {ABV_PRESETS.map((p) => (
              <Chip
                key={p.label}
                label={p.label}
                active={Math.abs(draft.abv - p.value) < 0.005}
                onPress={() => onChange({ abv: p.value })}
              />
            ))}
            <TextInput
              style={styles.abvInput}
              value={String(abvPct)}
              keyboardType="numeric"
              onChangeText={(txt) => {
                const n = Number(txt);
                if (!Number.isNaN(n)) onChange({ abv: Math.max(0, Math.min(100, n)) / 100 });
              }}
            />
          </View>
          <Text variant="labelSM" color={colors.textMuted} style={styles.label}>
            {strings.setup.difficulty}
          </Text>
          <View style={styles.chipRow}>
            {DIFFICULTIES.map((d) => (
              <Chip
                key={d}
                label={strings.setup[d]}
                active={draft.difficulty === d}
                onPress={() => onChange({ difficulty: d })}
              />
            ))}
          </View>
          <Text variant="labelSM" color={colors.textMuted} style={styles.label}>
            {strings.setup.gender}
          </Text>
          <View style={styles.chipRow}>
            {GENDERS.map((g) => (
              <Chip
                key={g}
                label={strings.setup[g]}
                active={draft.gender === g}
                onPress={() => onChange({ gender: g })}
              />
            ))}
          </View>
          <Text variant="labelSM" color={colors.textMuted} style={styles.label}>
            {strings.setup.attractedTo}
          </Text>
          <View style={styles.chipRow}>
            {GENDERS.map((g) => (
              <Chip
                key={g}
                label={strings.setup[g]}
                active={draft.attractedTo.includes(g)}
                onPress={() => toggleAttracted(g)}
              />
            ))}
          </View>
          <Pressable onPress={onRemove} style={styles.remove}>
            <Text variant="labelSM" color={colors.red}>
              {strings.setup.removePlayer.toUpperCase()}
            </Text>
          </Pressable>
        </View>
      ) : null}
    </SectionCard>
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
      <Text variant="labelSM" color={active ? colors.bg : colors.text}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nameInput: {
    flex: 1,
    color: colors.text,
    ...typography.displaySM,
  },
  expanded: {
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  label: { marginTop: spacing.md },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.xs },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
  },
  abvInput: {
    color: colors.text,
    ...typography.labelSM,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 50,
    textAlign: 'center',
  },
  remove: {
    alignSelf: 'flex-end',
    paddingTop: spacing.md,
  },
});
