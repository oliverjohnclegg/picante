import { View, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { Easing } from 'react-native-reanimated';
import { colors } from '@ui/theme';

type Props = {
  pressing: boolean;
  width: number;
  height: number;
  holdDurationMs: number;
  borderRadius?: number;
};

export default function DeckHoldOverlay({
  pressing,
  width,
  height,
  holdDurationMs,
  borderRadius = 18,
}: Props) {
  return (
    <View pointerEvents="none" style={[styles.clip, { width, height, borderRadius }]}>
      <MotiView
        animate={{ height: pressing ? height : 0 }}
        transition={{
          type: 'timing',
          duration: pressing ? holdDurationMs : 140,
          easing: pressing ? Easing.linear : Easing.out(Easing.quad),
        }}
        style={styles.fill}
      />
      <MotiView
        animate={{ opacity: pressing ? 1 : 0 }}
        transition={{ type: 'timing', duration: pressing ? 160 : 220 }}
        style={[styles.ring, { borderRadius }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  clip: {
    position: 'absolute',
    left: 0,
    top: 0,
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    backgroundColor: `${colors.yellow}40`,
  },
  ring: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 2,
    borderColor: colors.yellow,
  },
});
