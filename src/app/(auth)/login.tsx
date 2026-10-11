import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/features/auth/hooks';

const colors = { burgundy: '#8B0A24', burgundyDark: '#6E071D', burgundySoft: '#F9E9ED', ink: '#171717', muted: '#737373', line: '#E9E9EC', white: '#FFFFFF', canvas: '#F7F7F8' };

export default function LoginScreen() {
  const router = useRouter();
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Connexion', 'Saisis ton adresse e-mail et ton mot de passe.');
      return;
    }
    setLoading(true);
    const success = await login(email.trim(), password);
    setLoading(false);
    if (success) router.replace(returnTo === 'checkout' ? '/checkout' as any : '/');
    else Alert.alert('Connexion impossible', 'Vérifie ton adresse e-mail et ton mot de passe.');
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.brand}>
          <Text style={styles.brandOro}>ORO</Text>
          <Text style={styles.brandOrion}>ORION</Text>
        </View>
        <LinearGradient colors={[colors.burgundy, colors.burgundyDark]} style={styles.hero}>
          <Text style={styles.eyebrow}>VOTRE ESPACE ORION</Text>
          <Text style={styles.title}>Ravi de vous revoir</Text>
          <Text style={styles.subtitle}>Retrouvez vos boutiques, vos produits et vos échanges au même endroit.</Text>
        </LinearGradient>

        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Connexion</Text>
          <Text style={styles.formSubtitle}>Connectez-vous à votre compte Orion.</Text>

          <Text style={styles.label}>Adresse e-mail</Text>
          <View style={styles.inputWrap}>
            <Mail size={18} color={colors.muted} />
            <TextInput style={styles.input} placeholder="nom@exemple.com" placeholderTextColor="#A3A3A3" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" returnKeyType="next" />
          </View>

          <Text style={styles.label}>Mot de passe</Text>
          <View style={styles.inputWrap}>
            <LockKeyhole size={18} color={colors.muted} />
            <TextInput style={styles.input} placeholder="Votre mot de passe" placeholderTextColor="#A3A3A3" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} autoComplete="current-password" onSubmitEditing={handleLogin} returnKeyType="done" />
            <Pressable onPress={() => setShowPassword((value) => !value)} hitSlop={10} accessibilityLabel={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}>
              {showPassword ? <EyeOff size={18} color={colors.muted} /> : <Eye size={18} color={colors.muted} />}
            </Pressable>
          </View>

          <Pressable style={[styles.primaryButton, loading && styles.disabledButton]} onPress={handleLogin} disabled={loading}>
            <Text style={styles.primaryButtonText}>{loading ? 'Connexion…' : 'Se connecter'}</Text>
          </Pressable>

          <View style={styles.signupRow}>
            <Text style={styles.signupText}>Pas encore de compte ? </Text>
            <Link href={returnTo === 'checkout' ? { pathname: '/register', params: { returnTo } } : '/register'} asChild><Pressable><Text style={styles.signupLink}>Créer un compte</Text></Pressable></Link>
          </View>
        </View>
        <Text style={styles.footer}>ORION · Commerce, boutiques et opportunités</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.canvas },
  container: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 28, paddingBottom: 28, justifyContent: 'center' },
  brand: { alignSelf: 'center', alignItems: 'center', marginBottom: 22 },
  brandOro: { color: colors.burgundy, fontSize: 28, fontWeight: '900', letterSpacing: -2, lineHeight: 28 },
  brandOrion: { color: colors.burgundy, fontSize: 8, fontWeight: '700', letterSpacing: 4, marginTop: 2 },
  hero: { borderRadius: 20, padding: 23, marginBottom: 18 },
  eyebrow: { color: '#F7CBD5', fontSize: 10, fontWeight: '800', letterSpacing: 1.3 },
  title: { color: colors.white, fontSize: 25, fontWeight: '800', marginTop: 10 },
  subtitle: { color: '#F7CBD5', fontSize: 13, lineHeight: 19, marginTop: 7 },
  formCard: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 20, padding: 20 },
  formTitle: { color: colors.ink, fontSize: 20, fontWeight: '800' },
  formSubtitle: { color: colors.muted, fontSize: 12, marginTop: 5, marginBottom: 20 },
  label: { color: colors.ink, fontSize: 12, fontWeight: '700', marginBottom: 7, marginTop: 12 },
  inputWrap: { minHeight: 50, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: colors.line, borderRadius: 12, backgroundColor: colors.white, paddingHorizontal: 13 },
  input: { flex: 1, color: colors.ink, fontSize: 14, paddingVertical: 12 },
  primaryButton: { minHeight: 50, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.burgundy, borderRadius: 12, marginTop: 22 },
  disabledButton: { opacity: 0.65 },
  primaryButtonText: { color: colors.white, fontSize: 14, fontWeight: '800' },
  signupRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 18 },
  signupText: { color: colors.muted, fontSize: 12 },
  signupLink: { color: colors.burgundy, fontSize: 12, fontWeight: '800' },
  footer: { textAlign: 'center', color: colors.muted, fontSize: 10, marginTop: 20 },
});
