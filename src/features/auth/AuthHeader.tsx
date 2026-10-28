import { LinearGradient } from 'expo-linear-gradient';
import { ShoppingBag } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

type AuthHeaderProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
};

function Diamond({ size = 13, color = '#E7C487' }: { size?: number; color?: string }) {
  return <View style={[styles.diamond, { width: size, height: size, borderColor: color }]} />;
}

export function AuthHeader({ eyebrow, title, subtitle }: AuthHeaderProps) {
  return (
    <LinearGradient colors={['#8C1635', '#6D102B', '#510C24']} style={styles.hero}>
      <View pointerEvents="none" style={styles.sideMotif}>
        {[0, 1, 2, 3, 4].map((item) => <Diamond key={item} size={item % 2 === 0 ? 15 : 9} color={item % 2 === 0 ? '#E8C789' : '#F3DFB4'} />)}
      </View>
      <View style={styles.brandRow}>
        <View style={styles.brandMark}><ShoppingBag size={17} color="#74122E" strokeWidth={2.4} /></View>
        <View>
          <Text style={styles.brand}>ORION</Text>
          <Text style={styles.brandCaption}>LE MARCHÉ LOCAL, EN UN CLIC</Text>
        </View>
      </View>
      <View style={styles.copy}>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <View pointerEvents="none" style={styles.rightMotif}>
        <View style={styles.largeDiamond}><View style={styles.innerDiamond} /></View>
        <View style={styles.motifDot} />
        <View style={[styles.motifDot, styles.motifDotSecond]} />
      </View>
      <View pointerEvents="none" style={styles.textileTrim}>
        {Array.from({ length: 11 }, (_, index) => <View key={index} style={styles.trimUnit}><Diamond size={9} color="#EDCF91" /><View style={styles.trimDot} /></View>)}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  hero: { minHeight: 235, overflow: 'hidden', borderRadius: 24, paddingHorizontal: 23, paddingTop: 24, paddingBottom: 42, justifyContent: 'space-between' },
  brandRow: { zIndex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandMark: { width: 35, height: 35, borderRadius: 12, backgroundColor: '#F6EADB', alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-5deg' }] },
  brand: { color: '#FFF8EE', fontSize: 18, fontWeight: '900', letterSpacing: 2.2, lineHeight: 20 },
  brandCaption: { color: '#EACDAB', fontSize: 7, fontWeight: '700', letterSpacing: 1.1, marginTop: 2 },
  copy: { zIndex: 1, maxWidth: '83%', marginTop: 26 },
  eyebrow: { color: '#EBCB94', fontSize: 9, fontWeight: '800', letterSpacing: 1.25, marginBottom: 8 },
  title: { color: '#FFFAF3', fontSize: 27, fontWeight: '800', letterSpacing: -0.6 },
  subtitle: { color: '#F0DCE0', fontSize: 12, lineHeight: 18, marginTop: 6 },
  sideMotif: { position: 'absolute', left: 8, top: 96, gap: 13, alignItems: 'center', opacity: 0.68 },
  rightMotif: { position: 'absolute', right: 18, top: 77, width: 86, height: 104, alignItems: 'center', justifyContent: 'center', opacity: 0.64 },
  largeDiamond: { width: 55, height: 55, borderWidth: 1.4, borderColor: '#E8C789', transform: [{ rotate: '45deg' }], alignItems: 'center', justifyContent: 'center' },
  innerDiamond: { width: 30, height: 30, borderWidth: 1, borderColor: '#F4DFC0' },
  motifDot: { position: 'absolute', top: 2, right: 10, width: 7, height: 7, borderRadius: 4, backgroundColor: '#E8C789' },
  motifDotSecond: { top: undefined, right: undefined, bottom: 1, left: 12 },
  diamond: { borderWidth: 1.3, transform: [{ rotate: '45deg' }] },
  textileTrim: { position: 'absolute', right: 0, bottom: 12, left: 0, height: 15, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderTopWidth: 1, borderBottomWidth: 1, borderColor: 'rgba(237,207,145,0.4)' },
  trimUnit: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  trimDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: '#EDCF91' },
});
