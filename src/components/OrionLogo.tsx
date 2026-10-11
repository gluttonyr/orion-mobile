import { Image, StyleSheet, View, type StyleProp, type ViewStyle, type ImageStyle } from "react-native";
import { Palette, Shadows } from "@/constants/theme";

interface OrionLogoProps {
  /** Edge length of the logo mark in px. */
  size?: number;
  /** Wrap the mark in a white rounded tile — use on colored/gradient backgrounds. Set false on already-light backgrounds (e.g. headers). */
  boxed?: boolean;
  style?: StyleProp<ViewStyle | ImageStyle>;
}

/** The real Orion logomark (assets/images/orion-logo.png) — single source used across headers, auth screens and the splash route. */
export function OrionLogo({ size = 40, boxed = true, style }: OrionLogoProps) {
  if (!boxed) {
    return (
      <Image
        source={require("../../assets/images/orion-logo.png")}
        style={[{ width: size, height: size }, style as StyleProp<ImageStyle>]}
        resizeMode="contain"
      />
    );
  }

  const imageSize = size * 0.6;

  return (
    <View style={[styles.box, { width: size, height: size, borderRadius: size * 0.3 }, style as StyleProp<ViewStyle>]}>
      <Image
        source={require("../../assets/images/orion-logo.png")}
        style={{ width: imageSize, height: imageSize }}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: Palette.surface,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.sm,
  },
});
