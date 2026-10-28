import { LinearGradient } from 'expo-linear-gradient';
import {
  Bell,
  ArrowRight,
  ChevronRight,
  CirclePlay,
  Heart,
  Home,
  LayoutGrid,
  MessageCircle,
  Package,
  Plus,
  Radio,
  Search,
  ShoppingBag,
  Sparkles,
  Store,
  ShieldCheck,
  Truck,
  UserRound,
  Video,
  X,
} from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DashboardLayout } from '@/components/dashboard/layout';
import { DashboardHome } from '@/components/dashboard/screens/home';
import { StoresScreen } from '@/components/dashboard/screens/stores';
import { ProductsScreen } from '@/components/dashboard/screens/products';
import { SellerOrdersScreen, WalletScreen } from '@/components/dashboard/screens/wallet';
import { WithdrawalMethodsScreen } from '@/components/dashboard/screens/withdrawal';
import { OpportunitiesScreen } from '@/components/dashboard/screens/opportunities';
import { AnalyticsScreen } from '@/components/dashboard/screens/analytics';
import { MessagesScreen } from '@/components/dashboard/screens/messages';
import { ProfileScreen as DashboardProfile } from '@/components/dashboard/screens/profile';
import { ClientApplicationsScreen, ClientDashboardHome, ClientOrdersScreen } from '@/components/dashboard/screens/client';
import { SubscriptionsScreen } from '@/components/dashboard/screens/subscriptions';
import { AdminScreen } from '@/components/dashboard/screens/admin';
import { MarketplaceScreen as DashboardMarketplace } from '@/components/dashboard/screens/marketplace';
import type { DashboardScreen } from '@/components/dashboard/shared';
import { useAuth } from '@/features/auth/hooks';
import { useProducts } from '@/features/products/hooks';
import { useOpportunities } from '@/features/opportunities/hooks';
import { useCart } from '@/store/cart-store';
import { StoreProvider } from '@/features/seller/boutique-context';
import { WalletProvider } from '@/features/seller/wallet-context';
import { SubscriptionProvider } from '@/features/seller/subscription-context';
import { formatFcfa, toDesignOpportunity, toDesignProduct, uploadedImageUrl } from '@/features/redesign/mappers';
import { createApi } from '@/service/api.config';
import { useConversations } from '@/features/messages/hooks';
import { ShortComposer, ShortsFeed } from '@/features/shorts/ShortsMobile';

const publicSiteSettingsApi = createApi('site-settings');
type PublicSiteImages = { heroImages: string[]; carouselImages: string[] };
import { LiveCenterScreen } from '@/features/live/LiveCenterScreen';
import type { ImagePickerAsset } from 'expo-image-picker';
import { LiveAvatar } from '@/components/LiveAvatar';
import { getSellingProductPrice } from '@/features/products/pricing';
import { ThemeModeButton, useThemeMode } from '@/store/theme-mode';
import { useToast } from '@/store/toast-store';

const colors = {
  ink: '#241C1C',
  muted: '#766D67',
  soft: '#F7F1E9',
  line: '#E8DED2',
  burgundy: '#74122E',
  burgundyDark: '#580D27',
  burgundySoft: '#F6E7E7',
  green: '#147A57',
  gold: '#C88728',
  navy: '#07121E',
};

const photos = {
  shoes: 'https://images.pexels.com/photos/36463718/pexels-photo-36463718.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
};

type Tab = 'home' | 'marketplace' | 'shorts' | 'live' | 'profile';

function Logo({ light = false }: { light?: boolean }) {
  return (
    <View style={styles.logoWrap}>
      <Text style={[styles.logoOro, light && styles.logoLight]}>ORO</Text>
      <Text style={[styles.logoOrion, light && styles.logoLight]}>ORION</Text>
    </View>
  );
}

function Header({ onSearch, onNotifications, onOpenProfile }: { onSearch: () => void; onNotifications: () => void; onOpenProfile: () => void }) {
  return (
    <View style={styles.header}>
      <Logo />
      <View style={styles.headerActions}>
        <ThemeModeButton />
        <Pressable style={styles.iconButton} onPress={onSearch}>
          <Search size={20} color={colors.ink} strokeWidth={1.8} />
        </Pressable>
        <Pressable style={styles.iconButton} onPress={onNotifications}>
          <Bell size={20} color={colors.ink} strokeWidth={1.8} />
          <View style={styles.notificationDot} />
        </Pressable>
        <LiveAvatar size={36} onOfflinePress={onOpenProfile} />
      </View>
    </View>
  );
}

function SectionTitle({ title, action, onPress }: { title: string; action?: string; onPress?: () => void }) {
  return (
    <View style={styles.sectionTitle}>
      <Text style={styles.sectionHeading}>{title}</Text>
      {action ? <Pressable onPress={onPress}><Text style={styles.sectionAction}>{action}</Text></Pressable> : null}
    </View>
  );
}

