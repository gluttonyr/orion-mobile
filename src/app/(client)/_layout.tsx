import { Stack } from "expo-router";

/**
 * Pages ouvertes depuis l'accueil (produit, boutique, opportunités, messages, compte, aide…).
 * Pas de barre d'onglets ici : l'unique barre de navigation est celle de l'accueil (app/index.tsx).
 * Avant, ce groupe affichait sa propre ancienne barre d'onglets, d'où l'impression d'un « ancien design ».
 */
export default function ClientLayout() {
  return <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }} />;
}
