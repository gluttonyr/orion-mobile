import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';
import type { ChipTone } from './Chip';

interface StatTileProps {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
  tone?: ChipTone;
  style?: StyleProp<ViewStyle>;
}

const TONE_MAP: Record<ChipTone, string> = {
  neutral: Palette.neutral[600],
  primary: Palette.primary[500],
  secondary: Palette.secondary[600],
  success: Palette.success.base,
  warning: Palette.warning.base,
  danger: Palette.danger.base,
  info: Palette.info.base,
};

const TONE_BG_MAP: Record<ChipTone, string> = {
  neutral: Palette.neutral[100],
  primary: Palette.primary[50],
  secondary: Palette.secondary[50],
  success: Palette.success.bg,
  warning: Palette.warning.bg,
  danger: Palette.danger.bg,
  info: Palette.info.bg,
};

export function StatTile({ icon, value, label, tone = 'primary', style }: StatTileProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={[styles.iconBox, { backgroundColor: TONE_BG_MAP[tone] }]}>
        <Ionicons name={icon} size={18} color={TONE_MAP[tone]} />
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Palette.surface,
    borderRadius: Radius.lg,
    padding: Spacing.four,
    gap: 4,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  value: {
    fontSize: Typography.h2.fontSize,
    fontWeight: '800',
    color: Palette.text,
  },
  label: {
    fontSize: Typography.caption.fontSize,
    color: Palette.textSecondary,
  },
});
