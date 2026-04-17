import { View, StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Pattern, Rect, Stop } from 'react-native-svg';
import { MotiView } from 'moti';
import { colors, spacing } from '@ui/theme';
import Text from '@ui/components/Text';
import { strings } from '@i18n/en';

type Props = {
  width: number;
  height: number;
};

export default function DeckCard({ width, height }: Props) {
  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height} viewBox="0 0 220 320">
        <Defs>
          <LinearGradient id="deck-bg" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#1A0F0A" />
            <Stop offset="1" stopColor="#0F0906" />
          </LinearGradient>
          <LinearGradient id="deck-border" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={colors.orange} />
            <Stop offset="0.5" stopColor={colors.yellow} />
            <Stop offset="1" stopColor={colors.orange} />
          </LinearGradient>
          <Pattern id="deck-hatch" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
            <Rect width="16" height="16" fill="transparent" />
            <Rect x="0" y="0" width="1" height="16" fill={colors.orange} opacity="0.06" />
            <Rect x="8" y="0" width="1" height="16" fill={colors.yellow} opacity="0.05" />
          </Pattern>
        </Defs>
        <Rect
          x="4"
          y="4"
          rx="18"
          ry="18"
          width="212"
          height="312"
          fill="url(#deck-bg)"
          stroke="url(#deck-border)"
          strokeWidth="3"
        />
        <Rect x="4" y="4" rx="18" ry="18" width="212" height="312" fill="url(#deck-hatch)" />
        <Rect
          x="24"
          y="24"
          rx="10"
          ry="10"
          width="172"
          height="272"
          fill="none"
          stroke={colors.orange}
          strokeWidth="1"
          opacity="0.35"
        />
      </Svg>
      <View style={styles.overlay} pointerEvents="none">
        <View style={styles.tapLabelWrap}>
          <MotiView
            from={{ scale: 1 }}
            animate={{ scale: 1.04 }}
            transition={{
              type: 'timing',
              duration: 1400,
              loop: true,
              repeatReverse: true,
            }}
          >
            <Text
              variant="displayMD"
              color={colors.orange}
              numberOfLines={2}
              adjustsFontSizeToFit
              minimumFontScale={0.65}
              style={styles.tapLabel}
            >
              {strings.draw.tapToDraw}
            </Text>
          </MotiView>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tapLabelWrap: {
    width: '100%',
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tapLabel: {
    width: '100%',
    letterSpacing: 1,
    textAlign: 'center',
  },
});
