import { Image, Send, Search, Plus } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, radius, spacing } from '../theme';
import { useConversations } from '@/features/messages/hooks';

export function MessagesScreen() {
  const { conversations, messages, loading, sendMessage } = useConversations();
  const [activeId, setActiveId] = useState('');
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [sending, setSending] = useState(false);
  useEffect(() => { if (!activeId && conversations.length) setActiveId(conversations[0].id); }, [conversations, activeId]);

  const activeConv = conversations.find((c) => c.id === activeId);
  const visibleConversations = useMemo(() => conversations.filter((c) => c.userName.toLowerCase().includes(search.toLowerCase())), [conversations, search]);
  const activeMessages = messages.filter((message) => message.conversationId === activeId);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || !activeId || sending) return;
    setSending(true);
    try { await sendMessage(activeId, text); setInput(''); }
    catch (e: any) { Alert.alert('Message non envoyé', e?.response?.data?.message || e?.message || 'Vérifiez votre connexion puis réessayez.'); }
    finally { setSending(false); }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        <Text style={styles.subtitle}>Vos discussions</Text>
      </View>

      <View style={styles.searchBar}>
        <Search size={18} color={colors.muted} />
        <TextInput style={styles.searchInput} value={search} onChangeText={setSearch} placeholder="Rechercher une conversation..." placeholderTextColor={colors.muted} />
      </View>

      {loading ? <ActivityIndicator color={colors.burgundy} style={{ marginVertical: 24 }} /> : conversations.length === 0 ? <Text style={styles.emptyState}>Aucune discussion pour le moment. Les échanges enregistrés sur Orion apparaîtront ici.</Text> : null}
      {!loading && conversations.length > 0 ? <View style={styles.convList}>
        {visibleConversations.map((conv) => {
          const active = conv.id === activeId;
          return (
            <Pressable key={conv.id} style={[styles.convRow, active && styles.convRowActive]} onPress={() => setActiveId(conv.id)}>
              <View style={styles.convAvatar}>
                <Text style={styles.convAvatarText}>{conv.avatar || conv.userName[0]}</Text>
              </View>
              <View style={styles.flex}>
                <View style={styles.convHeader}>
                  <Text style={styles.convName} numberOfLines={1}>{conv.userName}</Text>
                  <Text style={styles.convTime}>{conv.timestamp}</Text>
                </View>
                <Text style={styles.convRole}>Discussion</Text>
                <Text style={styles.convPreview} numberOfLines={1}>{conv.lastMessage}</Text>
              </View>
            </Pressable>
          );
        })}
      </View> : null}

      {activeConv ? (
        <View style={styles.chatSection}>
          <View style={styles.chatHeader}>
            <View style={styles.chatAvatar}><Text style={styles.chatAvatarText}>{activeConv.avatar || activeConv.userName[0]}</Text></View>
            <View>
              <Text style={styles.chatName}>{activeConv.userName}</Text>
              <Text style={styles.chatRole}>Discussion Orion</Text>
            </View>
          </View>
          <ScrollView style={styles.chatBody} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 12 }}>
            {activeMessages.map((msg) => (
              <View key={msg.id} style={[styles.msgBubble, msg.isOwn ? styles.msgFromMe : styles.msgFromThem]}>
                <Text style={msg.isOwn ? styles.msgTextMe : styles.msgTextThem}>{msg.text}</Text>
                <Text style={[styles.messageTime, msg.isOwn && styles.messageTimeOwn]}>{msg.timestamp}</Text>
              </View>
            ))}
          </ScrollView>
          <View style={styles.inputBar}>
            <Pressable style={styles.attachBtn}><Image size={20} color={colors.muted} /></Pressable>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="Écrivez un message..."
              placeholderTextColor={colors.muted}
            />
              <Pressable style={[styles.sendBtn, sending && { opacity: 0.6 }]} onPress={() => void handleSend()} disabled={sending || !input.trim()}>
              <Send size={18} color="white" />
            </Pressable>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: colors.ink, fontSize: 24, fontWeight: '800' },
  subtitle: { color: colors.muted, fontSize: 12 },
  emptyState: { color: colors.muted, fontSize: 13, padding: 16, textAlign: 'center' },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.soft, alignItems: 'center', justifyContent: 'center' },
  searchBar: { height: 48, borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 14 },
  searchInput: { flex: 1, fontSize: 14, color: colors.ink },
  convList: { gap: 4 },
  convRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 10, borderRadius: radius.md, gap: 12 },
  convRowActive: { backgroundColor: colors.burgundySoft },
  convAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#243D4E', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  convAvatarText: { color: 'white', fontWeight: '700', fontSize: 15 },
  onlineDot: { position: 'absolute', bottom: 1, right: 1, width: 11, height: 11, borderRadius: 6, backgroundColor: colors.green, borderWidth: 2, borderColor: colors.white },
  flex: { flex: 1 },
  convHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  convName: { color: colors.ink, fontSize: 13, fontWeight: '700', flex: 1 },
  convTime: { color: colors.muted, fontSize: 10, marginLeft: 8 },
  convRole: { color: colors.burgundy, fontSize: 10, fontWeight: '600', marginTop: 2 },
  convPreview: { color: colors.muted, fontSize: 11, marginTop: 3 },
  unreadBadge: { backgroundColor: colors.burgundy, minWidth: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  unreadText: { color: 'white', fontSize: 10, fontWeight: '800' },
  chatSection: { flex: 1, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, overflow: 'hidden', minHeight: 400 },
  chatHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderBottomWidth: 1, borderBottomColor: colors.line },
  chatAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#243D4E', alignItems: 'center', justifyContent: 'center' },
  chatAvatarText: { color: 'white', fontWeight: '700', fontSize: 14 },
  chatName: { color: colors.ink, fontSize: 14, fontWeight: '700' },
  chatRole: { color: colors.muted, fontSize: 11, marginTop: 2 },
  chatBody: { padding: 14, gap: 10 },
  msgBubble: { maxWidth: '75%', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 16 },
  msgFromMe: { backgroundColor: colors.burgundy, alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  msgFromThem: { backgroundColor: colors.soft, alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  msgTextMe: { color: 'white', fontSize: 13, lineHeight: 19 },
  msgTextThem: { color: colors.ink, fontSize: 13, lineHeight: 19 },
  messageTime: { color: 'rgba(23,23,23,0.55)', fontSize: 9, marginTop: 4, alignSelf: 'flex-end' },
  messageTimeOwn: { color: 'rgba(255,255,255,0.72)' },
  inputBar: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderTopWidth: 1, borderTopColor: colors.line },
  attachBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.soft, alignItems: 'center', justifyContent: 'center' },
  input: { flex: 1, borderWidth: 1, borderColor: colors.line, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: colors.ink },
  sendBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.burgundy, alignItems: 'center', justifyContent: 'center' },
});
