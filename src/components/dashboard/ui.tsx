import { ChevronRight } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from './theme';
import { useThemeMode } from '@/store/theme-mode';

export function SectionHeader({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  const dark = useThemeMode().mode === 'dark';
  return (
    <View style={styles.row}>
      <Text style={[styles.title, dark && darkStyles.text]}>{title}</Text>
      {action ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={styles.action}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const color = statusColor(status);
  return (
    <View style={[styles.badge, { backgroundColor: color + '18' }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.badgeText, { color }]}>{status}</Text>
    </View>
  );
}

export function EmptyState({
  title,
  message,
  actionLabel,
  onAction,
}: {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const dark = useThemeMode().mode === 'dark';
  return (
    <View style={styles.empty}>
      <Text style={[styles.emptyTitle, dark && darkStyles.text]}>{title}</Text>
      <Text style={[styles.emptyMessage, dark && darkStyles.muted]}>{message}</Text>
      {actionLabel ? (
        <Pressable style={styles.emptyBtn} onPress={onAction}>
          <Text style={styles.emptyBtnText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function RowCard({
  icon,
  title,
  subtitle,
  right,
  onPress,
  rightLabel,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  rightLabel?: string;
}) {
  const dark = useThemeMode().mode === 'dark';
  return (
    <Pressable style={[styles.rowCard, dark && darkStyles.card]} onPress={onPress} disabled={!onPress}>
      <View style={styles.rowIcon}>{icon}</View>
      <View style={styles.rowBody}>
        <Text style={[styles.rowTitle, dark && darkStyles.text]} numberOfLines={1}>{title}</Text>
        {subtitle ? <Text style={[styles.rowSubtitle, dark && darkStyles.muted]} numberOfLines={1}>{subtitle}</Text> : null}
      </View>
      {right ? right : rightLabel ? <Text style={styles.rowRight}>{rightLabel}</Text> : null}
      {onPress ? <ChevronRight size={18} color={colors.muted} /> : null}
    </Pressable>
  );
}

function statusColor(status: string) {
  switch (status) {
    case 'Actif':
    case 'Disponible':
    case 'Ouverte':
      return colors.green;
    case 'Rupture':
    case 'Rupture de stock':
    case 'Fermée':
      return colors.error;
    case 'Brouillon':
      return colors.muted;
    default:
      return colors.muted;
  }
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    marginTop: spacing.xs,
  },
  title: { color: colors.ink, fontSize: 16, fontWeight: '700' },
  action: { color: colors.burgundy, fontSize: 12, fontWeight: '700' },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: 10, fontWeight: '700' },
  empty: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyTitle: { color: colors.ink, fontSize: 16, fontWeight: '700', marginBottom: 6 },
  emptyMessage: { color: colors.muted, fontSize: 13, textAlign: 'center', lineHeight: 20 },
  emptyBtn: {
    marginTop: 18,
    backgroundColor: colors.burgundy,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: radius.md,
  },
  emptyBtnText: { color: 'white', fontWeight: '700', fontSize: 13 },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.burgundySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowBody: { flex: 1 },
  rowTitle: { color: colors.ink, fontSize: 13, fontWeight: '700' },
  rowSubtitle: { color: colors.muted, fontSize: 11, marginTop: 3 },
  rowRight: { color: colors.ink, fontSize: 12, fontWeight: '700', marginRight: 8 },
});

const darkStyles = StyleSheet.create({
  card: { backgroundColor: '#1D1F26', borderColor: '#343640' },
  text: { color: '#F0EDF0' },
  muted: { color: '#B6B3BC' },
});
