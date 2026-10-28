import type { Boutique, Mission, produits } from '@/model/model';
import { photos, type Opportunity, type Product, type Store } from '@/components/dashboard/shared';
import { API_BASE_URL } from '@/service/api.config';
import { getSellingProductPrice } from '@/features/products/pricing';

export function uploadedImageUrl(value?: string | null): string {
  if (!value) return '';
  if (/^(https?:|data:|file:|content:)/i.test(value)) return value;
  return `${API_BASE_URL}/upload/${value.replace(/^\/+/, '')}`;
}

export function formatFcfa(value: number): string {
  return `${new Intl.NumberFormat('fr-FR').format(Number.isFinite(value) ? value : 0)} FCFA`;
}

export function toDesignProduct(value: produits): Product {
  const stock = Number(value.stock ?? 0);
  const rawStatus = String(value.statut ?? '').toLowerCase();
  const status: Product['status'] = rawStatus.includes('brouillon')
    ? 'Brouillon'
    : stock <= 0 || rawStatus.includes('rupture') ? 'Rupture de stock' : 'Disponible';
  return {
    id: String(value.id),
    name: value.nom,
    price: formatFcfa(getSellingProductPrice(value)),
    regularPrice: value.prixPromotionnel != null && getSellingProductPrice(value) < Number(value.prix ?? 0) ? formatFcfa(Number(value.prix ?? 0)) : undefined,
    promotionalPrice: value.prixPromotionnel == null ? undefined : Number(value.prixPromotionnel),
    secondaryImagePaths: value.images_secondaires ?? [],
    stock,
    status,
    category: String((value.categorie as any)?.['libell' + String.fromCharCode(233)] ?? 'Divers'),
    categoryId: value.categorie?.id ?? value.categorieId,
    image: uploadedImageUrl(value.image) || photos.product1,
    sold: 0,
    views: '—',
    description: value.description ?? '',
  };
}

export function toDesignStore(value: Boutique): Store {
  return {
    id: String(value.id),
    name: value.nom,
    category: value.category ?? 'Divers',
    location: value.location ?? '',
    address: value.address ?? '',
    description: value.description ?? '',
    logo: uploadedImageUrl(value.logo) || photos.store1,
    active: Boolean(value.active),
    products: Number(value.nombreProduits ?? value.produits?.length ?? 0),
    sales: '—',
  };
}

export function toDesignOpportunity(value: Mission): Opportunity {
  const status = String(value.statut ?? '').toLowerCase();
  return {
    id: String(value.id),
    title: value.titre ?? 'Opportunité',
    type: value.type ?? 'Mission',
    location: value.localisation ?? '',
    budget: formatFcfa(Number(value.montant ?? 0)),
    candidates: value.candidatures?.length ?? 0,
    status: status.includes('annul') ? ('Ferm' + String.fromCharCode(233) + 'e') as Opportunity['status'] : status === 'brouillon' || value.publicationPayee === false ? 'Brouillon' : 'Ouverte',
    posted: value.datePublication ? new Date(value.datePublication).toLocaleDateString('fr-FR') : '',
    description: value.description ?? value.descriptionCourte ?? '',
  };
}
