import { OrdersTable } from "@/components/dashboard/orders-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { nodePrisma as prisma } from "@/lib/prisma/node-client";
import type { Order } from "@/lib/generated/prisma";
import { SiteHeader } from "@app/(dashboard)/site-header";
import {
  IconCheck,
  IconClock,
  IconPackage,
  IconTruck,
} from "@tabler/icons-react";

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

  // Statistiques des commandes
  const stats = {
    total: orders.length,
    pending: orders.filter((order: Order) => order.status === "PENDING").length,
    confirmed: orders.filter((order: Order) => order.status === "CONFIRMED")
      .length,
    processing: orders.filter((order: Order) => order.status === "PROCESSING")
      .length,
    shipped: orders.filter((order: Order) => order.status === "SHIPPED").length,
    delivered: orders.filter((order: Order) => order.status === "DELIVERED")
      .length,
    cancelled: orders.filter((order: Order) => order.status === "CANCELLED")
      .length,
    totalRevenue: orders
      .filter((order: Order) => order.status === "CONFIRMED")
      .reduce((sum: number, order: Order) => sum + order.totalAmount, 0),
  };

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
              {/* Statistiques */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Total commandes
                        </p>
                        <p className="text-2xl font-bold">{stats.total}</p>
                      </div>
                      <IconPackage className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          En attente
                        </p>
                        <p className="text-2xl font-bold text-orange-600">
                          {stats.pending}
                        </p>
                      </div>
                      <IconClock className="h-8 w-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Livrées
                        </p>
                        <p className="text-2xl font-bold text-green-600">
                          {stats.delivered}
                        </p>
                      </div>
                      <IconCheck className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Revenus
                        </p>
                        <p className="text-2xl font-bold text-green-600">
                          {stats.totalRevenue.toFixed(2)}€
                        </p>
                      </div>
                      <IconTruck className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Table des commandes */}
              <Card>
                <CardHeader>
                  <CardTitle>Liste des commandes</CardTitle>
                  <CardDescription>
                    Gérez toutes les commandes de votre boutique
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <OrdersTable orders={orders} />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
