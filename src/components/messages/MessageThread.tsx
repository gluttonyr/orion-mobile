import { useState } from "react";
import { Alert, FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Palette, Radius, Shadows, Spacing } from "@/constants/theme";
import { Avatar } from "@/components/ui";
import type { ChatMessage, ConversationItem } from "@/features/messages/hooks";

interface MessageThreadProps {
  conversation: ConversationItem;
  messages: ChatMessage[];
  onBack: () => void;
  onSend: (text: string) => void | Promise<void>;
  bottomInset?: number;
}

export function MessageThread({ conversation, messages, onBack, onSend, bottomInset = 0 }: MessageThreadProps) {
  const [messageText, setMessageText] = useState("");

  const handleSend = async () => {
    if (!messageText.trim()) return;
    try {
      await onSend(messageText.trim());
      setMessageText("");
    } catch (error: any) {
      Alert.alert("Message non envoyé", error?.response?.data?.message || error?.message || "Vérifiez votre connexion puis réessayez.");
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={0}>
      <View style={styles.chatHeader}>
        <TouchableOpacity onPress={onBack} style={styles.chatBack} hitSlop={6}>
          <Ionicons name="arrow-back" size={22} color={Palette.primary[500]} />
        </TouchableOpacity>
        <Avatar initials={conversation.avatar} size={40} />
        <View style={styles.chatHeaderInfo}>
          <Text style={styles.chatHeaderName}>{conversation.userName}</Text>
          <Text style={styles.chatHeaderStatus}>En ligne</Text>
        </View>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.msgList}
        renderItem={({ item: msg }) => (
          <View style={[styles.msgRow, msg.isOwn && styles.msgRowOwn]}>
            <View style={[styles.msgBubble, msg.isOwn ? styles.msgBubbleOwn : styles.msgBubbleOther]}>
              <Text style={[styles.msgText, msg.isOwn && styles.msgTextOwn]}>{msg.text}</Text>
              <View style={styles.msgFooter}>
                <Text style={[styles.msgTime, msg.isOwn && styles.msgTimeOwn]}>{msg.timestamp}</Text>
                {msg.isOwn && <Ionicons name="checkmark-done" size={12} color={Palette.primary[100]} />}
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyChat}>
            <Text style={styles.emptyChatText}>Aucun message dans cette conversation</Text>
          </View>
        }
      />

      <View style={[styles.inputRow, { marginBottom: bottomInset }]}>
        <TextInput
          style={styles.msgInput}
          value={messageText}
          onChangeText={setMessageText}
          placeholder="Écrivez votre message..."
          placeholderTextColor={Palette.textMuted}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendBtn, !messageText.trim() && styles.sendBtnDisabled]}
          onPress={() => { void handleSend(); }}
          disabled={!messageText.trim()}
        >
          <Ionicons name="send" size={18} color={Palette.surface} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  chatHeader: { flexDirection: "row", alignItems: "center", gap: Spacing.three, padding: Spacing.four, backgroundColor: Palette.surface, borderBottomWidth: 1, borderBottomColor: Palette.border, ...Shadows.sm },
  chatBack: { padding: 4 },
  chatHeaderInfo: {},
  chatHeaderName: { fontSize: 16, fontWeight: "700", color: Palette.text },
  chatHeaderStatus: { fontSize: 12, color: Palette.secondary[600] },
  msgList: { padding: Spacing.four, gap: Spacing.three },
  msgRow: { flexDirection: "row", justifyContent: "flex-start" },
  msgRowOwn: { justifyContent: "flex-end" },
  msgBubble: { maxWidth: "75%", paddingHorizontal: Spacing.four, paddingVertical: Spacing.three, borderRadius: Radius.md },
  msgBubbleOwn: { backgroundColor: Palette.primary[500], borderBottomRightRadius: Radius.sm },
  msgBubbleOther: { backgroundColor: Palette.surface, borderBottomLeftRadius: Radius.sm, ...Shadows.sm },
  msgText: { fontSize: 14, color: Palette.text, lineHeight: 20 },
  msgTextOwn: { color: Palette.surface },
  msgFooter: { flexDirection: "row", alignItems: "center", gap: 4, justifyContent: "flex-end", marginTop: 4 },
  msgTime: { fontSize: 10, color: Palette.textMuted },
  msgTimeOwn: { color: Palette.primary[100] },
  emptyChat: { alignItems: "center", paddingTop: Spacing.eight },
  emptyChatText: { color: Palette.textSecondary, fontSize: 14 },
  inputRow: { flexDirection: "row", alignItems: "flex-end", gap: Spacing.three, padding: Spacing.three, backgroundColor: Palette.surface, borderTopWidth: 1, borderTopColor: Palette.border },
  msgInput: { flex: 1, backgroundColor: Palette.neutral[50], borderRadius: Radius.md, paddingHorizontal: Spacing.four, paddingVertical: Spacing.three, fontSize: 14, color: Palette.text, maxHeight: 100 },
  sendBtn: { width: 44, height: 44, borderRadius: Radius.pill, backgroundColor: Palette.primary[500], alignItems: "center", justifyContent: "center" },
  sendBtnDisabled: { opacity: 0.4 },
});
