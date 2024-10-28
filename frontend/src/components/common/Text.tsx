import {StyleSheet, Text as RNText, TextProps} from 'react-native';
import {typography, SizeVarient, WeightVarient} from '@theme/typography';
import {TextColorVariant, useColors} from 'src/hooks/useColors';

interface CustomTextProps extends TextProps {
  variant?: SizeVarient;
  color?: TextColorVariant;
  weight?: WeightVarient;
  align?: 'left' | 'right' | 'center';
  children: React.ReactNode;
}

export function Text({
  variant = 'body',
  color = 'main',
  weight = 'regular',
  align = 'left',
  style,
  children,
  ...props
}: CustomTextProps) {
  const themeColors = useColors();

  return (
    <RNText
      style={[
        {
          fontSize: typography.size[variant],
          color: themeColors.text[color],
          textAlign: align,
        },
        fontWeights[weight],
        style,
      ]}
      {...props}>
      {children}
    </RNText>
  );
}

const fontWeights = StyleSheet.create({
  regular: {
    fontFamily: typography.weight.regular,
  },
  medium: {
    fontFamily: typography.weight.medium,
  },
  bold: {
    fontFamily: typography.weight.bold,
  },
});
