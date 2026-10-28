import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react-native';
import { useAuth } from '@/features/auth/hooks';
import { AuthHeader } from '@/features/auth/AuthHeader';
import { useToast } from '@/store/toast-store';

const colors = { burgundy: '#74122E', burgundyDark: '#5C0D26', ink: '#241C1C', muted: '#766D67', line: '#E8DED2', white: '#FFFCF7', canvas: '#F5EFE7' };

export default function LoginScreen() {
  const router = useRouter();
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  const { login } = useAuth();
  const { showToast } = useToast();
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
    if (success) { showToast('Connexion réussie. Bienvenue sur Orion.'); router.replace(returnTo === 'checkout' ? '/checkout' as any : '/'); }
    else Alert.alert('Connexion impossible', 'Vérifie ton adresse e-mail et ton mot de passe.');
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <AuthHeader eyebrow="VOTRE ESPACE ORION" title="Ravi de vous revoir" subtitle="Retrouvez vos boutiques, vos produits et vos échanges au même endroit." />

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
  container: { flexGrow: 1, paddingHorizontal: 18, paddingTop: 18, paddingBottom: 24, justifyContent: 'center' },
  formCard: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 22, padding: 20, marginTop: -18, elevation: 5, shadowColor: '#421D24', shadowOpacity: 0.12, shadowRadius: 15, shadowOffset: { width: 0, height: 7 } },
  formTitle: { color: colors.ink, fontSize: 20, fontWeight: '800' },
  formSubtitle: { color: colors.muted, fontSize: 12, marginTop: 5, marginBottom: 20 },
  label: { color: colors.ink, fontSize: 12, fontWeight: '700', marginBottom: 7, marginTop: 12 },
  inputWrap: { minHeight: 50, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: colors.line, borderRadius: 12, backgroundColor: '#FFFEFC', paddingHorizontal: 13 },
  input: { flex: 1, color: colors.ink, fontSize: 14, paddingVertical: 12 },
  primaryButton: { minHeight: 52, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.burgundy, borderRadius: 13, marginTop: 22, shadowColor: colors.burgundyDark, shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  disabledButton: { opacity: 0.65 },
  primaryButtonText: { color: colors.white, fontSize: 14, fontWeight: '800' },
  signupRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 18 },
  signupText: { color: colors.muted, fontSize: 12 },
  signupLink: { color: colors.burgundy, fontSize: 12, fontWeight: '800' },
  footer: { textAlign: 'center', color: colors.muted, fontSize: 10, marginTop: 20 },
});
