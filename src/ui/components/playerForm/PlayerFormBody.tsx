import { forwardRef } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import Text from '@ui/components/Text';
import Chip from '@ui/components/Chip';
import FormField from '@ui/components/FormField';
import SheetScroll from '@ui/components/sheets/SheetScroll';
import { colors, layout, radii, spacing, typography } from '@ui/theme';
import { strings } from '@i18n/en';
import type { Difficulty, Gender } from '@game/types';
import type { PlayerDraftFormState } from '@ui/components/playerForm/usePlayerDraftForm';

const DIFFICULTIES: Difficulty[] = ['passive', 'tradicional', 'muerte'];
const GENDERS: Gender[] = ['man', 'woman', 'nonbinary'];

type Props = {
  form: PlayerDraftFormState;
  mode: 'add' | 'edit';
  onRemove?: () => void;
};

const PlayerFormBody = forwardRef<TextInput, Props>(function PlayerFormBody(
  { form, mode, onRemove },
  nameRef,
) {
  return (
    <SheetScroll>
      <FormField label={strings.setup.playerName}>
        <TextInput
          ref={nameRef}
          value={form.name}
          onChangeText={form.setName}
          placeholder={strings.setup.playerName}
          placeholderTextColor={colors.textSubtle}
          style={styles.input}
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="next"
          accessibilityLabel={strings.setup.playerName}
        />
      </FormField>
      <FormField label={strings.setup.abv}>
        <TextInput
          value={form.abvStr}
          onChangeText={form.setAbvStr}
          placeholder="12"
          placeholderTextColor={colors.textSubtle}
          style={styles.input}
          keyboardType="decimal-pad"
          returnKeyType="done"
          accessibilityLabel={strings.setup.abv}
        />
      </FormField>
      <FormField label={strings.setup.difficulty}>
        <View style={styles.chipRow}>
          {DIFFICULTIES.map((d) => (
            <Chip
              key={d}
              label={strings.setup[d]}
              active={form.difficulty === d}
              onPress={() => form.setDifficulty(d)}
            />
          ))}
        </View>
      </FormField>
      <FormField label={strings.setup.gender}>
        <View style={styles.chipRow}>
          {GENDERS.map((g) => (
            <Chip
              key={g}
              label={strings.setup[g]}
              active={form.gender === g}
              onPress={() => form.setGender(g)}
            />
          ))}
        </View>
      </FormField>
      <FormField label={strings.setup.attractedTo} hint={strings.setup.interestedOptional}>
        <View style={styles.chipRow}>
          {GENDERS.map((g) => (
            <Chip
              key={g}
              label={strings.setup[g]}
              active={form.attractedTo.includes(g)}
              onPress={() => form.toggleAttractedTo(g)}
            />
          ))}
        </View>
      </FormField>
      {mode === 'edit' && onRemove ? (
        <Pressable
          onPress={onRemove}
          style={styles.remove}
          accessibilityRole="button"
          accessibilityLabel={strings.setup.removePlayer}
        >
          <Text variant="labelMD" color={colors.red}>
            {strings.setup.removePlayer}
          </Text>
        </Pressable>
      ) : null}
    </SheetScroll>
  );
});

export default PlayerFormBody;

const styles = StyleSheet.create({
  input: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: layout.minTapTarget,
    color: colors.text,
    ...typography.bodyLG,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  remove: {
    alignSelf: 'flex-start',
    marginTop: spacing.xl,
    minHeight: layout.minTapTarget,
    paddingVertical: spacing.sm,
    justifyContent: 'center',
  },
});
