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
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import z from "zod";

const collectionSchema = z.object({
  nom: z.string().min(3, {
    message: "Précisez un titre",
  }),
  description: z.string().optional(),
});

export const AddCollectionForm = () => {
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(collectionSchema),
    defaultValues: {
      nom: "",
      description: "",
    },
  });

  async function onSubmit(values: z.infer<typeof collectionSchema>) {

    try {
      const collectionData = {
        ...values,
      };


      const response = await fetch("/api/collections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(collectionData),
      });


      // Récupérer le texte brut de la réponse d'abord
      const responseText = await response.text();

      if (response.ok) {
        // Essayer de parser le JSON seulement si on a une réponse
        let newCollection = null;
        if (responseText.trim()) {
          try {
            newCollection = JSON.parse(responseText);
          } catch (parseError) {
            console.warn(
              "Could not parse success response as JSON:",
              parseError
            );
          }
        }

        router.refresh();
      } else {
        // Essayer de parser l'erreur seulement si on a une réponse
        let errorData = { error: "Erreur inconnue" };
        if (responseText.trim()) {
          try {
            errorData = JSON.parse(responseText);
          } catch (parseError) {
            console.warn("Could not parse error response as JSON:", parseError);
            errorData = { error: responseText || "Erreur lors de la création" };
          }
        }

        console.error("API Error:", errorData);
        console.error(
          "Erreur lors de la création:",
          response.status,
          errorData
        );
      }
    } catch (error) {
      console.error("General error:", error);
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
              Enregistrer
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
