import { useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { ArrowRight, Check, CheckCircle2, Eye, EyeOff, LockKeyhole, ShieldCheck } from "lucide-react-native";
import { AuthHeader } from "@/features/auth/AuthHeader";
import { apiErrorMessage, maskEmail, passwordResetApi, passwordStrength } from "@/features/auth/password-reset";
import { resetColors as colors, resetStyles as styles } from "@/features/auth/reset-styles";
import { ResetProgress } from "@/features/auth/ResetProgress";

const STRENGTH_COLORS = ["", "#C9574F", "#D39A3D", "#5C9A6B", "#2F7D4A"];

function PasswordInput({ label, value, onChange, autoFocus }: { label: string; value: string; onChange: (value: string) => void; autoFocus?: boolean }) {
  const [visible, setVisible] = useState(false);
  return <>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.inputWrap}>
      <LockKeyhole size={18} color={colors.muted} />
      <TextInput style={styles.input} placeholder="••••••••" placeholderTextColor="#A3A3A3" value={value} onChangeText={onChange} secureTextEntry={!visible} autoCapitalize="none" autoComplete="new-password" textContentType="newPassword" autoFocus={autoFocus} />
      <Pressable onPress={() => setVisible((current) => !current)} hitSlop={10} accessibilityLabel={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}>
        {visible ? <EyeOff size={18} color={colors.muted} /> : <Eye size={18} color={colors.muted} />}
      </Pressable>
    </View>
  </>;
}

/** Étape 3 — nouveau mot de passe + confirmation, puis écran de succès. */
export default function NewPasswordScreen() {
  const router = useRouter();
  const { email = "", token = "" } = useLocalSearchParams<{ email?: string; token?: string }>();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const strength = passwordStrength(password);
  const mismatch = confirm.length > 0 && confirm !== password;

  if (!email || !token) return <Redirect href={"/forgot-password" as any} />;

  const submit = async () => {
    if (!strength.valid) { setError("Le mot de passe doit contenir au moins 8 caractères, une lettre et un chiffre."); return; }
    if (password !== confirm) { setError("Les deux mots de passe ne correspondent pas."); return; }
    setSaving(true);
    setError("");
    try {
      await passwordResetApi.reset(email, token, password);
      setDone(true);
    } catch (resetError) {
      const message = apiErrorMessage(resetError, "Impossible de modifier le mot de passe.");
      setError(message);
      if (/expiré|recommencez/i.test(message)) setTimeout(() => router.replace({ pathname: "/forgot-password", params: { email } } as any), 1800);
    } finally {
      setSaving(false);
    }
  };

  if (done) {
    return (
      <ScrollView style={styles.flex} contentContainerStyle={styles.container}>
        <AuthHeader eyebrow="C’EST FAIT" title="Mot de passe modifié" subtitle="Votre compte est de nouveau accessible." />
        <View style={styles.formCard}>
          <View style={styles.successIcon}><CheckCircle2 size={32} color={colors.success} /></View>
          <Text style={styles.formTitle}>Tout est en ordre</Text>
          <Text style={styles.formSubtitle}>Votre mot de passe a bien été mis à jour et un e-mail de confirmation vous a été envoyé. Connectez-vous avec vos nouveaux identifiants.</Text>
          <Pressable style={styles.primaryButton} onPress={() => router.replace("/login")}><Text style={styles.primaryButtonText}>Se connecter</Text><ArrowRight size={17} color={colors.white} /></Pressable>
          <View style={styles.note}><ShieldCheck size={15} color={colors.burgundy} /><Text style={styles.noteText}>Si vous n’êtes pas à l’origine de ce changement, contactez immédiatement le support Orion.</Text></View>
        </View>
      </ScrollView>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <AuthHeader eyebrow="SÉCURITÉ DU COMPTE" title="Nouveau mot de passe" subtitle="Choisissez un mot de passe que vous n’utilisez nulle part ailleurs." />
        <View style={styles.formCard}>
          <ResetProgress step={2} />
          <Text style={styles.step}>ÉTAPE 3 SUR 3</Text>
          <Text style={styles.formTitle}>Choisissez un mot de passe</Text>
          <Text style={styles.formSubtitle}>Pour le compte <Text style={styles.strong}>{maskEmail(email)}</Text>.</Text>

          <PasswordInput label="Nouveau mot de passe" value={password} onChange={(value) => { setPassword(value); if (error) setError(""); }} autoFocus />
          <View style={styles.strengthRow}>
            <View style={styles.strengthBars}>{[1, 2, 3, 4].map((level) => <View key={level} style={[styles.strengthBar, strength.level >= level && { backgroundColor: STRENGTH_COLORS[strength.level] }]} />)}</View>
            <Text style={styles.strengthLabel}>{password ? strength.label : "Sécurité"}</Text>
          </View>
          <View style={styles.checklist}>
            {strength.checks.map((check) => <View key={check.label} style={styles.checkItem}><Check size={13} color={check.ok ? colors.success : "#C9C1BA"} /><Text style={[styles.checkText, check.ok && styles.checkTextOk]}>{check.label}</Text></View>)}
          </View>

          <PasswordInput label="Confirmer le mot de passe" value={confirm} onChange={(value) => { setConfirm(value); if (error) setError(""); }} />
          {mismatch ? <Text style={[styles.hint, { color: colors.danger }]}>Les mots de passe ne correspondent pas.</Text> : confirm ? <Text style={[styles.hint, { color: colors.success }]}>Les mots de passe correspondent.</Text> : null}

          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Pressable style={[styles.primaryButton, (saving || !strength.valid || password !== confirm) && styles.disabledButton]} onPress={() => void submit()} disabled={saving || !strength.valid || password !== confirm}>
            {saving ? <ActivityIndicator color={colors.white} /> : <><Text style={styles.primaryButtonText}>Enregistrer le mot de passe</Text><ArrowRight size={17} color={colors.white} /></>}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