function HomeScreen({ onTab, displayName, isSeller, onOpenProfile, onOpenOpportunities, onViewOpportunity, onOpenMessages, onOpenWallet }: { onTab: (tab: Tab) => void; displayName: string; isSeller: boolean; onOpenProfile: () => void; onOpenOpportunities: () => void; onViewOpportunity: (id: string) => void; onOpenMessages: () => void; onOpenWallet: () => void }) {
  const router = useRouter();
  const { showToast } = useToast();
  const { addToCart } = useCart();
  const { products: apiProducts, loading: productsLoading, error: productsError } = useProducts();
  const { opportunities: apiOpportunities, loading } = useOpportunities();
  const { conversations, loading: conversationsLoading } = useConversations();
  const [siteImages, setSiteImages] = useState<PublicSiteImages>({ heroImages: [], carouselImages: [] });
  const opportunities = apiOpportunities.map(toDesignOpportunity);
  const products = apiProducts.map(toDesignProduct);
  const categories = Array.from(new Set(products.map((product) => product.category).filter(Boolean))).slice(0, 8);
  const heroProduct = products[0];
  useEffect(() => { let mounted = true; publicSiteSettingsApi.get<PublicSiteImages>('/').then(({ data }) => { if (mounted) setSiteImages(data); }).catch(() => undefined); return () => { mounted = false; }; }, []);
  const addProductToCart = (id: string) => {
    const product = products.find((item) => item.id === id);
    const record = apiProducts.find((item) => String(item.id) === id);
    if (!product || !record) return;
    addToCart({ id: product.id, name: product.name, price: getSellingProductPrice(record), image: product.image, seller: 'Orion' });
    showToast(`${product.name} a été ajouté au panier.`);
  };
  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <Header onSearch={() => onTab('marketplace')} onNotifications={() => Alert.alert('Notifications', 'Aucune notification pour le moment.')} onOpenProfile={onOpenProfile} />
      <LinearGradient colors={['#801432', '#610D2A', '#4F0B24']} style={styles.storefrontHero}>
        <View pointerEvents="none" style={styles.heroOrnament}><View style={styles.heroOrnamentOuter}><View style={styles.heroOrnamentInner} /></View><View style={styles.heroOrnamentDot} /></View>
        <Text style={styles.heroEyebrow}>PRODUITS AFRICAINS · TALENTS LOCAUX</Text>
        <Text style={styles.heroTitle}>Tout ce qu’il vous faut, au même endroit.</Text>
        <Text style={styles.heroSubtitle}>Bonjour {displayName.split(/\s+/)[0]}, découvrez les boutiques et les opportunités qui font avancer l’Afrique.</Text>
        {siteImages.heroImages.length >= 3 ? <View style={styles.heroAdminImages}>{siteImages.heroImages.slice(0, 3).map((image, index) => <Image key={`${image}-${index}`} source={{ uri: uploadedImageUrl(image) }} style={[styles.heroAdminImage, index === 0 ? styles.heroAdminImageMain : index === 1 ? styles.heroAdminImageLeft : styles.heroAdminImageRight]} />)}</View> : heroProduct ? <Pressable style={styles.heroProductVisual} onPress={() => router.push(`/(client)/product/${heroProduct.id}` as any)}><View style={styles.heroProductHalo} /><Image source={{ uri: siteImages.heroImages[0] ? uploadedImageUrl(siteImages.heroImages[0]) : heroProduct.image }} style={styles.heroProductImage} /><View style={styles.heroProductTag}><Text style={styles.heroProductTagText}>À DÉCOUVRIR</Text></View></Pressable> : null}
        <View style={styles.heroButtons}>
          <Pressable style={styles.heroPrimaryButton} onPress={() => onTab('marketplace')}><Text style={styles.heroPrimaryText}>Explorer le marché</Text><ArrowRight size={16} color={colors.burgundy} /></Pressable>
          <Pressable style={styles.heroSecondaryButton} onPress={onOpenOpportunities}><Text style={styles.heroSecondaryText}>Opportunités</Text></Pressable>
        </View>
        <View style={styles.heroTrustRow}><View style={styles.heroTrustItem}><ShieldCheck size={15} color="#F3D7B2" /><Text style={styles.heroTrustText}>Paiement sécurisé</Text></View><View style={styles.heroTrustItem}><Truck size={16} color="#F3D7B2" /><Text style={styles.heroTrustText}>Livraison en Afrique</Text></View></View>
      </LinearGradient>
      <View style={styles.homeSearchWrap}><Pressable style={styles.homeSearch} onPress={() => onTab('marketplace')}><Search size={18} color={colors.muted} /><Text style={styles.homeSearchText}>Rechercher un produit, une boutique...</Text><ChevronRight size={17} color={colors.burgundy} /></Pressable></View>
      {categories.length > 0 ? <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.homeCategories}>{categories.map((category) => <Pressable key={category} style={styles.homeCategory} onPress={() => onTab('marketplace')}><Text style={styles.homeCategoryText}>{category}</Text><ChevronRight size={13} color={colors.burgundy} /></Pressable>)}</ScrollView> : null}
      {siteImages.carouselImages.length > 0 ? <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.adminHomeCarousel}>{siteImages.carouselImages.map((image, index) => <Image key={`${image}-${index}`} source={{ uri: uploadedImageUrl(image) }} style={styles.adminHomeCarouselImage} />)}</ScrollView> : null}
      <View style={styles.homeSection}><SectionTitle title="Produits populaires" action="Tout voir" onPress={() => onTab('marketplace')} />
        {productsLoading ? <ActivityIndicator color={colors.burgundy} style={{ marginVertical: 20 }} /> : productsError ? <Text style={styles.cardSubtitle}>{productsError}</Text> : products.length === 0 ? <Text style={styles.cardSubtitle}>Les boutiques préparent leurs sélections.</Text> : <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.homeProductRail}>{products.slice(0, 6).map((product) => <View key={product.id} style={styles.homeProductCard}><Pressable onPress={() => router.push(`/(client)/product/${product.id}` as any)}><Image source={{ uri: product.image }} style={styles.homeProductImage} /><Text style={styles.homeProductCategory} numberOfLines={1}>{product.category}</Text><Text style={styles.homeProductName} numberOfLines={1}>{product.name}</Text><Text style={styles.homeProductPrice}>{product.price}</Text>{product.regularPrice ? <Text style={styles.homeProductOriginalPrice}>{product.regularPrice}</Text> : null}</Pressable><Pressable style={styles.homeAddButton} onPress={() => addProductToCart(product.id)}><ShoppingBag size={13} color={colors.burgundy} /><Text style={styles.homeAddText}>Ajouter</Text></Pressable></View>)}</ScrollView>}
      </View>
      {isSeller ? <Pressable style={styles.sellerHomeLink} onPress={onOpenWallet}><Store size={18} color={colors.burgundy} /><Text style={styles.sellerHomeLinkText}>Accéder à mon espace commerçant</Text><ChevronRight size={18} color={colors.burgundy} /></Pressable> : null}
      <SectionTitle title="Opportunités récentes" action="Voir tout" onPress={onOpenOpportunities} />
      {loading ? <ActivityIndicator color={colors.burgundy} style={{ marginVertical: 16 }} /> : opportunities.length === 0 ? <Text style={styles.cardSubtitle}>Aucune opportunité disponible.</Text> : opportunities.slice(0, 3).map((opp) => <Pressable key={opp.id} style={styles.opportunityCard} onPress={() => onViewOpportunity(opp.id)}><View style={styles.opportunityIcon}><Package size={19} color={colors.burgundy} /></View><View style={styles.flex}><Text style={styles.cardTitle}>{opp.title}</Text><Text style={styles.cardSubtitle}>{opp.type} · {opp.location}</Text><Text style={styles.opportunityAction}>Voir la mission et candidater</Text></View><View style={styles.alignEnd}><Text style={styles.priceSmall}>{opp.budget}</Text><Text style={styles.cardSubtitle}>{opp.candidates} candidats</Text></View></Pressable>)}
      <SectionTitle title="Discussions récentes" action="Voir tout" onPress={onOpenMessages} />
      {conversationsLoading ? <ActivityIndicator color={colors.burgundy} style={{ marginVertical: 12 }} /> : conversations.length === 0 ? <Text style={styles.cardSubtitle}>Aucune discussion pour le moment.</Text> : conversations.slice(0, 3).map((conversation) => <Pressable key={conversation.id} style={styles.opportunityCard} onPress={onOpenMessages}><View style={styles.opportunityIcon}><MessageCircle size={18} color={colors.burgundy} /></View><View style={styles.flex}><Text style={styles.cardTitle}>{conversation.userName}</Text><Text style={styles.cardSubtitle} numberOfLines={1}>{conversation.lastMessage}</Text></View><ChevronRight size={18} color={colors.muted} /></Pressable>)}
      <Pressable style={styles.livePromo} onPress={() => onTab('live')}>
        <Image source={{ uri: heroProduct?.image || photos.shoes }} style={styles.livePromoImage} />
        <View style={styles.livePromoBody}><View style={styles.livePill}><Radio size={12} color={colors.burgundy} /><Text style={styles.livePillText}>ORION EN DIRECT</Text></View><Text style={styles.livePromoTitle}>Faites découvrir votre univers</Text><Text style={styles.livePromoCtas}><Text style={styles.primaryText}>Ouvrir Live Center</Text></Text></View>
        <ChevronRight size={18} color={colors.burgundy} />
      </Pressable>
      <SectionTitle title="Aperçus Shorts" action="Voir tout" onPress={() => onTab('shorts')} />
      <Pressable style={styles.shortPreviewLink} onPress={() => onTab('shorts')}><CirclePlay size={22} color={colors.burgundy} /><Text style={styles.shortPreviewText}>Voir les vidéos de la communauté</Text><ChevronRight size={18} color={colors.burgundy} /></Pressable>
      <View style={styles.bottomSpace} />
    </ScrollView>
  );
}
function ShortsScreen({ refreshKey, onCreate }: { refreshKey: number; onCreate: () => void }) {
  return <ShortsFeed refreshKey={refreshKey} onCreate={onCreate} />;
}


