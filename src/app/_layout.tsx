import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "@/features/auth/hooks";
import { CartProvider } from "@/store/cart-store";
import { ImageProvider } from "@/store/image-store";
import { LiveProvider } from "@/features/live/LiveContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <LiveProvider>
        <ImageProvider>
          <CartProvider>
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(client)" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="seller" />
            </Stack>
          </CartProvider>
        </ImageProvider>
      </LiveProvider>
    </AuthProvider>
  );
}
