import { CollectionsTableSkeleton } from "@/components/dashboard/collections-table-skeleton";
import { ProductsTable } from "@/components/dashboard/products-table";
import { nodePrisma as prisma } from "@/lib/prisma/node-client";
import { TypeProduct } from "@/types/product";
import { SiteHeader } from "@app/(dashboard)/site-header";
import { Suspense } from "react";

async function getProducts(): Promise<TypeProduct[]> {
  try {
    const products = await prisma.product.findMany({
      include: {
        collections: {
          include: {
            collection: true,
          },
        },
        variants: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return products;
  } catch (error) {
    console.error("Erreur lors de la récupération des produits:", error);
    throw new Error("Impossible de charger les produits");
  }
}

export default function PageWithSuspense() {
  return (
    <>
      <SiteHeader
        title="Produits"
        buttonText="Ajouter un produit"
        buttonUrl="/dashboard/commandes/ajouter"
      />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6">
              <Suspense fallback={<CollectionsTableSkeleton />}>
                <ProductsTableAsync />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

async function ProductsTableAsync() {
  const products = await getProducts();
  return <ProductsTable data={products} />;
}
