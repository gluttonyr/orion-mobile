import { useState } from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "@/components/AppHeader";
import { BottomTabInset, Palette } from "@/constants/theme";
import { useConversations, type ConversationItem } from "@/features/messages/hooks";
import { ConversationList } from "@/components/messages/ConversationList";
import { MessageThread } from "@/components/messages/MessageThread";

export default function MessagesScreen() {
  const { conversations, messages, loading, sendMessage } = useConversations();
  const [selectedConv, setSelectedConv] = useState<ConversationItem | null>(null);

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
      <AppHeader variant="authenticated" title="Messages" />
      <ConversationList conversations={conversations} onSelect={setSelectedConv} bottomInset={BottomTabInset} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Palette.background },
  loader: { flex: 1 },
});
