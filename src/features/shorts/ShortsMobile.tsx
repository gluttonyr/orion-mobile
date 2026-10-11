import { LinearGradient } from 'expo-linear-gradient';
import { VideoView, useVideoPlayer } from 'expo-video';
import { ArrowLeft, Check, Heart, MapPin, MessageCircle, Play, Plus, Send, Share2, ShoppingBag, Store, X } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Animated, { cancelAnimation, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Linking,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
  type ViewToken,
} from 'react-native';
import type { ImagePickerAsset } from 'expo-image-picker';
import type { Boutique, produits, Short, ShortAuthor, ShortComment, ShortCreatorProfile } from '@/model/model';
import { shortService } from '@/service/short.service';
import { boutiqueService } from '@/service/boutique.service';
import { produitService } from '@/service/produit.service';
import { formatFcfa, uploadedImageUrl } from '@/features/redesign/mappers';
import { useAuth } from '@/features/auth/hooks';
import { liveService, type PublicLiveSession } from '@/features/live/live.service';

const colors = {
  ink: '#171717', muted: '#737373', line: '#E9E9EC', burgundy: '#8B0A24',
  burgundyDark: '#6E071D', burgundySoft: '#F9E9ED', navy: '#07121E', white: '#FFFFFF',
};

export function ShortsFeed({ refreshKey, onCreate }: { refreshKey: number; onCreate: () => void }) {
  const [items, setItems] = useState<Short[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [pageHeight, setPageHeight] = useState(0);
  const [profileAuthor, setProfileAuthor] = useState<ShortAuthor | null>(null);
  const listRef = useRef<FlatList<Short>>(null);
  const openCreator = useCallback((author: ShortAuthor) => setProfileAuthor(author), []);

  const loadFirstPage = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await shortService.getFeed(1, 8);
      setItems(result.items);
      setPage(1);
      setHasMore(result.hasMore);
      setActiveId(result.items[0]?.id ?? null);
      listRef.current?.scrollToOffset({ offset: 0, animated: false });
    } catch {
      setError('Impossible de charger les Shorts. Vérifie ta connexion puis réessaie.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadFirstPage(); }, [loadFirstPage, refreshKey]);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const result = await shortService.getFeed(page + 1, 8);
      setItems((current) => [...current, ...result.items]);
      setPage(result.page);
      setHasMore(result.hasMore);
    } catch {
      // Keep the already loaded feed available if pagination fails.
    } finally {
      setLoadingMore(false);
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken<Short>[] }) => {
    const current = viewableItems.find((item) => item.isViewable)?.item;
    setActiveId(current?.id ?? null);
  }).current;
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 75 }).current;

  const openProfileShort = (short: Short) => {
    setItems((current) => [short, ...current.filter((item) => item.id !== short.id)]);
    setActiveId(short.id);
    setPage(1);
    setProfileAuthor(null);
    requestAnimationFrame(() => listRef.current?.scrollToOffset({ offset: 0, animated: false }));
  };

  if (profileAuthor) {
    return <CreatorProfile author={profileAuthor} onBack={() => setProfileAuthor(null)} onOpenShort={openProfileShort} />;
  }

  if (loading) {
    return <View style={styles.centerState}><ActivityIndicator size="large" color={colors.burgundy} /><Text style={styles.stateHint}>Chargement des Shorts…</Text></View>;
  }

  if (!items.length) {
    return (
      <View style={styles.emptyScreen}>
        <View style={styles.emptyIcon}><Play size={28} color={colors.burgundy} fill={colors.burgundy} /></View>
        <Text style={styles.emptyTitle}>{error ? 'Le fil est indisponible' : 'Aucun Short pour le moment'}</Text>
        <Text style={styles.emptyCopy}>{error || 'Publie ta première vidéo et elle apparaîtra ici.'}</Text>
        <Pressable style={styles.emptyButton} onPress={error ? loadFirstPage : onCreate}>
          <Plus size={18} color={colors.white} /><Text style={styles.emptyButtonText}>{error ? 'Réessayer' : 'Publier une vidéo'}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.feedRoot} onLayout={(event) => setPageHeight(Math.max(320, event.nativeEvent.layout.height - 76))}>
      <FlatList
        ref={listRef}
        data={items}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <ShortCard item={item} active={item.id === activeId} pageHeight={pageHeight} onOpenCreator={openCreator} />}
        pagingEnabled
        snapToAlignment="start"
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        onEndReached={() => { void loadMore(); }}
        onEndReachedThreshold={0.6}
        windowSize={3}
        initialNumToRender={2}
        removeClippedSubviews
        ListFooterComponent={loadingMore ? <ActivityIndicator color={colors.white} style={{ padding: 15 }} /> : null}
      />
      <View pointerEvents="none" style={styles.feedHeading}><Text style={styles.feedHeadingText}>SHORTS</Text></View>
    </View>
  );
}

