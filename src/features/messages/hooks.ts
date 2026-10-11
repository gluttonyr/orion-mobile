import { useEffect, useState } from "react";
import { discussionService } from "@/service/discussion.service";
import { messageService } from "@/service/message.service";
import { useAuth } from "@/features/auth/hooks";
import { MessageStatus, MessageType, type Discussion, type Message } from "@/model/model";

export interface ConversationItem {
  id: string;
  userName: string;
  avatar: string;
  unread: number;
  lastMessage: string;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  text: string;
  timestamp: string;
  isOwn: boolean;
}

/** Shared by the client and seller Messages screens — same discussions/messages data either side of a conversation. */
export function useConversations() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [discussions, msgs] = await Promise.all([
          discussionService.getAll(),
          messageService.getAll(),
        ]);
        if (cancelled) return;

        const convList = discussions.map((d: Discussion) => {
          const other = d.participants?.find((p) => p.utilisateurId !== user?.id) ?? d.participants?.[0];
          const discussionMessages = msgs.filter((m: Message) => m.discussionId === d.id)
            .sort((a, b) => new Date(a.createdAt ?? a.date_envoi ?? 0).getTime() - new Date(b.createdAt ?? b.date_envoi ?? 0).getTime());
          const last = discussionMessages[discussionMessages.length - 1];
          return {
            id: String(d.id),
            userName: d.titre || (other?.utilisateur
              ? `${other.utilisateur.prenom ?? ""} ${other.utilisateur.nom ?? ""}`.trim() || `Conversation ${d.id}`
              : `Discussion ${d.id}`),
            avatar: other?.utilisateur?.prenom?.charAt(0)?.toUpperCase() || "C",
            unread: 0,
            lastMessage: last?.contenu ?? "Aucun message",
            timestamp: (last?.createdAt ?? last?.date_envoi)
              ? new Date(last?.createdAt ?? last?.date_envoi ?? 0).toLocaleDateString("fr-FR")
              : "",
          };
        });

        const msgList = msgs.map((m: Message) => ({
          id: String(m.id),
          conversationId: String(m.discussionId),
          text: m.contenu ?? "",
          timestamp: (m.createdAt ?? m.date_envoi)
            ? new Date(m.createdAt ?? m.date_envoi ?? 0).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
            : "",
          isOwn: user ? Number(m.senderId ?? m.utilisateurId) === user.id : false,
        }));

        setConversations(convList);
        setMessages(msgList);
      } catch {
        // Backend may not be reachable — screens fall back to an empty state.
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const sendMessage = async (conversationId: string, text: string) => {
    if (!user?.id) throw new Error('Connectez-vous pour envoyer un message.');
    const created = await messageService.create({
      discussionId: Number(conversationId),
      senderId: user.id,
      contenu: text,
      type: MessageType.TEXT,
      statut: MessageStatus.SENT,
    });
    const message = created as Message;
    setMessages((prev) => [...prev, {
      id: String(message.id ?? Date.now()),
      conversationId,
      text: message.contenu ?? text,
      timestamp: (message.createdAt ?? message.date_envoi)
        ? new Date(message.createdAt ?? message.date_envoi ?? 0).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        : 'À l’instant',
      isOwn: true,
    }]);
    setConversations((prev) => prev.map((conversation) => conversation.id === conversationId
      ? { ...conversation, lastMessage: text, timestamp: 'À l’instant' }
      : conversation));
  };

  /** Kept for screens that need an immediate local echo while offline. */
  const addLocalMessage = (conversationId: string, text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        conversationId,
        text,
        timestamp: "À l'instant",
        isOwn: true,
      },
    ]);
  };

  return { conversations, messages, loading, sendMessage, addLocalMessage };
}
