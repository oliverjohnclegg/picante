import Svg, { Path } from 'react-native-svg';
import type { Suit } from '@game/types';
import { suitColors } from '@ui/theme';

type Props = {
  suit: Suit;
  size?: number;
  color?: string;
};

const PATHS: Record<Suit, string> = {
  hearts:
    'M50 82 C 18 58, 8 38, 18 22 C 28 10, 44 14, 50 28 C 56 14, 72 10, 82 22 C 92 38, 82 58, 50 82 Z',
  diamonds: 'M50 10 L 88 50 L 50 90 L 12 50 Z',
  spades:
    'M50 10 C 80 38, 92 58, 80 72 C 68 84, 56 76, 54 68 L 60 88 L 40 88 L 46 68 C 44 76, 32 84, 20 72 C 8 58, 20 38, 50 10 Z',
  clubs:
    'M50 12 A 18 18 0 1 1 49 48 A 18 18 0 1 1 30 64 A 18 18 0 1 1 51 64 A 18 18 0 1 1 50 48 Z M 45 58 L 42 88 L 58 88 L 55 58 Z',
};

export default function SuitIcon({ suit, size = 48, color }: Props) {
  const fill = color ?? suitColors[suit];
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Path d={PATHS[suit]} fill={fill} />
    </Svg>
  );
}
