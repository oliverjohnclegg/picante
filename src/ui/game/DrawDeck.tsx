import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import type { Card } from '@game/types';
import CardArt from '@ui/svg/CardArt';
import DeckCard from '@ui/svg/DeckCard';
import DeckHoldOverlay from '@ui/components/DeckHoldOverlay';
import { DRAW_ANIM, HOLD_FOR_SETTINGS_MS } from '@ui/game/gameConstants';

type Props = {
  drawnCard: Card | null;
  width: number;
  height: number;
  cardOffsetX: number;
  onDraw: () => void;
  onOpenSettings: () => void;
};

export default function DrawDeck({
  drawnCard,
  width,
  height,
  cardOffsetX,
  onDraw,
  onOpenSettings,
}: Props) {
  const [pressing, setPressing] = useState(false);

  return (
    <MotiView
      animate={{ translateX: drawnCard ? 0 : cardOffsetX }}
      transition={{ type: 'timing', duration: DRAW_ANIM.slide }}
      style={{ width, height }}
    >
      <Pressable
        onPress={drawnCard ? undefined : onDraw}
        onLongPress={drawnCard ? undefined : onOpenSettings}
        delayLongPress={HOLD_FOR_SETTINGS_MS}
        onPressIn={() => !drawnCard && setPressing(true)}
        onPressOut={() => setPressing(false)}
        disabled={!!drawnCard}
        accessibilityRole="button"
        accessibilityLabel={drawnCard ? undefined : 'Draw next card'}
        accessibilityHint="Long press to open roster"
        style={{ width, height }}
      >
        <MotiView
          style={StyleSheet.absoluteFill}
          animate={{
            opacity: drawnCard ? 0 : 1,
            scale: drawnCard ? 0.92 : 1,
          }}
          transition={{ type: 'timing', duration: DRAW_ANIM.deckFade }}
          pointerEvents={drawnCard ? 'none' : 'auto'}
        >
          <DeckCard width={width} height={height} />
        </MotiView>
        <DeckHoldOverlay
          pressing={pressing && !drawnCard}
          width={width}
          height={height}
          holdDurationMs={HOLD_FOR_SETTINGS_MS}
        />
        <MotiView
          style={StyleSheet.absoluteFill}
          animate={{
            opacity: drawnCard ? 1 : 0,
            scale: drawnCard ? 1 : 0.92,
          }}
          transition={{
            type: 'timing',
            duration: DRAW_ANIM.reveal,
            delay: drawnCard ? DRAW_ANIM.deckRevealDelay : 0,
          }}
          pointerEvents="none"
        >
          {drawnCard ? <CardArt card={drawnCard} width={width} height={height} /> : null}
        </MotiView>
      </Pressable>
    </MotiView>
  );
}
