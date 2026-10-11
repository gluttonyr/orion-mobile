import { useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Palette, Radius, Shadows, Spacing } from "@/constants/theme";
import { Avatar, EmptyState } from "@/components/ui";
import type { ConversationItem } from "@/features/messages/hooks";

interface ConversationListProps {
  conversations: ConversationItem[];
  onSelect: (conversation: ConversationItem) => void;
  bottomInset?: number;
}

export function ConversationList({ conversations, onSelect, bottomInset = 0 }: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = conversations.filter((c) =>
    c.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={16} color={Palette.textMuted} />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Rechercher une conversation..."
          placeholderTextColor={Palette.textMuted}
        />
      </View>

      {filtered.length === 0 ? (
        <EmptyState
          icon="chatbubbles-outline"
          title="Aucune conversation"
          description="Vos échanges apparaîtront ici"
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(c) => c.id}
          contentContainerStyle={{ paddingBottom: bottomInset }}
          renderItem={({ item: conv }) => (
            <TouchableOpacity style={styles.convRow} onPress={() => onSelect(conv)}>
              <View style={styles.convAvatarWrap}>
                <Avatar initials={conv.avatar} size={48} />
                {conv.unread > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{conv.unread}</Text>
                  </View>
                )}
              </View>
              <View style={styles.convInfo}>
                <View style={styles.convTopRow}>
                  <Text style={styles.convName} numberOfLines={1}>{conv.userName}</Text>
                  <Text style={styles.convTime}>{conv.timestamp}</Text>
                </View>
                <Text style={styles.convLastMsg} numberOfLines={1}>{conv.lastMessage}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  searchBox: {
    flexDirection: "row", alignItems: "center", gap: Spacing.two,
    backgroundColor: Palette.surface, marginHorizontal: Spacing.four, marginTop: Spacing.three, marginBottom: Spacing.three,
    borderRadius: Radius.md, paddingHorizontal: Spacing.four, paddingVertical: Spacing.three, ...Shadows.sm,
  },
  searchInput: { flex: 1, fontSize: 14, color: Palette.text },
  convRow: { flexDirection: "row", alignItems: "center", gap: Spacing.three, paddingHorizontal: Spacing.four, paddingVertical: Spacing.four, backgroundColor: Palette.surface, borderBottomWidth: 1, borderBottomColor: Palette.border },
  convAvatarWrap: { position: "relative" },
  unreadBadge: { position: "absolute", top: -4, right: -4, width: 20, height: 20, borderRadius: Radius.pill, backgroundColor: Palette.secondary[500], borderWidth: 2, borderColor: Palette.surface, alignItems: "center", justifyContent: "center" },
  unreadText: { color: Palette.surface, fontSize: 10, fontWeight: "700" },
  convInfo: { flex: 1 },
  convTopRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  convName: { fontSize: 15, fontWeight: "700", color: Palette.text, flex: 1 },
  convTime: { fontSize: 12, color: Palette.textMuted },
  convLastMsg: { fontSize: 13, color: Palette.textSecondary },
});
