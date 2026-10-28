import { Mail, MapPin, Phone, Shield, Store } from 'lucide-react-native';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/features/auth/hooks';
import { useStore } from '@/features/seller/boutique-context';
import { colors, radius, spacing } from '../theme';

export function ProfileScreen() {
  const { user, isSeller } = useAuth();
  const { activeStore } = useStore();
  const fullName = [user?.prenom, user?.nom].filter(Boolean).join(' ') || 'Membre Orion';
  const initials = fullName.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();

  return <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <View style={styles.header}><Text style={styles.title}>Profil</Text><Text style={styles.subtitle}>Vos informations personnelles</Text></View>
    <View style={styles.profileCard}>
      <View style={styles.avatar}><Text style={styles.avatarText}>{initials}</Text></View>
      <View style={styles.profileInfo}><Text style={styles.profileName}>{fullName}</Text><Text style={styles.profileRole}>{isSeller ? 'Compte commerçant' : 'Compte utilisateur'}</Text><Text style={styles.profileLocation}>{user?.localisation || user?.adresse || 'Localisation non renseignée'}</Text></View>
    </View>
    {isSeller ? <LinearGradient colors={[colors.burgundy, colors.burgundyDark]} style={styles.banner}>
      <Text style={styles.bannerEyebrow}>VOTRE ÉCOSYSTÈME</Text><Text style={styles.bannerTitle}>Créez une fois.{ '\n' }Vendez partout.</Text><Text style={styles.bannerText}>Boutique · Shorts · Live · Clients</Text>
    </LinearGradient> : null}
    <Text style={styles.sectionLabel}>Informations personnelles</Text>
    <View style={styles.infoCard}>
      <InfoRow icon={<Mail size={18} color={colors.burgundy} />} label="Email" value={user?.email || 'Non renseigné'} />
      <InfoRow icon={<Phone size={18} color={colors.burgundy} />} label="Téléphone" value={user?.contact || 'Non renseigné'} />
      <InfoRow icon={<MapPin size={18} color={colors.burgundy} />} label="Localisation" value={user?.localisation || user?.adresse || 'Non renseignée'} />
    </View>
    {isSeller ? <><Text style={styles.sectionLabel}>Informations commerciales</Text><View style={styles.infoCard}>
      <InfoRow icon={<Store size={18} color={colors.burgundy} />} label="Boutique active" value={activeStore?.nom || 'Aucune boutique'} />
      <InfoRow icon={<Shield size={18} color={colors.burgundy} />} label="Statut" value="Compte commerçant" />
    </View></> : null}
  </ScrollView>;
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <View style={styles.infoRow}><View style={styles.infoIcon}>{icon}</View><View style={styles.flex}><Text style={styles.infoLabel}>{label}</Text><Text style={styles.infoValue}>{value}</Text></View></View>;
}

const styles = StyleSheet.create({
  content: { paddingBottom: 40 }, header: { marginBottom: spacing.md }, title: { color: colors.ink, fontSize: 24, fontWeight: '800' }, subtitle: { color: colors.muted, fontSize: 13, marginTop: 4 },
  profileCard: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, marginBottom: spacing.md }, avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#243D4E', alignItems: 'center', justifyContent: 'center', marginRight: 14 }, avatarText: { color: 'white', fontSize: 19, fontWeight: '800' }, profileInfo: { flex: 1 }, profileName: { color: colors.ink, fontSize: 19, fontWeight: '800' }, profileRole: { color: colors.burgundy, fontSize: 11, fontWeight: '700', marginTop: 4 }, profileLocation: { color: colors.muted, fontSize: 11, marginTop: 4 },
  banner: { borderRadius: radius.lg, padding: 20, marginBottom: spacing.lg }, bannerEyebrow: { color: '#F7CBD5', fontSize: 9, letterSpacing: 1.1, fontWeight: '800' }, bannerTitle: { color: 'white', fontSize: 23, fontWeight: '800', marginTop: 12, lineHeight: 27 }, bannerText: { color: '#F7CBD5', fontSize: 11, marginTop: 14 },
  sectionLabel: { color: colors.ink, fontSize: 14, fontWeight: '700', marginBottom: 10, marginTop: 4 }, infoCard: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, padding: 4, marginBottom: spacing.lg }, infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: colors.line }, infoIcon: { width: 38, height: 38, borderRadius: 11, backgroundColor: colors.burgundySoft, alignItems: 'center', justifyContent: 'center', marginRight: 12 }, flex: { flex: 1 }, infoLabel: { color: colors.muted, fontSize: 11, fontWeight: '600' }, infoValue: { color: colors.ink, fontSize: 13, fontWeight: '700', marginTop: 3 },
});
