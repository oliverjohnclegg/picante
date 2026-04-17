import { ScrollView, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Screen from '@ui/components/Screen';
import Text from '@ui/components/Text';
import Button from '@ui/components/Button';
import SectionCard from '@ui/components/SectionCard';
import { colors, spacing } from '@ui/theme';

const RULES = [
  {
    title: 'Penalties, not drinks',
    body: 'Cards give out penalties. Shots only happen when your penalty total hits your personal threshold — which the app computes from your ABV, your difficulty, and the party size.',
  },
  {
    title: "Everyone's glass is different",
    body: 'Lightweights and spirit-drinkers take shots at a fair rate. Strong drink = lower threshold = more shots per penalty.',
  },
  {
    title: 'Forfeits are invitations',
    body: "Every card has a cop-out baked into its text. Don't want to do it? Take the penalty instead.",
  },
  {
    title: 'The host drives',
    body: "One phone, the drawer's. Subjective calls (vote winners, dare adjudication) get tapped by the drawer on behalf of the group.",
  },
];

export default function HowToPlayScreen() {
  const router = useRouter();
  return (
    <Screen>
      <View style={styles.header}>
        <Text variant="displayLG">How to play</Text>
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
      <Button label="Back" variant="ghost" onPress={() => router.back()} fullWidth />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingBottom: spacing.lg,
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
