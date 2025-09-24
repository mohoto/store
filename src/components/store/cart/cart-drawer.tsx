"use client";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useCartStore } from "@/store/cart-store";
import {
  IconMinus,
  IconPlus,
  IconShoppingCart,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export const CartDrawer = () => {
  const router = useRouter();

  const {
    items,
    isOpen,
    removeItem,
    updateQuantity,
    openCart,
    closeCart,
    getTotalPrice,
    getTotalItems,
    hasHydrated,
  } = useCartStore();

  const handleQuantityChange = (
    id: string,
    action: "increment" | "decrement"
  ) => {
    const item = items.find((item) => item.id === id);
    if (!item) return;

    const maxQty = item.maxQuantity || Infinity;
    const newQuantity =
      action === "increment"
        ? Math.min(item.quantite + 1, maxQty)
        : item.quantite - 1;

    updateQuantity(id, newQuantity);
  };

  return (
    <Drawer
      open={isOpen}
      onOpenChange={(open) => (open ? openCart() : closeCart())}
      direction="right"
    >
      <DrawerTrigger asChild>
        <Button
          className="relative rounded-full"
          size="icon"
          onClick={openCart}
        >
          <IconShoppingCart className="h-5 w-5" />
          {hasHydrated && getTotalItems() > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {getTotalItems()}
            </span>
          )}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-full max-w-md ml-auto right-0 top-0 bottom-0 fixed z-50 rounded-l-lg">
        <DrawerHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <DrawerTitle>
                Panier ({hasHydrated ? getTotalItems() : 0})
              </DrawerTitle>
              <DrawerDescription>
                Gérez vos articles avant de passer commande
              </DrawerDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={closeCart}>
              <IconX className="h-5 w-5" />
            </Button>
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <IconShoppingCart className="h-16 w-16 mb-4" />
              <p>Votre panier est vide</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
                  <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.nom}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">{item.nom}</h3>
                    <div className="text-xs text-gray-500 mt-1 space-y-1">
                      {item.taille && <p>Taille: {item.taille}</p>}
                      {item.couleur && <p>Couleur: {item.couleur}</p>}
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      {item.prixReduit && item.prixReduit > 0 ? (
                        <>
                          <span className="font-bold text-sm text-black">
                            {item.prixReduit.toFixed(2)}€
                          </span>
                          <span className="text-xs text-gray-500 line-through">
                            {item.prix.toFixed(2)}€
                          </span>
                        </>
                      ) : (
                        <span className="font-medium text-sm text-black">
                          {item.prix.toFixed(2)}€
                        </span>
                      )}
                    </div>
                    
                    {/* Quantité sur mobile - en dessous du prix */}
                    <div className="flex items-center justify-between mt-2 sm:hidden">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() =>
                            handleQuantityChange(item.id, "decrement")
                          }
                          disabled={item.quantite <= 1}
                        >
                          <IconMinus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium px-2">
                          {item.quantite}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() =>
                            handleQuantityChange(item.id, "increment")
                          }
                          disabled={item.maxQuantity ? item.quantite >= item.maxQuantity : false}
                        >
                          <IconPlus className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-gray-400 hover:text-red-500"
                        onClick={() => removeItem(item.id)}
                      >
                        <IconTrash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Quantité et suppression sur desktop - à droite */}
                  <div className="hidden sm:flex flex-col items-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-gray-400 hover:text-red-500"
                      onClick={() => removeItem(item.id)}
                    >
                      <IconTrash className="h-4 w-4" />
                    </Button>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() =>
                          handleQuantityChange(item.id, "decrement")
                        }
                        disabled={item.quantite <= 1}
                      >
                        <IconMinus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm font-medium px-2">
                        {item.quantite}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() =>
                          handleQuantityChange(item.id, "increment")
                        }
                        disabled={item.maxQuantity ? item.quantite >= item.maxQuantity : false}
                      >
                        <IconPlus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t p-6 space-y-4">
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Total:</span>
              <span>{getTotalPrice().toFixed(2)}€</span>
            </div>

            <div className="space-y-2">
              <Button
                className="w-full cursor-pointer"
                size="lg"
                onClick={() => {
                  // Rediriger vers la page de confirmation
                  router.push("/commande/confirmation");
                  closeCart();
                }}
              >
                Passer commande
              </Button>
              <Button
                variant="outline"
                className="w-full"
                size="lg"
                onClick={closeCart}
              >
                Continuer mes achats
              </Button>
            </div>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
};
