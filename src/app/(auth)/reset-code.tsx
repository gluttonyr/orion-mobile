import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, ArrowRight, MailCheck, RotateCw } from "lucide-react-native";
import { AuthHeader } from "@/features/auth/AuthHeader";
import { apiErrorMessage, maskEmail, passwordResetApi } from "@/features/auth/password-reset";
import { resetColors as colors, resetStyles as styles } from "@/features/auth/reset-styles";
import { ResetProgress } from "@/features/auth/ResetProgress";
import { useToast } from "@/store/toast-store";

function useSecondsLeft(target: number) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (target <= Date.now()) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [target]);
  return Math.max(0, Math.ceil((target - now) / 1000));
}

/** Étape 2 — saisie du code à 6 chiffres reçu par e-mail. */
export default function ResetCodeScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const params = useLocalSearchParams<{ email?: string; sentAt?: string; resendIn?: string; expiresIn?: string }>();
  const email = params.email ?? "";
  const [sentAt, setSentAt] = useState(Number(params.sentAt) || Date.now());
  const [resendDelay, setResendDelay] = useState(Number(params.resendIn) || 60);
  const [validity, setValidity] = useState(Number(params.expiresIn) || 15);
  const [code, setCode] = useState("");
  const [focused, setFocused] = useState(true);
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const resendIn = useSecondsLeft(sentAt + resendDelay * 1000);
  const expiresIn = useSecondsLeft(sentAt + validity * 60_000);

  if (!email) return <Redirect href={"/forgot-password" as any} />;

  const verify = async (value = code) => {
    if (value.length !== 6 || verifying) { setError("Saisissez les 6 chiffres du code."); return; }
    setVerifying(true);
    setError("");
    try {
      const { resetToken } = await passwordResetApi.verify(email, value);
      router.replace({ pathname: "/new-password", params: { email, token: resetToken } } as any);
    } catch (verifyError) {
      setError(apiErrorMessage(verifyError, "Code invalide."));
      setCode("");
      inputRef.current?.focus();
    } finally {
      setVerifying(false);
    }
  };

  const onChange = (value: string) => {
    const clean = value.replace(/\D/g, "").slice(0, 6);
    setCode(clean);
    if (error) setError("");
    if (clean.length === 6) void verify(clean);
  };

  const resend = async () => {
    setResending(true);
    setError("");
    try {
      const response = await passwordResetApi.request(email);
      setSentAt(Date.now());
      setResendDelay(response.resendInSeconds);
      setValidity(response.expiresInMinutes);
      setCode("");
      showToast("Un nouveau code vient d’être envoyé.");
    } catch (resendError) {
      setError(apiErrorMessage(resendError, "Impossible de renvoyer le code."));
    } finally {
      setResending(false);
    }
  };

  const minutes = Math.floor(expiresIn / 60);
  const seconds = String(expiresIn % 60).padStart(2, "0");

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <AuthHeader eyebrow="SÉCURITÉ DU COMPTE" title="Vérifiez votre boîte mail" subtitle="Un code à 6 chiffres vient de vous être envoyé." />
        <View style={styles.formCard}>
          <ResetProgress step={1} />
          <Text style={styles.step}>ÉTAPE 2 SUR 3</Text>
          <Text style={styles.formTitle}>Code de vérification</Text>
          <Text style={styles.formSubtitle}>Saisissez le code envoyé à <Text style={styles.strong}>{maskEmail(email)}</Text>. Pensez à vérifier vos courriers indésirables.</Text>

          <Pressable onPress={() => inputRef.current?.focus()} accessibilityLabel="Saisir le code à 6 chiffres">
            <View style={styles.codeRow}>
              {Array.from({ length: 6 }, (_, index) => {
                const active = focused && index === Math.min(code.length, 5);
                return <View key={index} style={[styles.codeBox, active && styles.codeBoxActive, error ? styles.codeBoxError : null]}><Text style={styles.codeDigit}>{code[index] ?? ""}</Text></View>;
              })}
            </View>
          </Pressable>
          {/* Champ unique masqué : gère le clavier numérique, le collage et l'autocomplétion du code SMS/e-mail. */}
          <TextInput ref={inputRef} style={styles.hiddenInput} value={code} onChangeText={onChange} keyboardType="number-pad" textContentType="oneTimeCode" autoComplete="one-time-code" maxLength={6} autoFocus onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} editable={!verifying} />

          <View style={styles.codeMeta}>
            <Text style={[styles.codeMetaText, expiresIn === 0 && { color: colors.danger, fontWeight: "700" }]}>{expiresIn > 0 ? `Code valable encore ${minutes}:${seconds}` : "Ce code a expiré."}</Text>
            <Pressable style={styles.resend} onPress={() => void resend()} disabled={resendIn > 0 || resending}>
              <RotateCw size={13} color={resendIn > 0 ? "#B1A9A2" : colors.burgundy} />
              <Text style={[styles.resendText, (resendIn > 0 || resending) && styles.resendDisabled]}>{resendIn > 0 ? `Renvoyer dans ${resendIn} s` : resending ? "Envoi…" : "Renvoyer le code"}</Text>
            </Pressable>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Pressable style={[styles.primaryButton, (verifying || code.length !== 6) && styles.disabledButton]} onPress={() => void verify()} disabled={verifying || code.length !== 6}>
            {verifying ? <ActivityIndicator color={colors.white} /> : <><Text style={styles.primaryButtonText}>Vérifier le code</Text><ArrowRight size={17} color={colors.white} /></>}
          </Pressable>
          <View style={styles.note}><MailCheck size={15} color={colors.burgundy} /><Text style={styles.noteText}>Le code n’est valable qu’une fois. Ne le communiquez à personne : l’équipe Orion ne vous le demandera jamais.</Text></View>
          <Pressable style={styles.backLink} onPress={() => router.replace({ pathname: "/forgot-password", params: { email } } as any)}><ArrowLeft size={15} color={colors.burgundy} /><Text style={styles.backLinkText}>Modifier l’adresse e-mail</Text></Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
