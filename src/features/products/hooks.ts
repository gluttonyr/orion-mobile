import { useEffect, useState } from "react";
import { productsApi } from "./api";
import type { produits, Categorie } from "./types";

export function useProducts() {
  const [products, setProducts] = useState<produits[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    productsApi
      .getAll()
      .then(setProducts)
      .catch(() => setError("Impossible de charger les produits."))
      .finally(() => setLoading(false));
  }, []);

  return { products, loading, error };
}

export function useProduct(id: number) {
  const [product, setProduct] = useState<produits | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productsApi
      .getById(id)
      .then(setProduct)
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  return { product, loading };
}

export function useCategories() {
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productsApi
      .getCategories()
      .then(setCategories)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { categories, loading };
}
