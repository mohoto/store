import { CollectionsTable } from "@/components/dashboard/collections-table";
import { CollectionsTableSkeleton } from "@/components/dashboard/collections-table-skeleton";
import { nodePrisma as prisma } from "@/lib/prisma/node-client";
import { SiteHeader } from "@app/(dashboard)/site-header";
import { Suspense } from "react";

async function getCollections() {
  try {
    const collections = await prisma.collection.findMany();
    return collections;
  } catch (error) {
    console.error("Erreur lors de la récupération des collections:", error);
    throw new Error("Impossible de charger les collections");
  }
}

// Option 1: Avec gestion d'erreur intégrée
export default async function Page() {
  let collections;

  try {
    collections = await getCollections();
  } catch (error) {
    return (
      <>
        <SiteHeader
          title="Collections"
          buttonText="Ajouter une collection"
          buttonUrl="/dashboard/collections/ajouter"
        />
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-900">
              Erreur de chargement
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Impossible de charger les collections
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SiteHeader
        title="Collections"
        buttonText="Ajouter une collection"
        buttonUrl="/dashboard/collections/ajouter"
      />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6">
              <CollectionsTable data={collections} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Option 2: Avec Suspense pour un loading optimal
export function PageWithSuspense() {
  return (
    <>
      <SiteHeader
        title="Collections"
        buttonText="Ajouter une collection"
        buttonUrl="/dashboard/collections/ajouter"
      />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6">
              <Suspense fallback={<CollectionsTableSkeleton />}>
                <CollectionsTableAsync />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

async function CollectionsTableAsync() {
  const collections = await getCollections();
  return <CollectionsTable data={collections} />;
}
