import { View } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Text } from 'react-native-svg';
import { colors } from '@ui/theme';

type Props = {
  size?: number;
  align?: 'center' | 'start';
};

export default function Wordmark({ size = 72, align = 'center' }: Props) {
  const height = size;
  const width = size * 4.3;
  return (
    <View style={{ alignSelf: align === 'start' ? 'flex-start' : 'center' }}>
      <Svg width={width} height={height} viewBox="0 0 430 100">
        <Defs>
          <LinearGradient id="picante-grad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={colors.orange} />
            <Stop offset="0.5" stopColor={colors.yellow} />
            <Stop offset="1" stopColor={colors.purple} />
          </LinearGradient>
        </Defs>
        <Text
          x={align === 'start' ? 2 : 215}
          y="76"
          textAnchor={align === 'start' ? 'start' : 'middle'}
          fill="url(#picante-grad)"
          fontFamily="Fraunces_900Black"
          fontSize="88"
          letterSpacing="-3"
        >
          Picante
        </Text>
      </Svg>
    </View>
  );
}
