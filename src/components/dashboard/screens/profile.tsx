import { ChevronRight, Mail, MapPin, Phone, Shield, Store } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, spacing } from '../theme';
import { type DashboardScreen } from '../shared';

export function ProfileScreen({ onNavigate }: { onNavigate: (screen: DashboardScreen) => void }) {
  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Profil</Text>
        <Text style={styles.subtitle}>Vos informations et abonnement</Text>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatar}><Text style={styles.avatarText}>JK</Text></View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>Jean Koffi</Text>
          <View style={styles.verifiedRow}>
            <Text style={styles.profileRole}>Commerçant vérifié</Text>
            <Text style={styles.check}>✓</Text>
          </View>
          <Text style={styles.profileLocation}>Lomé, Togo</Text>
        </View>
      </View>

      <LinearGradient colors={[colors.burgundy, colors.burgundyDark]} style={styles.bannerCard}>
        <Text style={styles.bannerEyebrow}>VOTRE ÉCOSYSTÈME</Text>
        <Text style={styles.bannerTitle}>Créez une fois.{'\n'}Vendez partout.</Text>
        <Text style={styles.bannerText}>Boutique · Shorts · Live · Clients</Text>
      </LinearGradient>

      <Text style={styles.sectionLabel}>Informations personnelles</Text>
      <View style={styles.infoCard}>
        <InfoRow icon={<Mail size={18} color={colors.burgundy} />} label="Email" value="jean.koffi@email.com" />
        <InfoRow icon={<Phone size={18} color={colors.burgundy} />} label="Téléphone" value="+228 90 12 34 56" />
        <InfoRow icon={<MapPin size={18} color={colors.burgundy} />} label="Localisation" value="Lomé, Togo" />
      </View>

      <Text style={styles.sectionLabel}>Informations commerciales</Text>
      <View style={styles.infoCard}>
        <InfoRow icon={<Store size={18} color={colors.burgundy} />} label="Boutique active" value="Koffi Shoes" />
        <InfoRow icon={<Shield size={18} color={colors.burgundy} />} label="Statut" value="Vérifié" />
      </View>

      <Text style={styles.sectionLabel}>Abonnement</Text>
      <View style={styles.subscriptionCard}>
        <View>
          <Text style={styles.planName}>Plan Pro</Text>
          <Text style={styles.planPrice}>15 000 FCFA / mois</Text>
          <Text style={styles.planRenew}>Renouvellement le 14 sept. 2026</Text>
        </View>
        <Pressable style={styles.manageBtn} onPress={() => onNavigate('subscriptions')}>
          <Text style={styles.manageBtnText}>Gérer</Text>
          <ChevronRight size={16} color={colors.burgundy} />
        </Pressable>
      </View>

      <Pressable style={styles.editBtn}>
        <Text style={styles.editBtnText}>Modifier le profil</Text>
      </Pressable>
    </ScrollView>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>{icon}</View>
      <View style={styles.flex}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: spacing.md },
  title: { color: colors.ink, fontSize: 24, fontWeight: '800' },
  subtitle: { color: colors.muted, fontSize: 13, marginTop: 4 },
  profileCard: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, marginBottom: spacing.md },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#243D4E', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  avatarText: { color: 'white', fontSize: 19, fontWeight: '800' },
  profileInfo: { flex: 1 },
  profileName: { color: colors.ink, fontSize: 19, fontWeight: '800' },
  verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  profileRole: { color: colors.burgundy, fontSize: 11, fontWeight: '700' },
  check: { width: 15, height: 15, borderRadius: 8, backgroundColor: colors.burgundy, color: 'white', textAlign: 'center', fontSize: 10, fontWeight: '800' },
  profileLocation: { color: colors.muted, fontSize: 11, marginTop: 4 },
  bannerCard: { borderRadius: radius.lg, padding: 20, marginBottom: spacing.lg },
  bannerEyebrow: { color: '#F7CBD5', fontSize: 9, letterSpacing: 1.1, fontWeight: '800' },
  bannerTitle: { color: 'white', fontSize: 23, fontWeight: '800', marginTop: 12, lineHeight: 27 },
  bannerText: { color: '#F7CBD5', fontSize: 11, marginTop: 14 },
  sectionLabel: { color: colors.ink, fontSize: 14, fontWeight: '700', marginBottom: 10, marginTop: 4 },
  infoCard: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, padding: 4, marginBottom: spacing.lg },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: colors.line },
  infoIcon: { width: 38, height: 38, borderRadius: 11, backgroundColor: colors.burgundySoft, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  flex: { flex: 1 },
  infoLabel: { color: colors.muted, fontSize: 11, fontWeight: '600' },
  infoValue: { color: colors.ink, fontSize: 13, fontWeight: '700', marginTop: 3 },
  subscriptionCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.burgundySoft, borderRadius: radius.lg, padding: 16, marginBottom: spacing.lg },
  planName: { color: colors.burgundy, fontSize: 16, fontWeight: '800' },
  planPrice: { color: colors.ink, fontSize: 13, fontWeight: '700', marginTop: 4 },
  planRenew: { color: colors.muted, fontSize: 11, marginTop: 4 },
  manageBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'white', paddingHorizontal: 14, paddingVertical: 10, borderRadius: radius.md },
  manageBtnText: { color: colors.burgundy, fontSize: 12, fontWeight: '800' },
  editBtn: { backgroundColor: colors.burgundy, borderRadius: radius.md, paddingVertical: 15, alignItems: 'center' },
  editBtnText: { color: 'white', fontSize: 14, fontWeight: '800' },
});
