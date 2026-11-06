import { Briefcase, ChevronRight, MapPin, Pencil, Plus, Trash2, Users } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { FormField, FormSelect } from '../form';
import { EmptyState, SectionHeader, StatusBadge } from '../ui';
import { colors, radius, spacing } from '../theme';
import { type Opportunity } from '../shared';
import { mission } from '@/service/mission.service';
import { missionTypeService } from '@/service/mission-type.service';
import { MissionCandidates } from '../MissionCandidates';
import { toDesignOpportunity } from '@/features/redesign/mappers';
import { TypePaiement, type Mission } from '@/model/model';
import { checkFedaPayPayment, initMissionPublicationPayment } from '@/service/paiement.service';
import { useToast } from '@/store/toast-store';

export type OpportunityForm = { title: string; type: string; location: string; montant: number; frequencePaiement: TypePaiement; dureeMission: number; description: string; requis: string };

const FREQUENCIES: { label: string; value: TypePaiement }[] = [
  { label: 'Une seule fois', value: TypePaiement.FIXE },
  { label: 'Par jour', value: TypePaiement.JOURNALIER },
  { label: 'Par semaine', value: TypePaiement.HEBDOMADAIRE },
  { label: 'Par mois', value: TypePaiement.MENSUEL },
  { label: 'Par an', value: TypePaiement.ANNUEL },
];

