import { OrdersDashboard } from "@/components/dashboard/orders-dashboard";
import { nodePrisma as prisma } from "@/lib/prisma/node-client";
import { SiteHeader } from "@app/(dashboard)/site-header";

export default async function Page() {
  // Récupérer toutes les commandes avec leurs items
  const orders = await prisma.order.findMany({
    include: {
      items: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <>
      <SiteHeader
        title="Gestion des commandes"
        buttonText="Ajouter une commande"
        buttonUrl="/dashboard/commandes/ajouter"
      />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6">
              <OrdersDashboard initialOrders={orders} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
