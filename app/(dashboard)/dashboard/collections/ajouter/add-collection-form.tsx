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
import { useState } from "react";
import z from "zod";

const collectionSchema = z.object({
  nom: z.string().min(3, {
    message: "Précisez un titre",
  }),
  description: z.string().optional(),
});

export const AddCollectionForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(collectionSchema),
    defaultValues: {
      nom: "",
      description: "",
    },
  });

  async function onSubmit(values: z.infer<typeof collectionSchema>) {
    setIsLoading(true);

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

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);
      console.log("Response headers:", Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const responseText = await response.text();
        console.log("Response text:", responseText);

        try {
          const newCollection = JSON.parse(responseText);
          console.log("Collection créée avec succès:", newCollection);

          form.reset();
          router.push("/dashboard/collections");
        } catch (parseError) {
          console.error("JSON parse error:", parseError);
          console.error("Raw response:", responseText);
        }
      } else {
        const responseText = await response.text();
        console.log("Error response text:", responseText);

        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch (parseError) {
          errorData = { error: responseText || "Erreur lors de la création" };
        }

        console.error("API Error:", errorData);
        console.error("Erreur lors de la création:", response.status, errorData);
      }
    } catch (error) {
      console.error("General error:", error);
    } finally {
      setIsLoading(false);
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
              type="submit"
              variant="ghost"
              size="lg"
              disabled={isLoading}
              className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear mt-20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
