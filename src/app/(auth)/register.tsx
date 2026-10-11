import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { authApi } from '@/features/auth/api';
import { useAuth } from '@/features/auth/hooks';
import { UserRole } from '@/model/model';

const burgundy = '#7B1738';
type Role = UserRole.COMMERCANT | UserRole.UTILISATEUR;

export default function RegisterScreen() {
  const router = useRouter();
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  const { login, acceptSession } = useAuth();
  const [role, setRole] = useState<Role>(UserRole.COMMERCANT);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ prenom: '', nom: '', email: '', phone: '', adresse: '', date_naissance: '', password: '', confirmPassword: '' });
  const change = (key: keyof typeof form, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async () => {
    if (!form.prenom || !form.nom || !form.email || !form.password) return Alert.alert('Informations manquantes', 'Renseignez au minimum le prénom, le nom, l’e-mail et le mot de passe.');
    if (form.password !== form.confirmPassword) return Alert.alert('Mot de passe', 'Les deux mots de passe ne correspondent pas.');
    setLoading(true);
    try {
      const res = await authApi.register({ nom: form.nom, prenom: form.prenom, email: form.email, adresse: form.adresse, date_naissance: form.date_naissance, password: form.password, role });
      if (res?.access_token && res?.user) await acceptSession(res.user, res.access_token);
      else if (!await login(form.email, form.password)) {
        Alert.alert('Compte créé', 'Connectez-vous avec vos nouveaux identifiants.');
        router.replace(returnTo === 'checkout' ? { pathname: '/login', params: { returnTo } } : '/login');
        return;
      }
      router.replace(returnTo === 'checkout' ? '/checkout' as any : '/');
    } catch (error: any) {
      Alert.alert('Inscription impossible', error?.response?.data?.message || 'Une erreur est survenue. Vérifiez les informations puis réessayez.');
    } finally { setLoading(false); }
  };

  const fields: { key: keyof typeof form; label: string; keyboard?: 'default' | 'email-address' | 'phone-pad' }[] = [
    { key: 'prenom', label: 'Prénom *' }, { key: 'nom', label: 'Nom *' },
    { key: 'email', label: 'Adresse e-mail *', keyboard: 'email-address' }, { key: 'phone', label: 'Téléphone', keyboard: 'phone-pad' },
    { key: 'adresse', label: 'Adresse' }, { key: 'date_naissance', label: 'Date de naissance' },
    { key: 'password', label: 'Mot de passe *' }, { key: 'confirmPassword', label: 'Confirmer le mot de passe *' },
  ];

  return <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <LinearGradient colors={[burgundy, '#A42B50']} style={styles.hero}>
        <Text style={styles.brand}>ORO <Text style={styles.brandSmall}>ORION</Text></Text>
        <Text style={styles.title}>Rejoignez Orion</Text>
        <Text style={styles.subtitle}>Créez votre compte et développez votre activité.</Text>
      </LinearGradient>
      <View style={styles.card}>
        <Text style={styles.heading}>Créer un compte</Text>
        <Text style={styles.label}>Votre profil</Text>
        <View style={styles.roles}>
          {([{ value: UserRole.COMMERCANT, title: 'Commerçant', detail: 'Gérer une boutique et vendre' }, { value: UserRole.UTILISATEUR, title: 'Entrepreneur', detail: 'Découvrir les opportunités' }] as const).map((item) => <Pressable key={item.value} onPress={() => setRole(item.value)} style={[styles.role, role === item.value && styles.roleSelected]}>
            <Text style={[styles.roleTitle, role === item.value && styles.selectedText]}>{item.title}</Text><Text style={styles.roleDetail}>{item.detail}</Text>
          </Pressable>)}
        </View>
        {fields.map(({ key, label, keyboard }) => <View key={key} style={styles.field}>
          <Text style={styles.label}>{label}</Text>
          <TextInput style={styles.input} placeholder={label.replace(' *', '')} placeholderTextColor="#9A9294" value={form[key]} onChangeText={(value) => change(key, value)} keyboardType={keyboard || 'default'} autoCapitalize={key === 'email' ? 'none' : 'sentences'} secureTextEntry={key === 'password' || key === 'confirmPassword'} />
        </View>)}
        <Pressable style={[styles.button, loading && styles.disabled]} onPress={submit} disabled={loading}>{loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Créer mon compte</Text>}</Pressable>
        <View style={styles.loginRow}><Text style={styles.hint}>Déjà inscrit ? </Text><Link href={returnTo === 'checkout' ? { pathname: '/login', params: { returnTo } } : '/login'} style={styles.link}>Se connecter</Link></View>
      </View>
    </ScrollView>
  </KeyboardAvoidingView>;
}

const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: '#FAF8F7' }, content: { flexGrow: 1, paddingBottom: 28 }, hero: { paddingTop: 56, paddingBottom: 52, paddingHorizontal: 24, alignItems: 'center' }, brand: { color: 'white', fontSize: 22, letterSpacing: 2, fontWeight: '900', marginBottom: 22 }, brandSmall: { fontSize: 10, letterSpacing: 4 }, title: { color: 'white', fontSize: 27, fontWeight: '800' }, subtitle: { color: '#F1DCE3', textAlign: 'center', marginTop: 8, fontSize: 14 }, card: { backgroundColor: 'white', marginHorizontal: 18, marginTop: -24, padding: 22, borderRadius: 22, elevation: 4 }, heading: { color: '#261F21', fontSize: 21, fontWeight: '800', marginBottom: 20 }, label: { color: '#5F5558', fontSize: 12, fontWeight: '700', marginBottom: 7 }, roles: { flexDirection: 'row', gap: 10, marginBottom: 18 }, role: { flex: 1, borderWidth: 1, borderColor: '#E9E2E4', borderRadius: 13, padding: 12 }, roleSelected: { borderColor: burgundy, backgroundColor: '#FBF2F5' }, roleTitle: { color: '#30282A', fontWeight: '700', fontSize: 13 }, selectedText: { color: burgundy }, roleDetail: { color: '#83797C', fontSize: 11, marginTop: 5 }, field: { marginBottom: 13 }, input: { minHeight: 48, borderWidth: 1, borderColor: '#E9E2E4', borderRadius: 12, paddingHorizontal: 13, color: '#261F21', fontSize: 14 }, button: { height: 50, borderRadius: 13, backgroundColor: burgundy, justifyContent: 'center', alignItems: 'center', marginTop: 7 }, disabled: { opacity: 0.7 }, buttonText: { color: 'white', fontSize: 15, fontWeight: '800' }, loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 }, hint: { color: '#71676A', fontSize: 13 }, link: { color: burgundy, fontSize: 13, fontWeight: '800' } });
