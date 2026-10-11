import { StyleSheet, View, type ColorValue } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Palette, Radius } from '@/constants/theme';

interface TabBarIconProps {
  /** Icon name without the `-outline` suffix, e.g. "home". */
  name: string;
  focused: boolean;
  color: ColorValue;
}

/** Bottom-tab icon with a soft pill highlight behind the active tab, and filled/outline swap on focus. */
export function TabBarIcon({ name, focused, color }: TabBarIconProps) {
  return (
    <View style={[styles.wrap, focused && styles.wrapActive]}>
      <Ionicons name={(focused ? name : `${name}-outline`) as keyof typeof Ionicons.glyphMap} size={19} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 34,
    height: 30,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wrapActive: {
    backgroundColor: Palette.primary[50],
  },
});
