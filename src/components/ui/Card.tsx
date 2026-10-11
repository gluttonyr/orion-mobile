import { type ReactNode } from 'react';
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Palette, Radius, Shadows, Spacing } from '@/constants/theme';
import { AnimatedPressable } from './AnimatedPressable';

interface CardProps {
  children: ReactNode;
  onPress?: () => void;
  padded?: boolean;
  elevation?: 'sm' | 'md' | 'none';
  style?: StyleProp<ViewStyle>;
}

export function Card({ children, onPress, padded = true, elevation = 'sm', style }: CardProps) {
  const composedStyle = [
    styles.base,
    padded && styles.padded,
    elevation !== 'none' && Shadows[elevation],
    style,
  ];

  if (onPress) {
    return (
      <AnimatedPressable onPress={onPress} scaleTo={0.98} style={composedStyle}>
        {children}
      </AnimatedPressable>
    );
  }

  return <View style={composedStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: Palette.surface,
    borderRadius: Radius.lg,
  },
  padded: {
    padding: Spacing.four,
  },
});
