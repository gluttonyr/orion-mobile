import { type ReactNode } from 'react';
import { Image, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Palette, Radius, Shadows, Spacing, Typography } from '@/constants/theme';
import { AnimatedPressable } from './AnimatedPressable';
import { Chip, type ChipTone } from './Chip';
import { PriceTag } from './PriceTag';

interface ProductCardProps {
  imageUri: string;
  title: string;
  category?: string;
  price: number;
  badge?: { label: string; tone?: ChipTone };
  onPress?: () => void;
  onAddToCart?: () => void;
  addToCartDone?: boolean;
  /** Custom footer, overrides the default price + add-to-cart row (used by seller listings). */
  footer?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function ProductCard({
  imageUri,
  title,
  category,
  price,
  badge,
  onPress,
  onAddToCart,
  addToCartDone,
  footer,
  style,
}: ProductCardProps) {
  return (
    <AnimatedPressable onPress={onPress} scaleTo={0.98} style={[styles.card, style]}>
      <View style={styles.imageWrap}>
        <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
        {badge && (
          <Chip label={badge.label} tone={badge.tone ?? 'primary'} size="sm" style={styles.badge} />
        )}
      </View>

      <View style={styles.info}>
        {category && <Text style={styles.category}>{category}</Text>}
        <Text style={styles.title} numberOfLines={2}>{title}</Text>

        {footer ?? (
          <View style={styles.defaultFooter}>
            <PriceTag amount={price} size="sm" />
            {onAddToCart && (
              <AnimatedPressable onPress={onAddToCart} scaleTo={0.9} style={styles.addBtn}>
                <Ionicons name={addToCartDone ? 'checkmark' : 'add'} size={18} color={Palette.surface} />
              </AnimatedPressable>
            )}
          </View>
        )}
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Palette.surface,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  imageWrap: {
    position: 'relative',
  },
  image: {
    width: '100%',
    aspectRatio: 1.1,
    backgroundColor: Palette.neutral[100],
  },
  badge: {
    position: 'absolute',
    top: 10,
    left: 10,
  },
  info: {
    padding: Spacing.three,
    gap: 4,
  },
  category: {
    fontSize: Typography.caption.fontSize,
    fontWeight: '600',
    color: Palette.primary[500],
  },
  title: {
    fontSize: Typography.bodySmall.fontSize,
    fontWeight: '600',
    color: Palette.text,
    lineHeight: 18,
    minHeight: 36,
  },
  defaultFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: Radius.pill,
    backgroundColor: Palette.secondary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
});
