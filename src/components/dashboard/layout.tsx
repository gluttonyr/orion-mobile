import {
  BarChart3,
  Briefcase,
  CreditCard,
  Home,
  LayoutGrid,
  LogOut,
  Menu,
  MessageCircle,
  Package,
  Store as StoreIcon,
  UserRound,
  Wallet,
  X,
} from 'lucide-react-native';
import { useState } from 'react';
import {
  Dimensions,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, spacing } from './theme';
import { photos, type Store, type DashboardScreen } from './shared';
import { useStore } from '@/features/seller/boutique-context';
import { uploadedImageUrl } from '@/features/redesign/mappers';
import { LiveAvatar } from '@/components/LiveAvatar';

type NavItem = {
  key: DashboardScreen;
  label: string;
  icon: typeof Home;
};

const navItems: NavItem[] = [
  { key: 'home', label: 'Tableau de bord', icon: Home },
  { key: 'stores', label: 'Mes boutiques', icon: StoreIcon },
  { key: 'products', label: 'Mes produits', icon: Package },
  { key: 'marketplace', label: 'Marketplace', icon: LayoutGrid },
  { key: 'wallet', label: 'Portefeuille', icon: Wallet },
  { key: 'withdrawal-methods', label: 'Moyens de retrait', icon: CreditCard },
  { key: 'analytics', label: 'Analyses', icon: BarChart3 },
  { key: 'opportunities', label: 'Opportunités', icon: Briefcase },
  { key: 'subscriptions', label: 'Abonnements', icon: CreditCard },
  { key: 'messages', label: 'Messages', icon: MessageCircle },
  { key: 'profile', label: 'Profil', icon: UserRound },
];

