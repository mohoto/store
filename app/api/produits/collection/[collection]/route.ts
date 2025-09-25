import { NextRequest, NextResponse } from "next/server";
import { nodePrisma as prisma } from "@/lib/prisma/node-client";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ collection: string }> }
) {
  try {
    const { collection } = await params;
    console.log("Fetching products for collection:", collection);

    const products = await prisma.product.findMany({
      where: {
        collections: {
          some: {
            collection: {
              slug: collection,
            },
          },
        },
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

    console.log(products);
    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching collection:", error);
    return NextResponse.json(
      { error: "Erreur lors de la recherche de la collection" },
      { status: 500 }
    );
  }
}
