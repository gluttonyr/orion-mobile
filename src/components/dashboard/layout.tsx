import {
  BarChart3,
  Bell,
  Briefcase,
  CreditCard,
  Home,
  LayoutGrid,
  LogOut,
  Menu,
  MessageCircle,
  Package,
  ShoppingCart,
  Store as StoreIcon,
  UserRound,
  Wallet,
  Settings2,
  Tags,
  X,
} from 'lucide-react-native';
import { useState } from 'react';
import { useEffect } from 'react';
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
import { useAuth } from '@/features/auth/hooks';
import { uploadedImageUrl } from '@/features/redesign/mappers';
import { LiveAvatar } from '@/components/LiveAvatar';
import { notificationsService, type OrionNotification } from '@/features/orders/api';
import { ThemeModeButton, useThemeMode } from '@/store/theme-mode';

type NavItem = {
  key: DashboardScreen;
  label: string;
  icon: typeof Home;
};

const navItems: NavItem[] = [
  { key: 'home', label: 'Tableau de bord', icon: Home },
  { key: 'stores', label: 'Mes boutiques', icon: StoreIcon },
  { key: 'products', label: 'Mes produits', icon: Package },
  { key: 'orders', label: 'Commandes reçues', icon: ShoppingCart },
  { key: 'marketplace', label: 'Marketplace', icon: LayoutGrid },
  { key: 'wallet', label: 'Portefeuille', icon: Wallet },
  { key: 'withdrawal-methods', label: 'Moyens de retrait', icon: CreditCard },
  { key: 'analytics', label: 'Analyses', icon: BarChart3 },
  { key: 'opportunities', label: 'Opportunités', icon: Briefcase },
  { key: 'subscriptions', label: 'Abonnements', icon: CreditCard },
  { key: 'messages', label: 'Messages', icon: MessageCircle },
  { key: 'profile', label: 'Profil', icon: UserRound },
];
const clientNavItems: NavItem[] = [
  { key: 'home', label: 'Mon espace', icon: Home },
  { key: 'applications', label: 'Mes candidatures', icon: Briefcase },
  { key: 'orders', label: 'Mes commandes', icon: Package },
  { key: 'messages', label: 'Messages', icon: MessageCircle },
  { key: 'profile', label: 'Profil', icon: UserRound },
];
const adminNavItems: NavItem[] = [
  { key: 'admin-users', label: 'Utilisateurs', icon: UserRound },
  { key: 'admin-orders', label: 'Commandes', icon: ShoppingCart },
  { key: 'admin-wallet', label: 'Portefeuille plateforme', icon: Wallet },
  { key: 'admin-settings', label: 'Réglages du site', icon: Settings2 },
  { key: 'admin-store-categories', label: 'Catégories boutique', icon: Tags },
];

