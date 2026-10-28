import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "@/features/auth/hooks";
import { CartProvider } from "@/store/cart-store";
import { ImageProvider } from "@/store/image-store";
import { LiveProvider } from "@/features/live/LiveContext";
import { ThemeModeProvider, useThemeMode } from "@/store/theme-mode";
import { ToastProvider } from "@/store/toast-store";

function ThemeStatusBar() {
  const { mode } = useThemeMode();
  return <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />;
}

export default function RootLayout() {
  return (
    <ThemeModeProvider><ToastProvider><AuthProvider>
      <LiveProvider>
        <ImageProvider>
          <CartProvider>
            <ThemeStatusBar />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(client)" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="seller" />
            </Stack>
          </CartProvider>
        </ImageProvider>
      </LiveProvider>
    </AuthProvider></ToastProvider></ThemeModeProvider>
  );
}
