import { View, StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop, Text as SvgText } from 'react-native-svg';
import type { Card } from '@game/types';
import { colors, suitColors, suitDeepColors } from '@ui/theme';
import SuitIcon from '@ui/svg/SuitIcon';

type Props = {
  card: Card;
  width: number;
  height: number;
};

function valueLabel(card: Card): string {
  if (typeof card.value === 'number') return String(card.value);
  return card.value;
}

export default function CardArt({ card, width, height }: Props) {
  const accent = suitColors[card.suit];
  const deep = suitDeepColors[card.suit];
  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height} viewBox="0 0 220 320">
        <Defs>
          <LinearGradient id="card-bg" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={colors.surfaceElevated} />
            <Stop offset="1" stopColor={colors.surface} />
          </LinearGradient>
          <LinearGradient id="card-accent" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={accent} stopOpacity={0.18} />
            <Stop offset="1" stopColor={deep} stopOpacity={0.02} />
          </LinearGradient>
        </Defs>
        <Rect
          x="4"
          y="4"
          rx="18"
          ry="18"
          width="212"
          height="312"
          fill="url(#card-bg)"
          stroke={colors.border}
          strokeWidth="2"
        />
        <Rect x="4" y="4" rx="18" ry="18" width="212" height="312" fill="url(#card-accent)" />
        <SvgText x="24" y="60" fill={accent} fontFamily="Fraunces_900Black" fontSize="48">
          {valueLabel(card)}
        </SvgText>
        <SvgText
          x="196"
          y="296"
          fill={accent}
          fontFamily="Fraunces_900Black"
          fontSize="48"
          textAnchor="end"
        >
          {valueLabel(card)}
        </SvgText>
      </Svg>
      <View style={styles.suitOverlay} pointerEvents="none">
        <SuitIcon suit={card.suit} size={Math.min(width, height) * 0.42} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  suitOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
