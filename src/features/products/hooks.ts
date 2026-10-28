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
    // Ignore a late response for a previous id.
    let active = true;
    setLoading(true);
    productsApi
      .getById(id)
      .then((record) => { if (active) setProduct(record); })
      .catch(() => { if (active) setProduct(null); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
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