function MarketplaceScreen() {
  const { showToast } = useToast();
  const { products: apiProducts, loading, error } = useProducts();
  const { addToCart } = useCart();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Tout');
  const [favorites, setFavorites] = useState<string[]>([]);
  const products = apiProducts.map(toDesignProduct);
  const categories = ['Tout', ...Array.from(new Set(products.map((product) => product.category).filter(Boolean)))];
  const filtered = products.filter((product) => product.name.toLowerCase().includes(search.toLowerCase()) && (category === 'Tout' || product.category === category));
  const toggleFav = (id: string) => setFavorites((list) => list.includes(id) ? list.filter((f) => f !== id) : [...list, id]);

  return <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
    <View style={styles.simpleHeader}><View><Text style={styles.screenTitle}>Marketplace</Text><Text style={styles.screenSubtitle}>Trouvez ce qui vous ressemble</Text></View><Pressable style={styles.iconButton}><Search size={20} color={colors.ink} /></Pressable></View>
    <View style={styles.searchBar}><Search size={18} color={colors.muted} /><TextInput style={styles.searchPlaceholder} placeholder="Rechercher un produit, une boutique..." placeholderTextColor={colors.muted} value={search} onChangeText={setSearch} /></View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>{categories.map((item) => <Text key={item} style={category === item ? styles.chipActive : styles.chip} onPress={() => setCategory(item)}>{item}</Text>)}</ScrollView>
    <SectionTitle title={`Produits disponibles (${filtered.length})`} action="Actualisé depuis Orion" />
    {loading ? <ActivityIndicator color={colors.burgundy} style={{ marginVertical: 28 }} /> : error ? <Text style={styles.cardSubtitle}>{error}</Text> : filtered.length === 0 ? <Text style={styles.cardSubtitle}>Aucun produit trouvé.</Text> : <View style={styles.productGrid}>{filtered.map((product) => <View key={product.id} style={styles.productCard}><Image source={{ uri: product.image }} style={styles.productImage} /><Pressable style={styles.favorite} onPress={() => toggleFav(product.id)}><Heart size={17} color={colors.burgundy} fill={favorites.includes(product.id) ? colors.burgundy : 'transparent'} /></Pressable><Text style={styles.cardTitle} numberOfLines={1}>{product.name}</Text><Text style={styles.cardSubtitle}>{product.category}</Text><Text style={styles.productPrice}>{product.price}</Text>{product.regularPrice ? <Text style={styles.homeProductOriginalPrice}>{product.regularPrice}</Text> : null}<Pressable style={styles.addToCartBtn} onPress={() => { const item = apiProducts.find((entry) => String(entry.id) === product.id); if (!item) return; addToCart({ id: product.id, name: product.name, price: getSellingProductPrice(item), image: product.image, seller: 'Orion' }); showToast(`${product.name} a été ajouté au panier.`); }}><ShoppingBag size={13} color={colors.burgundy} /><Text style={styles.addToCartText}>Ajouter</Text></Pressable></View>)}</View>}
    <View style={styles.bottomSpace} />
  </ScrollView>;
}
function ProfileScreen({ onTab, onDashboard, onLogout, displayName, isSeller }: { onTab: (tab: Tab) => void; onDashboard: () => void; onLogout: () => void; displayName: string; isSeller: boolean }) {
  return <ScrollView contentContainerStyle={styles.scrollContent}>
    <View style={styles.profileHeader}>
      <LiveAvatar size={64} />
      <View style={styles.flex}><Text style={styles.profileName}>{displayName}</Text><Text style={styles.profileRole}>{isSeller ? 'Commerçant Orion' : 'Membre Orion'}</Text><Text style={styles.cardSubtitle}>Compte connecté</Text></View>
      <Pressable style={styles.iconButton} onPress={onLogout}><Text style={styles.cardSubtitle}>Quitter</Text></Pressable>
    </View>
    <LinearGradient colors={[colors.burgundy, colors.burgundyDark]} style={styles.profileBanner}><Text style={styles.profileBannerEyebrow}>VOTRE ÉCOSYSTÈME</Text><Text style={styles.profileBannerTitle}>Créez une fois.{ '\n' }Vendez partout.</Text><Text style={styles.profileBannerText}>Boutique · Shorts · Live · Clients</Text></LinearGradient>
    <Pressable style={styles.dashboardCta} onPress={onDashboard}><Store size={19} color="white" /><Text style={styles.dashboardCtaText}>{isSeller ? 'Dashboard commerçant' : 'Mon espace personnel'}</Text><ChevronRight size={18} color="white" /></Pressable>
    {[['Marketplace', LayoutGrid, 'marketplace'], ['Mes Shorts', CirclePlay, 'shorts'], ['Live Center', Radio, 'live']].map(([label, Icon, tab]) => { const IconComponent = Icon as typeof Store; return <Pressable key={label as string} style={styles.profileMenu} onPress={() => onTab(tab as Tab)}><View style={styles.profileMenuIcon}><IconComponent size={19} color={colors.burgundy} /></View><Text style={styles.profileMenuText}>{label as string}</Text><ChevronRight size={18} color={colors.muted} /></Pressable>; })}
    <Pressable style={styles.outlineCta} onPress={onLogout}><Text style={styles.outlineCtaText}>Se déconnecter</Text></Pressable>
    <View style={styles.bottomSpace} />
  </ScrollView>;
}
function CreateSheet({ visible, onClose, onCreateClip }: { visible: boolean; onClose: () => void; onCreateClip: () => void }) {
  const actions = [{ label: 'Créer un Short', icon: Video, accent: true, action: onCreateClip }, { label: 'Créer un Live', icon: Radio, action: () => onClose() }, { label: 'Ajouter un produit', icon: Package, action: () => onClose() }, { label: 'Créer une opportunité', icon: Sparkles, action: () => onClose() }];
  return <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}><View style={styles.modalBackdrop}><View style={styles.createSheet}><View style={styles.sheetHandle} /><View style={styles.sheetHeader}><View><Text style={styles.sheetTitle}>Créer dans ORION</Text><Text style={styles.cardSubtitle}>Une idée, plusieurs façons de la partager.</Text></View><Pressable onPress={onClose} style={styles.closeButton}><X size={18} color={colors.ink} /></Pressable></View>{actions.map((item) => { const Icon = item.icon; return <Pressable key={item.label} style={[styles.createAction, item.accent && styles.createActionAccent]} onPress={item.action}><View style={[styles.createActionIcon, item.accent && styles.createActionIconAccent]}><Icon size={20} color={item.accent ? 'white' : colors.burgundy} /></View><Text style={[styles.createActionText, item.accent && styles.createActionTextAccent]}>{item.label}</Text><ChevronRight size={18} color={item.accent ? 'white' : colors.muted} /></Pressable>; })}</View></View></Modal>;
}

