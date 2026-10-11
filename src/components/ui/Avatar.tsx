import { Image, StyleSheet, Text, View } from 'react-native';
import { Palette } from '@/constants/theme';

interface AvatarProps {
  initials: string;
  imageUri?: string | null;
  size?: number;
  ring?: boolean;
}

export function Avatar({ initials, imageUri, size = 40, ring }: AvatarProps) {
  const dimension = { width: size, height: size, borderRadius: size / 2 };

  if (imageUri) {
    return (
      <Image
        source={{ uri: imageUri }}
        style={[dimension, ring && styles.ring]}
      />
    );
  }

  return (
    <View style={[styles.fallback, dimension, ring && styles.ring]}>
      <Text style={[styles.initials, { fontSize: size * 0.38 }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: Palette.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    borderWidth: 2,
    borderColor: Palette.secondary[500],
  },
  initials: {
    color: Palette.surface,
    fontWeight: '700',
  },
});
