"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Discount } from "@/types/order";
import { IconClock, IconTag } from "@tabler/icons-react";
import { useEffect, useState } from "react";

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const DiscountReminder = () => {
  const [activeDiscounts, setActiveDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState<
    Record<string, TimeRemaining>
  >({});

  useEffect(() => {
    const loadActiveDiscounts = async () => {
      try {
        const response = await fetch("/api/discounts");
        if (response.ok) {
          const allDiscounts: Discount[] = await response.json();
          const now = new Date();

          // Filtrer les réductions actives et non expirées
          const activeDiscounts = allDiscounts.filter((discount) => {
            if (!discount.isActive) return false;

            // Vérifier la date d'expiration
            if (discount.expiresAt && new Date(discount.expiresAt) < now) {
              return false;
            }

            // Vérifier la date de début
            if (discount.startsAt && new Date(discount.startsAt) > now) {
              return false;
            }

            // Vérifier le nombre d'utilisations maximum
            if (discount.maxUses && discount.usedCount >= discount.maxUses) {
              return false;
            }

            return true;
          });

          setActiveDiscounts(activeDiscounts);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des réductions:", error);
      } finally {
        setLoading(false);
      }
    };

    loadActiveDiscounts();
  }, []);

  // Timer en temps réel
  useEffect(() => {
    if (activeDiscounts.length === 0) return;

    const updateTimer = () => {
      const newTimeRemaining: Record<string, TimeRemaining> = {};

      activeDiscounts.forEach((discount) => {
        if (discount.expiresAt) {
          const now = new Date();
          const expiry = new Date(discount.expiresAt);
          const diff = expiry.getTime() - now.getTime();

          if (diff > 0) {
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor(
              (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
            );
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            newTimeRemaining[discount.id] = { days, hours, minutes, seconds };
          }
        }
      });

      setTimeRemaining(newTimeRemaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [activeDiscounts]);

  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    /*  toast.success(`Code "${code}" copié !`, {
      position: "top-center",
    });
 */
    // Reset l'état après 2 secondes
    setTimeout(() => {
      setCopiedCode(null);
    }, 2000);
  };

  const TimeDisplay = ({ time }: { time: TimeRemaining }) => (
    <div className="flex items-center gap-1 sm:gap-2">
      <div className="flex items-center gap-1 bg-black text-white px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg font-mono shadow-sm">
        <span className="w-5 sm:w-6 text-center text-sm sm:text-base font-bold">
          {time.days.toString().padStart(2, "0")}
        </span>
        <span className="text-gray-300 text-xs sm:text-sm">j</span>
      </div>
      <span className="text-black text-base sm:text-lg font-bold">:</span>
      <div className="flex items-center gap-1 bg-black text-white px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg font-mono shadow-sm">
        <span className="w-5 sm:w-6 text-center text-sm sm:text-base font-bold">
          {time.hours.toString().padStart(2, "0")}
        </span>
        <span className="text-gray-300 text-xs sm:text-sm">h</span>
      </div>
      <span className="text-black text-base sm:text-lg font-bold">:</span>
      <div className="flex items-center gap-1 bg-black text-white px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg font-mono shadow-sm">
        <span className="w-5 sm:w-6 text-center text-sm sm:text-base font-bold">
          {time.minutes.toString().padStart(2, "0")}
        </span>
        <span className="text-gray-300 text-xs sm:text-sm">m</span>
      </div>
      <span className="text-black text-base sm:text-lg font-bold">:</span>
      <div className="flex items-center gap-1 bg-black text-white px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg font-mono shadow-sm">
        <span className="w-5 sm:w-6 text-center text-sm sm:text-base font-bold">
          {time.seconds.toString().padStart(2, "0")}
        </span>
        <span className="text-gray-300 text-xs sm:text-sm">s</span>
      </div>
    </div>
  );

  if (loading || activeDiscounts.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-xl p-4 sm:p-6 shadow-sm">
      <div className="text-center mb-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <h3 className="text-lg sm:text-xl font-bold text-black">
            OFFRES LIMITÉES !
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-gray-700 font-medium px-2">
          Profitez de nos réductions exceptionnelles avant qu&#39;il ne soit
          trop tard
        </p>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {activeDiscounts.slice(0, 2).map((discount) => {
          const time = timeRemaining[discount.id];
          return (
            <div
              key={discount.id}
              className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-3 sm:p-4 shadow-sm"
            >
              {/* Layout mobile : empilé, desktop : côte à côte */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-3">
                {/* Ligne 1 : Code + Bouton copy */}
                <div className="flex items-center justify-between sm:justify-start gap-3">
                  <div className="flex items-center gap-2">
                    <IconTag className="h-4 w-4 sm:h-5 sm:w-5 text-black" />
                    <span className="font-mono font-bold text-base sm:text-lg text-white bg-black px-2 sm:px-3 py-1 rounded-lg">
                      {discount.code}
                    </span>
                  </div>
                  <Button
                    variant={
                      copiedCode === discount.code ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => copyToClipboard(discount.code)}
                    className={`h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm transition-all duration-200 ${
                      copiedCode === discount.code
                        ? "bg-green-600 text-white border-green-600 hover:bg-green-700 scale-95"
                        : "text-black hover:bg-gray-100 border-gray-300 hover:scale-105 active:scale-95"
                    }`}
                    disabled={copiedCode === discount.code}
                  >
                    {copiedCode === discount.code ? "✓ Copié" : "Copier"}
                  </Button>
                </div>

                {/* Ligne 2 : Réduction + Badge */}
                <div className="text-left sm:text-right">
                  <div className="text-base sm:text-lg font-bold text-black">
                    {discount.type === "PERCENTAGE"
                      ? `${discount.value}% DE RÉDUCTION`
                      : `${discount.value.toFixed(2)}€ DE RÉDUCTION`}
                  </div>
                  {discount.minAmount && (
                    <Badge
                      variant="outline"
                      className="text-xs border-gray-300 text-gray-700 mt-1"
                    >
                      Min. {discount.minAmount.toFixed(2)}€
                    </Badge>
                  )}
                </div>
              </div>

              {/* Timer */}
              {time && (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mt-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <IconClock className="h-4 w-4 sm:h-5 sm:w-5 text-black" />
                    <span className="text-xs sm:text-sm font-medium text-black">
                      Temps restant :
                    </span>
                  </div>
                  <TimeDisplay time={time} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {activeDiscounts.length > 2 && (
        <div className="text-center mt-4 p-3 bg-gray-200 rounded-lg">
          <p className="text-xs sm:text-sm text-black font-medium">
            🔥 Et {activeDiscounts.length - 2} autre
            {activeDiscounts.length - 2 > 1 ? "s" : ""} réduction
            {activeDiscounts.length - 2 > 1 ? "s" : ""} disponible
            {activeDiscounts.length - 2 > 1 ? "s" : ""} !
          </p>
        </div>
      )}
    </div>
  );
};