export default function Index() {
  const { mode } = useThemeMode();
  const dark = mode === 'dark';
  const router = useRouter();
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const { showToast } = useToast();
  const [tab, setTab] = useState<Tab>('home');
  const [createVisible, setCreateVisible] = useState(false);
  const [clipVisible, setClipVisible] = useState(false);
  const [shortAsset, setShortAsset] = useState<ImagePickerAsset | null>(null);
  const [shortRefreshKey, setShortRefreshKey] = useState(0);
  const [showDashboard, setShowDashboard] = useState(false);
  const [dashScreen, setDashScreen] = useState<DashboardScreen>('home');
  const { width } = useWindowDimensions();
  const contentWidth = useMemo(() => Math.min(width, 480), [width]);
  const openClip = async () => {
    setCreateVisible(false);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Accès à la galerie', 'Autorise Orion à accéder à tes vidéos pour créer un Short.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['videos'], allowsEditing: false, quality: 1 });
    if (result.canceled || !result.assets[0]) return;
    const selected = result.assets[0];
    if (selected.fileSize && selected.fileSize > 150 * 1024 * 1024) {
      Alert.alert('Vidéo trop volumineuse', 'La limite d’envoi est de 150 Mo. Choisis une vidéo plus légère.');
      return;
    }
    setShortAsset(selected);
    setClipVisible(true);
  };
  const closeComposer = () => setClipVisible(false);
  const onShortPublished = () => {
    setClipVisible(false);
    setTab('shorts');
    setShortRefreshKey((key) => key + 1);
  };
  const openDashboard = (target: DashboardScreen = 'home') => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.role === 'ADMIN' && !['admin-users', 'admin-orders', 'admin-wallet', 'admin-settings', 'admin-store-categories'].includes(target)) {
      target = 'admin-users';
    } else if (user.role !== 'COMMERCANT' && !['home', 'applications', 'orders', 'messages', 'profile'].includes(target)) {
      Alert.alert('Section indisponible', 'Cette section est réservée aux comptes commerçants.');
      return;
    }
    setDashScreen(target);
    setShowDashboard(true);
  };
  const logoutFromDashboard = () => { showToast('Vous êtes déconnecté.'); void logout(); };
  const goToPublicHome = () => { setTab('home'); setShowDashboard(false); };

  if (isLoading) return <SafeAreaView style={[styles.safeArea, dark && darkStyles.canvas]}><View style={styles.loading}><ActivityIndicator color={colors.burgundy} size="large" /></View></SafeAreaView>;
  if (!isAuthenticated) return <Redirect href="/login" />;

  if (showDashboard) {
    const isSeller = user?.role === 'COMMERCANT';
    const isAdmin = user?.role === 'ADMIN';
    const dashContent = isAdmin ? <AdminScreen screen={dashScreen} />
      : !isSeller && dashScreen === 'home' ? <ClientDashboardHome onNavigate={setDashScreen} />
      : !isSeller && dashScreen === 'applications' ? <ClientApplicationsScreen />
      : !isSeller && dashScreen === 'orders' ? <ClientOrdersScreen />
      : isSeller && dashScreen === 'orders' ? <SellerOrdersScreen />
      : dashScreen === 'home' ? <DashboardHome onNavigate={setDashScreen} />
      : dashScreen === 'stores' ? <StoresScreen />
      : dashScreen === 'products' ? <ProductsScreen />
      : dashScreen === 'marketplace' ? <DashboardMarketplace />
      : dashScreen === 'wallet' ? <WalletScreen onNavigate={() => setDashScreen('withdrawal-methods')} />
      : dashScreen === 'withdrawal-methods' ? <WithdrawalMethodsScreen />
      : dashScreen === 'analytics' ? <AnalyticsScreen />
      : dashScreen === 'opportunities' ? <OpportunitiesScreen />
      : dashScreen === 'subscriptions' ? <SubscriptionsScreen />
      : dashScreen === 'messages' ? <MessagesScreen />
      : <DashboardProfile />;
    return <SubscriptionProvider><WalletProvider><StoreProvider><SafeAreaView style={[styles.safeArea, dark && darkStyles.canvas]}><DashboardLayout active={dashScreen} onNavigate={setDashScreen} onHome={goToPublicHome} onExit={logoutFromDashboard}>{dashContent}</DashboardLayout></SafeAreaView></StoreProvider></WalletProvider></SubscriptionProvider>;
  }

  const displayName = [user?.prenom, user?.nom].filter(Boolean).join(' ') || user?.email || 'Membre Orion';
  const screen = tab === 'home' ? <HomeScreen onTab={setTab} displayName={displayName} isSeller={user?.role === 'COMMERCANT'} onOpenProfile={() => setTab('profile')} onOpenOpportunities={() => router.push('/(client)/opportunities')} onViewOpportunity={(id) => router.push(`/(client)/opportunities/${id}` as any)} onOpenMessages={() => user?.role === 'COMMERCANT' ? openDashboard('messages') : router.push('/(client)/messages')} onOpenWallet={() => user?.role === 'COMMERCANT' ? openDashboard() : Alert.alert('Espace commerçant', 'Cette section est réservée aux comptes commerçants.')} /> : tab === 'shorts' ? <ShortsScreen refreshKey={shortRefreshKey} onCreate={() => { void openClip(); }} /> : tab === 'live' ? <LiveCenterScreen onCreateClip={openClip} onOpenProfile={() => setTab('profile')} /> : tab === 'marketplace' ? <MarketplaceScreen /> : <ProfileScreen onTab={setTab} onDashboard={openDashboard} onLogout={() => { showToast('Vous êtes déconnecté.'); void logout(); }} displayName={displayName} isSeller={user?.role === 'COMMERCANT'} />;
  return <SafeAreaView style={[styles.safeArea, dark && darkStyles.canvas]}><View style={[styles.app, dark && darkStyles.canvas, { maxWidth: contentWidth }]}>{screen}<View style={styles.bottomNav}>{[{ key: 'home' as Tab, label: 'Accueil', icon: Home }, { key: 'marketplace' as Tab, label: 'Marché', icon: LayoutGrid }, { key: 'shorts' as Tab, label: 'Shorts', icon: CirclePlay }, { key: 'live' as Tab, label: 'Live', icon: Radio }, { key: 'profile' as Tab, label: 'Profil', icon: UserRound }].map((item) => { const Icon = item.icon; const active = tab === item.key; return <Pressable key={item.key} style={styles.navItem} onPress={() => setTab(item.key)}><Icon size={21} color={active ? colors.burgundy : colors.muted} strokeWidth={active ? 2.5 : 1.8} /><Text style={[styles.navLabel, active && styles.navLabelActive]}>{item.label}</Text></Pressable>; })}<Pressable style={styles.floatingPlus} onPress={() => setCreateVisible(true)}><Plus size={24} color="white" strokeWidth={2.4} /></Pressable></View></View><CreateSheet visible={createVisible} onClose={() => setCreateVisible(false)} onCreateClip={openClip} /><ShortComposer visible={clipVisible} asset={shortAsset} onClose={closeComposer} onPublished={onShortPublished} onChooseAnother={openClip} /></SafeAreaView>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5EFE7' },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  app: { flex: 1, width: '100%', alignSelf: 'center', backgroundColor: '#F5EFE7' },
  flex: { flex: 1 },
  scrollContent: { paddingHorizontal: 18, paddingTop: 8, paddingBottom: 110 },
  header: { height: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  logoWrap: { alignItems: 'flex-start' },
  logoOro: { color: colors.burgundy, fontSize: 24, fontWeight: '800', letterSpacing: -2, lineHeight: 21 },
  logoOrion: { color: colors.burgundy, fontSize: 7, fontWeight: '600', letterSpacing: 4, marginLeft: 3 },
  logoLight: { color: 'white' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.soft, alignItems: 'center', justifyContent: 'center' },
  notificationDot: { position: 'absolute', top: 8, right: 8, width: 6, height: 6, backgroundColor: colors.burgundy, borderRadius: 3, borderWidth: 1, borderColor: 'white' },
  storefrontHero: { minHeight: 326, borderRadius: 23, paddingHorizontal: 19, paddingTop: 20, paddingBottom: 17, marginTop: 10, marginBottom: 15, overflow: 'hidden', justifyContent: 'space-between' },
  heroEyebrow: { color: '#F0D39F', fontSize: 9, fontWeight: '800', letterSpacing: 1, maxWidth: '76%' },
  heroTitle: { color: '#FFFAF3', fontSize: 25, fontWeight: '900', lineHeight: 29, letterSpacing: -0.8, maxWidth: '73%', marginTop: 13 },
  heroSubtitle: { color: '#F2DDE0', fontSize: 11, lineHeight: 16, maxWidth: '72%', marginTop: 8 },
  heroButtons: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14 },
  heroPrimaryButton: { minHeight: 40, borderRadius: 11, backgroundColor: '#FFF9F0', paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  heroPrimaryText: { color: colors.burgundy, fontSize: 10, fontWeight: '800' },
  heroSecondaryButton: { minHeight: 40, borderRadius: 11, borderWidth: 1, borderColor: 'rgba(255,245,230,0.55)', paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center' },
  heroSecondaryText: { color: '#FFF9F0', fontSize: 10, fontWeight: '700' },
  heroTrustRow: { flexDirection: 'row', gap: 16, marginTop: 18 },
  heroTrustItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  heroTrustText: { color: '#F7E8D7', fontSize: 9, fontWeight: '600' },
  heroOrnament: { position: 'absolute', top: -30, right: -25, width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(255,255,255,0.035)', alignItems: 'center', justifyContent: 'center' },
  heroOrnamentOuter: { width: 108, height: 108, borderWidth: 1, borderColor: 'rgba(240,211,159,0.48)', transform: [{ rotate: '45deg' }], alignItems: 'center', justifyContent: 'center' },
  heroOrnamentInner: { width: 66, height: 66, borderWidth: 1, borderColor: 'rgba(240,211,159,0.4)' },
  heroOrnamentDot: { position: 'absolute', bottom: 28, left: 24, width: 7, height: 7, borderRadius: 4, backgroundColor: '#E8C789' },
  heroProductVisual: { position: 'absolute', top: 99, right: 11, width: '39%', height: 139, alignItems: 'center', justifyContent: 'center' },
  heroAdminImages: { position: 'absolute', top: 100, right: 10, width: '43%', height: 145 },
  heroAdminImage: { position: 'absolute', borderRadius: 11, borderWidth: 3, borderColor: '#FFF4E4', backgroundColor: '#F7E7D3' },
  heroAdminImageMain: { right: 0, top: 5, width: '72%', height: '83%', transform: [{ rotate: '3deg' }] },
  heroAdminImageLeft: { left: 0, bottom: 0, width: '48%', height: '49%', transform: [{ rotate: '-7deg' }] },
  heroAdminImageRight: { right: 0, bottom: -2, width: '43%', height: '40%', transform: [{ rotate: '7deg' }] },
  adminHomeCarousel: { paddingHorizontal: 18, gap: 10, marginTop: 14 },
  adminHomeCarouselImage: { width: 245, height: 110, borderRadius: 13, resizeMode: 'cover', backgroundColor: '#EFE6DB' },
  heroProductHalo: { position: 'absolute', width: 115, height: 115, borderRadius: 58, backgroundColor: 'rgba(245,221,188,0.88)' },
  heroProductImage: { width: '100%', height: '100%', resizeMode: 'contain', borderRadius: 14 },
  heroProductTag: { position: 'absolute', right: -2, bottom: 2, backgroundColor: '#FFF8EC', borderRadius: 8, paddingHorizontal: 7, paddingVertical: 5 },
  heroProductTagText: { color: colors.burgundy, fontSize: 7, fontWeight: '900', letterSpacing: 0.5 },
  homeSearchWrap: { marginBottom: 9 },
  homeSearch: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 9, borderWidth: 1, borderColor: colors.line, borderRadius: 13, backgroundColor: '#FFFCF7', paddingHorizontal: 13 },
  homeSearchText: { flex: 1, color: '#918780', fontSize: 11 },
  homeCategories: { gap: 8, paddingVertical: 6, paddingBottom: 19 },
  homeCategory: { minHeight: 35, flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 10, backgroundColor: '#FFFCF7', borderWidth: 1, borderColor: colors.line, paddingHorizontal: 10 },
  homeCategoryText: { color: '#3D3331', fontSize: 10, fontWeight: '700' },
  homeSection: { marginBottom: 15 },
  homeProductRail: { gap: 11, paddingBottom: 8 },
  homeProductCard: { width: 157, backgroundColor: '#FFFCF7', borderWidth: 1, borderColor: colors.line, borderRadius: 15, padding: 8 },
  homeProductImage: { width: '100%', height: 115, borderRadius: 10, backgroundColor: '#F1E9DF' },
  homeProductCategory: { color: '#9B775C', fontSize: 8, fontWeight: '800', letterSpacing: 0.5, marginTop: 8 },
  homeProductName: { color: colors.ink, fontSize: 11, fontWeight: '700', marginTop: 4 },
  homeProductPrice: { color: colors.burgundy, fontSize: 11, fontWeight: '900', marginTop: 5 },
  homeProductOriginalPrice: { color: colors.muted, fontSize: 10, textDecorationLine: 'line-through', marginTop: 2 },
  homeAddButton: { minHeight: 31, borderWidth: 1, borderColor: '#D9B7B6', borderRadius: 9, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 5, marginTop: 8 },
  homeAddText: { color: colors.burgundy, fontSize: 9, fontWeight: '800' },
  sellerHomeLink: { minHeight: 47, flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 12, borderWidth: 1, borderColor: '#E1C9BA', backgroundColor: '#FBF4EA', paddingHorizontal: 12, marginBottom: 18 },
  sellerHomeLinkText: { flex: 1, color: colors.burgundy, fontSize: 11, fontWeight: '800' },
  avatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#243D4E', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: 'white', fontWeight: '700', fontSize: 11 },
  greetingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 18 },
  eyebrow: { color: colors.muted, letterSpacing: 1.4, fontSize: 10, fontWeight: '600', marginBottom: 7 },
  greeting: { color: colors.ink, fontSize: 25, fontWeight: '700', letterSpacing: -0.5 },
  subtle: { color: colors.muted, fontSize: 13, marginTop: 4 },
  createMini: { width: 44, height: 44, borderRadius: 15, backgroundColor: colors.burgundy, alignItems: 'center', justifyContent: 'center', shadowColor: colors.burgundy, shadowOpacity: 0.25, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, elevation: 5 },
  walletCard: { borderRadius: 18, padding: 18, marginBottom: 18 },
  walletTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  walletLabel: { color: '#F7CBD5', fontSize: 10, letterSpacing: 1.1, fontWeight: '700' },
  walletAmount: { color: 'white', fontWeight: '800', fontSize: 24, marginTop: 14, letterSpacing: -0.5 },
  walletFooter: { borderTopColor: 'rgba(255,255,255,0.25)', borderTopWidth: 1, marginTop: 18, paddingTop: 13, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  walletLink: { color: 'white', fontSize: 12, fontWeight: '600' },
  quickGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  quickItem: { alignItems: 'center', width: '24%' },
  quickIcon: { width: 43, height: 43, backgroundColor: colors.burgundySoft, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 7 },
  quickLabel: { color: colors.ink, fontSize: 10, textAlign: 'center' },
  livePromo: { flexDirection: 'row', backgroundColor: colors.soft, borderRadius: 16, padding: 10, marginBottom: 26, position: 'relative' },
  livePromoImage: { width: 68, height: 78, borderRadius: 11 },
  livePromoBody: { paddingLeft: 12, flex: 1, justifyContent: 'center' },
  livePill: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  livePillText: { color: colors.burgundy, fontSize: 9, fontWeight: '800', letterSpacing: 0.7 },
  livePromoTitle: { color: colors.ink, fontWeight: '700', fontSize: 13, marginTop: 5 },
  livePromoMeta: { color: colors.muted, fontSize: 10, marginTop: 3 },
  livePromoCtas: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 8 },
  primaryText: { color: colors.burgundy, fontSize: 10, fontWeight: '800' },
  secondaryText: { color: colors.muted, fontSize: 10, fontWeight: '600' },
  moreIcon: { position: 'absolute', right: 10, top: 11 },
  sectionTitle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 3 },
  sectionHeading: { color: colors.ink, fontSize: 16, fontWeight: '700' },
  sectionAction: { color: colors.burgundy, fontSize: 11, fontWeight: '700' },
  salesCard: { borderWidth: 1, borderColor: colors.line, borderRadius: 16, padding: 16, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  mutedLabel: { color: colors.muted, fontSize: 11 },
  salesAmount: { color: colors.ink, fontSize: 19, fontWeight: '800', marginTop: 7 },
  positive: { color: colors.green, fontSize: 11, fontWeight: '700', marginTop: 8 },
  chart: { width: 125, height: 76, justifyContent: 'flex-end', position: 'relative' },
  chartBars: { flexDirection: 'row', gap: 7, alignItems: 'flex-end', height: 65 },
  bar: { width: 10, backgroundColor: colors.burgundySoft, borderRadius: 4 },
  chartLine: { position: 'absolute', left: 0, right: 0, bottom: 37, borderTopColor: colors.burgundy, borderTopWidth: 2, transform: [{ rotate: '-9deg' }] },
  chartDot: { position: 'absolute', right: 10, bottom: 46, width: 7, height: 7, borderRadius: 4, backgroundColor: colors.burgundy },
  opportunityCard: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.line },
  opportunityIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.burgundySoft, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  opportunityAction: { color: colors.burgundy, fontSize: 10, fontWeight: '800', marginTop: 5 },
  cardTitle: { color: colors.ink, fontSize: 12, fontWeight: '700' },
  cardSubtitle: { color: colors.muted, fontSize: 10, marginTop: 4 },
  alignEnd: { alignItems: 'flex-end' },
  priceSmall: { color: colors.ink, fontSize: 11, fontWeight: '700' },
  horizontalList: { gap: 12, paddingBottom: 10 },
  shortPreviewLink: { borderWidth: 1, borderColor: colors.line, borderRadius: 15, padding: 15, flexDirection: 'row', alignItems: 'center', gap: 10 },
  shortPreviewText: { flex: 1, color: colors.ink, fontSize: 12, fontWeight: '700' },
  shortMini: { width: 118 },
  shortMiniImage: { width: 118, height: 145, marginBottom: 7 },
  roundImage: { borderRadius: 13 },
  playBadge: { position: 'absolute', bottom: 8, left: 8, width: 27, height: 27, borderRadius: 14, backgroundColor: colors.burgundy, alignItems: 'center', justifyContent: 'center' },
  shortMiniTitle: { color: colors.ink, fontSize: 11, fontWeight: '700' },
  bottomSpace: { height: 30 },
  bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 76, borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: 'rgba(255,255,255,0.98)', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingHorizontal: 8 },
  navItem: { alignItems: 'center', justifyContent: 'center', width: 55, gap: 4 },
  navLabel: { color: colors.muted, fontSize: 9, fontWeight: '600' },
  navLabelActive: { color: colors.burgundy, fontWeight: '800' },
  floatingPlus: { position: 'absolute', left: '50%', marginLeft: -24, top: -26, width: 48, height: 48, borderRadius: 24, backgroundColor: colors.burgundy, alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: 'white', shadowColor: colors.burgundy, shadowOpacity: 0.3, shadowRadius: 9, shadowOffset: { width: 0, height: 4 }, elevation: 5 },
  simpleHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, paddingBottom: 20 },
  screenTitle: { color: colors.ink, fontSize: 25, fontWeight: '800', letterSpacing: -0.5 },
  screenSubtitle: { color: colors.muted, fontSize: 12, marginTop: 4 },
  discoveryBanner: { backgroundColor: colors.burgundySoft, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  bannerEyebrow: { color: colors.burgundy, fontSize: 9, letterSpacing: 1, fontWeight: '800' },
  bannerTitle: { color: colors.ink, fontSize: 16, fontWeight: '800', marginTop: 7 },
  bannerText: { color: colors.muted, fontSize: 11, marginTop: 3, maxWidth: 240 },
  shortsContent: { paddingHorizontal: 20, paddingBottom: 110 },
  shortCard: { marginBottom: 20 },
  shortVisual: { height: 420, borderRadius: 20, overflow: 'hidden', justifyContent: 'space-between', padding: 15, position: 'relative', backgroundColor: colors.navy },
  shortVisualImage: { borderRadius: 20 },
  shortVisualTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  creatorTag: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  creatorAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center' },
  creatorInitial: { color: colors.burgundy, fontWeight: '800', fontSize: 12 },
  creatorName: { color: 'white', fontSize: 12, fontWeight: '700' },
  verified: { color: '#F7CBD5', fontSize: 13, fontWeight: '800' },
  shortVisualBottom: { paddingRight: 50 },
  shortTitle: { color: 'white', fontSize: 22, lineHeight: 27, fontWeight: '800' },
  shortPrice: { color: 'white', fontSize: 17, fontWeight: '800', marginTop: 7 },
  productButton: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'white', borderRadius: 18, paddingHorizontal: 12, paddingVertical: 8, marginTop: 12 },
  productButtonText: { color: colors.burgundy, fontSize: 11, fontWeight: '800' },
  shortActions: { position: 'absolute', right: 13, bottom: 24, alignItems: 'center', gap: 17 },
  actionCount: { color: 'white', fontSize: 9, marginTop: 3, textAlign: 'center', fontWeight: '700' },
  liveAnnouncement: { borderWidth: 1, borderColor: colors.line, borderRadius: 15, padding: 11, marginTop: 8, flexDirection: 'row', alignItems: 'center' },
  liveAnnouncementIcon: { width: 35, height: 35, borderRadius: 11, backgroundColor: colors.burgundySoft, justifyContent: 'center', alignItems: 'center', marginRight: 9 },
  liveAnnouncementLabel: { color: colors.burgundy, fontSize: 9, fontWeight: '800', letterSpacing: 0.6 },
  liveAnnouncementTitle: { color: colors.ink, fontSize: 12, fontWeight: '700', marginTop: 3 },
  liveActions: { alignItems: 'flex-end', gap: 6, marginLeft: 8 },
  reminderButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  reminderText: { color: colors.burgundy, fontSize: 9, fontWeight: '700' },
  joinButton: { backgroundColor: colors.burgundy, paddingHorizontal: 9, paddingVertical: 7, borderRadius: 9 },
  joinText: { color: 'white', fontSize: 9, fontWeight: '800' },
  titleWithDot: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  redDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: '#D93458' },
  liveStatusCard: { borderRadius: 19, overflow: 'hidden', marginBottom: 25 },
  liveStatusGradient: { padding: 18 },
  statusHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  onAir: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  onAirDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E14D67' },
  onAirText: { color: '#F1A5B4', fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  platform: { color: '#B8CCD9', fontSize: 11, fontWeight: '700' },
  liveTitle: { color: 'white', fontSize: 21, fontWeight: '800', marginTop: 22 },
  liveMeta: { color: '#B8CCD9', fontSize: 11, marginTop: 5 },
  liveStats: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.16)', marginTop: 21, paddingTop: 16, flexDirection: 'row', gap: 35 },
  liveStatValue: { color: 'white', fontSize: 17, fontWeight: '800' },
  liveStatLabel: { color: '#B8CCD9', fontSize: 10, marginTop: 4 },
  currentProduct: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.line, borderRadius: 16, padding: 10, marginBottom: 17 },
  currentProductImage: { width: 70, height: 74, borderRadius: 11, marginRight: 11 },
  productLiveLabel: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  productLiveText: { color: colors.burgundy, fontSize: 8, fontWeight: '800', letterSpacing: 0.7 },
  currentProductName: { color: colors.ink, fontSize: 14, fontWeight: '800', marginTop: 5 },
  currentProductPrice: { color: colors.burgundy, fontSize: 12, fontWeight: '800', marginTop: 3 },
  stockText: { color: colors.muted, fontSize: 10, marginTop: 5 },
  stockStrong: { color: colors.green, fontWeight: '800' },
  dealCard: { backgroundColor: colors.burgundySoft, borderRadius: 16, padding: 15, marginBottom: 25 },
  dealHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dealTag: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.burgundy, borderRadius: 7, paddingHorizontal: 8, paddingVertical: 5 },
  dealTagText: { color: 'white', fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  dealTimer: { color: colors.burgundy, fontSize: 17, fontWeight: '800' },
  dealTitle: { color: colors.ink, fontSize: 14, fontWeight: '700', marginTop: 13 },
  dealPriceRow: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 6 },
  oldPrice: { color: colors.muted, fontSize: 10, textDecorationLine: 'line-through' },
  dealPrice: { color: colors.burgundy, fontWeight: '800', fontSize: 17 },
  remaining: { color: colors.burgundy, fontSize: 9, fontWeight: '700' },
  orderRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.line },
  orderIcon: { width: 37, height: 37, borderRadius: 11, backgroundColor: colors.burgundySoft, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  confirmed: { color: colors.green, fontSize: 9, marginTop: 4, fontWeight: '700' },
  bridgeCard: { backgroundColor: '#F7F8FA', borderRadius: 15, padding: 14, flexDirection: 'row', alignItems: 'center', marginTop: 24, marginBottom: 12 },
  bridgeIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.burgundySoft, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  primaryCta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.burgundy, borderRadius: 13, paddingVertical: 14, marginTop: 8 },
  primaryCtaText: { color: 'white', fontSize: 12, fontWeight: '800', flex: 1 },
  outlineCta: { alignItems: 'center', paddingVertical: 15 },
  outlineCtaText: { color: colors.muted, fontSize: 11, fontWeight: '700' },
  searchBar: { height: 48, borderWidth: 1, borderColor: colors.line, borderRadius: 14, flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 14, marginBottom: 15 },
  searchPlaceholder: { color: colors.muted, fontSize: 11 },
  chips: { gap: 8, paddingBottom: 25 },
  chip: { borderWidth: 1, borderColor: colors.line, borderRadius: 15, paddingHorizontal: 13, paddingVertical: 8, color: colors.muted, fontSize: 10, overflow: 'hidden' },
  chipActive: { backgroundColor: colors.burgundy, borderRadius: 15, paddingHorizontal: 15, paddingVertical: 8, color: 'white', fontSize: 10, overflow: 'hidden', fontWeight: '700' },
  productGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  productCard: { width: '47%', position: 'relative', marginBottom: 12 },
  productImage: { width: '100%', height: 175, borderRadius: 15, marginBottom: 8 },
  favorite: { position: 'absolute', top: 10, right: 10, width: 29, height: 29, borderRadius: 15, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center' },
  productPrice: { color: colors.burgundy, fontSize: 13, fontWeight: '800', marginTop: 6 },
  addToCartBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1, borderColor: colors.burgundy, borderRadius: 10, paddingVertical: 8, marginTop: 9 },
  addToCartText: { color: colors.burgundy, fontSize: 11, fontWeight: '800' },
  profileHeader: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18 },
  profileAvatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#243D4E', alignItems: 'center', justifyContent: 'center', marginRight: 13 },
  profileAvatarText: { color: 'white', fontSize: 19, fontWeight: '800' },
  profileName: { color: colors.ink, fontSize: 19, fontWeight: '800' },
  verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  profileRole: { color: colors.burgundy, fontSize: 11, fontWeight: '700' },
  check: { width: 15, height: 15, borderRadius: 8, backgroundColor: colors.burgundy, color: 'white', textAlign: 'center', fontSize: 10, fontWeight: '800' },
  profileBanner: { borderRadius: 19, padding: 20, marginVertical: 10 },
  profileBannerEyebrow: { color: '#F7CBD5', fontSize: 9, letterSpacing: 1.1, fontWeight: '800' },
  profileBannerTitle: { color: 'white', fontSize: 23, fontWeight: '800', marginTop: 12, lineHeight: 27 },
  profileBannerText: { color: '#F7CBD5', fontSize: 11, marginTop: 14 },
  profileMenu: { height: 61, borderBottomWidth: 1, borderBottomColor: colors.line, flexDirection: 'row', alignItems: 'center' },
  profileMenuIcon: { width: 35, height: 35, borderRadius: 11, backgroundColor: colors.burgundySoft, alignItems: 'center', justifyContent: 'center', marginRight: 11 },
  profileMenuText: { color: colors.ink, fontSize: 13, fontWeight: '600', flex: 1 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(7,18,30,0.45)', justifyContent: 'flex-end' },
  createSheet: { backgroundColor: 'white', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 20, paddingBottom: 34 },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.line, alignSelf: 'center', marginBottom: 20 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 17 },
  sheetTitle: { color: colors.ink, fontSize: 20, fontWeight: '800' },
  closeButton: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.soft, alignItems: 'center', justifyContent: 'center' },
  createAction: { flexDirection: 'row', alignItems: 'center', paddingVertical: 11, paddingHorizontal: 10, borderRadius: 14, marginBottom: 7 },
  createActionAccent: { backgroundColor: colors.burgundy },
  createActionIcon: { width: 39, height: 39, borderRadius: 12, backgroundColor: colors.burgundySoft, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  createActionIconAccent: { backgroundColor: 'rgba(255,255,255,0.18)' },
  createActionText: { color: colors.ink, fontSize: 13, fontWeight: '700', flex: 1 },
  createActionTextAccent: { color: 'white' },
  clipPreview: { height: 180, backgroundColor: colors.navy, borderRadius: 16, overflow: 'hidden', position: 'relative', marginBottom: 18 },
  clipPreviewImage: { width: '100%', height: '100%', opacity: 0.75 },
  clipPlay: { position: 'absolute', width: 42, height: 42, borderRadius: 21, backgroundColor: colors.burgundy, alignItems: 'center', justifyContent: 'center', left: '50%', top: '50%', marginLeft: -21, marginTop: -21 },
  clipDuration: { position: 'absolute', bottom: 10, right: 11, backgroundColor: 'rgba(0,0,0,0.55)', color: 'white', fontSize: 10, paddingHorizontal: 7, paddingVertical: 4, borderRadius: 6 },
  clipSectionLabel: { color: colors.ink, fontSize: 12, fontWeight: '800', marginBottom: 8 },
  momentRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: colors.line, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  radioSelected: { borderColor: colors.burgundy },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.burgundy },
  momentText: { color: colors.ink, fontSize: 12, fontWeight: '600', flex: 1 },
  momentTime: { color: colors.muted, fontSize: 10 },
  dashboardCta: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.ink, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 16, marginBottom: 18 },
  dashboardCtaText: { color: 'white', fontSize: 13, fontWeight: '800', flex: 1 },
});

const darkStyles = StyleSheet.create({ canvas: { backgroundColor: '#15161B' } });


