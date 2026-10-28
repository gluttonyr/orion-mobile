import { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronDown } from 'lucide-react-native';
import { authApi } from '@/features/auth/api';
import { useAuth } from '@/features/auth/hooks';
import { UserRole } from '@/model/model';
import { AuthHeader } from '@/features/auth/AuthHeader';
import { useToast } from '@/store/toast-store';
import { Eye, EyeOff } from 'lucide-react-native';

const burgundy = '#74122E';
type Role = UserRole.COMMERCANT | UserRole.UTILISATEUR;
const countryFlagImageUrl = (iso: string) => `https://flagcdn.com/w40/${iso.toLowerCase()}.png`;
const countries = [
  ['Afrique du Sud', '+27', 'ZA'], ['Algérie', '+213', 'DZ'], ['Angola', '+244', 'AO'], ['Bénin', '+229', 'BJ'], ['Botswana', '+267', 'BW'],
  ['Burkina Faso', '+226', 'BF'], ['Burundi', '+257', 'BI'], ['Cameroun', '+237', 'CM'], ['Cap-Vert', '+238', 'CV'], ['Comores', '+269', 'KM'],
  ['Côte d’Ivoire', '+225', 'CI'], ['Djibouti', '+253', 'DJ'], ['Égypte', '+20', 'EG'], ['Érythrée', '+291', 'ER'], ['Eswatini', '+268', 'SZ'],
  ['Éthiopie', '+251', 'ET'], ['Gabon', '+241', 'GA'], ['Gambie', '+220', 'GM'], ['Ghana', '+233', 'GH'], ['Guinée', '+224', 'GN'],
  ['Guinée-Bissau', '+245', 'GW'], ['Guinée équatoriale', '+240', 'GQ'], ['Kenya', '+254', 'KE'], ['Lesotho', '+266', 'LS'], ['Liberia', '+231', 'LR'],
  ['Libye', '+218', 'LY'], ['Madagascar', '+261', 'MG'], ['Malawi', '+265', 'MW'], ['Mali', '+223', 'ML'], ['Maroc', '+212', 'MA'], ['Maurice', '+230', 'MU'],
  ['Mauritanie', '+222', 'MR'], ['Mozambique', '+258', 'MZ'], ['Namibie', '+264', 'NA'], ['Niger', '+227', 'NE'], ['Nigeria', '+234', 'NG'],
  ['Ouganda', '+256', 'UG'], ['République centrafricaine', '+236', 'CF'], ['République démocratique du Congo', '+243', 'CD'],
  ['République du Congo', '+242', 'CG'], ['Rwanda', '+250', 'RW'], ['Sao Tomé-et-Principe', '+239', 'ST'], ['Sénégal', '+221', 'SN'],
  ['Seychelles', '+248', 'SC'], ['Sierra Leone', '+232', 'SL'], ['Somalie', '+252', 'SO'], ['Soudan', '+249', 'SD'], ['Soudan du Sud', '+211', 'SS'],
  ['Tanzanie', '+255', 'TZ'], ['Tchad', '+235', 'TD'], ['Togo', '+228', 'TG'], ['Tunisie', '+216', 'TN'], ['Zambie', '+260', 'ZM'], ['Zimbabwe', '+263', 'ZW'],
] as const;

