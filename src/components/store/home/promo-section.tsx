"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface PromoConfig {
  title: string;
  description: string;
  image: string;
}

export default function PromoSection() {
  const [config, setConfig] = useState<PromoConfig>({
    title: "LIMITED OFFER",
    description: "Des arrivages permanents pour tous les goûts.",
    image: "/images/promo-background.jpg",
  });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await fetch("/api/site-config");
      const configs = await response.json();

      const configMap: Record<string, string> = {};
      configs.forEach((c: any) => {
        configMap[c.key] = c.value;
      });

      setConfig({
        title: configMap["promo_section_title"] || config.title,
        description:
          configMap["promo_section_description"] || config.description,
        image: configMap["promo_section_image"] || config.image,
      });
    } catch (error) {
      console.error("Erreur lors du chargement de la config promo:", error);
    }
  };
  return (
    <section className="pt-4 pb-20 bg-white">
      <div className="md:max-w-7xl md:mx-auto w-full">
        <div className="relative overflow-hidden">
          {/* Background image */}
          <div className="absolute inset-0">
            <Image
              src={config.image}
              alt="Promo background"
              fill
              className="object-cover"
              quality={90}
            />
            {/* Overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40"></div>
          </div>

          <div className="relative px-8 md:px-16 py-28">
            <div className="max-w-lg">
              <div className="mb-4">
                <span className="inline-block bg-white text-black px-3 py-1 rounded text-sm font-medium">
                  {config.title}
                </span>
              </div>

              <h2 className="text-3xl md:text-4xl font-semibold text-white mb-6 leading-tight">
                {config.description}
              </h2>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-8 right-8 w-16 h-16 bg-white/10 rounded-full"></div>
          <div className="absolute bottom-12 right-24 w-8 h-8 bg-white/10 rounded-full"></div>
        </div>
      </div>
    </section>
  );
}
