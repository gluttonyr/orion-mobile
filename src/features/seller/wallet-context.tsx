import { createContext, useContext, useState, type ReactNode, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

export interface Transaction {
  id: string;
  type: "vente" | "retrait" | "commission" | "remboursement";
  amount: number;
  status: "completed" | "pending" | "cancelled";
  description: string;
  date: Date;
  orderId?: string;
}

interface WalletContextType {
  totalRevenue: number;
  availableBalance: number;
  pendingBalance: number;
  transactions: Transaction[];
  withdrawFunds: (amount: number) => void;
  addTransaction: (transaction: Omit<Transaction, "id" | "date">) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    AsyncStorage.getItem("orion-wallet-transactions").then((saved) => {
      if (saved) {
        const parsed = JSON.parse(saved).map((t: Transaction) => ({ ...t, date: new Date(t.date) }));
        setTransactions(parsed);
      }
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem("orion-wallet-transactions", JSON.stringify(transactions));
  }, [transactions]);

  const totalRevenue = transactions
    .filter((t) => t.type === "vente" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingBalance = transactions
    .filter((t) => t.type === "vente" && t.status === "pending")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalWithdrawn = transactions
    .filter((t) => t.type === "retrait" && t.status === "completed")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const totalCommissions = transactions
    .filter((t) => t.type === "commission" && t.status === "completed")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const availableBalance = totalRevenue - totalWithdrawn - totalCommissions;

  const withdrawFunds = (amount: number) => {
    if (amount > availableBalance) {
      Alert.alert("Erreur", "Solde insuffisant pour effectuer ce retrait");
      return;
    }
    setTransactions((prev) => [
      { id: Date.now().toString(), type: "retrait", amount: -amount, status: "completed", description: "Retrait vers Mobile Money", date: new Date() },
      ...prev,
    ]);
  };

  const addTransaction = (transaction: Omit<Transaction, "id" | "date">) => {
    setTransactions((prev) => [
      { ...transaction, id: Date.now().toString(), date: new Date() },
      ...prev,
    ]);
  };

  return (
    <WalletContext.Provider value={{ totalRevenue, availableBalance, pendingBalance, transactions, withdrawFunds, addTransaction }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) throw new Error("useWallet doit être utilisé dans un WalletProvider");
  return context;
}
