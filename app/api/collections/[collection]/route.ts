import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ collection: string }> }
) {
  try {
    const { collection } = await context.params;
    console.log("Fetching products for collection:", collection);

    /* const products = await prisma.product.findMany({
      where: {
        collections: {
          some: {
            collection: {
              slug: collection,
            },
          },
        },
      },
    });

    console.log(products);

    return NextResponse.json(products, { status: 200 }); */
    return NextResponse.json([], { status: 200 });
  } catch (error) {
    console.error("Error fetching collection:", error);
    return NextResponse.json(
      { error: "Erreur lors de la recherche de la collection" },
      { status: 500 }
    );
  }
}
