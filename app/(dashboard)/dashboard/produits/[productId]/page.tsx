import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma/client";
import { SiteHeader } from "@app/(dashboard)/site-header";
import { EditProductForm } from "./edit-product-form";

export default async function Page(props: {
  params: Promise<{ productId: string }>;
}) {
  const params = await props.params;

  const product = await prisma.product.findUnique({
    where: {
      id: params.productId,
    },
    include: {
      collections: {
        include: {
          collection: true,
        },
      },
      variants: true,
    },
  });

  if (!product) {
    return (
      <>
        <SiteHeader title="Produit introuvable" />
        <div className="flex flex-1 flex-col items-center justify-center">
          <p>Produit introuvable</p>
        </div>
      </>
    );
  }

  return (
    <>
      <SiteHeader title="Modifier un produit" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6">
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <EditProductForm product={product} />
                </div>
                <div className="lg:col-span-1">
                  <Card>
                    <CardHeader>
                      <CardTitle>Tous les produits</CardTitle>
                    </CardHeader>
                    <CardContent></CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
