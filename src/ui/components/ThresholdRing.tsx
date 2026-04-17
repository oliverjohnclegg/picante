import Svg, { Circle, G, Text as SvgText } from 'react-native-svg';
import { View } from 'react-native';
import { colors } from '@ui/theme';

type Props = {
  size?: number;
  progress: number;
  label: string;
  accent?: string;
  showProgressArc?: boolean;
};

export default function ThresholdRing({
  size = 96,
  progress,
  label,
  accent = colors.orange,
  showProgressArc = true,
}: Props) {
  const strokeWidth = Math.max(4, size * 0.08);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(1, progress));
  const dashOffset = circumference * (1 - clamped);
  const center = size / 2;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${center}, ${center}`}>
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={colors.border}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {showProgressArc ? (
            <Circle
              cx={center}
              cy={center}
              r={radius}
              stroke={accent}
              strokeWidth={strokeWidth}
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              fill="transparent"
            />
          ) : null}
        </G>
        <SvgText
          x={center}
          y={center}
          fill={colors.text}
          fontFamily="Fraunces_700Bold"
          fontSize={size * 0.28}
          textAnchor="middle"
          alignmentBaseline="central"
        >
          {label}
        </SvgText>
      </Svg>
    </View>
  );
}
