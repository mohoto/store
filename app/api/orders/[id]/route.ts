import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { isValidOrderStatus } from '@/lib/order-utils';

interface OrderItemInput {
  productId: string;
  variantId?: string;
  nom: string;
  prix: number;
  quantite: number;
  taille?: string;
  couleur?: string;
  image?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        items: true
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Commande non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Erreur lors de la récupération de la commande:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    
    const {
      customerName,
      customerEmail,
      customerPhone,
      customerStreet,
      customerPostalCode,
      customerCity,
      customerCountry,
      status,
      notes,
      subtotalAmount,
      discountType,
      discountValue,
      discountAmount,
      totalAmount,
      items
    } = data;

    // Vérifier que le statut est valide s'il est fourni
    if (status && !isValidOrderStatus(status)) {
      return NextResponse.json(
        { error: 'Statut invalide' },
        { status: 400 }
      );
    }

    // Vérifier que la commande existe
    const existingOrder = await prisma.order.findUnique({
      where: { id: params.id },
      include: { items: true }
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Commande non trouvée' },
        { status: 404 }
      );
    }

    // Commencer une transaction pour mettre à jour la commande et ses items
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Supprimer les anciens items
      await tx.orderItem.deleteMany({
        where: { orderId: params.id }
      });

      // Mettre à jour la commande
      await tx.order.update({
        where: { id: params.id },
        data: {
          customerName: customerName || null,
          customerEmail: customerEmail || null,
          customerPhone: customerPhone || null,
          customerStreet: customerStreet || null,
          customerPostalCode: customerPostalCode || null,
          customerCity: customerCity || null,
          customerCountry: customerCountry || null,
          status: status || existingOrder.status,
          notes: notes || null,
          subtotalAmount: subtotalAmount || existingOrder.subtotalAmount,
          discountType: discountType || null,
          discountValue: discountValue || null,
          discountAmount: discountAmount || null,
          totalAmount: totalAmount || existingOrder.totalAmount,
          updatedAt: new Date(),
        },
      });

      // Créer les nouveaux items s'ils sont fournis
      if (items && items.length > 0) {
        await tx.orderItem.createMany({
          data: items.map((item: OrderItemInput) => ({
            orderId: params.id,
            productId: item.productId,
            variantId: item.variantId || null,
            nom: item.nom,
            prix: item.prix,
            quantite: item.quantite,
            taille: item.taille || null,
            couleur: item.couleur || null,
            image: item.image || null,
          }))
        });
      }

      // Retourner la commande mise à jour avec ses items
      return await tx.order.findUnique({
        where: { id: params.id },
        include: { items: true }
      });
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la commande:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier que la commande existe et récupérer ses articles
    const existingOrder = await prisma.order.findUnique({
      where: { id: params.id },
      include: { items: true } // Inclure les articles pour restaurer les stocks
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Commande non trouvée' },
        { status: 404 }
      );
    }

    // Utiliser une transaction pour supprimer la commande et restaurer les stocks
    await prisma.$transaction(async (tx) => {
      // Restaurer les stocks seulement si la commande n'était pas déjà annulée
      if (existingOrder.status !== 'CANCELLED') {
        // Parcourir chaque article de la commande pour restaurer les quantités
        for (const item of existingOrder.items) {
          if (item.variantId) {
            // Restaurer le stock de la variante
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: {
                quantity: {
                  increment: item.quantite, // Ajouter la quantité commandée
                },
              },
            });
          } else {
            // Restaurer le stock du produit principal
            await tx.product.update({
              where: { id: item.productId },
              data: {
                quantity: {
                  increment: item.quantite, // Ajouter la quantité commandée
                },
              },
            });
          }
        }
      }

      // Supprimer la commande (les items seront supprimés automatiquement grâce à onDelete: Cascade)
      await tx.order.delete({
        where: { id: params.id }
      });
    });

    return NextResponse.json({ message: 'Commande supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la commande:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}