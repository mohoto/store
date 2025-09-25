"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOrder } from "@/hooks/use-order";
import { useCartStore } from "@/store/cart-store";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  IconBrandWhatsapp,
  IconCheck,
  IconCircleCheck,
} from "@tabler/icons-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

// Schéma de validation pour le formulaire client
const customerSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  phone: z.string().min(10, "Le téléphone doit contenir au moins 10 chiffres"),
  street: z.string().min(5, "L'adresse doit contenir au moins 5 caractères"),
  postalCode: z.string().min(4, "Le code postal est requis"),
  city: z.string().min(2, "La ville est requise"),
  country: z.enum(["France", "Belgique"]),
});

// Composant qui contient la logique utilisant useSearchParams
function OrderConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { createOrder, isLoading: orderLoading } = useOrder();

  const [isMounted, setIsMounted] = useState(false);
  const [formCompleted, setFormCompleted] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);

  // Formulaire avec react-hook-form et zod
  const form = useForm<z.infer<typeof customerSchema>>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      street: "",
      postalCode: "",
      city: "",
      country: "France",
    },
  });

  // Générer le numéro de commande une seule fois
  const orderNumber = useMemo(() => {
    const generateOrderNumber = () => {
      const timestamp = Date.now().toString().slice(-6);
      const random = Math.random().toString(36).substring(2, 6).toUpperCase();
      return `CMD-${timestamp}-${random}`;
    };

    return searchParams.get("order") || generateOrderNumber();
  }, [searchParams]);

  // Marquer comme monté côté client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Vider le panier seulement lors de la sortie de la page (pas au rechargement)
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Vider le panier seulement si la commande a été confirmée
      if (orderConfirmed) {
        clearCart();
      }
    };

    const handlePopstate = () => {
      // Vider le panier lors de la navigation arrière si commande confirmée
      if (orderConfirmed) {
        clearCart();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopstate);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopstate);
      // Vider le panier lors du démontage du composant si commande confirmée
      if (orderConfirmed) {
        clearCart();
      }
    };
  }, [orderConfirmed, clearCart]);

  // Ne pas vider le panier automatiquement - attendre la sauvegarde réussie

  // Fonction de soumission du formulaire
  const onSubmitCustomerInfo = async () => {
    setFormCompleted(true);
  };

  const formatOrderMessage = useCallback(() => {
    const itemsList = items
      .map(
        (item) =>
          `• ${item.nom}${item.taille ? ` (Taille: ${item.taille})` : ""}${item.couleur ? ` (Couleur: ${item.couleur})` : ""} x${item.quantite} - ${(item.prix * item.quantite).toFixed(2)}€`
      )
      .join("\n");

    const formValues = form.getValues();
    const customerName = `${formValues.firstName} ${formValues.lastName}`;
    const fullAddress = `${formValues.street}\n${formValues.postalCode} ${formValues.city}\n${formValues.country}`;

    return (
      `*Nouvelle Commande*\n\n` +
      `*Numéro: ${orderNumber}\n\n` +
      `*Client: ${customerName}\n` +
      `*Téléphone: ${formValues.phone}\n` +
      `*Adresse:*\n${fullAddress}\n\n` +
      `*Articles commandés:\n${itemsList}\n\n` +
      `*Total: ${getTotalPrice().toFixed(2)}€\n\n`
    );
  }, [items, orderNumber, getTotalPrice, form]);

  const handleWhatsAppClick = async () => {
    if (!formCompleted) {
      toast.error("Veuillez d'abord remplir vos informations de livraison", {
        position: "top-center",
      });
      return;
    }

    setIsSavingOrder(true);

    try {
      const formValues = form.getValues();
      const customerName = `${formValues.firstName} ${formValues.lastName}`;

      // Sauvegarder la commande avec les informations client
      const result = await createOrder(orderNumber, items, getTotalPrice(), {
        name: customerName,
        phone: formValues.phone,
        street: formValues.street,
        postalCode: formValues.postalCode,
        city: formValues.city,
        country: formValues.country,
      });

      if (result) {
        // Marquer la commande comme confirmée
        setOrderConfirmed(true);
        toast.success(
          "Commande sauvegardée avec succès ! Ouverture de WhatsApp...",
          {
            position: "top-center",
          }
        );

        // Générer le message AVANT de vider le panier
        const message = encodeURIComponent(formatOrderMessage());

        // Attendre un peu pour que l'utilisateur voie le toast
        setTimeout(() => {
          const phoneNumber = "+33774037899";
          const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
          window.open(whatsappUrl, "_blank");
        }, 1500);
      } else {
        toast.error("Erreur lors de la sauvegarde de la commande", {
          position: "top-center",
        });
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast.error("Erreur lors de la sauvegarde de la commande", {
        position: "top-center",
      });
    } finally {
      setIsSavingOrder(false);
    }
  };

  /*  const handleCopyOrder = async () => {
    try {
      await navigator.clipboard.writeText(formatOrderMessage());

      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Erreur lors de la copie:", err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Commande ${orderNumber}`,
          text: formatOrderMessage(),
        });
      } catch (err) {
        console.error("Erreur lors du partage:", err);
      }
    } else {
      handleCopyOrder();
    }
  }; */

  // Attendre que le composant soit monté pour éviter l'hydratation mismatch
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="text-lg text-gray-600">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête de confirmation */}
        <div className="text-center mb-8">
          <div
            className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
              orderConfirmed ? "bg-green-100" : "bg-blue-100"
            }`}
          >
            <IconCheck
              className={`h-8 w-8 ${
                orderConfirmed ? "text-green-600" : "text-blue-600"
              }`}
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {orderConfirmed
              ? "Commande confirmée !"
              : "Récapitulatif de commande"}
          </h1>
          <p className="text-lg text-gray-600">
            {orderConfirmed ? (
              <>
                Votre commande{" "}
                <span className="font-semibold">#{orderNumber}</span> a été
                confirmée et sauvegardée
              </>
            ) : (
              <>
                Commande <span className="font-semibold">#{orderNumber}</span>{" "}
                en cours de préparation
              </>
            )}
          </p>
          {isSavingOrder && (
            <p className="text-sm text-blue-600 mt-2">
              💾 Sauvegarde en cours...
            </p>
          )}
        </div>

        {/* Résumé de la commande */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              Résumé de votre commande
            </h2>

            {items.length > 0 ? (
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-start py-2 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium">{item.nom}</h3>
                      <div className="text-sm text-gray-500 mt-1">
                        {item.taille && <span>Taille: {item.taille} • </span>}
                        {item.couleur && (
                          <span>Couleur: {item.couleur} • </span>
                        )}
                        Quantité: {item.quantite}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {(item.prix * item.quantite).toFixed(2)}€
                      </p>
                      <p className="text-sm text-gray-500">
                        {item.prix.toFixed(2)}€ × {item.quantite}
                      </p>
                    </div>
                  </div>
                ))}

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total:</span>
                    <span>{getTotalPrice().toFixed(2)}€</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                Détails de la commande en cours de chargement...
              </p>
            )}
          </CardContent>
        </Card>

        {/* Formulaire client */}
        {!formCompleted ? (
          <Card className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                Informations de livraison
              </h2>
              <p className="text-gray-600 text-sm mb-6">
                Veuillez remplir vos informations pour finaliser la commande.
              </p>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmitCustomerInfo)}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Nom */}
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom *</FormLabel>
                          <FormControl>
                            <Input placeholder="Votre nom" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Prénom */}
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prénom *</FormLabel>
                          <FormControl>
                            <Input placeholder="Votre prénom" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Téléphone */}
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Téléphone *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="+33 1 23 45 67 89"
                              type="tel"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Adresse rue */}
                    <FormField
                      control={form.control}
                      name="street"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Adresse *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="123 Rue de la Paix"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Code postal */}
                    <FormField
                      control={form.control}
                      name="postalCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Code postal *</FormLabel>
                          <FormControl>
                            <Input placeholder="75001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Ville */}
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ville *</FormLabel>
                          <FormControl>
                            <Input placeholder="Paris" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Pays */}
                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Pays *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner un pays" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="France">France</SelectItem>
                              <SelectItem value="Belgique">Belgique</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={orderLoading || !form.formState.isValid}
                    className="w-full cursor-pointer"
                    size="lg"
                  >
                    {orderLoading
                      ? "Sauvegarde..."
                      : "Confirmer mes informations"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <IconCircleCheck className="h-6 w-6 text-green-600" />
                  <h2 className="text-xl font-semibold text-green-600">
                    Informations confirmées
                  </h2>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFormCompleted(false)}
                >
                  Modifier
                </Button>
              </div>

              <div className="bg-green-50 rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">
                      Nom complet:
                    </span>
                    <p className="text-gray-900">
                      {form.getValues("firstName")} {form.getValues("lastName")}
                    </p>
                  </div>

                  <div>
                    <span className="font-medium text-gray-700">
                      Téléphone:
                    </span>
                    <p className="text-gray-900">{form.getValues("phone")}</p>
                  </div>

                  <div className="md:col-span-2">
                    <span className="font-medium text-gray-700">
                      Adresse de livraison:
                    </span>
                    <div className="text-gray-900 mt-1">
                      <p>{form.getValues("street")}</p>
                      <p>
                        {form.getValues("postalCode")} {form.getValues("city")}
                      </p>
                      <p>{form.getValues("country")}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions et actions */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              {formCompleted ? "Finaliser votre commande" : "Prochaines étapes"}
            </h2>

            {!formCompleted ? (
              <div className="space-y-4 mb-6">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">1</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Remplissez vos informations</h3>
                    <p className="text-gray-600 text-sm">
                      Complétez le formulaire ci-dessus avec vos informations de
                      livraison.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-400">2</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-400">
                      Contactez-nous via WhatsApp
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Une fois vos informations confirmées, vous pourrez
                      finaliser via WhatsApp.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-400">3</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-400">
                      Recevez votre commande
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Livraison sous 2-5 jours ouvrables selon votre
                      localisation.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 mb-6">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-green-600">
                      ✓
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium text-green-600">
                      Informations confirmées
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Vos informations de livraison ont été enregistrées.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">1</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Contactez-nous via WhatsApp</h3>
                    <p className="text-gray-600 text-sm">
                      Cliquez sur le bouton WhatsApp ci-dessous pour finaliser
                      votre commande.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">2</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Recevez votre commande</h3>
                    <p className="text-gray-600 text-sm">
                      Livraison sous 2-5 jours ouvrables selon votre
                      localisation.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Boutons d'action */}
            <div className="space-y-3">
              <Button
                onClick={handleWhatsAppClick}
                disabled={!formCompleted || isSavingOrder}
                className={`w-full h-12 text-lg ${
                  formCompleted
                    ? "bg-green-600 hover:bg-green-700 cursor pointer"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
                size="lg"
              >
                <IconBrandWhatsapp className="h-6 w-6 mr-3" />
                {isSavingOrder
                  ? "Sauvegarde..."
                  : formCompleted
                    ? "Finaliser avec WhatsApp"
                    : "Complétez vos informations d'abord"}
              </Button>

              {/* <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={handleCopyOrder}
                  className="h-10"
                >
                  <IconCopy className="h-4 w-4 mr-2" />
                  {isCopied ? "Copié !" : "Copier"}
                </Button>

                <Button
                  variant="outline"
                  onClick={handleShare}
                  className="h-10"
                >
                  <IconShare className="h-4 w-4 mr-2" />
                  Partager
                </Button>
              </div> */}
            </div>
          </CardContent>
        </Card>

        {/* Informations de contact */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-3">Besoin d&#39;aide ?</h2>
            <div className="text-sm text-gray-600 space-y-2">
              <p>
                • Numéro de commande:{" "}
                <span className="font-medium">#{orderNumber}</span>
              </p>
              <p>• Email: support@monstore.com</p>
              <p>• Téléphone: +33 1 23 45 67 89</p>
              <p>• Horaires: Lun-Ven 9h-18h, Sam 10h-16h</p>
            </div>

            <Button
              variant="outline"
              onClick={() => router.push("/")}
              className="w-full mt-4"
            >
              Retourner à l&#39;accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Composant principal qui encapsule avec Suspense
export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="text-lg text-gray-600">Chargement...</div>
      </div>
    }>
      <OrderConfirmationContent />
    </Suspense>
  );
}
