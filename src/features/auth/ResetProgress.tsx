import { View } from "react-native";
import { resetStyles as styles } from "./reset-styles";

/** Barre d'avancement en 3 segments du parcours « mot de passe oublié ». */
export function ResetProgress({ step }: { step: number }) {
  return <View style={styles.progress}>{[0, 1, 2].map((index) => <View key={index} style={[styles.progressBar, step >= index && styles.progressBarActive]} />)}</View>;
}
