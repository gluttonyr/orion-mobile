import { colors } from './theme';

export type DashboardScreen =
  | 'home'
  | 'stores'
  | 'products'
  | 'marketplace'
  | 'wallet'
  | 'withdrawal-methods'
  | 'analytics'
  | 'opportunities'
  | 'subscriptions'
  | 'messages'
  | 'orders'
  | 'applications'
  | 'profile'
  | 'admin-users'
  | 'admin-orders'
  | 'admin-wallet'
  | 'admin-settings'
  | 'admin-store-categories';

export type Store = {
  id: string;
  name: string;
  category: string;
  location: string;
  address?: string;
  description: string;
  logo: string;
  active: boolean;
  products: number;
  sales: string;
};

export type Product = {
  id: string;
  name: string;
  price: string;
  regularPrice?: string;
  promotionalPrice?: number;
  secondaryImagePaths?: string[];
  stock: number;
  status: 'Disponible' | 'Rupture de stock' | 'Brouillon' | 'Actif' | 'Rupture';
  category: string;
  categoryId?: number;
  image: string;
  sold: number;
  views: string;
  description?: string;
};

export type Opportunity = {
  id: string;
  title: string;
  type: string;
  location: string;
  budget: string;
  candidates: number;
  status: 'Ouverte' | 'Fermée' | 'Brouillon';
  posted: string;
  description?: string;
};

export type Transaction = {
  id: string;
  label: string;
  date: string;
  amount: string;
  type: 'credit' | 'debit';
};

export type WithdrawalMethod = {
  id: string;
  type: 'Mobile Money' | 'Banque' | 'Autre';
  label: string;
  detail: string;
  active: boolean;
};

export type Conversation = {
  id: string;
  name: string;
  role: string;
  preview: string;
  time: string;
  unread: number;
  online: boolean;
};

export const photos = {
  shoes: 'https://images.pexels.com/photos/36463718/pexels-photo-36463718.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  fashion: 'https://images.pexels.com/photos/38499732/pexels-photo-38499732.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  creator: 'https://images.pexels.com/photos/16864834/pexels-photo-16864834.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  store1: 'https://images.pexels.com/photos/36463718/pexels-photo-36463718.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
  store2: 'https://images.pexels.com/photos/38499732/pexels-photo-38499732.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
  store3: 'https://images.pexels.com/photos/16864834/pexels-photo-16864834.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
  product1: 'https://images.pexels.com/photos/36463718/pexels-photo-36463718.jpeg?auto=compress&cs=tinysrgb&h=500&w=500',
  product2: 'https://images.pexels.com/photos/38499732/pexels-photo-38499732.jpeg?auto=compress&cs=tinysrgb&h=500&w=500',
  product3: 'https://images.pexels.com/photos/16864834/pexels-photo-16864834.jpeg?auto=compress&cs=tinysrgb&h=500&w=500',
  avatar: 'https://images.pexels.com/photos/16864834/pexels-photo-16864834.jpeg?auto=compress&cs=tinysrgb&h=200&w=200',
};

export const stores: Store[] = [
  { id: 's1', name: 'Koffi Shoes', category: 'Mode', location: 'Lomé, Togo', description: 'Boutique de chaussures pour homme et femme. Livraison dans tout le pays.', logo: photos.store1, active: true, products: 24, sales: '2 456 800 FCFA' },
  { id: 's2', name: 'Awa Studio', category: 'Mode', location: 'Kara, Togo', description: 'Vêtements sur mesure et accessoires fabriqués localement.', logo: photos.store2, active: false, products: 18, sales: '1 120 400 FCFA' },
  { id: 's3', name: 'Atelier Lomé', category: 'Artisanat', location: 'Lomé, Togo', description: 'Objets décoratifs et accessoires faits main.', logo: photos.store3, active: false, products: 12, sales: '640 200 FCFA' },
];

