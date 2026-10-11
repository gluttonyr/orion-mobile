import { Redirect, Tabs } from "expo-router";
import { useAuth } from "@/features/auth/hooks";
import { SubscriptionProvider } from "@/features/seller/subscription-context";
import { WalletProvider } from "@/features/seller/wallet-context";
import { StoreProvider } from "@/features/seller/boutique-context";
import { Palette, Radius, Shadows } from "@/constants/theme";
import { TabBarIcon } from "@/components/TabBarIcon";

export default function SellerLayout() {
  const { isAuthenticated, isLoading, isSeller } = useAuth();

  if (isLoading) return null;
  if (!isAuthenticated) return <Redirect href="/login" />;
  if (!isSeller) return <Redirect href="/(client)/home" />;

  return (
    <SubscriptionProvider>
      <WalletProvider>
        <StoreProvider>
          <Tabs
            screenOptions={{
              headerShown: false,
              tabBarActiveTintColor: Palette.primary[500],
              tabBarInactiveTintColor: Palette.neutral[400],
              tabBarStyle: {
                position: "absolute",
                left: 10,
                right: 10,
                bottom: 16,
                height: 68,
                backgroundColor: Palette.surface,
                borderTopWidth: 0,
                borderRadius: Radius.xl,
                paddingTop: 10,
                ...Shadows.lg,
              },
              tabBarItemStyle: { paddingTop: 2, paddingHorizontal: 0 },
              tabBarLabelStyle: { fontSize: 9, fontWeight: "700", marginTop: 0 },
            }}
          >
            <Tabs.Screen
              name="index"
              options={{
                title: "Dashboard",
                tabBarIcon: ({ color, focused }) => <TabBarIcon name="grid" focused={focused} color={color} />,
              }}
            />
            <Tabs.Screen
              name="products"
              options={{
                title: "Produits",
                tabBarIcon: ({ color, focused }) => <TabBarIcon name="cube" focused={focused} color={color} />,
              }}
            />
            <Tabs.Screen
              name="orders"
              options={{
                title: "Commandes",
                tabBarIcon: ({ color, focused }) => <TabBarIcon name="receipt" focused={focused} color={color} />,
              }}
            />
            <Tabs.Screen
              name="opportunities"
              options={{
                title: "Opportunités",
                tabBarIcon: ({ color, focused }) => <TabBarIcon name="briefcase" focused={focused} color={color} />,
              }}
            />
            <Tabs.Screen
              name="shop"
              options={{
                title: "Boutique",
                tabBarIcon: ({ color, focused }) => <TabBarIcon name="storefront" focused={focused} color={color} />,
              }}
            />
            <Tabs.Screen
              name="messages"
              options={{
                title: "Messages",
                tabBarIcon: ({ color, focused }) => <TabBarIcon name="chatbubbles" focused={focused} color={color} />,
              }}
            />

            {/* Accessibles par navigation, sans onglet dédié */}
            <Tabs.Screen name="wallet" options={{ href: null }} />
            <Tabs.Screen name="subscription" options={{ href: null }} />
            <Tabs.Screen name="analytics" options={{ href: null }} />
            <Tabs.Screen name="profile" options={{ href: null }} />
          </Tabs>
        </StoreProvider>
      </WalletProvider>
    </SubscriptionProvider>
  );
}
