import { ScrollView, View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Screen from '@ui/components/Screen';
import Text from '@ui/components/Text';
import SectionCard from '@ui/components/SectionCard';
import { colors, layout, radii, spacing } from '@ui/theme';
import { strings } from '@i18n/en';
import type { LegalSection } from '@content/legal';

type Props = {
  title: string;
  sections: LegalSection[];
};

export default function LegalScreen({ title, sections }: Props) {
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
        <Text variant="displayLG">{title}</Text>
        <View style={styles.backSpacer} />
      </View>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {sections.map((section) => (
          <SectionCard key={section.heading} style={styles.card}>
            <Text variant="displaySM">{section.heading}</Text>
            <Text variant="bodyMD" color={colors.textMuted} style={styles.sectionBody}>
              {section.body}
            </Text>
          </SectionCard>
        ))}
        <Text variant="labelSM" color={colors.textSubtle} style={styles.footer}>
          {strings.app.name} · {strings.settings.version}
        </Text>
      </ScrollView>
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
  backSpacer: {
    width: layout.minTapTarget,
  },
  body: {
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  card: {
    gap: spacing.sm,
  },
  sectionBody: {
    marginTop: spacing.xs,
  },
  footer: {
    marginTop: spacing.lg,
    textAlign: 'center',
  },
});
