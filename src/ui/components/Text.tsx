import { Text as RNText, type TextProps, type StyleProp, type TextStyle } from 'react-native';
import { colors, typography, type TypographyVariant } from '@ui/theme';

type Props = TextProps & {
  variant?: TypographyVariant;
  color?: string;
  style?: StyleProp<TextStyle>;
};

export default function Text({
  variant = 'bodyMD',
  color = colors.text,
  style,
  children,
  ...rest
}: Props) {
  return (
    <RNText {...rest} style={[typography[variant], { color }, style]}>
      {children}
    </RNText>
  );
}
