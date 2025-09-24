"use client";

import { SiteHeader } from "@app/(dashboard)/site-header";
import { ProductsTable } from "@/components/dashboard/products-table";
import { TypeProduct } from "@/types/product";
import { useEffect, useState } from "react";

async function fetchProducts(): Promise<TypeProduct[]> {
  const response = await fetch("/api/products");
  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }
  return response.json();
}

export default function Page() {
  const [products, setProducts] = useState<TypeProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await fetchProducts();
      setProducts(data);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  if (loading) {
    return (
      <>
        <SiteHeader
          title="Produits"
          buttonText="Ajouter un produit"
          buttonUrl="/dashboard/produits/ajouter"
        />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
              <div className="text-center py-8">Chargement...</div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SiteHeader
        title="Produits"
        buttonText="Ajouter un produit"
        buttonUrl="/dashboard/produits/ajouter"
      />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
            <ProductsTable data={products} onDataChange={loadProducts} />
          </div>
        </div>
      </div>
    </>
  );
}
