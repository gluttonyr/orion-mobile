import { Redirect } from "expo-router";

/** Ancien accueil : l'accueil unique de l'app est app/index.tsx. */
export default function LegacyHome() {
  return <Redirect href="/" />;
}
