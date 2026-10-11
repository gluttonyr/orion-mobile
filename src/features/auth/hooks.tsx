import { createContext, useContext, useState, type ReactNode, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { userService } from "@/service/utilisateur.service";
import { UserRole, type Utilisateur } from "@/model/model";

interface AuthContextType {
  user: Utilisateur | null;
  login: (email: string, password: string) => Promise<boolean>;
  acceptSession: (user: Utilisateur, token: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isSeller: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Utilisateur | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem("token").then((token) => {
      if (token) {
        userService
          .getCurrent(token)
          .then((currentUser) => setUser(currentUser))
          .catch(() => AsyncStorage.removeItem("token"))
          .finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await userService.login(email, password);
      if (response.user && response.access_token) {
        setUser(response.user);
        await AsyncStorage.setItem("token", response.access_token);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const acceptSession = async (authenticatedUser: Utilisateur, token: string) => {
    await AsyncStorage.setItem('token', token);
    setUser(authenticatedUser);
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        acceptSession,
        logout,
        isAuthenticated: !!user,
        isSeller: user?.role === UserRole.COMMERCANT,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