export function DashboardLayout({
  active,
  onNavigate,
  onExit,
  children,
}: {
  active: DashboardScreen;
  onNavigate: (screen: DashboardScreen) => void;
  onExit: () => void;
  children: React.ReactNode;
}) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const [menuOpen, setMenuOpen] = useState(false);
  const { stores } = useStore();
  const selectedStore = stores.find((store) => store.active) ?? stores[0];
  const activeStore: Store = selectedStore ? {
    id: String(selectedStore.id),
    name: selectedStore.nom,
    category: selectedStore.category ?? 'Boutique Orion',
    location: selectedStore.location ?? '',
    description: selectedStore.description ?? '',
    logo: uploadedImageUrl(selectedStore.logo) || photos.store1,
    active: Boolean(selectedStore.active),
    products: Number(selectedStore.nombreProduits ?? selectedStore.produits?.length ?? 0),
    sales: '—',
  } : {
    id: 'empty', name: 'Aucune boutique', category: 'Créez votre boutique', location: '', description: '',
    logo: photos.store1, active: false, products: 0, sales: '—',
  };

  const sidebar = (
    <SidebarContent
      active={active}
      onNavigate={(s) => {
        onNavigate(s);
        setMenuOpen(false);
      }}
      onExit={onExit}
      activeStore={activeStore}
    />
  );

  if (isDesktop) {
    return (
      <View style={styles.desktopShell}>
        <View style={styles.sidebar}>{sidebar}</View>
        <View style={styles.main}>
          <TopBar activeStore={activeStore} />
          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.mobileShell}>
      <View style={styles.mobileTopBar}>
        <Pressable style={styles.iconBtn} onPress={() => setMenuOpen(true)}>
          <Menu size={22} color={colors.ink} />
        </Pressable>
        <View style={styles.mobileStore}>
          <Image source={{ uri: activeStore.logo }} style={styles.mobileStoreLogo} />
          <View>
            <Text style={styles.mobileStoreName} numberOfLines={1}>{activeStore.name}</Text>
            <Text style={styles.mobileStoreCat}>{activeStore.category}</Text>
          </View>
        </View>
        <Pressable style={styles.iconBtn} onPress={onExit}>
          <LogOut size={20} color={colors.ink} />
        </Pressable>
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContentMobile} showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
      <Modal visible={menuOpen} transparent animationType="slide" onRequestClose={() => setMenuOpen(false)}>
        <View style={styles.overlay}>
          <Pressable style={styles.overlayBackdrop} onPress={() => setMenuOpen(false)} />
          <View style={styles.drawer}>
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>Menu</Text>
              <Pressable style={styles.iconBtn} onPress={() => setMenuOpen(false)}>
                <X size={20} color={colors.ink} />
              </Pressable>
            </View>
            {sidebar}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function SidebarContent({
  active,
  onNavigate,
  onExit,
  activeStore,
}: {
  active: DashboardScreen;
  onNavigate: (s: DashboardScreen) => void;
  onExit: () => void;
  activeStore: Store;
}) {
  return (
    <View style={styles.sidebarInner}>
      <View style={styles.sidebarHeader}>
        <View style={styles.logoWrap}>
          <Text style={styles.logoOro}>ORO</Text>
          <Text style={styles.logoOrion}>ORION</Text>
        </View>
        <Text style={styles.logoTagline}>Espace commerçant</Text>
      </View>

      <View style={styles.storeCard}>
        <Image source={{ uri: activeStore.logo }} style={styles.storeLogo} />
        <View style={styles.storeInfo}>
          <Text style={styles.storeName} numberOfLines={1}>{activeStore.name}</Text>
          <Text style={styles.storeMeta}>{activeStore.category} · {activeStore.location}</Text>
        </View>
        <View style={styles.activeDot} />
      </View>

      <ScrollView style={styles.navScroll} showsVerticalScrollIndicator={false}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.key;
          return (
            <Pressable
              key={item.key}
              style={[styles.navItem, isActive && styles.navItemActive]}
              onPress={() => onNavigate(item.key)}
            >
              <Icon size={20} color={isActive ? colors.burgundy : colors.muted} strokeWidth={isActive ? 2.4 : 1.8} />
              <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Pressable style={styles.logoutBtn} onPress={onExit}>
        <LogOut size={19} color={colors.muted} />
        <Text style={styles.logoutText}>Déconnexion</Text>
      </Pressable>
    </View>
  );
}

function TopBar({ activeStore }: { activeStore: Store }) {
  return (
    <View style={styles.topBar}>
      <View style={styles.topBarStore}>
        <Image source={{ uri: activeStore.logo }} style={styles.topBarLogo} />
        <View>
          <Text style={styles.topBarStoreName}>{activeStore.name}</Text>
          <Text style={styles.topBarStoreMeta}>Boutique active</Text>
        </View>
      </View>
      <View style={styles.topBarRight}>
        <Pressable style={styles.iconBtn}>
          <MessageCircle size={20} color={colors.ink} strokeWidth={1.8} />
          <View style={styles.badgeDot} />
        </Pressable>
        <Pressable style={styles.iconBtn}>
          <LiveAvatar size={36} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  desktopShell: { flex: 1, flexDirection: 'row', backgroundColor: colors.soft },
  sidebar: {
    width: 280,
    backgroundColor: colors.white,
    borderRightWidth: 1,
    borderRightColor: colors.line,
  },
  sidebarInner: { flex: 1, paddingTop: spacing.lg, paddingHorizontal: 16 },
  sidebarHeader: { paddingHorizontal: 8, marginBottom: spacing.md },
  logoWrap: { flexDirection: 'row', alignItems: 'baseline', gap: 5 },
  logoOro: { color: colors.burgundy, fontSize: 26, fontWeight: '800', letterSpacing: -2 },
  logoOrion: { color: colors.burgundy, fontSize: 8, fontWeight: '600', letterSpacing: 4 },
  logoTagline: { color: colors.muted, fontSize: 11, marginTop: 4, fontWeight: '600' },
  storeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.soft,
    borderRadius: radius.md,
    padding: 10,
    marginBottom: spacing.md,
  },
  storeLogo: { width: 36, height: 36, borderRadius: 10, marginRight: 10 },
  storeInfo: { flex: 1 },
  storeName: { color: colors.ink, fontSize: 13, fontWeight: '700' },
  storeMeta: { color: colors.muted, fontSize: 10, marginTop: 2 },
  activeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.green },
  navScroll: { flex: 1 },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderRadius: radius.md,
    marginBottom: 2,
  },
  navItemActive: { backgroundColor: colors.burgundySoft },
  navLabel: { color: colors.muted, fontSize: 13, fontWeight: '600' },
  navLabelActive: { color: colors.burgundy, fontWeight: '800' },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    marginTop: spacing.sm,
  },
  logoutText: { color: colors.muted, fontSize: 13, fontWeight: '600' },
  main: { flex: 1 },
  topBar: {
    height: 64,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 28,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  topBarStore: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  topBarLogo: { width: 36, height: 36, borderRadius: 10 },
  topBarStoreName: { color: colors.ink, fontSize: 14, fontWeight: '700' },
  topBarStoreMeta: { color: colors.muted, fontSize: 11, marginTop: 2 },
  topBarRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.soft,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badgeDot: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.burgundy,
    borderWidth: 1.5,
    borderColor: colors.white,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#243D4E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: 'white', fontWeight: '700', fontSize: 12 },
  scroll: { flex: 1 },
  scrollContent: { padding: 28, paddingBottom: 60 },
  mobileShell: { flex: 1, backgroundColor: colors.white },
  mobileTopBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  mobileStore: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, marginLeft: 8 },
  mobileStoreLogo: { width: 32, height: 32, borderRadius: 9 },
  mobileStoreName: { color: colors.ink, fontSize: 13, fontWeight: '700' },
  mobileStoreCat: { color: colors.muted, fontSize: 10, marginTop: 1 },
  scrollContentMobile: { padding: 16, paddingBottom: 60 },
  overlay: { flex: 1, flexDirection: 'row' },
  overlayBackdrop: { flex: 1, backgroundColor: colors.overlay },
  drawer: {
    width: 300,
    backgroundColor: colors.white,
    paddingTop: spacing.lg,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: spacing.md,
  },
  drawerTitle: { color: colors.ink, fontSize: 18, fontWeight: '800' },
});

