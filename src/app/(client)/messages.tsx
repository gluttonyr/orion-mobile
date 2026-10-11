import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/features/auth/hooks";
import { AppHeader } from "@/components/AppHeader";
import { BottomTabInset, Palette, Spacing, Typography } from "@/constants/theme";
import { Button, EmptyState } from "@/components/ui";
import { useConversations, type ConversationItem } from "@/features/messages/hooks";
import { ConversationList } from "@/components/messages/ConversationList";
import { MessageThread } from "@/components/messages/MessageThread";

export default function MessagesScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { conversations, messages, loading, sendMessage } = useConversations();
  const [selectedConv, setSelectedConv] = useState<ConversationItem | null>(null);

  if (authLoading) return null;

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.flex} edges={["top"]}>
        <AppHeader variant="public" />
        <EmptyState
          icon="lock-closed-outline"
          title="Connectez-vous pour voir vos messages"
          description="Échangez directement avec les vendeurs à propos de vos commandes."
        />
        <View style={styles.authActions}>
          <Button title="Se connecter" onPress={() => router.push("/login")} variant="primary" fullWidth />
          <Button title="Créer un compte" onPress={() => router.push("/register")} variant="ghost" fullWidth />
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.flex} edges={["top"]}>
        <ActivityIndicator color={Palette.primary[500]} size="large" style={styles.loader} />
      </SafeAreaView>
    );
  }

  if (selectedConv) {
    return (
      <SafeAreaView style={styles.flex} edges={["top"]}>
        <MessageThread
          conversation={selectedConv}
          messages={messages.filter((m) => m.conversationId === selectedConv.id)}
          onBack={() => setSelectedConv(null)}
          onSend={(text) => sendMessage(selectedConv.id, text)}
          bottomInset={BottomTabInset}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.flex} edges={["top"]}>
      <AppHeader variant="public" />
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        <Text style={styles.subtitle}>Vos échanges avec les vendeurs</Text>
      </View>
      <ConversationList conversations={conversations} onSelect={setSelectedConv} bottomInset={BottomTabInset} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Palette.background },
  loader: { flex: 1 },
  authActions: { paddingHorizontal: Spacing.six, gap: Spacing.three },
  header: { paddingHorizontal: Spacing.five, paddingTop: Spacing.four },
  title: { fontSize: Typography.h1.fontSize, fontWeight: "800", color: Palette.text },
  subtitle: { fontSize: 13, color: Palette.textSecondary, marginTop: 4 },
});