function ShortCard({ item, active, pageHeight, onOpenCreator }: { item: Short; active: boolean; pageHeight: number; onOpenCreator: (author: ShortAuthor) => void }) {
  const [creatorLive, setCreatorLive] = useState<PublicLiveSession | null>(null);
  const isCreatorLive = !!creatorLive;
  const liveBadgeOffset = useSharedValue(0);
  const liveBadgeStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: liveBadgeOffset.value }],
  }));
  const player = useVideoPlayer(shortService.getVideoUrl(item), (instance) => { instance.loop = true; });
  const countedView = useRef(false);
  const [liked, setLiked] = useState(Boolean(item.likedByMe));
  const [likeCount, setLikeCount] = useState(item.likes ?? 0);
  const [shareCount, setShareCount] = useState(item.partages ?? 0);
  const [commentCount, setCommentCount] = useState(item.commentaires ?? 0);
  const [commentsVisible, setCommentsVisible] = useState(false);
  const [productVisible, setProductVisible] = useState(false);
  const [playing, setPlaying] = useState(active);

  const swipeResponder = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_event, gesture) => gesture.dx > 32 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.35,
    onPanResponderRelease: (_event, gesture) => { if (gesture.dx > 85) onOpenCreator(item.auteur); },
  }), [item.auteur, onOpenCreator]);

  useEffect(() => {
    let isMounted = true;
    const refreshCreatorLive = () => {
      void liveService.getCreatorLive(item.auteur.id)
        .then((live) => { if (isMounted) setCreatorLive(live); })
        .catch((error) => {
          console.warn('Impossible de vérifier le Live du créateur.', error);
          if (isMounted) setCreatorLive(null);
        });
    };
    refreshCreatorLive();
    const interval = setInterval(refreshCreatorLive, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [item.auteur.id]);

  useEffect(() => {
    if (isCreatorLive) {
      liveBadgeOffset.value = withRepeat(
        withSequence(
          withTiming(-2, { duration: 450 }),
          withTiming(0, { duration: 450 }),
        ),
        -1,
        false,
      );
    } else {
      cancelAnimation(liveBadgeOffset);
      liveBadgeOffset.value = 0;
    }
    return () => cancelAnimation(liveBadgeOffset);
  }, [isCreatorLive, liveBadgeOffset]);

  useEffect(() => {
    if (active) {
      player.play();
      setPlaying(true);
      if (!countedView.current) {
        countedView.current = true;
        void shortService.registerView(item.id).catch(() => undefined);
      }
    } else {
      player.pause();
      setPlaying(false);
    }
  }, [active, item.id, player]);

  const toggleLike = async () => {
    const previous = liked;
    setLiked(!previous);
    setLikeCount((count) => Math.max(0, count + (previous ? -1 : 1)));
    try {
      const result = await shortService.toggleLike(item.id);
      setLiked(result.liked);
      setLikeCount(result.likes);
    } catch {
      setLiked(previous);
      setLikeCount((count) => Math.max(0, count + (previous ? 1 : -1)));
      Alert.alert('Like non enregistré', 'Vérifie ta connexion puis réessaie.');
    }
  };

  const togglePlayback = () => {
    if (player.playing) {
      player.pause();
      setPlaying(false);
    } else {
      player.play();
      setPlaying(true);
    }
  };

  const share = async () => {
    try {
      const result = await Share.share({ message: `${item.titre}\n${shortService.getVideoUrl(item)}` });
      if (result.action === Share.sharedAction) {
        const updated = await shortService.registerShare(item.id);
        setShareCount(updated.partages);
      }
    } catch {
      Alert.alert('Partage', 'Le partage n’a pas pu être ouvert.');
    }
  };

  const authorName = [item.auteur?.prenom, item.auteur?.nom].filter(Boolean).join(' ') || 'Membre Orion';
  return (
    <View style={[styles.shortPage, { height: pageHeight || '100%' }]} {...swipeResponder.panHandlers}>
      <VideoView player={player} style={StyleSheet.absoluteFill} contentFit="cover" nativeControls={false} allowsPictureInPicture={false} />
      <Pressable style={StyleSheet.absoluteFill} onPress={togglePlayback} />
      {!playing ? <View pointerEvents="none" style={styles.pausedBadge}><Play size={25} color={colors.white} fill={colors.white} /></View> : null}
      <LinearGradient pointerEvents="none" colors={['rgba(0,0,0,0.30)', 'transparent', 'rgba(0,0,0,0.72)']} locations={[0, 0.42, 1]} style={StyleSheet.absoluteFill} />
      <View style={styles.shortTop}><Text style={styles.shortBadge}>ORION · SHORT</Text></View>
      <View style={styles.shortBottom}>
        <View style={styles.shortTextBlock}>
          <Text style={styles.creatorName}>@{authorName}</Text>
          <Text style={styles.shortTitle} numberOfLines={2}>{item.titre}</Text>
          {item.description ? <Text style={styles.shortDescription} numberOfLines={3}>{item.description}</Text> : null}
          <Text style={styles.viewCount}>{item.vues.toLocaleString('fr-FR')} vues</Text>
        </View>
        <View style={styles.actionRail}>
          <Pressable style={styles.profileActionButton} onPress={() => onOpenCreator(item.auteur)} accessibilityLabel={isCreatorLive ? 'Ouvrir le profil du créateur, en direct' : 'Ouvrir le profil du créateur'}>
            <View style={styles.creatorAvatarWrap}>
              {item.auteur?.image ? <Image source={{ uri: item.auteur.image }} style={[styles.creatorAvatar, isCreatorLive && styles.creatorAvatarLive]} /> : <View style={[styles.creatorAvatarFallback, isCreatorLive && styles.creatorAvatarLive]}><Text style={styles.creatorAvatarLetter}>{authorNameInitial(item.auteur)}</Text></View>}
              {isCreatorLive ? <Animated.View style={[styles.shortLiveBadge, liveBadgeStyle]}><Text style={styles.shortLiveText}>LIVE</Text></Animated.View> : null}
            </View>
          </Pressable>
          <Pressable style={styles.actionButton} onPress={() => { void toggleLike(); }}>
            <Heart size={27} color={colors.white} fill={liked ? '#E83D61' : 'transparent'} />
            <Text style={styles.actionLabel}>{likeCount}</Text>
          </Pressable>
          <Pressable style={styles.actionButton} onPress={() => setCommentsVisible(true)}>
            <MessageCircle size={26} color={colors.white} />
            <Text style={styles.actionLabel}>{commentCount}</Text>
          </Pressable>
          <Pressable style={styles.actionButton} onPress={() => { void share(); }}>
            <Share2 size={25} color={colors.white} />
            <Text style={styles.actionLabel}>{shareCount}</Text>
          </Pressable>
          <Pressable style={[styles.actionButton, !item.produit && styles.disabledProductAction]} disabled={!item.produit} onPress={() => setProductVisible(true)} accessibilityLabel={item.produit ? 'Voir le produit référencé' : 'Aucun produit référencé'}>
            <ShoppingBag size={24} color={colors.white} />
            <Text style={styles.actionLabel}>Produit</Text>
          </Pressable>
        </View>
      </View>
      <CommentsSheet shortId={item.id} visible={commentsVisible} onClose={() => setCommentsVisible(false)} onCountChange={setCommentCount} />
      {item.produit ? <ProductSheet product={item.produit} visible={productVisible} onClose={() => setProductVisible(false)} /> : null}
    </View>
  );
}

function authorNameInitial(author: ShortAuthor) {
  return `${author.prenom?.[0] ?? ''}${author.nom?.[0] ?? ''}`.toUpperCase() || 'O';
}

function ProductSheet({ product, visible, onClose }: { product: produits; visible: boolean; onClose: () => void }) {
  return <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <Pressable style={styles.productBackdrop} onPress={onClose}>
      <Pressable style={styles.productSheet} onPress={(event) => event.stopPropagation()}>
        <View style={styles.sheetHandle} />
        <View style={styles.productSheetHeader}><Text style={styles.productSheetTitle}>Produit de la vidéo</Text><Pressable onPress={onClose} hitSlop={10}><X size={22} color={colors.ink} /></Pressable></View>
        {product.image ? <Image source={{ uri: uploadedImageUrl(product.image) }} style={styles.linkedProductImage} resizeMode="cover" /> : <View style={[styles.linkedProductImage, styles.productImageFallback]}><Store size={34} color={colors.burgundy} /></View>}
        <Text style={styles.linkedProductName}>{product.nom}</Text>
        <Text style={styles.linkedProductPrice}>{formatFcfa(Number(product.prix ?? 0))}</Text>
        {product.description ? <Text style={styles.linkedProductDescription}>{product.description}</Text> : null}
        {product.stock != null ? <Text style={styles.linkedProductStock}>{product.stock > 0 ? `${product.stock} en stock` : 'Rupture de stock'}</Text> : null}
      </Pressable>
    </Pressable>
  </Modal>;
}

function CreatorProfile({ author, onBack, onOpenShort }: { author: ShortAuthor; onBack: () => void; onOpenShort: (short: Short) => void }) {
  const [profile, setProfile] = useState<ShortCreatorProfile | null>(null);
  const [creatorLive, setCreatorLive] = useState<PublicLiveSession | null>(null);
  const profileLiveBadgeOffset = useSharedValue(0);
  const profileLiveBadgeStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: profileLiveBadgeOffset.value }],
  }));
  const [shops, setShops] = useState<Boutique[]>([]);
  const [ownedProducts, setOwnedProducts] = useState<produits[]>([]);
  const [tab, setTab] = useState<'videos' | 'products'>('videos');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { width } = useWindowDimensions();
  const tileWidth = Math.max(120, (Math.min(width, 480) - 42) / 2);
  const backSwipe = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_event, gesture) => gesture.dx < -32 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.35,
    onPanResponderRelease: (_event, gesture) => { if (gesture.dx < -85) onBack(); },
  }), [onBack]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    Promise.all([
      shortService.getCreatorProfile(author.id),
      boutiqueService.getAll().catch(() => [] as Boutique[]),
      produitService.getByOwner(author.id).catch(() => [] as produits[]),
    ]).then(([creator, allShops, creatorProducts]) => {
      if (cancelled) return;
      setProfile(creator);
      setShops(allShops.filter((shop) => Number(shop.proprietaireId) === author.id));
      setOwnedProducts(creatorProducts);
    }).catch(() => {
      if (!cancelled) setError('Impossible de charger ce profil pour le moment.');
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [author.id]);

  useEffect(() => {
    if (creatorLive) {
      profileLiveBadgeOffset.value = withRepeat(
        withSequence(
          withTiming(-2, { duration: 450 }),
          withTiming(0, { duration: 450 }),
        ),
        -1,
        false,
      );
    } else {
      cancelAnimation(profileLiveBadgeOffset);
      profileLiveBadgeOffset.value = 0;
    }
    return () => cancelAnimation(profileLiveBadgeOffset);
  }, [creatorLive, profileLiveBadgeOffset]);

  useEffect(() => {
    let isMounted = true;
    const refreshCreatorLive = () => {
      void liveService.getCreatorLive(author.id)
        .then((live) => { if (isMounted) setCreatorLive(live); })
        .catch((requestError) => {
          console.warn('Impossible de vérifier le Live du créateur.', requestError);
          if (isMounted) setCreatorLive(null);
        });
    };
    refreshCreatorLive();
    const interval = setInterval(refreshCreatorLive, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [author.id]);

  const creator = profile?.auteur ?? author;
  const shorts = profile?.shorts ?? [];
  const shopProducts: { product: produits; shop: Boutique }[] = shops.flatMap((shop) =>
    (shop.produits ?? []).map((product) => ({ product, shop })),
  );
  const linkedProductIds = new Set(shopProducts.map(({ product }) => product.id));
  const standaloneProducts = ownedProducts.filter((product) => !linkedProductIds.has(product.id));
  const productsCount = shopProducts.length + standaloneProducts.length;
  const creatorName = [creator.prenom, creator.nom].filter(Boolean).join(' ') || 'Membre Orion';

  return (
    <ScrollView {...backSwipe.panHandlers} style={styles.profilePage} contentContainerStyle={styles.profileContent} showsVerticalScrollIndicator={false}>
      <View style={styles.profileTopBar}>
        <Pressable style={styles.backButton} onPress={onBack}><ArrowLeft size={22} color={colors.ink} /></Pressable>
        <Text style={styles.profileTopTitle}>Profil</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.profileHero}>
        <Pressable
          style={styles.profileAvatarButton}
          disabled={!creatorLive}
          onPress={() => {
            if (creatorLive) {
              void Linking.openURL(creatorLive.tiktokUrl).catch(() =>
                Alert.alert('Ouverture impossible', 'Le lien TikTok du Live ne peut pas être ouvert sur cet appareil.'),
              );
            }
          }}
          accessibilityRole={creatorLive ? 'button' : undefined}
          accessibilityLabel={creatorLive ? 'Regarder le Live TikTok du créateur' : 'Photo du créateur'}
        >
          {creator.image ? <Image source={{ uri: creator.image }} style={[styles.profileAvatar, creatorLive && styles.profileAvatarLive]} /> : <View style={[styles.profileAvatar, styles.profileAvatarFallback, creatorLive && styles.profileAvatarLive]}><Text style={styles.profileAvatarInitial}>{authorNameInitial(creator)}</Text></View>}
          {creatorLive ? <Animated.View style={[styles.profileLiveBadge, profileLiveBadgeStyle]}><Text style={styles.profileLiveBadgeText}>LIVE</Text></Animated.View> : null}
        </Pressable>
        <Text style={styles.profileName}>{creatorName}</Text>
        <Text style={styles.profileMeta}>{creator.role === 'COMMERCANT' ? 'Créateur · Commerçant' : 'Créateur Orion'}</Text>
        {creator.specialite ? <Text style={styles.profileBio}>{creator.specialite}</Text> : null}
        {creator.localisation ? <View style={styles.locationRow}><MapPin size={13} color={colors.muted} /><Text style={styles.locationText}>{creator.localisation}</Text></View> : null}
        <View style={styles.profileStats}>
          <View style={styles.profileStat}><Text style={styles.profileStatValue}>{shorts.length}</Text><Text style={styles.profileStatLabel}>Vidéos</Text></View>
          <View style={styles.profileStatDivider} />
          <View style={styles.profileStat}><Text style={styles.profileStatValue}>{productsCount}</Text><Text style={styles.profileStatLabel}>Produits</Text></View>
          <View style={styles.profileStatDivider} />
          <View style={styles.profileStat}><Text style={styles.profileStatValue}>{shops.length}</Text><Text style={styles.profileStatLabel}>Boutiques</Text></View>
        </View>
      </View>
      <View style={styles.profileTabs}>
        <Pressable style={[styles.profileTab, tab === 'videos' && styles.profileTabActive]} onPress={() => setTab('videos')}><Play size={16} color={tab === 'videos' ? colors.burgundy : colors.muted} /><Text style={[styles.profileTabText, tab === 'videos' && styles.profileTabTextActive]}>Vidéos</Text></Pressable>
        <Pressable style={[styles.profileTab, tab === 'products' && styles.profileTabActive]} onPress={() => setTab('products')}><Store size={16} color={tab === 'products' ? colors.burgundy : colors.muted} /><Text style={[styles.profileTabText, tab === 'products' && styles.profileTabTextActive]}>Produits</Text></Pressable>
      </View>
      {loading ? <ActivityIndicator color={colors.burgundy} style={{ marginVertical: 30 }} /> : error ? <Text style={styles.profileEmpty}>{error}</Text> : tab === 'videos' ? (
        shorts.length ? <View style={styles.profileGrid}>{shorts.map((short) => <Pressable key={short.id} style={[styles.videoTile, { width: tileWidth }]} onPress={() => onOpenShort(short)}>
          {short.coverUrl ? <Image source={{ uri: short.coverUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" /> : <View style={styles.videoTileFallback}><Play size={26} color={colors.white} fill={colors.white} /></View>}
          <View style={styles.videoTileOverlay}><Play size={12} color={colors.white} fill={colors.white} /><Text style={styles.videoTileViews}>{short.vues}</Text></View>
          <Text style={styles.videoTileTitle} numberOfLines={2}>{short.titre}</Text>
        </Pressable>)}</View> : <Text style={styles.profileEmpty}>Aucune vidéo publiée pour le moment.</Text>
      ) : productsCount ? (
        <View style={styles.creatorShops}>
          {shops.map((shop) => {
            const shopProducts = shop.produits ?? [];
            if (!shopProducts.length) return null;
            return <View key={shop.id} style={styles.creatorShopSection}>
              <View style={styles.creatorShopHeading}><Store size={16} color={colors.burgundy} /><Text style={styles.creatorShopName}>{shop.nom}</Text><Text style={styles.creatorShopCount}>{shopProducts.length} produits</Text></View>
              <View style={styles.profileGrid}>{shopProducts.map((product) => <View key={`${shop.id}-${product.id}`} style={[styles.productTile, { width: tileWidth }]}>
                {product.image ? <Image source={{ uri: uploadedImageUrl(product.image) }} style={styles.profileProductImage} resizeMode="cover" /> : <View style={[styles.profileProductImage, styles.productImageFallback]}><Store size={24} color={colors.burgundy} /></View>}
                <Text style={styles.profileProductName} numberOfLines={2}>{product.nom}</Text>
                <Text style={styles.profileProductPrice}>{formatFcfa(Number(product.prix ?? 0))}</Text>
              </View>)}</View>
            </View>;
          })}
          {standaloneProducts.length ? <View style={styles.creatorShopSection}>
            <View style={styles.creatorShopHeading}><Store size={16} color={colors.burgundy} /><Text style={styles.creatorShopName}>Produits du créateur</Text><Text style={styles.creatorShopCount}>{standaloneProducts.length} produits</Text></View>
            <View style={styles.profileGrid}>{standaloneProducts.map((product) => <View key={product.id} style={[styles.productTile, { width: tileWidth }]}>
              {product.image ? <Image source={{ uri: uploadedImageUrl(product.image) }} style={styles.profileProductImage} resizeMode="cover" /> : <View style={[styles.profileProductImage, styles.productImageFallback]}><Store size={24} color={colors.burgundy} /></View>}
              <Text style={styles.profileProductName} numberOfLines={2}>{product.nom}</Text>
              <Text style={styles.profileProductPrice}>{formatFcfa(Number(product.prix ?? 0))}</Text>
            </View>)}</View>
          </View> : null}
        </View>
      ) : <Text style={styles.profileEmpty}>Aucun produit disponible dans les boutiques de ce créateur.</Text>}
      <View style={{ height: 92 }} />
    </ScrollView>
  );
}

function CommentsSheet({ shortId, visible, onClose, onCountChange }: { shortId: number; visible: boolean; onClose: () => void; onCountChange: (count: number) => void }) {
  const [comments, setComments] = useState<ShortComment[]>([]);
  const [total, setTotal] = useState(0);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!visible) return;
    setLoading(true);
    setError('');
    shortService.getComments(shortId)
      .then((response) => { setComments(response.items); setTotal(response.total); onCountChange(response.total); })
      .catch(() => setError('Impossible de charger les commentaires.'))
      .finally(() => setLoading(false));
  }, [shortId, visible, onCountChange]);

  const send = async () => {
    const contenu = draft.trim();
    if (!contenu || sending) return;
    setSending(true);
    try {
      const comment = await shortService.addComment(shortId, contenu);
      setComments((current) => [comment, ...current]);
      setTotal((current) => { onCountChange(current + 1); return current + 1; });
      setDraft('');
    } catch (requestError: any) {
      const message = requestError?.response?.data?.message;
      Alert.alert('Commentaire non publié', Array.isArray(message) ? message.join('\n') : message || 'Vérifie ta connexion puis réessaie.');
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.commentBackdrop}>
        <KeyboardAvoidingView style={styles.commentSheet} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.commentHeader}><Text style={styles.commentHeading}>Commentaires</Text><Pressable onPress={onClose}><X size={21} color={colors.ink} /></Pressable></View>
          {loading ? <ActivityIndicator color={colors.burgundy} style={{ margin: 24 }} /> : error ? <Text style={styles.commentEmpty}>{error}</Text> : comments.length ? (
            <FlatList
              data={comments}
              keyExtractor={(comment) => String(comment.id)}
              renderItem={({ item: comment }) => {
                const name = [comment.auteur?.prenom, comment.auteur?.nom].filter(Boolean).join(' ') || 'Membre Orion';
                return <View style={styles.commentRow}><Text style={styles.commentAuthor}>{name}</Text><Text style={styles.commentText}>{comment.contenu}</Text><Text style={styles.commentDate}>{new Date(comment.creeLe).toLocaleDateString('fr-FR')}</Text></View>;
              }}
              contentContainerStyle={{ paddingBottom: 12 }}
              showsVerticalScrollIndicator={false}
            />
          ) : <Text style={styles.commentEmpty}>Aucun commentaire. Lance la discussion !</Text>}
          <View style={styles.commentInputRow}>
            <TextInput value={draft} onChangeText={setDraft} maxLength={1000} placeholder="Écrire un commentaire…" placeholderTextColor="#8B8B8B" style={styles.commentInput} multiline />
            <Pressable style={[styles.sendComment, (!draft.trim() || sending) && { opacity: 0.5 }]} disabled={!draft.trim() || sending} onPress={() => { void send(); }}>
              {sending ? <ActivityIndicator color={colors.white} size="small" /> : <Send size={17} color={colors.white} />}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

export function ShortComposer({
  visible,
  asset,
  onClose,
  onPublished,
  onChooseAnother,
}: {
  visible: boolean;
  asset: ImagePickerAsset | null;
  onClose: () => void;
  onPublished: () => void;
  onChooseAnother: () => void;
}) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [products, setProducts] = useState<produits[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<produits | null>(null);
  const [productPickerVisible, setProductPickerVisible] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const player = useVideoPlayer(asset?.uri ?? null, (instance) => { instance.loop = true; });

  useEffect(() => {
    if (visible && asset) player.play();
    else player.pause();
  }, [asset, player, visible]);

  useEffect(() => {
    if (visible) {
      setTitle('');
      setDescription('');
      setProgress(0);
      setSelectedProduct(null);
      if (user?.id) {
        setProductsLoading(true);
        void produitService.getByOwner(user.id).then(setProducts).catch(() => setProducts([])).finally(() => setProductsLoading(false));
      } else {
        setProducts([]);
      }
    }
  }, [visible, asset?.uri]);

  const publish = async () => {
    if (!asset) return;
    if (!title.trim()) {
      Alert.alert('Titre requis', 'Ajoute un titre pour publier ton Short.');
      return;
    }
    setPublishing(true);
    try {
      await shortService.publish({
        videoUri: asset.uri,
        titre: title.trim(),
        description: description.trim(),
        produitId: selectedProduct?.id,
        onUploadProgress: setProgress,
      });
      onClose();
      onPublished();
      Alert.alert('Short publié', 'Ta vidéo est maintenant disponible dans le fil Shorts.');
    } catch (error: any) {
      const message = error?.response?.data?.message;
      Alert.alert('Publication impossible', Array.isArray(message) ? message.join('\n') : message || 'Vérifie ta connexion et réessaie.');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={publishing ? undefined : onClose}>
      <KeyboardAvoidingView style={styles.composer} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.composerHeader}>
          <Pressable disabled={publishing} onPress={onClose} style={styles.closeComposer}><X size={22} color={colors.ink} /></Pressable>
          <Text style={styles.composerHeading}>Nouveau Short</Text>
          <View style={{ width: 40 }} />
        </View>
        {asset ? (
          <>
            <View style={styles.previewFrame}>
              <VideoView player={player} style={StyleSheet.absoluteFill} contentFit="contain" nativeControls allowsPictureInPicture={false} />
              <Text style={styles.previewDuration}>{asset.duration ? `${Math.round(asset.duration / 1000)} s` : 'Aperçu'}</Text>
            </View>
            <Pressable style={styles.changeVideo} disabled={publishing} onPress={onChooseAnother}>
              <Text style={styles.changeVideoText} numberOfLines={1}>{asset.fileName || 'Vidéo sélectionnée'}</Text>
            </Pressable>
            <Text style={styles.formLabel}>Titre</Text>
            <TextInput value={title} onChangeText={setTitle} maxLength={120} placeholder="Donne un titre à ta vidéo" placeholderTextColor="#999" style={styles.titleInput} editable={!publishing} />
            <Text style={styles.formLabel}>Description</Text>
            <TextInput value={description} onChangeText={setDescription} maxLength={2000} multiline placeholder="Présente ta vidéo, ton produit ou ton idée…" placeholderTextColor="#999" style={styles.descriptionInput} textAlignVertical="top" editable={!publishing} />
            <Text style={styles.formLabel}>Produit à référencer (facultatif)</Text>
            <Pressable style={styles.productPickerButton} disabled={publishing} onPress={() => setProductPickerVisible(true)}>
              <ShoppingBag size={18} color={colors.burgundy} />
              <Text style={styles.productPickerLabel} numberOfLines={1}>{selectedProduct?.nom ?? 'Choisir un de mes produits'}</Text>
              {selectedProduct ? <Pressable onPress={(event) => { event.stopPropagation(); setSelectedProduct(null); }} hitSlop={8}><X size={18} color={colors.muted} /></Pressable> : null}
            </Pressable>
            {publishing ? <Text style={styles.uploadProgress}>Envoi de la vidéo… {progress}%</Text> : null}
            <Pressable style={[styles.publishButton, publishing && { opacity: 0.65 }]} disabled={publishing} onPress={() => { void publish(); }}>
              {publishing ? <ActivityIndicator color={colors.white} /> : <><Plus size={18} color={colors.white} /><Text style={styles.publishButtonText}>Publier le Short</Text></>}
            </Pressable>
          </>
        ) : <View style={styles.centerState}><Text style={styles.stateHint}>Aucune vidéo sélectionnée.</Text></View>}
        <ProductPickerSheet visible={productPickerVisible} products={products} loading={productsLoading} selectedId={selectedProduct?.id} onClose={() => setProductPickerVisible(false)} onSelect={(product) => { setSelectedProduct(product); setProductPickerVisible(false); }} />
      </KeyboardAvoidingView>
    </Modal>
  );
}

function ProductPickerSheet({ visible, products, loading, selectedId, onClose, onSelect }: { visible: boolean; products: produits[]; loading: boolean; selectedId?: number; onClose: () => void; onSelect: (product: produits) => void }) {
  return <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <Pressable style={styles.productBackdrop} onPress={onClose}>
      <View style={[styles.productSheet, styles.pickerSheet]}>
        <View style={styles.sheetHandle} />
        <View style={styles.productSheetHeader}><Text style={styles.productSheetTitle}>Référencer un produit</Text><Pressable onPress={onClose} hitSlop={10}><X size={22} color={colors.ink} /></Pressable></View>
        <Text style={styles.pickerHint}>Le produit apparaîtra sous Partager dans cette vidéo.</Text>
        {loading ? <ActivityIndicator color={colors.burgundy} style={{ marginTop: 28 }} /> : products.length ? <FlatList data={products} keyExtractor={(product) => String(product.id)} contentContainerStyle={{ paddingBottom: 20 }} renderItem={({ item }) => <Pressable style={styles.productOption} onPress={() => onSelect(item)}>
          {item.image ? <Image source={{ uri: uploadedImageUrl(item.image) }} style={styles.productOptionImage} /> : <View style={[styles.productOptionImage, styles.productImageFallback]}><Store size={20} color={colors.burgundy} /></View>}
          <View style={{ flex: 1 }}><Text style={styles.productOptionName} numberOfLines={1}>{item.nom}</Text><Text style={styles.productOptionPrice}>{formatFcfa(Number(item.prix ?? 0))}</Text></View>
          {selectedId === item.id ? <Check size={20} color={colors.burgundy} /> : null}
        </Pressable>} /> : <Text style={styles.noProducts}>Tu n’as pas encore de produit à référencer.</Text>}
      </View>
    </Pressable>
  </Modal>;
}

const styles = StyleSheet.create({
  feedRoot: { flex: 1, paddingBottom: 76, backgroundColor: colors.navy },
  shortPage: { backgroundColor: colors.navy, overflow: 'hidden' },
  feedHeading: { position: 'absolute', top: 17, alignSelf: 'center' },
  feedHeadingText: { color: colors.white, fontWeight: '800', fontSize: 14, letterSpacing: 1.5 },
  shortTop: { position: 'absolute', top: 16, left: 17, right: 17, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  shortBadge: { color: 'rgba(255,255,255,0.82)', fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  profileActionButton: { alignItems: 'center', justifyContent: 'center', marginBottom: 1 },
  creatorAvatarWrap: { position: 'relative', paddingTop: 2 },
  creatorAvatar: { width: 42, height: 42, borderRadius: 21, borderWidth: 2, borderColor: colors.white, backgroundColor: colors.burgundy },
  creatorAvatarLive: { borderColor: '#FF496C' },
  creatorAvatarFallback: { width: 42, height: 42, borderRadius: 21, borderWidth: 2, borderColor: colors.white, backgroundColor: colors.burgundy, alignItems: 'center', justifyContent: 'center' },
  creatorAvatarLetter: { color: colors.white, fontSize: 13, fontWeight: '800' },
  shortLiveBadge: { position: 'absolute', top: -7, alignSelf: 'center', backgroundColor: '#D93458', borderRadius: 7, paddingHorizontal: 5, paddingVertical: 1, borderWidth: 1, borderColor: colors.white, zIndex: 1 },
  shortLiveText: { color: colors.white, fontSize: 7, fontWeight: '900', letterSpacing: 0.4 },
  pausedBadge: { position: 'absolute', zIndex: 1, alignSelf: 'center', top: '46%', width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  shortBottom: { position: 'absolute', left: 18, right: 16, bottom: 27, flexDirection: 'row', alignItems: 'flex-end' },
  shortTextBlock: { flex: 1, paddingRight: 15 },
  creatorName: { color: colors.white, fontWeight: '800', fontSize: 14, marginBottom: 8 },
  shortTitle: { color: colors.white, fontWeight: '800', fontSize: 20, lineHeight: 25 },
  shortDescription: { color: colors.white, fontSize: 13, lineHeight: 18, marginTop: 7 },
  viewCount: { color: 'rgba(255,255,255,0.78)', fontSize: 11, marginTop: 9 },
  actionRail: { alignItems: 'center', gap: 19, paddingBottom: 2 },
  actionButton: { minWidth: 40, alignItems: 'center' },
  actionLabel: { color: colors.white, fontSize: 10, fontWeight: '700', marginTop: 3 },
  disabledProductAction: { opacity: 0.38 },
  centerState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30, backgroundColor: colors.white },
  stateHint: { color: colors.muted, marginTop: 12, textAlign: 'center' },
  emptyScreen: { flex: 1, paddingBottom: 76, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 35 },
  emptyIcon: { width: 74, height: 74, borderRadius: 24, backgroundColor: colors.burgundySoft, alignItems: 'center', justifyContent: 'center', marginBottom: 19 },
  emptyTitle: { color: colors.ink, fontSize: 20, fontWeight: '800', textAlign: 'center' },
  emptyCopy: { color: colors.muted, fontSize: 13, lineHeight: 19, textAlign: 'center', marginTop: 8 },
  emptyButton: { flexDirection: 'row', gap: 8, alignItems: 'center', backgroundColor: colors.burgundy, borderRadius: 14, paddingHorizontal: 17, paddingVertical: 13, marginTop: 20 },
  emptyButtonText: { color: colors.white, fontSize: 13, fontWeight: '800' },
  composer: { flex: 1, backgroundColor: colors.white, paddingHorizontal: 18, paddingBottom: 20 },
  composerHeader: { height: 58, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  closeComposer: { width: 40, height: 40, justifyContent: 'center' },
  composerHeading: { color: colors.ink, fontWeight: '800', fontSize: 17 },
  previewFrame: { height: 270, backgroundColor: '#080B10', borderRadius: 17, overflow: 'hidden', marginTop: 5 },
  previewDuration: { position: 'absolute', right: 10, bottom: 10, color: colors.white, backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 7, fontSize: 11 },
  changeVideo: { alignSelf: 'flex-start', maxWidth: '100%', backgroundColor: colors.burgundySoft, borderRadius: 11, paddingHorizontal: 12, paddingVertical: 8, marginTop: 10, marginBottom: 15 },
  changeVideoText: { color: colors.burgundy, fontSize: 11, fontWeight: '700' },
  formLabel: { color: colors.ink, fontWeight: '800', fontSize: 12, marginBottom: 7 },
  titleInput: { minHeight: 45, borderWidth: 1, borderColor: colors.line, borderRadius: 12, paddingHorizontal: 12, color: colors.ink, fontSize: 13, marginBottom: 14 },
  descriptionInput: { height: 83, borderWidth: 1, borderColor: colors.line, borderRadius: 12, padding: 12, color: colors.ink, fontSize: 13, marginBottom: 12 },
  productPickerButton: { minHeight: 47, borderWidth: 1, borderColor: colors.line, borderRadius: 12, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  productPickerLabel: { flex: 1, color: colors.ink, fontSize: 13 },
  productBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.48)' },
  productSheet: { backgroundColor: colors.white, borderTopLeftRadius: 23, borderTopRightRadius: 23, paddingHorizontal: 19, paddingTop: 10, paddingBottom: 28, maxHeight: '78%' },
  pickerSheet: { height: '68%' },
  sheetHandle: { alignSelf: 'center', width: 38, height: 4, borderRadius: 2, backgroundColor: '#D5D5D8', marginBottom: 15 },
  productSheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  productSheetTitle: { color: colors.ink, fontSize: 17, fontWeight: '800' },
  pickerHint: { color: colors.muted, fontSize: 12, marginBottom: 12 },
  productOption: { minHeight: 70, borderBottomWidth: 1, borderBottomColor: colors.line, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 9 },
  productOptionImage: { width: 52, height: 52, borderRadius: 10, backgroundColor: colors.burgundySoft },
  productOptionName: { color: colors.ink, fontSize: 13, fontWeight: '700' },
  productOptionPrice: { color: colors.burgundy, fontSize: 12, fontWeight: '800', marginTop: 4 },
  noProducts: { color: colors.muted, textAlign: 'center', paddingVertical: 30, fontSize: 13 },
  linkedProductImage: { width: '100%', height: 220, borderRadius: 15, backgroundColor: colors.burgundySoft, marginBottom: 12 },
  linkedProductName: { color: colors.ink, fontSize: 18, fontWeight: '800' },
  linkedProductPrice: { color: colors.burgundy, fontSize: 16, fontWeight: '800', marginTop: 6 },
  linkedProductDescription: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 10 },
  linkedProductStock: { color: colors.muted, fontSize: 12, marginTop: 9 },
  uploadProgress: { color: colors.burgundy, fontSize: 12, fontWeight: '700', textAlign: 'center', marginVertical: 8 },
  publishButton: { minHeight: 49, borderRadius: 14, backgroundColor: colors.burgundy, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 9, marginTop: 5 },
  publishButtonText: { color: colors.white, fontWeight: '800', fontSize: 14 },
  commentBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  commentSheet: { height: '72%', backgroundColor: colors.white, borderTopLeftRadius: 22, borderTopRightRadius: 22, paddingHorizontal: 18, paddingTop: 18, paddingBottom: 12 },
  commentHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: colors.line },
  commentHeading: { color: colors.ink, fontSize: 16, fontWeight: '800' },
  commentEmpty: { color: colors.muted, textAlign: 'center', marginTop: 24, fontSize: 13 },
  commentRow: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.line },
  commentAuthor: { color: colors.ink, fontSize: 12, fontWeight: '800' },
  commentText: { color: colors.ink, fontSize: 13, lineHeight: 19, marginTop: 4 },
  commentDate: { color: colors.muted, fontSize: 10, marginTop: 5 },
  commentInputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 9, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.line },
  commentInput: { flex: 1, maxHeight: 90, borderWidth: 1, borderColor: colors.line, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 9, color: colors.ink, fontSize: 13 },
  sendComment: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.burgundy, alignItems: 'center', justifyContent: 'center' },
  profilePage: { flex: 1, backgroundColor: '#FAF8F7' },
  profileContent: { paddingBottom: 15 },
  profileTopBar: { height: 54, paddingHorizontal: 15, backgroundColor: colors.white, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  profileTopTitle: { color: colors.ink, fontSize: 16, fontWeight: '800' },
  profileHero: { backgroundColor: colors.white, alignItems: 'center', paddingHorizontal: 22, paddingTop: 13, paddingBottom: 19 },
  profileAvatarButton: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  profileAvatar: { width: 88, height: 88, borderRadius: 44, backgroundColor: colors.burgundySoft, borderWidth: 3, borderColor: colors.burgundySoft },
  profileAvatarLive: { borderColor: '#FF496C' },
  profileLiveBadge: { position: 'absolute', bottom: -5, alignSelf: 'center', backgroundColor: '#D93458', borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2, borderWidth: 1, borderColor: colors.white, zIndex: 1 },
  profileLiveBadgeText: { color: colors.white, fontSize: 8, fontWeight: '900', letterSpacing: 0.4 },
  profileAvatarFallback: { alignItems: 'center', justifyContent: 'center' },
  profileAvatarInitial: { color: colors.burgundy, fontSize: 26, fontWeight: '800' },
  profileName: { color: colors.ink, fontSize: 19, fontWeight: '800', marginTop: 10 },
  profileMeta: { color: colors.burgundy, fontSize: 11, fontWeight: '700', marginTop: 4 },
  profileBio: { color: colors.ink, fontSize: 12, marginTop: 9, textAlign: 'center' },
  locationRow: { flexDirection: 'row', gap: 4, alignItems: 'center', marginTop: 6 },
  locationText: { color: colors.muted, fontSize: 11 },
  profileStats: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly', width: '100%', marginTop: 18, paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.line },
  profileStat: { alignItems: 'center', minWidth: 72 },
  profileStatValue: { color: colors.ink, fontSize: 15, fontWeight: '800' },
  profileStatLabel: { color: colors.muted, fontSize: 10, marginTop: 3 },
  profileStatDivider: { height: 28, width: 1, backgroundColor: colors.line },
  profileTabs: { flexDirection: 'row', backgroundColor: colors.white, marginTop: 9, borderBottomWidth: 1, borderBottomColor: colors.line },
  profileTab: { flex: 1, height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  profileTabActive: { borderBottomColor: colors.burgundy },
  profileTabText: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  profileTabTextActive: { color: colors.burgundy },
  profileEmpty: { color: colors.muted, fontSize: 12, lineHeight: 18, textAlign: 'center', paddingHorizontal: 25, paddingVertical: 28 },
  profileGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', gap: 10, paddingHorizontal: 14, paddingTop: 14 },
  videoTile: { height: 185, borderRadius: 13, overflow: 'hidden', backgroundColor: colors.navy, justifyContent: 'flex-end' },
  videoTileFallback: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: '#223344' },
  videoTileOverlay: { position: 'absolute', left: 9, bottom: 9, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 12, paddingHorizontal: 7, paddingVertical: 4 },
  videoTileViews: { color: colors.white, fontSize: 10, fontWeight: '700' },
  videoTileTitle: { color: colors.white, fontSize: 11, lineHeight: 15, fontWeight: '700', paddingHorizontal: 8, paddingBottom: 29, backgroundColor: 'rgba(0,0,0,0.25)' },
  creatorShops: { paddingBottom: 15 },
  creatorShopSection: { paddingTop: 15 },
  creatorShopHeading: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 15, paddingBottom: 3 },
  creatorShopName: { color: colors.ink, fontSize: 14, fontWeight: '800', flex: 1 },
  creatorShopCount: { color: colors.muted, fontSize: 10 },
  productTile: { backgroundColor: colors.white, borderRadius: 13, padding: 8, overflow: 'hidden' },
  profileProductImage: { width: '100%', height: 125, borderRadius: 9, backgroundColor: colors.burgundySoft },
  productImageFallback: { alignItems: 'center', justifyContent: 'center' },
  profileProductName: { color: colors.ink, fontSize: 11, lineHeight: 15, fontWeight: '700', marginTop: 8, minHeight: 30 },
  profileProductPrice: { color: colors.burgundy, fontSize: 11, fontWeight: '800', marginTop: 5 },
});
