import type { produits } from '@/model/model';

export function getSellingProductPrice(product: Pick<produits, 'prix' | 'prixPromotionnel'>): number {
  const regularPrice = Number(product.prix ?? 0);
  const promotionalPrice = Number(product.prixPromotionnel);
  return Number.isFinite(promotionalPrice) && promotionalPrice > 0 && promotionalPrice < regularPrice
    ? promotionalPrice
    : regularPrice;
}
