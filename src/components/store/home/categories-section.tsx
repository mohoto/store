"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import ChaussureFemme from "../../../../public/images/categorie-chaussure-femme.jpeg";
import ChaussureHomme from "../../../../public/images/categorie-chaussure-homme.jpeg";
import VetementsFemme from "../../../../public/images/categorie-vetements-femme.jpeg";
import VetementsHomme from "../../../../public/images/categorie-vetements-homme.jpeg";

type Category = {
  title: string;
  subtitle: string;
  image: StaticImageData | string;
  link: string;
  buttonText: string;
  featured?: boolean;
};

interface CategoriesConfig {
  title: string;
  description: string;
}

export default function CategoriesSection() {
  const [config, setConfig] = useState<CategoriesConfig>({
    title: "Nos catégories",
    description:
      "Découvrez notre sélection soigneusement choisie pour chaque style et occasion",
  });

  const [categories, setCategories] = useState<Category[]>([
    {
      title: "Vêtements femme",
      subtitle: "Élégance & Confort",
      image: VetementsFemme,
      link: "femmes",
      buttonText: "Explorer",
      featured: true,
    },
    {
      title: "Vêtements homme",
      subtitle: "Style & Performance",
      image: VetementsHomme,
      link: "hommes",
      buttonText: "Explorer",
    },
    {
      title: "Chaussures femme",
      subtitle: "Tendance & Qualité",
      image: ChaussureFemme,
      link: "chaussures-femme",
      buttonText: "Explorer",
    },
    {
      title: "Chaussures homme",
      subtitle: "Confort & Durabilité",
      image: ChaussureHomme,
      link: "chaussures-homme",
      buttonText: "Explorer",
    },
  ]);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await fetch("/api/site-config");
      const configs = await response.json();

      const configMap: Record<string, string> = {};
      configs.forEach((c: { key: string; value: string }) => {
        configMap[c.key] = c.value;
      });

      // Update section config
      setConfig({
        title: configMap["categories_section_title"] || config.title,
        description:
          configMap["categories_section_description"] || config.description,
      });

      // Update categories with database data
      const updatedCategories = categories.map((category, index) => {
        const categoryNum = index + 1;
        return {
          ...category,
          title: configMap[`category_${categoryNum}_name`] || category.title,
          subtitle:
            configMap[`category_${categoryNum}_subtitle`] || category.subtitle,
          buttonText:
            configMap[`category_${categoryNum}_button_text`] ||
            category.buttonText,
          link: configMap[`category_${categoryNum}_link`] || category.link,
          image: configMap[`category_${categoryNum}_image`] || category.image,
        };
      });

      setCategories(updatedCategories);
    } catch (error) {
      console.error(
        "Erreur lors du chargement de la config categories:",
        error
      );
    }
  };

  return (
    <section className="py-10 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="inline-flex items-center px-4 py-2 border border-black/20 text-black text-sm font-medium mb-6">
            COLLECTIONS
          </h2>
          {/* <h2 className="text-3xl md:text-4xl font-light text-black mb-4 tracking-wide">
            {config.title}
          </h2> */}
          <p className="text-lg text-gray-600 max-w-2xl mx-auto font-light">
            {config.description}
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category, index) => (
            <Link
              key={index}
              href={`/${category.link}`}
              className="group block"
            >
              <div className="relative overflow-hidden bg-white border border-gray-200 hover:border-black transition-all duration-300">
                {/* Featured Badge */}
                {category.featured && (
                  <div className="absolute top-4 left-4 z-20">
                    <div className="bg-black text-white px-3 py-1 text-xs font-medium">
                      POPULAIRE
                    </div>
                  </div>
                )}

                {/* Image Container */}
                <div className="relative h-80 overflow-hidden">
                  <Image
                    src={
                      typeof category.image === "string"
                        ? category.image
                        : category.image
                    }
                    alt={category.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300"></div>
                </div>

                {/* Content */}
                <div className="p-6 bg-white transition-colors duration-300">
                  <h3 className="text-lg font-medium text-black mb-1">
                    {category.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 font-light">
                    {category.subtitle}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-between text-black hover:bg-black hover:text-white hover:px-4 transition-all duration-300 px-0"
                  >
                    <span>{category.buttonText}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
