import { nodePrisma as prisma } from "@/lib/prisma/node-client";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

const collectionSchema = z.object({
  nom: z.string(),
  description: z.string().optional(),
  image: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ collectionId: string }>;
  }
) {
  try {
    const { collectionId } = await params;
    const body = await req.json();
    const validatedData = collectionSchema.parse(body);
    const updatedCollection = await prisma.collection.update({
      where: {
        id: collectionId,
      },
      data: {
        nom: validatedData.nom,
        description: validatedData.description,
        image: validatedData.image,
      },
    });
    return NextResponse.json(updatedCollection, { status: 201 });
  } catch (error) {
    console.error("Error updating collection:", error);
    return NextResponse.json(
      { error: "Erreur lors de la modification de la collection" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ collectionId: string }>;
  }
) {
  try {
    const { collectionId } = await params;
    
    console.log("DELETE collection called with ID:", collectionId);
    
    // Vérifier si la collection existe
    const existingCollection = await prisma.collection.findUnique({
      where: {
        id: collectionId,
      },
      include: {
        products: true,
      },
    });

    if (!existingCollection) {
      return NextResponse.json(
        { error: "Collection non trouvée" },
        { status: 404 }
      );
    }

    console.log("Found collection:", existingCollection.nom, "with", existingCollection.products.length, "products");

    // Supprimer d'abord toutes les relations ProductCollection
    await prisma.productCollection.deleteMany({
      where: {
        collectionId: collectionId,
      },
    });

    console.log("Deleted ProductCollection relations");

    // Ensuite supprimer la collection
    const deletedCollection = await prisma.collection.delete({
      where: {
        id: collectionId,
      },
    });

    console.log("Collection deleted successfully:", deletedCollection.nom);

    return NextResponse.json(
      { message: "Collection supprimée avec succès", collection: deletedCollection },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting collection:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la collection", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
