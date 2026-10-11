import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Palette, Radius } from '@/constants/theme';
import { AnimatedPressable } from './AnimatedPressable';

export type ChipTone = 'neutral' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';

interface ChipProps {
  label: string;
  tone?: ChipTone;
  selected?: boolean;
  onPress?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  size?: 'sm' | 'md';
  style?: StyleProp<ViewStyle>;
}

const TONE_MAP: Record<ChipTone, { bg: string; text: string }> = {
  neutral: { bg: Palette.neutral[100], text: Palette.textSecondary },
  primary: { bg: Palette.primary[50], text: Palette.primary[500] },
  secondary: { bg: Palette.secondary[50], text: Palette.secondary[700] },
  success: { bg: Palette.success.bg, text: Palette.success.text },
  warning: { bg: Palette.warning.bg, text: Palette.warning.text },
  danger: { bg: Palette.danger.bg, text: Palette.danger.text },
  info: { bg: Palette.info.bg, text: Palette.info.text },
};

/** Filter chip / status badge / tag — one component for all three, driven by `tone`. */
export function Chip({ label, tone = 'neutral', selected, onPress, icon, size = 'md', style }: ChipProps) {
  const { bg, text } = selected
    ? { bg: Palette.primary[500], text: Palette.surface }
    : TONE_MAP[tone];

  const content = (
    <View
      style={[
        styles.base,
        size === 'sm' && styles.sm,
        { backgroundColor: bg },
        style,
      ]}
    >
      {icon && <Ionicons name={icon} size={size === 'sm' ? 12 : 14} color={text} />}
      <Text style={[styles.label, size === 'sm' && styles.labelSm, { color: text }]}>{label}</Text>
    </View>
  );

  if (!onPress) return content;

  return (
    <AnimatedPressable onPress={onPress} scaleTo={0.95}>
      {content}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.pill,
    alignSelf: 'flex-start',
  },
  sm: {
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
  labelSm: {
    fontSize: 11,
  },
});
