export const dashboardStats = {
  revenue: 2450000,
  sales: 87,
  stock: 245,
  pendingOrders: 12,
  revenueGrowth: 12.5,
  salesGrowth: 8.3,
  stockGrowth: -5.2,
  ordersGrowth: 15.7,
};

export const recentSales = [
  { id: "1", product: "Smartphone Samsung", amount: 185000, date: "2026-03-05", status: "Livré" },
  { id: "2", product: "Sac de Riz 50kg", amount: 32000, date: "2026-03-05", status: "En cours" },
  { id: "3", product: "Tissus Wax", amount: 25000, date: "2026-03-04", status: "Livré" },
  { id: "4", product: "Cosmétiques Naturels", amount: 15000, date: "2026-03-04", status: "En attente" },
  { id: "5", product: "Machine à Coudre", amount: 450000, date: "2026-03-03", status: "Livré" },
];

export const missions = [
  {
    id: "1",
    title: "Formation Marketing Digital",
    type: "Formation",
    progress: 65,
    deadline: "2026-03-15",
    reward: "Certificat + 50000 FCFA",
  },
  {
    id: "2",
    title: "Développer votre réseau commercial",
    type: "Challenge",
    progress: 40,
    deadline: "2026-03-20",
    reward: "Accès réseau premium",
  },
  {
    id: "3",
    title: "Optimiser votre inventaire",
    type: "Tutoriel",
    progress: 80,
    deadline: "2026-03-10",
    reward: "Outil de gestion gratuit",
  },
];

export const defaultTransactions = [
  {
    id: "1",
    type: "vente" as const,
    amount: 45000,
    status: "completed" as const,
    description: "Vente - iPhone 12 Pro",
    date: new Date("2026-04-20"),
    orderId: "ORD-001",
  },
  {
    id: "2",
    type: "vente" as const,
    amount: 125000,
    status: "completed" as const,
    description: "Vente - Laptop Dell XPS",
    date: new Date("2026-04-18"),
    orderId: "ORD-002",
  },
  {
    id: "3",
    type: "vente" as const,
    amount: 28000,
    status: "pending" as const,
    description: "Vente - Samsung Galaxy Buds",
    date: new Date("2026-04-22"),
    orderId: "ORD-003",
  },
  {
    id: "4",
    type: "retrait" as const,
    amount: -50000,
    status: "completed" as const,
    description: "Retrait vers Mobile Money",
    date: new Date("2026-04-15"),
  },
  {
    id: "5",
    type: "commission" as const,
    amount: -3500,
    status: "completed" as const,
    description: "Commission plateforme (5%)",
    date: new Date("2026-04-20"),
  },
];