export const products: Product[] = [
  { id: 'p1', name: 'Nike Air Max blanc', price: '25 000 FCFA', stock: 8, status: 'Actif', category: 'Chaussures', image: photos.product1, sold: 142, views: '3,2 k' },
  { id: 'p2', name: 'Robe wax moderne', price: '35 000 FCFA', stock: 0, status: 'Rupture', category: 'Vêtements', image: photos.product2, sold: 87, views: '1,8 k' },
  { id: 'p3', name: 'Sac en cuir tressé', price: '18 500 FCFA', stock: 15, status: 'Actif', category: 'Accessoires', image: photos.product3, sold: 56, views: '940' },
  { id: 'p4', name: 'Montre Casio noir', price: '18 000 FCFA', stock: 3, status: 'Actif', category: 'Accessoires', image: photos.product1, sold: 34, views: '720' },
  { id: 'p5', name: 'Boubou traditionnel', price: '22 000 FCFA', stock: 0, status: 'Brouillon', category: 'Vêtements', image: photos.product2, sold: 0, views: '0' },
];

export const opportunities: Opportunity[] = [
  { id: 'o1', title: 'Assistant commercial', type: 'Emploi', location: 'Lomé', budget: '80 000 FCFA', candidates: 12, status: 'Ouverte', posted: 'Il y a 2 jours' },
  { id: 'o2', title: 'Photographe produit', type: 'Freelance', location: 'Lomé', budget: '120 000 FCFA', candidates: 7, status: 'Ouverte', posted: 'Il y a 5 jours' },
  { id: 'o3', title: 'Livreur local', type: 'Mission', location: 'Kara', budget: '45 000 FCFA', candidates: 3, status: 'Fermée', posted: 'Il y a 2 semaines' },
];

export const transactions: Transaction[] = [
  { id: 't1', label: 'Vente - Nike Air Max', date: '19 août 2026', amount: '25 000 FCFA', type: 'credit' },
  { id: 't2', label: 'Retrait Mobile Money', date: '17 août 2026', amount: '80 000 FCFA', type: 'debit' },
  { id: 't3', label: 'Vente - Sac en cuir', date: '16 août 2026', amount: '18 500 FCFA', type: 'credit' },
  { id: 't4', label: 'Vente - Montre Casio', date: '15 août 2026', amount: '18 000 FCFA', type: 'credit' },
  { id: 't5', label: 'Abonnement Pro', date: '14 août 2026', amount: '15 000 FCFA', type: 'debit' },
  { id: 't6', label: 'Vente - Robe wax', date: '12 août 2026', amount: '35 000 FCFA', type: 'credit' },
];

export const withdrawalMethods: WithdrawalMethod[] = [
  { id: 'w1', type: 'Mobile Money', label: 'TMo Money', detail: '+228 90 12 34 56', active: true },
  { id: 'w2', type: 'Banque', label: 'Ecobank', detail: 'TG-***-4521', active: false },
];

export const conversations: Conversation[] = [
  { id: 'c1', name: 'Awa Diallo', role: 'Cliente', preview: 'Bonjour, la robe est-elle disponible en M ?', time: '14:32', unread: 2, online: true },
  { id: 'c2', name: 'Kossi Mensah', role: 'Candidat', preview: 'Merci pour l\'opportunité, je suis intéressé.', time: '11:08', unread: 0, online: false },
  { id: 'c3', name: 'Support Orion', role: 'Support', preview: 'Votre boutique a été vérifiée avec succès.', time: 'Hier', unread: 1, online: true },
  { id: 'c4', name: 'Mawunyo K.', role: 'Cliente', preview: 'Livraison reçue, merci beaucoup !', time: 'Lun', unread: 0, online: false },
];

export type Kpi = { label: string; value: string; delta: string; positive: boolean };

export const kpis: Kpi[] = [
  { label: 'Ventes du mois', value: '2 456 800 FCFA', delta: '+12%', positive: true },
  { label: 'Commandes', value: '186', delta: '+8%', positive: true },
  { label: 'Produits actifs', value: '24', delta: '+3', positive: true },
  { label: 'Clients', value: '1 240', delta: '+5%', positive: true },
];

export const statusColor = (status: string) => {
  switch (status) {
    case 'Actif':
    case 'Ouverte':
      return colors.green;
    case 'Rupture':
    case 'Fermée':
      return colors.error;
    case 'Brouillon':
      return colors.muted;
    default:
      return colors.muted;
  }
};
