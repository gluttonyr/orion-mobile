import { ActivityIndicator, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Palette, Radius, Spacing } from '@/constants/theme';
import { AnimatedPressable } from './AnimatedPressable';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
}

const SIZE_MAP: Record<ButtonSize, { paddingVertical: number; paddingHorizontal: number; fontSize: number; iconSize: number }> = {
  sm: { paddingVertical: 10, paddingHorizontal: Spacing.four, fontSize: 13, iconSize: 15 },
  md: { paddingVertical: 14, paddingHorizontal: Spacing.six, fontSize: 14, iconSize: 17 },
  lg: { paddingVertical: 17, paddingHorizontal: Spacing.seven, fontSize: 15, iconSize: 18 },
};

const VARIANT_MAP: Record<ButtonVariant, { container: ViewStyle; textColor: string }> = {
  primary: { container: { backgroundColor: Palette.primary[500] }, textColor: Palette.surface },
  secondary: { container: { backgroundColor: Palette.secondary[500] }, textColor: Palette.surface },
  outline: {
    container: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: Palette.primary[500] },
    textColor: Palette.primary[500],
  },
  ghost: { container: { backgroundColor: Palette.primary[50] }, textColor: Palette.primary[500] },
  danger: { container: { backgroundColor: Palette.danger.base }, textColor: Palette.surface },
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  disabled,
  loading,
  fullWidth,
  style,
}: ButtonProps) {
  const sizeTokens = SIZE_MAP[size];
  const { container, textColor } = VARIANT_MAP[variant];

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.base,
        { paddingVertical: sizeTokens.paddingVertical, paddingHorizontal: sizeTokens.paddingHorizontal },
        container,
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <>
          {icon && iconPosition === 'left' && <Ionicons name={icon} size={sizeTokens.iconSize} color={textColor} />}
          <Text style={[styles.label, { fontSize: sizeTokens.fontSize, color: textColor }]}>{title}</Text>
          {icon && iconPosition === 'right' && <Ionicons name={icon} size={sizeTokens.iconSize} color={textColor} />}
        </>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: Radius.pill,
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  label: {
    fontWeight: '700',
  },
});
