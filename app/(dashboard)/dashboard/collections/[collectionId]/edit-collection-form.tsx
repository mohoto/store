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
import { Textarea } from "@/components/ui/textarea";
import { Collection } from "@/types/product";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const collectionSchema = z.object({
  nom: z.string().min(3, {
    message: "Précisez un titre",
  }),
  description: z.string().optional(),
});

export const EditCollectionForm = ({
  collection,
}: {
  collection: Collection;
}) => {
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(collectionSchema),
    defaultValues: {
      nom: "",
      description: "",
    },
  });

  // Réinitialiser le formulaire avec les données de la collection
  useEffect(() => {
    if (collection) {
      form.reset({
        nom: collection.nom || "",
        description: collection.description || "",
      });
    }
  }, [collection, form]);

  async function onSubmit(values: z.infer<typeof collectionSchema>) {
    try {
      const collectionData = {
        ...values,
      };

      const response = await fetch(
        `/api/collections/modifier/${collection.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(collectionData),
        }
      );


      if (response.ok) {
        // Vérifier si la réponse contient du JSON
        const contentType = response.headers.get("content-type");
        let updatedCollection = null;

        if (contentType && contentType.includes("application/json")) {
          const responseText = await response.text();
          if (responseText.trim()) {
            try {
              updatedCollection = JSON.parse(responseText);
            } catch (parseError) {
              console.warn("Failed to parse JSON response:", parseError);
            }
          }
        }


        toast.success("Collection modifiée avec succès", {
          position: "top-center",
        });
        router.refresh();
      } else {
        // Gérer les erreurs de réponse
        const contentType = response.headers.get("content-type");
        let errorData = null;

        if (contentType && contentType.includes("application/json")) {
          const responseText = await response.text();
          if (responseText.trim()) {
            try {
              errorData = JSON.parse(responseText);
            } catch (parseError) {
              console.warn("Failed to parse error JSON:", parseError);
              errorData = { message: responseText };
            }
          }
        } else {
          errorData = { message: "Erreur du serveur" };
        }

        console.error("API Error:", errorData);
        console.error(
          "Erreur lors de la modification:",
          response.status,
          errorData
        );
        toast.error(errorData?.message || "Erreur lors de la modification");
      }
    } catch (error) {
      console.error("General error:", error);
      toast.error("Erreur lors de la modification");
    }
  }

  return (
    <Card className="w-full">
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              <FormField
                control={form.control}
                name="nom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titre</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              variant="ghost"
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear mt-20 cursor-pointer"
            >
              Modifier
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
