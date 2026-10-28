import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/AppHeader';
import { WalletScreen } from '@/components/dashboard/screens/wallet';
import { Palette } from '@/constants/theme';

export default function SellerOrdersRoute() {
  return <SafeAreaView style={styles.safe} edges={['top']}>
    <AppHeader variant="authenticated" title="Commandes et remises" />
    <ScrollView><WalletScreen onNavigate={() => undefined} /></ScrollView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: Palette.background } });
