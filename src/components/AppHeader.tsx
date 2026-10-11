import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Palette, Radius, Shadows, Spacing, Typography } from '@/constants/theme';
import { useAuth } from '@/features/auth/hooks';
import { useCart } from '@/store/cart-store';
import { Avatar } from '@/components/ui/Avatar';
import { OrionLogo } from '@/components/OrionLogo';

type AppHeaderProps =
  | { variant: 'public'; showBack?: boolean }
  | { variant: 'authenticated'; title?: string; onNotification?: () => void }
  | {
      variant: 'back';
      title: string;
      subtitle?: string;
      onBack?: () => void;
      rightIcon?: keyof typeof Ionicons.glyphMap;
      onRight?: () => void;
    };

/** Single themeable header used across the app — replaces the former PublicHeader / AppHeader / ScreenHeader trio. */
export function AppHeader(props: AppHeaderProps) {
  const router = useRouter();

  if (props.variant === 'back') {
    const { title, subtitle, onBack, rightIcon, onRight } = props;
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.roundBtn} onPress={onBack ?? (() => router.back())} hitSlop={6}>
          <Ionicons name="arrow-back" size={20} color={Palette.primary[500]} />
        </TouchableOpacity>

        <View style={styles.center}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          {subtitle && <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>}
        </View>

        {rightIcon && onRight ? (
          <TouchableOpacity style={styles.roundBtn} onPress={onRight} hitSlop={6}>
            <Ionicons name={rightIcon} size={20} color={Palette.primary[500]} />
          </TouchableOpacity>
        ) : (
          <View style={styles.roundBtnPlaceholder} />
        )}
      </View>
    );
  }

  if (props.variant === 'authenticated') {
    const { title, onNotification } = props;
    const { user } = useAuth();
    const initials =
      (`${(user?.prenom ?? '')[0] ?? ''}${(user?.nom ?? '')[0] ?? ''}`.toUpperCase() || 'U');

    return (
      <View style={styles.container}>
        <View style={styles.logoRow}>
          <OrionLogo size={34} boxed={false} />
          <View>
            <Text style={styles.logoName}>ORION</Text>
            {title && <Text style={styles.pageTitle}>{title}</Text>}
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.roundBtn} onPress={onNotification} hitSlop={6}>
            <Ionicons name="notifications-outline" size={20} color={Palette.textSecondary} />
          </TouchableOpacity>
          <Avatar initials={initials} size={38} ring />
        </View>
      </View>
    );
  }

  const { showBack } = props;
  const { isAuthenticated, user } = useAuth();
  const { getTotalItems } = useCart();
  const initials = (`${(user?.prenom ?? '')[0] ?? ''}${(user?.nom ?? '')[0] ?? ''}`.toUpperCase() || 'U');
  const cartCount = getTotalItems();

  return (
    <View style={styles.container}>
      <View style={styles.logoRow}>
        {showBack && (
          <TouchableOpacity style={styles.roundBtn} onPress={() => router.back()} hitSlop={6}>
            <Ionicons name="arrow-back" size={18} color={Palette.primary[500]} />
          </TouchableOpacity>
        )}
        <OrionLogo size={34} boxed={false} />
        <View>
          <Text style={styles.logoName}>ORION</Text>
          <Text style={styles.pageTitle}>Marketplace africaine</Text>
        </View>
      </View>

      {/* Navigation between sections happens via the bottom tab bar — this header only ever holds cart + a single trailing action, so it can never overflow narrow screens. */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.roundBtn} onPress={() => router.push('/cart')} hitSlop={6}>
          <Ionicons name="bag-outline" size={19} color={Palette.textSecondary} />
          {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount > 9 ? '9+' : cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        {isAuthenticated ? (
          <TouchableOpacity onPress={() => router.push('/account')} hitSlop={6}>
            <Avatar initials={initials} size={38} ring />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.loginBtn} onPress={() => router.push('/login')}>
            <Ionicons name="log-in-outline" size={15} color={Palette.surface} />
            <Text style={styles.loginText}>Connexion</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Palette.surface,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    gap: Spacing.two,
    ...Shadows.sm,
  },
  center: {
    flex: 1,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoName: {
    fontSize: 15,
    fontWeight: '800',
    color: Palette.primary[500],
    letterSpacing: 1,
  },
  pageTitle: {
    fontSize: 11,
    color: Palette.textSecondary,
    fontWeight: '500',
    marginTop: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Palette.primary[500],
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: Radius.pill,
  },
  loginText: {
    color: Palette.surface,
    fontSize: 13,
    fontWeight: '700',
  },
  roundBtn: {
    width: 38,
    height: 38,
    borderRadius: Radius.pill,
    backgroundColor: Palette.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundBtnPlaceholder: {
    width: 38,
  },
  cartBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
    backgroundColor: Palette.secondary[500],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Palette.surface,
  },
  cartBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: Palette.surface,
  },
  title: {
    fontSize: Typography.h3.fontSize,
    fontWeight: '700',
    color: Palette.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: Palette.textSecondary,
    marginTop: 1,
    textAlign: 'center',
  },
});