export function DashboardLayout({
  active,
  onNavigate,
  onHome,
  onExit,
  children,
}: {
  active: DashboardScreen;
  onNavigate: (screen: DashboardScreen) => void;
  onHome: () => void;
  onExit: () => void;
  children: React.ReactNode;
}) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const [menuOpen, setMenuOpen] = useState(false);
  const { mode } = useThemeMode();
  const dark = mode === 'dark';
  const { user, isSeller } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
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
      onHome={() => { onHome(); setMenuOpen(false); }}
      activeStore={activeStore}
      isSeller={isSeller}
      isAdmin={isAdmin}
    />
  );

  if (isDesktop) {
    return (
      <View style={[styles.desktopShell, dark && darkStyles.canvas]}>
        <View style={[styles.sidebar, dark && darkStyles.surface]}>{sidebar}</View>
        <View style={[styles.main, dark && darkStyles.canvas]}>
          <TopBar activeStore={activeStore} isSeller={isSeller} isAdmin={isAdmin} displayName={[user?.prenom, user?.nom].filter(Boolean).join(' ') || user?.email || 'Mon espace'} onNavigate={onNavigate} />
          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.mobileShell}>
      <View style={[styles.mobileTopBar, dark && darkStyles.surface]}>
        <Pressable style={[styles.iconBtn, dark && darkStyles.control]} onPress={() => setMenuOpen(true)}>
          <Menu size={22} color={dark ? '#F1EDF0' : colors.ink} />
        </Pressable>
        <View style={styles.mobileStore}>
          {isSeller ? <Image source={{ uri: activeStore.logo }} style={styles.mobileStoreLogo} /> : null}
          <View>
            <Text style={[styles.mobileStoreName, dark && darkStyles.text]} numberOfLines={1}>{isSeller ? activeStore.name : 'Mon espace personnel'}</Text>
            <Text style={[styles.mobileStoreCat, dark && darkStyles.mutedText]}>{isSeller ? activeStore.category : 'Bienvenue sur ORION'}</Text>
          </View>
        </View>
        <NotificationBell isSeller={isSeller} onOpenOrders={() => onNavigate(isAdmin ? 'admin-orders' : 'orders')} />
        <ThemeModeButton />
        <Pressable style={styles.iconBtn} onPress={onExit}>
          <LogOut size={20} color={dark ? '#F1EDF0' : colors.ink} />
        </Pressable>
      </View>
      <ScrollView style={[styles.scroll, dark && darkStyles.canvas]} contentContainerStyle={styles.scrollContentMobile} showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
      <Modal visible={menuOpen} transparent animationType="slide" onRequestClose={() => setMenuOpen(false)}>
        <View style={styles.overlay}>
          <Pressable style={styles.overlayBackdrop} onPress={() => setMenuOpen(false)} />
          <View style={[styles.drawer, dark && darkStyles.surface]}>
            <View style={styles.drawerHeader}>
              <Text style={[styles.drawerTitle, dark && darkStyles.text]}>Menu</Text>
              <Pressable style={[styles.iconBtn, dark && darkStyles.control]} onPress={() => setMenuOpen(false)}>
                <X size={20} color={dark ? '#E8E6E2' : colors.ink} />
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
  onHome,
  activeStore,
  isSeller,
  isAdmin,
}: {
  active: DashboardScreen;
  onNavigate: (s: DashboardScreen) => void;
  onExit: () => void;
  onHome: () => void;
  activeStore: Store;
  isSeller: boolean;
  isAdmin: boolean;
}) {
  const { mode } = useThemeMode();
  const dark = mode === 'dark';
  const visibleNavItems = isAdmin ? adminNavItems : isSeller ? navItems : clientNavItems;
  return (
    <View style={styles.sidebarInner}>
      <View style={styles.sidebarHeader}>
        <Pressable style={styles.logoWrap} onPress={onHome} accessibilityRole="button" accessibilityLabel="Retour à l’accueil Orion">
          <Text style={styles.logoOro}>ORO</Text>
          <Text style={styles.logoOrion}>ORION</Text>
        </Pressable>
        <Text style={[styles.logoTagline, dark && darkStyles.mutedText]}>{isAdmin ? 'Administration' : isSeller ? 'Espace commerçant' : 'Espace personnel'}</Text>
      </View>

      {isSeller ? <View style={[styles.storeCard, dark && darkStyles.control]}>
        <Image source={{ uri: activeStore.logo }} style={styles.storeLogo} />
        <View style={styles.storeInfo}>
          <Text style={[styles.storeName, dark && darkStyles.text]} numberOfLines={1}>{activeStore.name}</Text>
          <Text style={[styles.storeMeta, dark && darkStyles.mutedText]}>{activeStore.category} · {activeStore.location}</Text>
        </View>
        <View style={styles.activeDot} />
      </View> : null}

      <ScrollView style={styles.navScroll} showsVerticalScrollIndicator={false}>
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.key;
          return (
            <Pressable
              key={item.key}
              style={[styles.navItem, isActive && styles.navItemActive]}
              onPress={() => onNavigate(item.key)}
            >
              <Icon size={20} color={isActive ? colors.burgundy : dark ? '#B6B3BC' : colors.muted} strokeWidth={isActive ? 2.4 : 1.8} />
              <Text style={[styles.navLabel, dark && darkStyles.text, isActive && styles.navLabelActive, dark && isActive && darkStyles.activeLabel]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Pressable style={styles.logoutBtn} onPress={onExit}>
        <LogOut size={19} color={dark ? '#B6B3BC' : colors.muted} />
        <Text style={[styles.logoutText, dark && darkStyles.mutedText]}>Déconnexion</Text>
      </Pressable>
    </View>
  );
}

function TopBar({ activeStore, isSeller, isAdmin, displayName, onNavigate }: { activeStore: Store; isSeller: boolean; isAdmin: boolean; displayName: string; onNavigate: (screen: DashboardScreen) => void }) {
  const { mode } = useThemeMode();
  const dark = mode === 'dark';
  return (
    <View style={[styles.topBar, dark && darkStyles.surface]}>
      <View style={styles.topBarStore}>
        {isSeller ? <Image source={{ uri: activeStore.logo }} style={styles.topBarLogo} /> : null}
        <View>
          <Text style={[styles.topBarStoreName, dark && darkStyles.text]}>{isSeller ? activeStore.name : displayName}</Text>
          <Text style={[styles.topBarStoreMeta, dark && darkStyles.mutedText]}>{isAdmin ? 'Administration Orion' : isSeller ? 'Boutique active' : 'Espace personnel'}</Text>
        </View>
      </View>
      <View style={styles.topBarRight}>
        <Pressable style={[styles.iconBtn, dark && darkStyles.control]} onPress={() => onNavigate(isAdmin ? 'admin-users' : 'messages')} accessibilityRole="button" accessibilityLabel={isAdmin ? 'Ouvrir les utilisateurs' : 'Ouvrir les messages'}>
          <MessageCircle size={20} color={dark ? '#E8E6E2' : colors.ink} strokeWidth={1.8} />
        </Pressable>
        <NotificationBell isSeller={isSeller} onOpenOrders={() => onNavigate(isAdmin ? 'admin-orders' : 'orders')} />
        <ThemeModeButton />
        <Pressable style={[styles.iconBtn, dark && darkStyles.control]}>
          <LiveAvatar size={36} />
        </Pressable>
      </View>
    </View>
  );
}

function NotificationBell({ isSeller, onOpenOrders }: { isSeller: boolean; onOpenOrders: () => void }) {
  const { mode } = useThemeMode();
  const dark = mode === 'dark';
  const [visible, setVisible] = useState(false);
  const [items, setItems] = useState<OrionNotification[]>([]);
  const [unread, setUnread] = useState(0);
  useEffect(() => {
    let mounted = true;
    const refresh = async () => {
      try {
        const result = await notificationsService.getAll();
        if (mounted) {
          setItems(result.items);
          setUnread(result.unreadCount);
        }
      } catch {
        if (mounted) { setItems([]); setUnread(0); }
      }
    };
    void refresh();
    const timer = setInterval(() => void refresh(), 30000);
    return () => { mounted = false; clearInterval(timer); };
  }, [isSeller]);
  const markAllRead = async () => {
    try { const result = await notificationsService.markAllRead(); setItems(result.items); setUnread(result.unreadCount); } catch { /* Le prochain rafraîchissement relira le backend. */ }
  };
  const openItem = async (item: OrionNotification) => {
    if (!item.readAt) {
      try { const result = await notificationsService.markRead(item.id); setItems(result.items); setUnread(result.unreadCount); } catch { /* L’écran des commandes reste accessible. */ }
    }
    setVisible(false);
    onOpenOrders();
  };
  return <>
    <Pressable style={[styles.iconBtn, dark && darkStyles.control]} onPress={() => setVisible(true)} accessibilityRole="button" accessibilityLabel={`Notifications${unread ? `, ${unread} non lues` : ''}`}>
      <Bell size={20} color={dark ? '#E8E6E2' : colors.ink} strokeWidth={1.8} />{unread ? <View style={styles.badgeDot} /> : null}
    </Pressable>
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
      <View style={styles.notificationOverlay}><Pressable style={styles.notificationBackdrop} onPress={() => setVisible(false)} /><View style={[styles.notificationSheet, dark && darkStyles.surface]}>
        <View style={[styles.notificationHeader, dark && darkStyles.surface]}><Text style={[styles.notificationTitle, dark && darkStyles.text]}>Notifications{unread ? ` (${unread})` : ''}</Text><Pressable onPress={() => void markAllRead()} disabled={!unread}><Text style={[styles.notificationReadAll, !unread && styles.notificationReadDisabled]}>Tout lire</Text></Pressable></View>
        <ScrollView>{items.length ? items.map((item) => <Pressable key={item.id} style={[styles.notificationRow, item.readAt && styles.notificationRowRead, dark && darkStyles.control]} onPress={() => void openItem(item)}><View style={styles.notificationIcon}><Package size={16} color={colors.burgundy} /></View><View style={styles.notificationCopy}><Text style={[styles.notificationItemTitle, dark && darkStyles.text]}>{item.title}</Text><Text style={[styles.notificationMessage, dark && darkStyles.mutedText]}>{item.message}</Text><Text style={[styles.notificationDate, dark && darkStyles.mutedText]}>{item.createdAt ? new Date(item.createdAt).toLocaleString('fr-FR') : 'Récemment'}</Text></View></Pressable>) : <Text style={[styles.notificationEmpty, dark && darkStyles.mutedText]}>Aucune notification pour le moment.</Text>}</ScrollView>
      </View></View>
    </Modal>
  </>;
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
  notificationOverlay: { flex: 1, justifyContent: 'flex-start', alignItems: 'flex-end', paddingTop: 80, paddingHorizontal: 18, backgroundColor: 'rgba(24,16,16,0.28)' },
  notificationBackdrop: { ...StyleSheet.absoluteFill },
  notificationSheet: { width: 350, maxWidth: '100%', maxHeight: '72%', backgroundColor: colors.white, borderRadius: 16, overflow: 'hidden', elevation: 8 },
  notificationHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.line },
  notificationTitle: { color: colors.ink, fontSize: 15, fontWeight: '800' },
  notificationReadAll: { color: colors.burgundy, fontSize: 12, fontWeight: '700' },
  notificationReadDisabled: { color: colors.muted },
  notificationRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingHorizontal: 15, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: colors.line, backgroundColor: '#FFF9F7' },
  notificationRowRead: { backgroundColor: colors.white },
  notificationIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: colors.burgundySoft, alignItems: 'center', justifyContent: 'center' },
  notificationCopy: { flex: 1, gap: 3 },
  notificationItemTitle: { color: colors.ink, fontSize: 12, fontWeight: '800' },
  notificationMessage: { color: colors.muted, fontSize: 11 },
  notificationDate: { color: '#A69A92', fontSize: 10, marginTop: 2 },
  notificationEmpty: { color: colors.muted, fontSize: 12, textAlign: 'center', padding: 26 },
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

const darkStyles = StyleSheet.create({
  canvas: { backgroundColor: '#15161B' },
  surface: { backgroundColor: '#1D1F26', borderColor: '#343640', borderRightColor: '#343640', borderBottomColor: '#343640' },
  control: { backgroundColor: '#30313A', borderColor: '#41434D' },
  text: { color: '#E8E6E2' },
  mutedText: { color: '#B6B3BC' },
  activeLabel: { color: '#F0A9BD' },
});

