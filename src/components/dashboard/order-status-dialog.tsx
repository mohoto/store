"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { STATUS_CONFIG, STATUS_ORDER } from "@/lib/order-utils";
import { OrderStatus } from "@/types/order";
import { useState } from "react";
import { toast } from "sonner";

interface OrderStatusDialogProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  currentStatus: OrderStatus;
  orderNumber: string;
  onStatusUpdate?: (orderId: string, newStatus: OrderStatus) => void;
}

export function OrderStatusDialog({
  isOpen,
  onClose,
  orderId,
  currentStatus,
  orderNumber,
  onStatusUpdate,
}: OrderStatusDialogProps) {
  const [selectedStatus, setSelectedStatus] =
    useState<OrderStatus>(currentStatus);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateStatus = async () => {
    if (selectedStatus === currentStatus) {
      onClose();
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: selectedStatus }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour du statut");
      }

      toast.success("Statut mis à jour avec succès", {
        position: "top-center",
      });

      if (onStatusUpdate) {
        onStatusUpdate(orderId, selectedStatus);
      }

      onClose();
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du statut", {
        position: "top-center",
      });
      console.error("Error updating order status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Modifier le statut de la commande</DialogTitle>
          <DialogDescription>Commande #{orderNumber}</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <RadioGroup
            value={selectedStatus}
            onValueChange={(value) => setSelectedStatus(value as OrderStatus)}
          >
            {STATUS_ORDER.map((status) => {
              const config = STATUS_CONFIG[status];
              const Icon = config.icon;
              return (
                <div
                  key={status}
                  className="flex items-start space-x-3 space-y-0"
                >
                  <RadioGroupItem value={status} id={status} className="mt-1" />
                  <div className="flex items-start space-x-3 flex-1">
                    <Icon className={`h-5 w-5 mt-0.5 ${config.color}`} />
                    <div className="flex-1">
                      <Label
                        htmlFor={status}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {config.label}
                      </Label>
                      <p className="text-xs text-gray-500 mt-1">
                        {config.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </RadioGroup>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Annuler
          </Button>
          <Button
            onClick={handleUpdateStatus}
            disabled={isLoading}
            className="ml-2"
          >
            {isLoading ? "Mise à jour..." : "Mettre à jour"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
