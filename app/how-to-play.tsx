import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Screen from '@ui/components/Screen';
import Text from '@ui/components/Text';
import Button from '@ui/components/Button';
import SectionCard from '@ui/components/SectionCard';
import { colors, layout, radii, spacing } from '@ui/theme';
import { strings } from '@i18n/en';

const RULES = [
  { title: strings.howToPlay.penaltiesTitle, body: strings.howToPlay.penaltiesBody },
  { title: strings.howToPlay.fairnessTitle, body: strings.howToPlay.fairnessBody },
  { title: strings.howToPlay.copOutTitle, body: strings.howToPlay.copOutBody },
  { title: strings.howToPlay.hostTitle, body: strings.howToPlay.hostBody },
];

export default function HowToPlayScreen() {
  const router = useRouter();
  return (
    <Screen>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={spacing.md}
          accessibilityRole="button"
          accessibilityLabel={strings.common.back}
          style={({ pressed }) => [styles.back, pressed && styles.backPressed]}
        >
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </Pressable>
        <Text variant="displayLG">{strings.home.howToPlayTitle}</Text>
        <View style={styles.spacer} />
      </View>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {RULES.map((r) => (
          <SectionCard key={r.title} style={styles.card}>
            <Text variant="displaySM">{r.title}</Text>
            <Text variant="bodyLG" color={colors.textMuted} style={styles.cardBody}>
              {r.body}
            </Text>
          </SectionCard>
        ))}
      </ScrollView>
      <Button label={strings.common.back} variant="ghost" onPress={() => router.back()} fullWidth />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.md,
  },
  back: {
    width: layout.minTapTarget,
    height: layout.minTapTarget,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backPressed: {
    opacity: 0.6,
  },
  spacer: {
    width: layout.minTapTarget,
  },
  body: {
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
  card: {
    gap: spacing.sm,
  },
  cardBody: {
    marginTop: spacing.xs,
  },
});
