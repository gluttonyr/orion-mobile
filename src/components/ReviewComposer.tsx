import { useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Palette, Radius, Spacing } from '@/constants/theme';
import { productsApi } from '@/features/products/api';
import { Button } from '@/components/ui';

export function ReviewComposer({ productId, productName, onSaved }: { productId: number; productName: string; onSaved: () => void }) {
  const [visible, setVisible] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!rating) { Alert.alert('Note requise', 'Choisis une note de 1 à 5 étoiles.'); return; }
    setSaving(true);
    try {
      await productsApi.saveReview(productId, rating, comment.trim());
      setVisible(false);
      setComment('');
      setRating(0);
      onSaved();
      Alert.alert('Avis publié', 'Merci d’avoir partagé ton expérience.');
    } catch (error) {
      const message = (error as any)?.response?.data?.message ?? (error instanceof Error ? error.message : 'Impossible d’enregistrer ton avis.');
      Alert.alert('Envoi impossible', Array.isArray(message) ? message.join(' ') : String(message));
    } finally {
      setSaving(false);
    }
  };

  return <>
    <Button title="Ajouter un avis" icon="star" variant="outline" onPress={() => setVisible(true)} fullWidth />
    <Modal visible={visible} transparent animationType="slide" onRequestClose={() => !saving && setVisible(false)}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => !saving && setVisible(false)} accessibilityLabel="Fermer" />
        <View style={styles.sheet}>
          <View style={styles.header}><View style={styles.icon}><Ionicons name="star" size={19} color={Palette.warning.text} /></View><View style={styles.flex}><Text style={styles.eyebrow}>VOTRE EXPÉRIENCE</Text><Text style={styles.title}>Donner votre avis</Text></View><Pressable onPress={() => !saving && setVisible(false)} accessibilityRole="button" accessibilityLabel="Fermer" hitSlop={8}><Ionicons name="close" size={22} color={Palette.textSecondary} /></Pressable></View>
          <Text style={styles.productName} numberOfLines={2}>{productName}</Text>
          <Text style={styles.label}>Ta note</Text>
          <View style={styles.stars} accessibilityRole="radiogroup">
            {[1, 2, 3, 4, 5].map((value) => <Pressable key={value} onPress={() => setRating(value)} accessibilityRole="radio" accessibilityState={{ selected: rating === value }} accessibilityLabel={`${value} étoile${value > 1 ? 's' : ''}`} hitSlop={5}><Ionicons name={value <= rating ? 'star' : 'star-outline'} size={31} color={Palette.warning.text} /></Pressable>)}
          </View>
          <Text style={styles.ratingHint}>{rating ? `${rating} / 5` : 'Sélectionne une note'}</Text>
          <Text style={styles.label}>Commentaire <Text style={styles.optional}>· facultatif</Text></Text>
          <TextInput value={comment} onChangeText={setComment} placeholder="Qu’as-tu pensé de ce produit ?" placeholderTextColor={Palette.textMuted} multiline maxLength={2000} textAlignVertical="top" style={styles.input} />
          <Text style={styles.hint}>La note est requise ; le commentaire ne l’est pas.</Text>
          <Button title={saving ? 'Publication…' : 'Publier mon avis'} onPress={() => void submit()} disabled={saving} loading={saving} fullWidth />
        </View>
      </View>
    </Modal>
  </>;
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(20,12,15,0.42)' },
  sheet: { borderTopLeftRadius: 22, borderTopRightRadius: 22, backgroundColor: Palette.surface, padding: Spacing.five, paddingBottom: Spacing.eight, gap: Spacing.three },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  icon: { width: 40, height: 40, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: Palette.warning.bg },
  flex: { flex: 1 },
  eyebrow: { color: Palette.primary[500], fontSize: 9, fontWeight: '800', letterSpacing: 1.1 },
  title: { color: Palette.text, fontSize: 18, fontWeight: '800', marginTop: 3 },
  productName: { color: Palette.textSecondary, fontSize: 13, fontWeight: '700' },
  label: { color: Palette.text, fontSize: 12, fontWeight: '700', marginTop: Spacing.one },
  stars: { flexDirection: 'row', gap: Spacing.two },
  ratingHint: { color: Palette.textMuted, fontSize: 11, marginTop: -Spacing.two },
  optional: { color: Palette.textMuted, fontWeight: '500' },
  input: { minHeight: 100, borderWidth: 1, borderColor: Palette.border, borderRadius: Radius.md, padding: Spacing.three, color: Palette.text, fontSize: 13, backgroundColor: Palette.surface },
  hint: { color: Palette.textMuted, fontSize: 11, marginTop: -Spacing.two },
});
