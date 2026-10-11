import { useState } from 'react';
import { Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '@/features/auth/hooks';
import { useLiveSession } from '@/features/live/LiveContext';
import { uploadedImageUrl } from '@/features/redesign/mappers';

export function LiveAvatar({ size = 36, onOfflinePress }: { size?: number; onOfflinePress?: () => void }) {
  const { user } = useAuth();
  const { session } = useLiveSession();
  const [imageFailed, setImageFailed] = useState(false);
  const initials = `${user?.prenom?.[0] ?? ''}${user?.nom?.[0] ?? ''}`.toUpperCase() || 'O';
  const dimension = { width: size, height: size, borderRadius: size / 2 };
  const imageUri = uploadedImageUrl(user?.image);

  const open = () => {
    if (session?.tiktokUrl) void Linking.openURL(session.tiktokUrl).catch(() => undefined);
    else onOfflinePress?.();
  };

  return <Pressable onPress={open} accessibilityRole="button" accessibilityLabel={session ? 'Ouvrir mon Live TikTok' : 'Ouvrir mon profil'} style={styles.wrap}>
    {imageUri && !imageFailed ? <Image source={{ uri: imageUri }} style={[dimension, session && styles.liveRing]} onError={() => setImageFailed(true)} /> : <View style={[styles.fallback, dimension, session && styles.liveRing]}><Text style={{ color: '#fff', fontSize: size * 0.34, fontWeight: '800' }}>{initials}</Text></View>}
    {session ? <View style={styles.liveBadge}><Text style={styles.liveText}>LIVE</Text></View> : null}
  </Pressable>;
}

const styles = StyleSheet.create({
  wrap: { position: 'relative', margin: 3 },
  fallback: { backgroundColor: '#243D4E', alignItems: 'center', justifyContent: 'center' },
  liveRing: { borderWidth: 2, borderColor: '#E14D67' },
  liveBadge: { position: 'absolute', bottom: -4, alignSelf: 'center', backgroundColor: '#D93458', borderRadius: 7, paddingHorizontal: 5, paddingVertical: 1, borderWidth: 1, borderColor: '#fff' },
  liveText: { color: '#fff', fontSize: 7, fontWeight: '900', letterSpacing: 0.3 },
});
