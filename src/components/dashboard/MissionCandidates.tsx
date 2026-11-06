import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Check, MessageCircle, X } from 'lucide-react-native';
import { colors, radius } from './theme';
import { mission, type MissionCandidate } from '@/service/mission.service';

const isAccepted = (status: string) => ['acceptee', 'acceptée', 'accepté'].includes(status);
const isRefused = (status: string) => ['refusee', 'refusée', 'refusé'].includes(status);

function statusLabel(status: string) {
  if (isAccepted(status)) return { label: 'Acceptée', color: colors.green };
  if (isRefused(status)) return { label: 'Refusée', color: colors.error };
  return { label: 'En attente', color: colors.gold };
}

/**
 * Liste des candidats d'une mission avec acceptation / refus — équivalent de la
 * gestion des candidatures du tableau de bord web. Accepter ouvre une discussion.
 */
export function MissionCandidates({ missionId, onOpenMessages }: { missionId: number; onOpenMessages?: () => void }) {
  const [candidates, setCandidates] = useState<MissionCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try { setCandidates(await mission.getCandidates(missionId)); setError(''); }
    catch (e: any) { setError(e?.response?.data?.message || 'Impossible de charger les candidatures.'); }
    finally { setLoading(false); }
  }, [missionId]);

  useEffect(() => { void load(); }, [load]);

  const decide = (candidate: MissionCandidate, statut: 'acceptee' | 'refusee') => {
    const name = [candidate.candidat?.prenom, candidate.candidat?.nom].filter(Boolean).join(' ') || 'ce candidat';
    Alert.alert(
      statut === 'acceptee' ? 'Accepter la candidature ?' : 'Refuser la candidature ?',
      statut === 'acceptee' ? `Une discussion sera ouverte avec ${name}.` : `${name} sera informé(e) du refus.`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: statut === 'acceptee' ? 'Accepter' : 'Refuser', style: statut === 'refusee' ? 'destructive' : 'default', onPress: async () => {
          setUpdatingId(candidate.userId);
          try {
            await mission.updateCandidateStatus(missionId, candidate.userId, statut);
            await load();
          } catch (e: any) {
            Alert.alert('Action impossible', e?.response?.data?.message || 'Réessayez plus tard.');
          } finally { setUpdatingId(null); }
        } },
      ],
    );
  };

  if (loading) return <ActivityIndicator color={colors.burgundy} style={{ marginVertical: 16 }} />;
  if (error) return <Text style={styles.muted}>{error}</Text>;
  if (!candidates.length) return <Text style={styles.muted}>Aucune candidature pour le moment.</Text>;

  return (
    <View style={styles.list}>
      {candidates.map((candidate) => {
        const name = [candidate.candidat?.prenom, candidate.candidat?.nom].filter(Boolean).join(' ') || 'Candidat';
        const status = statusLabel(candidate.statut);
        const pending = !isAccepted(candidate.statut) && !isRefused(candidate.statut);
        return (
          <View key={candidate.userId} style={styles.row}>
            <View style={styles.head}>
              <View style={styles.avatar}><Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text></View>
              <View style={styles.flex}>
                <Text style={styles.name}>{name}</Text>
                <Text style={styles.muted}>{candidate.candidat?.specialite || candidate.candidat?.email || ''}</Text>
              </View>
              <Text style={[styles.status, { color: status.color }]}>{status.label}</Text>
            </View>
            {candidate.message ? <Text style={styles.message}>« {candidate.message} »</Text> : null}
            <Text style={styles.muted}>Candidature du {new Date(candidate.dateCandidature).toLocaleDateString('fr-FR')}</Text>
            {updatingId === candidate.userId ? <ActivityIndicator color={colors.burgundy} style={{ marginTop: 8 }} /> : (
              <View style={styles.actions}>
                {pending || isRefused(candidate.statut) ? (
                  <Pressable style={[styles.action, styles.accept]} onPress={() => decide(candidate, 'acceptee')}><Check size={14} color="white" /><Text style={styles.acceptText}>Accepter</Text></Pressable>
                ) : null}
                {pending || isAccepted(candidate.statut) ? (
                  <Pressable style={[styles.action, styles.refuse]} onPress={() => decide(candidate, 'refusee')}><X size={14} color={colors.error} /><Text style={styles.refuseText}>Refuser</Text></Pressable>
                ) : null}
                {isAccepted(candidate.statut) && onOpenMessages ? (
                  <Pressable style={[styles.action, styles.chat]} onPress={onOpenMessages}><MessageCircle size={14} color={colors.burgundy} /><Text style={styles.chatText}>Discuter</Text></Pressable>
                ) : null}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 10, marginTop: 8 },
  row: { borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, padding: 12, gap: 6 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#7F1033', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: 'white', fontWeight: '700' },
  flex: { flex: 1 },
  name: { color: colors.ink, fontSize: 13, fontWeight: '700' },
  status: { fontSize: 11, fontWeight: '800' },
  message: { color: colors.ink, fontSize: 12, fontStyle: 'italic' },
  muted: { color: colors.muted, fontSize: 11 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 6, flexWrap: 'wrap' },
  action: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.md, borderWidth: 1 },
  accept: { backgroundColor: colors.green, borderColor: colors.green },
  acceptText: { color: 'white', fontSize: 12, fontWeight: '700' },
  refuse: { borderColor: colors.error },
  refuseText: { color: colors.error, fontSize: 12, fontWeight: '700' },
  chat: { borderColor: colors.burgundy },
  chatText: { color: colors.burgundy, fontSize: 12, fontWeight: '700' },
});
