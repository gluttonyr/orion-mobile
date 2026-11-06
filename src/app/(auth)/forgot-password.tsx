import { useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, ArrowRight, LockKeyhole, Mail } from "lucide-react-native";
import { AuthHeader } from "@/features/auth/AuthHeader";
import { apiErrorMessage, passwordResetApi } from "@/features/auth/password-reset";
import { resetColors as colors, resetStyles as styles } from "@/features/auth/reset-styles";
import { useToast } from "@/store/toast-store";
import { ResetProgress } from "@/features/auth/ResetProgress";

/** Étape 1 — adresse e-mail (équivalent de /mot-de-passe-oublie sur le web). */
export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const params = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = useState(params.email ?? "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const normalized = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) { setError("Saisissez une adresse e-mail valide."); return; }
    setLoading(true);
    setError("");
    try {
      const response = await passwordResetApi.request(normalized);
      showToast("Code envoyé. Consultez votre boîte de réception.");
      router.push({ pathname: "/reset-code", params: { email: normalized, sentAt: String(Date.now()), resendIn: String(response.resendInSeconds), expiresIn: String(response.expiresInMinutes) } } as any);
    } catch (requestError) {
      setError(apiErrorMessage(requestError, "Impossible d’envoyer le code pour le moment."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <AuthHeader eyebrow="SÉCURITÉ DU COMPTE" title="Mot de passe oublié ?" subtitle="Recevez un code par e-mail pour choisir un nouveau mot de passe." />
        <View style={styles.formCard}>
          <ResetProgress step={0} />
          <Text style={styles.step}>ÉTAPE 1 SUR 3</Text>
          <Text style={styles.formTitle}>Votre adresse e-mail</Text>
          <Text style={styles.formSubtitle}>Indiquez l’adresse de votre compte. Nous vous enverrons un code à 6 chiffres.</Text>
          <Text style={styles.label}>Adresse e-mail</Text>
          <View style={styles.inputWrap}>
            <Mail size={18} color={colors.muted} />
            <TextInput style={styles.input} placeholder="nom@exemple.com" placeholderTextColor="#A3A3A3" value={email} onChangeText={(value) => { setEmail(value); if (error) setError(""); }} keyboardType="email-address" autoCapitalize="none" autoComplete="email" autoFocus returnKeyType="send" onSubmitEditing={() => void submit()} />
          </View>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Pressable style={[styles.primaryButton, loading && styles.disabledButton]} onPress={() => void submit()} disabled={loading}>
            {loading ? <ActivityIndicator color={colors.white} /> : <><Text style={styles.primaryButtonText}>Recevoir mon code</Text><ArrowRight size={17} color={colors.white} /></>}
          </Pressable>
          <View style={styles.note}><LockKeyhole size={15} color={colors.burgundy} /><Text style={styles.noteText}>Pour votre sécurité, nous n’indiquons pas si une adresse est associée à un compte.</Text></View>
          <Pressable style={styles.backLink} onPress={() => router.replace("/login")}><ArrowLeft size={15} color={colors.burgundy} /><Text style={styles.backLinkText}>Retour à la connexion</Text></Pressable>
        </View>
        <Text style={styles.footer}>ORION · Commerce, boutiques et opportunités</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
