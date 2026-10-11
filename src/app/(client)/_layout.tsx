import { Tabs } from "expo-router";
import { Palette, Radius, Shadows } from "@/constants/theme";
import { TabBarIcon } from "@/components/TabBarIcon";

export default function ClientLayout() {
  return (
    <Tabs
      initialRouteName="home"
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
        name="home"
        options={{
          title: "Accueil",
          tabBarIcon: ({ color, focused }) => <TabBarIcon name="home" focused={focused} color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Recherche",
          tabBarIcon: ({ color, focused }) => <TabBarIcon name="search" focused={focused} color={color} />,
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
        name="orders"
        options={{
          title: "Mes achats",
          tabBarIcon: ({ color, focused }) => <TabBarIcon name="bag" focused={focused} color={color} />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: "Messages",
          tabBarIcon: ({ color, focused }) => <TabBarIcon name="chatbubbles" focused={focused} color={color} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "Compte",
          tabBarIcon: ({ color, focused }) => <TabBarIcon name="person" focused={focused} color={color} />,
        }}
      />

      {/* Accessibles par navigation, sans onglet dédié */}
      <Tabs.Screen name="product" options={{ href: null }} />
      <Tabs.Screen name="cart" options={{ href: null }} />
    </Tabs>
  );
}