export function OpportunitiesScreen({ onOpenMessages }: { onOpenMessages?: () => void } = {}) {
  const { showToast } = useToast();
  const [oppList, setOppList] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingOpp, setEditingOpp] = useState<Opportunity | null>(null);
  const [detailOpp, setDetailOpp] = useState<Opportunity | null>(null);
  const [publishingMissionId, setPublishingMissionId] = useState<number | null>(null);

  const loadMissions = async () => {
    setLoading(true);
    try { setOppList((await mission.getMine()).map(toDesignOpportunity)); setError(''); }
    catch (e: any) { setError(e?.response?.data?.message || 'Impossible de charger vos opportunités.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { void loadMissions(); }, []);

  const openCreate = () => { setEditingOpp(null); setShowForm(true); };
  const openEdit = (opp: Opportunity) => { setEditingOpp(opp); setDetailOpp(null); setShowForm(true); };

  const startPublicationPayment = async (missionId: number) => {
    setPublishingMissionId(missionId);
    try {
      const payment = await initMissionPublicationPayment(missionId);
      await WebBrowser.openAuthSessionAsync(payment.payment_url, 'orionmobile://checkout');
      let confirmed = false;
      for (let attempt = 0; attempt < 12; attempt++) {
        const state = await checkFedaPayPayment(payment.reference);
        if (state.status === 'SUCCESS' && state.mission?.publicationPayee) { confirmed = true; break; }
        if (state.status === 'FAILED' || state.status === 'REFUNDED') break;
        if (attempt < 11) await new Promise((resolve) => setTimeout(resolve, 2000));
      }
      await loadMissions();
      if (confirmed) showToast('Mission publiée : le paiement FedaPay est confirmé.');
      else showToast('Paiement en attente : la mission reste en brouillon.', 'info');
    } catch (e: any) {
      Alert.alert('Publication non confirmée', e?.response?.data?.message || e?.message || 'La mission reste en brouillon. Réessaie depuis son détail.');
    } finally {
      setPublishingMissionId(null);
    }
  };

  const handleSave = async (form: OpportunityForm) => {
    const payload: Partial<Mission> = {
      titre: form.title.trim(), type: form.type, localisation: form.location.trim(),
      description: form.description.trim(), descriptionCourte: form.description.trim().slice(0, 180),
      montant: form.montant, dureeMission: form.dureeMission, frequencePaiement: form.frequencePaiement,
      requis: form.requis.trim(),
    };
    // Les dates ne sont fixées qu'à la création : modifier une mission ne doit pas les réinitialiser.
    if (!editingOpp) {
      payload.datePublication = new Date();
      payload.dateLimiteCandidature = new Date(Date.now() + 14 * 86400000);
    }
    setSaving(true);
    try {
      if (editingOpp) await mission.update(Number(editingOpp.id), payload);
      else {
        const draft = await mission.create(payload);
        await loadMissions();
        setShowForm(false);
        await startPublicationPayment(Number(draft.id));
        return;
      }
      await loadMissions(); setShowForm(false); showToast('Votre opportunité a été modifiée.');
    } catch (e: any) { Alert.alert('Opportunité non enregistrée', e?.response?.data?.message || 'Vérifiez les informations puis réessayez.'); }
    finally { setSaving(false); }
  };

  const handleDelete = (id: string) => Alert.alert('Supprimer cette opportunité ?', 'Cette action est définitive.', [
    { text: 'Annuler', style: 'cancel' }, { text: 'Supprimer', style: 'destructive', onPress: async () => {
      try { await mission.delete(Number(id)); setDetailOpp(null); await loadMissions(); }
      catch (e: any) { Alert.alert('Suppression impossible', e?.response?.data?.message || 'Réessayez plus tard.'); }
    } },
  ]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Mes opportunités</Text>
          <Text style={styles.subtitle}>Publiez et gérez vos offres</Text>
        </View>
        <Pressable style={styles.primaryBtn} onPress={openCreate}>
          <Plus size={18} color="white" />
          <Text style={styles.primaryBtnText}>Créer</Text>
        </Pressable>
      </View>

      {loading ? <ActivityIndicator color={colors.burgundy} style={{ marginVertical: 28 }} /> : error ? <Text style={styles.error}>{error}</Text> : oppList.length === 0 ? (
        <EmptyState title="Aucune opportunité" message="Créez votre première offre pour recruter des talents." actionLabel="Créer une opportunité" onAction={openCreate} />
      ) : (
        <View style={styles.list}>
          {oppList.map((opp) => (
            <Pressable key={opp.id} style={styles.oppCard} onPress={() => setDetailOpp(opp)}>
              <View style={styles.oppIcon}><Briefcase size={19} color={colors.burgundy} /></View>
              <View style={styles.oppBody}>
                <Text style={styles.oppTitle}>{opp.title}</Text>
                <Text style={styles.oppMeta}>{opp.type} · {opp.location}</Text>
                <View style={styles.oppInfoRow}>
                  <StatusBadge status={opp.status} />
                  <View style={styles.candidatePill}><Users size={11} color={colors.muted} /><Text style={styles.candidateText}>{opp.candidates} candidats</Text></View>
                  <Text style={styles.oppBudget}>{opp.budget}</Text>
                </View>
                <Text style={styles.oppPosted}>{opp.posted}</Text>
              </View>
              <ChevronRight size={18} color={colors.muted} />
            </Pressable>
          ))}
        </View>
      )}

      <OpportunityFormModal key={editingOpp?.id ?? 'new-opportunity'} visible={showForm} saving={saving} onClose={() => setShowForm(false)} onSave={handleSave} opp={editingOpp} />
      <OpportunityDetailModal onOpenMessages={onOpenMessages ? () => { setDetailOpp(null); onOpenMessages(); } : undefined} opp={detailOpp} publishing={publishingMissionId === Number(detailOpp?.id)} onPublish={() => void startPublicationPayment(Number(detailOpp?.id))} onClose={() => setDetailOpp(null)} onEdit={openEdit} onDelete={handleDelete} />
    </View>
  );
}

function OpportunityFormModal({
  visible,
  onClose,
  onSave,
  saving,
  opp,
}: {
  visible: boolean;
  onClose: () => void;
  onSave: (form: OpportunityForm) => void | Promise<void>;
  saving: boolean;
  opp: Opportunity | null;
}) {
  const raw = opp?.raw;
  const [title, setTitle] = useState(opp?.title || '');
  const [type, setType] = useState(opp?.type || '');
  const [location, setLocation] = useState(opp?.location || '');
  const [montant, setMontant] = useState(raw?.montant != null ? String(Math.round(Number(raw.montant))) : '');
  const [frequency, setFrequency] = useState<TypePaiement>(raw?.frequencePaiement ?? TypePaiement.FIXE);
  const [duration, setDuration] = useState(raw?.dureeMission ? String(raw.dureeMission) : '1');
  const [description, setDescription] = useState(opp?.description || '');
  const [requis, setRequis] = useState(raw?.requis || '');
  const [types, setTypes] = useState<string[]>([]);
  const [typesLoading, setTypesLoading] = useState(true);

  useEffect(() => {
    let active = true;
    missionTypeService.getAll()
      .then((rows) => {
        if (!active) return;
        const names = rows.map((row) => row.nom);
        // Conserve un type archivé déjà utilisé par la mission modifiée.
        if (opp?.type && !names.includes(opp.type)) names.push(opp.type);
        setTypes(names);
        setType((current) => current || names[0] || '');
      })
      .catch(() => { if (active) setTypes(opp?.type ? [opp.type] : []); })
      .finally(() => { if (active) setTypesLoading(false); });
    return () => { active = false; };
  }, [opp?.type]);

  const handleSave = () => {
    const amount = Number(montant.replace(/[^0-9]/g, ''));
    const months = Number(duration.replace(/[^0-9]/g, ''));
    if (!title.trim() || !type || !location.trim() || !description.trim()) {
      Alert.alert('Informations manquantes', 'Le titre, le type, la localisation et la description sont obligatoires.');
      return;
    }
    if (!montant.trim() || !Number.isFinite(amount) || !months || months < 1) {
      Alert.alert('Valeurs invalides', 'Indiquez un montant et une durée (en mois) valides.');
      return;
    }
    void onSave({ title, type, location, montant: amount, frequencePaiement: frequency, dureeMission: months, description, requis });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalSheet}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{opp ? "Modifier l'opportunité" : 'Nouvelle opportunité'}</Text>
            <Pressable style={styles.closeBtn} onPress={onClose}><Text style={styles.closeX}>✕</Text></Pressable>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }} keyboardShouldPersistTaps="handled">
            <FormField label="Titre" value={title} onChangeText={setTitle} placeholder="Ex. Photographe produit pour..." />
            {typesLoading ? <ActivityIndicator color={colors.burgundy} style={{ marginVertical: 10 }} /> : types.length ? (
              <FormSelect label="Type de mission" value={type} options={types} onSelect={setType} />
            ) : <Text style={styles.error}>Aucun type de mission disponible pour le moment.</Text>}
            <FormField label="Localisation" value={location} onChangeText={setLocation} placeholder="Ville · À distance" />
            <FormField label="Montant / rémunération (FCFA)" value={montant} onChangeText={setMontant} placeholder="Ex. 250000" keyboardType="numeric" />
            <FormSelect label="Fréquence de rémunération" value={FREQUENCIES.find((item) => item.value === frequency)?.label ?? FREQUENCIES[0].label} options={FREQUENCIES.map((item) => item.label)} onSelect={(label) => setFrequency(FREQUENCIES.find((item) => item.label === label)?.value ?? TypePaiement.FIXE)} />
            <FormField label="Durée de la mission (mois)" value={duration} onChangeText={setDuration} placeholder="Ex. 2" keyboardType="numeric" />
            <FormField label="Description" value={description} onChangeText={setDescription} placeholder="Quel est le contexte, le besoin et le résultat attendu ?" multiline />
            <FormField label="Prérequis (facultatif)" value={requis} onChangeText={setRequis} placeholder="Un prérequis par ligne" multiline />
            {!opp ? <Text style={styles.detailPosted}>La mission sera créée en brouillon et publiée seulement après confirmation des frais FedaPay de 500 FCFA.</Text> : null}
            <Pressable style={styles.saveBtn} onPress={handleSave} disabled={saving || typesLoading || !types.length}>
              {saving ? <ActivityIndicator color="white" /> : <Text style={styles.saveBtnText}>{opp ? 'Enregistrer' : 'Créer et payer 500 FCFA'}</Text>}
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function OpportunityDetailModal({
  opp,
  onOpenMessages,
  publishing,
  onPublish,
  onClose,
  onEdit,
  onDelete,
}: {
  opp: Opportunity | null;
  onOpenMessages?: () => void;
  publishing: boolean;
  onPublish: () => void;
  onClose: () => void;
  onEdit: (opp: Opportunity) => void;
  onDelete: (id: string) => void;
}) {
  if (!opp) return null;
  return (
    <Modal visible={!!opp} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalSheet}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Détail de l'opportunité</Text>
            <Pressable style={styles.closeBtn} onPress={onClose}><Text style={styles.closeX}>✕</Text></Pressable>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
            <View style={styles.detailHeader}>
              <Text style={styles.detailTitle}>{opp.title}</Text>
              <StatusBadge status={opp.status} />
            </View>
            <View style={styles.detailMeta}>
              <View style={styles.metaItem}><Briefcase size={14} color={colors.muted} /><Text style={styles.metaText}>{opp.type}</Text></View>
              <View style={styles.metaItem}><MapPin size={14} color={colors.muted} /><Text style={styles.metaText}>{opp.location}</Text></View>
              <Text style={styles.detailBudget}>{opp.budget}</Text>
            </View>
            <Text style={styles.detailPosted}>Publiée {opp.posted}</Text>
            {opp.description ? <Text style={styles.detailPosted}>{opp.description}</Text> : null}

            {opp.raw?.requis ? <Text style={styles.detailPosted}>Prérequis : {opp.raw.requis}</Text> : null}

            <SectionHeader title={`Candidats (${opp.candidates})`} />
            <MissionCandidates missionId={Number(opp.id)} onOpenMessages={onOpenMessages} />

            <View style={styles.detailActions}>
              {opp.status === 'Brouillon' ? <Pressable style={styles.saveBtn} onPress={onPublish} disabled={publishing}>{publishing ? <ActivityIndicator color="white" /> : <Text style={styles.saveBtnText}>Payer 500 FCFA et publier</Text>}</Pressable> : null}
              <Pressable style={styles.editBtn} onPress={() => onEdit(opp)}>
                <Pencil size={16} color={colors.burgundy} />
                <Text style={styles.editBtnText}>Modifier</Text>
              </Pressable>
              <Pressable style={styles.deleteBtn} onPress={() => onDelete(opp.id)}>
                <Trash2 size={16} color={colors.error} />
                <Text style={styles.deleteBtnText}>Supprimer</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  title: { color: colors.ink, fontSize: 24, fontWeight: '800' },
  subtitle: { color: colors.muted, fontSize: 13, marginTop: 4 },
  primaryBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.burgundy, paddingHorizontal: 16, paddingVertical: 12, borderRadius: radius.md },
  primaryBtnText: { color: 'white', fontSize: 12, fontWeight: '800' },
  list: { gap: 12 },
  oppCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, padding: 14 },
  oppIcon: { width: 42, height: 42, borderRadius: 12, backgroundColor: colors.burgundySoft, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  oppBody: { flex: 1 },
  oppTitle: { color: colors.ink, fontSize: 14, fontWeight: '800' },
  oppMeta: { color: colors.muted, fontSize: 11, marginTop: 3 },
  oppInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8, flexWrap: 'wrap' },
  candidatePill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.soft, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  candidateText: { color: colors.muted, fontSize: 10, fontWeight: '600' },
  oppBudget: { color: colors.ink, fontSize: 11, fontWeight: '700' },
  oppPosted: { color: colors.muted, fontSize: 10, marginTop: 6 },
  modalBackdrop: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: colors.white, borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 20, paddingBottom: 34, maxHeight: '90%' },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.line, alignSelf: 'center', marginBottom: 20 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  sheetTitle: { color: colors.ink, fontSize: 20, fontWeight: '800' },
  closeBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.soft, alignItems: 'center', justifyContent: 'center' },
  closeX: { color: colors.ink, fontSize: 14, fontWeight: '700' },
  saveBtn: { backgroundColor: colors.burgundy, borderRadius: radius.md, paddingVertical: 15, alignItems: 'center', marginTop: 8 },
  saveBtnText: { color: 'white', fontSize: 14, fontWeight: '800' },
  detailHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  detailTitle: { color: colors.ink, fontSize: 18, fontWeight: '800', flex: 1 },
  detailMeta: { flexDirection: 'row', alignItems: 'center', gap: 14, flexWrap: 'wrap' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { color: colors.muted, fontSize: 12 },
  detailBudget: { color: colors.burgundy, fontSize: 14, fontWeight: '800' },
  detailPosted: { color: colors.muted, fontSize: 11, marginTop: 8 },
  candidateList: { gap: 2 },
  candidateRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.line },
  candidateAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#243D4E', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  candidateInitial: { color: 'white', fontWeight: '700', fontSize: 13 },
  flex: { flex: 1 },
  candidateName: { color: colors.ink, fontSize: 13, fontWeight: '700' },
  candidateRole: { color: colors.muted, fontSize: 11, marginTop: 2 },
  candidateStatus: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  candidateStatusText: { fontSize: 10, fontWeight: '700' },
  detailActions: { flexDirection: 'row', gap: 10, marginTop: 20 },
  editBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: colors.burgundy, borderRadius: radius.md, paddingVertical: 14 },
  editBtnText: { color: colors.burgundy, fontSize: 13, fontWeight: '700' },
  deleteBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: colors.error, borderRadius: radius.md, paddingVertical: 14 },
  deleteBtnText: { color: colors.error, fontSize: 13, fontWeight: '700' },
  error: { color: colors.error, padding: 12 },
});
