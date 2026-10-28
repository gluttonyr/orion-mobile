import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { Redirect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/AppHeader';
import { ClientOrdersScreen } from '@/components/dashboard/screens/client';
import { useAuth } from '@/features/auth/hooks';
import { Palette, BottomTabInset } from '@/constants/theme';

export default function OrdersScreen() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <SafeAreaView style={styles.safe}><ActivityIndicator color={Palette.primary[500]} /></SafeAreaView>;
  if (!isAuthenticated) return <Redirect href="/login" />;
  return <SafeAreaView style={styles.safe} edges={['top']}>
    <AppHeader variant="authenticated" title="Mes achats" />
    <ScrollView contentContainerStyle={styles.content}><View style={styles.inner}><ClientOrdersScreen /></View></ScrollView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Palette.background },
  content: { paddingBottom: BottomTabInset },
  inner: { padding: 16 },
});
