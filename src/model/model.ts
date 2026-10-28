export enum UserRole {
  UTILISATEUR = 'UTILISATEUR',
  COMMERCANT = 'COMMERCANT',
  ADMIN = 'ADMIN'
}

export enum TypeMission {
  AUTRE = 'autre',
  EMPLOI = 'emploi',
  SERVICE = 'service',
  MISSION = 'mission',
  FORMATION = 'formation',
  FREELANCE = 'freelance',
  LIVRAISON = 'livraison',
}

export enum TypePaiement {
  FIXE = 'fixe',
  HORAIRE = 'horaire',
  JOURNALIER = 'journalier',
  MENSUEL = 'mensuel',
  PROJET = 'projet',
}

export enum StatutMission {
    BROUILLON = 'brouillon',
  OUVERTE = 'ouverte',
  EN_COURS = 'en_cours',
  TERMINEE = 'terminée',
  ANNULEE = 'annulée',
}

export enum StatutCandidature {
  EN_ATTENTE = 'en_attente',
  ACCEPTE = 'accepte',
  REFUSE = 'refuse',
}

export enum Categories {
  ELECTRONIQUE = "ELECTRONIQUE",
  VETEMENTS = "VETEMENTS",
  MAISON = "MAISON"
}

export enum statutPayementCandidat {
  EN_ATTENTE = 'en_attente',
  EFFECTUE = 'effectue',
  ANNULE = 'annule',
}

export enum TypePlan {
    STANDARD = 'STANDARD',
  BASIQUE = 'BASIQUE',
  PRO = 'PRO',
  PREMIUM = 'PREMIUM',
  BUSINESS = 'BUSINESS',
}

export enum MessageType {
  TEXT = "text",
  IMAGE = "image",
  VIDEO = "video",
  AUDIO = "audio",
  FILE = "file",
}

export enum MessageStatus {
  SENT = "sent",
  DELIVERED = "delivered",
  READ = "read",
}

export enum DiscussionType {
  PRIVATE = 'private',
  GROUP = 'group',
}

export enum DiscussionStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  BLOCKED = 'blocked',
}

export interface Utilisateur {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  date_naissance?: string;
  adresse?: string;
  role: UserRole;
  password: string;
  specialite?: string;
  localisation?: string;
  contact?: string;
  pays?: string;
  indicatifPays?: string;
  image?: string | null;
}

export interface produits {
  id: number;
  nom: string;
  description: string;
  prix?: number;
  prixPromotionnel?: number | null;
  stock?: number;
  image?: string;
  images_secondaires?: string[];
  statut?: string;
  categorie?: Categorie;
  proprietaireId?: number | null;
  categorieId?: number;
}

// Alias for compatibility
export type Produits = produits;

export interface Commande {
  id: number;
  utilisateurId: number;
  produitId: number;
  quantite: number;
  dateCommande: Date;
}

export interface Categorie {
  id: number;
  libellé: string;
  description: string;
}

export interface Demande {
  id: number;
  utilisateurId: number;
  type: string;
  description: string;
  statut: string;
  date_envoi: Date;
}

export interface Discussion {
  id: number;
  type?: string;
  statut?: DiscussionStatus;
  titre?: string;
  photo?: string;
  lastMessage?: string;
  lastMessageDate?: Date;
  messages?: Message[];
  participants?: Discussion_Participant[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Discussion_Participant {
  id?: number;
  discussion?: Discussion;
  discussionId?: number;
  utilisateur?: Utilisateur;
  utilisateurId?: number;
  lastReadMessageId?: number;
  muted?: boolean;
  archived?: boolean;
  joinedAt?: Date;
}

export interface Message {
  id: number;
  discussion?: Discussion;
  discussionId?: number;
  utilisateurId: number;
  sender?: Utilisateur;
  senderId?: number;
  contenu?: string;
  date_envoi: Date;
  type?: MessageType;
  statut?: MessageStatus;
  mediaUrl?: string;
  edited?: boolean;
  deleted?: boolean;
  createdAt?: Date;
}

export interface Candidature {
  userId: number;
  statut: StatutCandidature;
  dateCandidature: Date;
  experience: number;
  paymentHistory: {
    date: Date;
    montant: number;
    statut: statutPayementCandidat;
  }[];
  totalPaid: number;
  message: string;
}

export interface Mission {
  id: number;
  commercantId: number;
  commercant?: Utilisateur;
  titre?: string;
  localisation?: string;
  type?: string;
  statut?: StatutMission;
    publicationPayee?: boolean;
  descriptionCourte?: string;
  description?: string;
  montant?: number;
  frequencePaiement?: TypePaiement;
  dureeMission?: number;
  datePublication?: any;
  dateLimiteCandidature?: any;
  requis?: string;
  candidatures?: Candidature[];
}

export interface Vente {
  id?: number;
  utilisateurId?: number;
  produits?: produits[];
  quantites?: number[];
  date_achat?: string;
  prix_total?: number;
  reference?: string;
  statut?: string;
    remises?: Array<{ id: number; commercantId: number; montant: number; montantBrut: number; commissionMontant: number; commissionPourcentage: number; statut: string; articles: Array<{ nom: string; quantite: number }>; dateRemise?: string | null }>;
}

export interface Panier {
  id?: number;
  utilisateurId?: number;
  produitId?: number[];
  quantite?: number[];
  dateCommande?: Date;
  statut?: string;
}

export interface Boutique {
  id: number;
  nom: string;
  description?: string;
  category?: string;
  location?: string;
  address?: string;
  logo?: string;
  active: boolean;
  nombreProduits?: number;
  produits?: produits[];
  produitIds?: number[];
  proprietaireId?: number;
  dateCreation?: Date | null;
}

export interface Plan {
  id?: number;
  titre?: string;
  type?: TypePlan;
  prix?: number;
  avantages?: string;
  description?: string;
  nombreBoutiques?: number;
  nombreProduits?: number;
  dureeEnMois?: number;
  dateActivation?: Date | null;
  dateCreation: Date;
  dateExpiration?: Date | null;
  active?: boolean;
  renouvelement?: boolean;
  commercant?: number;
}

export interface ShortAuthor {
  id: number;
  nom?: string;
  prenom?: string;
  image?: string | null;
  role?: UserRole | string;
  specialite?: string;
  localisation?: string;
}

export interface Short {
  id: number;
  titre: string;
  description?: string | null;
  videoUrl: string;
  coverUrl?: string | null;
  tailleOctets?: number;
  vues: number;
  likes?: number;
  commentaires?: number;
  partages?: number;
  likedByMe?: boolean;
  publie: boolean;
  creeLe: string | Date;
  auteur: ShortAuthor;
  produit?: produits | null;
}

export interface ShortFeed {
  items: Short[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export interface ShortComment {
  id: number;
  shortId: number;
  utilisateurId: number;
  contenu: string;
  creeLe: string | Date;
  auteur: ShortAuthor;
}

export interface ShortCommentFeed {
  items: ShortComment[];
  total: number;
  hasMore: boolean;
}

export interface ShortCreatorProfile {
  auteur: ShortAuthor;
  shorts: Short[];
}
