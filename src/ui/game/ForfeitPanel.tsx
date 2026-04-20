import { StyleSheet, View } from 'react-native';
import { MotiView } from 'moti';
import type { Card } from '@game/types';
import type { ResolvedForfeit } from '@game/gameStore';
import Text from '@ui/components/Text';
import Button from '@ui/components/Button';
import { colors, spacing, suitColors } from '@ui/theme';
import { strings } from '@i18n/en';
import { cardTitle } from '@game/cardTitle';
import { DRAW_ANIM } from '@ui/game/gameConstants';

type Props = {
  resolved: ResolvedForfeit | null;
  drawnCard: Card | null;
  isLandscape: boolean;
  landscapeMaxWidth: number;
};

export default function ForfeitPanel({
  resolved,
  drawnCard,
  isLandscape,
  landscapeMaxWidth,
}: Props) {
  const suitAccent = drawnCard ? suitColors[drawnCard.suit] : colors.orange;
  const isAce = drawnCard?.value === 'A';
  const visible = Boolean(resolved && drawnCard);

  return (
    <>
      <MotiView
        style={[
          isLandscape ? styles.forfeitLandscape : styles.forfeitPortrait,
          isLandscape && { maxWidth: landscapeMaxWidth },
        ]}
        animate={{
          opacity: visible ? 1 : 0,
          translateX: visible ? 0 : isLandscape ? 12 : 0,
          translateY: visible ? 0 : isLandscape ? 0 : 8,
        }}
        transition={{
          type: 'timing',
          duration: DRAW_ANIM.panelDuration,
          delay: visible ? DRAW_ANIM.panelDelay : 0,
        }}
        pointerEvents={visible ? 'auto' : 'none'}
      >
        {resolved && drawnCard ? (
          <>
            <Text
              variant="displayLG"
              color={suitAccent}
              numberOfLines={2}
              style={styles.centerText}
            >
              {cardTitle(drawnCard)}
            </Text>
            <Text variant="bodyLG" style={[styles.forfeitText, styles.centerText]}>
              {resolved.renderedText}
            </Text>
            {!isAce ? (
              <Text
                variant="labelSM"
                color={colors.yellow}
                style={[styles.stake, styles.centerText]}
              >
                {strings.game.penaltiesOnTheLine.replace(
                  '{amount}',
                  String(resolved.penaltyAmount),
                )}
              </Text>
            ) : null}
          </>
        ) : null}
      </MotiView>
    </>
  );
}

type ContinueProps = {
  visible: boolean;
  onContinue: () => void;
};

export function ContinueButton({ visible, onContinue }: ContinueProps) {
  return (
    <MotiView
      style={styles.continueWrap}
      animate={{
        opacity: visible ? 1 : 0,
        translateY: visible ? 0 : 8,
      }}
      transition={{
        type: 'timing',
        duration: DRAW_ANIM.continueDuration,
        delay: visible ? DRAW_ANIM.panelDelay + DRAW_ANIM.continueDelayOffset : 0,
      }}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      <View style={styles.continueInner}>
        <Button label={strings.draw.continue} variant="primary" fullWidth onPress={onContinue} />
      </View>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  forfeitLandscape: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  forfeitPortrait: {
    alignSelf: 'stretch',
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
  },
  forfeitText: {
    marginTop: spacing.md,
    lineHeight: 26,
  },
  stake: {
    marginTop: spacing.md,
  },
  centerText: {
    textAlign: 'center',
  },
  continueWrap: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    alignSelf: 'stretch',
  },
  continueInner: {
    width: '100%',
    maxWidth: 320,
  },
});