export default function RegisterScreen() {
  const router = useRouter();
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  const { login, acceptSession } = useAuth();
  const { showToast } = useToast();
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(false);
  const [registrationStep, setRegistrationStep] = useState<1 | 2>(1);
  const [countryDialCode, setCountryDialCode] = useState('+225');
  const [countryPickerVisible, setCountryPickerVisible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [form, setForm] = useState({ prenom: '', nom: '', email: '', phone: '', password: '', confirmPassword: '' });
  const change = (key: keyof typeof form, value: string) => setForm((prev) => ({ ...prev, [key]: value }));
  const selectedCountry = countries.find((country) => country[1] === countryDialCode) ?? countries[10];

  const continueToProfile = () => {
    if (!form.nom.trim() || !form.prenom.trim() || !form.email.trim() || !form.phone.trim() || !form.password || !form.confirmPassword) {
      return Alert.alert('Informations manquantes', 'Renseignez tous les champs avant de continuer.');
    }
    if (form.password.length < 4) return Alert.alert('Mot de passe', 'Le mot de passe doit contenir au moins 4 caractères.');
    if (form.password !== form.confirmPassword) return Alert.alert('Mot de passe', 'Les deux mots de passe ne correspondent pas.');
    setRegistrationStep(2);
  };

  const submit = async () => {
    if (!role) return Alert.alert('Choisir un profil', 'Sélectionnez ce que vous souhaitez faire sur Orion.');
    if (!form.prenom || !form.nom || !form.email || !form.password) return Alert.alert('Informations manquantes', 'Renseignez au minimum le prénom, le nom, l’e-mail et le mot de passe.');
    if (form.password !== form.confirmPassword) return Alert.alert('Mot de passe', 'Les deux mots de passe ne correspondent pas.');
    setLoading(true);
    try {
      const res = await authApi.register({ nom: form.nom, prenom: form.prenom, email: form.email, contact: `${countryDialCode} ${form.phone.trim()}`, indicatifPays: countryDialCode, password: form.password, role });
      if (res?.access_token && res?.user) await acceptSession(res.user, res.access_token);
      else if (!await login(form.email, form.password)) {
        showToast('Compte créé. Connectez-vous avec vos identifiants.', 'info');
        router.replace(returnTo === 'checkout' ? { pathname: '/login', params: { returnTo } } : '/login');
        return;
      }
      showToast('Votre compte Orion a bien été créé.');
      router.replace(returnTo === 'checkout' ? '/checkout' as any : '/');
    } catch (error: any) {
      Alert.alert('Inscription impossible', error?.response?.data?.message || 'Une erreur est survenue. Vérifiez les informations puis réessayez.');
    } finally { setLoading(false); }
  };

  const fields: { key: keyof typeof form; label: string; keyboard?: 'default' | 'email-address' | 'phone-pad' }[] = [
    { key: 'nom', label: 'Nom *' }, { key: 'prenom', label: 'Prénom *' },
    { key: 'email', label: 'Adresse e-mail *', keyboard: 'email-address' }, { key: 'phone', label: 'Téléphone *', keyboard: 'phone-pad' },
    { key: 'password', label: 'Mot de passe *' }, { key: 'confirmPassword', label: 'Confirmer le mot de passe *' },
  ];

  return <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <AuthHeader eyebrow={registrationStep === 1 ? 'ÉTAPE 1 SUR 2' : 'ÉTAPE 2 SUR 2'} title="Rejoignez Orion" subtitle={registrationStep === 1 ? 'Renseignez vos informations de compte pour continuer.' : 'Choisissez ce que vous souhaitez faire sur Orion pour finaliser votre inscription.'} />
      <View style={styles.card}>
        <Text style={styles.heading}>Créer un compte</Text>
        {registrationStep === 1 ? fields.filter(({ key }) => key !== 'password' && key !== 'confirmPassword').map(({ key, label, keyboard }) => <View key={key} style={styles.field}>
          <Text style={styles.label}>{label}</Text>
          {key === 'phone' ? <View style={styles.phoneRow}>
            <Pressable style={styles.countryButton} onPress={() => setCountryPickerVisible(true)} accessibilityRole="button" accessibilityLabel="Choisir le pays et son indicatif"><Image source={{ uri: countryFlagImageUrl(selectedCountry[2]) }} style={styles.countryFlag} accessibilityLabel={`Drapeau ${selectedCountry[0]}`} /><Text style={styles.countryCode}>{countryDialCode}</Text><ChevronDown size={14} color={burgundy} /></Pressable>
            <TextInput style={[styles.input, styles.phoneInput]} placeholder="Numéro local, sans indicatif" placeholderTextColor="#9A9294" value={form.phone} onChangeText={(value) => change('phone', value)} keyboardType="phone-pad" />
          </View> : <TextInput style={styles.input} placeholder={label.replace(' *', '')} placeholderTextColor="#9A9294" value={form[key]} onChangeText={(value) => change(key, value)} keyboardType={keyboard || 'default'} autoCapitalize={key === 'email' ? 'none' : 'sentences'} />}
        </View>) : null}
        {registrationStep === 2 ? <>
        <Text style={styles.stepHeading}>Que veux-tu faire sur Orion ?</Text>
        <Text style={styles.label}>Choisis ton profil</Text>
        <View style={styles.roles}>
          {([{ value: UserRole.COMMERCANT, title: 'Commerçant', detail: 'Gérer une boutique et vendre' }, { value: UserRole.UTILISATEUR, title: 'Entrepreneur', detail: 'Découvrir les opportunités' }] as const).map((item) => <Pressable key={item.value} onPress={() => setRole(item.value)} style={[styles.role, role === item.value && styles.roleSelected]}>
            <Text style={[styles.roleTitle, role === item.value && styles.selectedText]}>{item.title}</Text><Text style={styles.roleDetail}>{item.detail}</Text>
          </Pressable>)}
        </View>
        </> : null}
        {registrationStep === 1 ? fields.filter(({ key }) => key === 'password' || key === 'confirmPassword').map(({ key, label, keyboard }) => <View key={key} style={styles.field}>
          <Text style={styles.label}>{label}</Text>
          <View style={styles.passwordInput}>
            <TextInput style={[styles.input, styles.passwordTextInput]} placeholder={label.replace(' *', '')} placeholderTextColor="#9A9294" value={form[key]} onChangeText={(value) => change(key, value)} keyboardType={keyboard || 'default'} autoCapitalize="none" secureTextEntry={key === 'password' ? !showPassword : !showConfirmPassword} />
            <Pressable style={styles.eyeButton} onPress={() => key === 'password' ? setShowPassword((value) => !value) : setShowConfirmPassword((value) => !value)} accessibilityRole="button" accessibilityLabel={(key === 'password' ? showPassword : showConfirmPassword) ? 'Masquer le mot de passe' : 'Afficher le mot de passe'} hitSlop={10}>{(key === 'password' ? showPassword : showConfirmPassword) ? <EyeOff size={19} color="#74122E" /> : <Eye size={19} color="#74122E" />}</Pressable>
          </View>
        </View>) : null}
        {registrationStep === 2 ? <Pressable style={styles.backButton} onPress={() => setRegistrationStep(1)}><Text style={styles.backButtonText}>Retour aux informations</Text></Pressable> : null}
        <Pressable style={[styles.button, loading && styles.disabled]} onPress={registrationStep === 1 ? continueToProfile : submit} disabled={loading}>{loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>{registrationStep === 1 ? 'Suivant' : 'Finaliser mon inscription'}</Text>}</Pressable>
        <View style={styles.loginRow}><Text style={styles.hint}>Déjà inscrit ? </Text><Link href={returnTo === 'checkout' ? { pathname: '/login', params: { returnTo } } : '/login'} style={styles.link}>Se connecter</Link></View>
      </View>
    </ScrollView>
    <Modal visible={countryPickerVisible} transparent animationType="fade" onRequestClose={() => setCountryPickerVisible(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.countryModal}>
          <Text style={styles.countryModalTitle}>Choisis ton pays</Text>
          <FlatList data={countries} keyExtractor={(item) => item[1]} keyboardShouldPersistTaps="handled" renderItem={({ item }) => <Pressable style={styles.countryOption} onPress={() => { setCountryDialCode(item[1]); setCountryPickerVisible(false); }}><View style={styles.countryOptionName}><Image source={{ uri: countryFlagImageUrl(item[2]) }} style={styles.countryFlag} accessibilityLabel={`Drapeau ${item[0]}`} /><Text style={styles.countryName}>{item[0]}</Text></View><Text style={styles.countryOptionCode}>{item[1]}</Text></Pressable>} />
          <Pressable style={styles.countryCancel} onPress={() => setCountryPickerVisible(false)}><Text style={styles.backButtonText}>Annuler</Text></Pressable>
        </View>
      </View>
    </Modal>
  </KeyboardAvoidingView>;
}

const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: '#F5EFE7' }, content: { flexGrow: 1, paddingHorizontal: 18, paddingTop: 18, paddingBottom: 28 }, card: { backgroundColor: '#FFFCF7', marginTop: -18, padding: 20, borderWidth: 1, borderColor: '#E8DED2', borderRadius: 22, elevation: 5, shadowColor: '#421D24', shadowOpacity: 0.12, shadowRadius: 15, shadowOffset: { width: 0, height: 7 } }, heading: { color: '#241C1C', fontSize: 21, fontWeight: '800', marginBottom: 20 }, stepHeading: { color: '#241C1C', fontSize: 18, fontWeight: '800', marginBottom: 18 }, label: { color: '#554A45', fontSize: 12, fontWeight: '700', marginBottom: 7 }, roles: { flexDirection: 'row', gap: 10, marginBottom: 18 }, role: { flex: 1, borderWidth: 1, borderColor: '#E8DED2', borderRadius: 13, padding: 12, backgroundColor: '#FFFEFC' }, roleSelected: { borderColor: burgundy, backgroundColor: '#F8E9E8' }, roleTitle: { color: '#302624', fontWeight: '700', fontSize: 13 }, selectedText: { color: burgundy }, roleDetail: { color: '#83776F', fontSize: 11, marginTop: 5 }, field: { marginBottom: 13 }, input: { minHeight: 48, borderWidth: 1, borderColor: '#E8DED2', borderRadius: 12, paddingHorizontal: 13, color: '#241C1C', fontSize: 14, backgroundColor: '#FFFEFC' }, phoneRow: { flexDirection: 'row', gap: 8 }, countryButton: { width: 84, minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, borderWidth: 1, borderColor: '#E8DED2', borderRadius: 12, backgroundColor: '#FFFEFC' }, countryFlag: { width: 20, height: 14, borderRadius: 2 }, countryCode: { color: '#241C1C', fontSize: 13, fontWeight: '700' }, phoneInput: { flex: 1, minWidth: 0 }, passwordInput: { position: 'relative', justifyContent: 'center' }, passwordTextInput: { paddingRight: 48 }, eyeButton: { position: 'absolute', right: 14, height: 44, justifyContent: 'center', alignItems: 'center' }, backButton: { alignSelf: 'flex-start', paddingVertical: 10, marginBottom: 8 }, backButtonText: { color: burgundy, fontSize: 13, fontWeight: '700' }, button: { height: 52, borderRadius: 13, backgroundColor: burgundy, justifyContent: 'center', alignItems: 'center', marginTop: 7, shadowColor: '#5C0D26', shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 3 }, disabled: { opacity: 0.7 }, buttonText: { color: 'white', fontSize: 15, fontWeight: '800' }, loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 }, hint: { color: '#71676A', fontSize: 13 }, link: { color: burgundy, fontSize: 13, fontWeight: '800' }, modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 22, backgroundColor: 'rgba(20, 15, 16, 0.55)' }, countryModal: { width: '100%', maxHeight: '78%', borderRadius: 20, padding: 18, backgroundColor: '#FFFCF7' }, countryModalTitle: { color: '#241C1C', fontSize: 18, fontWeight: '800', marginBottom: 12 }, countryOption: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#EFE8E0', paddingHorizontal: 4 }, countryOptionName: { flexDirection: 'row', alignItems: 'center', gap: 10 }, countryName: { color: '#302624', fontSize: 14 }, countryOptionCode: { color: burgundy, fontSize: 14, fontWeight: '700' }, countryCancel: { alignSelf: 'flex-end', padding: 10, marginTop: 4 } });
