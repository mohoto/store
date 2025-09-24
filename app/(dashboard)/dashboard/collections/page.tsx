import { CollectionsTable } from "@/components/dashboard/collections-table";
import { Collection } from "@/types/product";
import { SiteHeader } from "@app/(dashboard)/site-header";

async function getCollections(): Promise<Collection[]> {
  try {
    const res = await fetch(
      `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/collections`,
      {
        cache: "no-store",
      }
    );

    if (!res.ok) {
      throw new Error("Failed to fetch collections");
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching collections:", error);
    return [];
  }
}

export default async function Page() {
  const collections = await getCollections();

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
