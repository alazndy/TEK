"use client";

import { useState } from "react";
import { usePurchaseStore } from "@/stores/purchase-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Package, Check } from "lucide-react";
import type { PurchaseOrder } from "@/lib/types";

interface ReceiveItemsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  purchaseOrder: PurchaseOrder;
  onSuccess: () => void;
}

export function ReceiveItemsDialog({
  open,
  onOpenChange,
  purchaseOrder,
  onSuccess,
}: ReceiveItemsDialogProps) {
  const { receivePOItems } = usePurchaseStore();
  const [receivedQuantities, setReceivedQuantities] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    purchaseOrder.items.forEach(item => {
      initial[item.id] = item.quantity - item.receivedQuantity;
    });
    return initial;
  });
  const [loading, setLoading] = useState(false);

  const handleQuantityChange = (itemId: string, value: number) => {
    const item = purchaseOrder.items.find(i => i.id === itemId);
    if (!item) return;

    const maxReceivable = item.quantity - item.receivedQuantity;
    const clampedValue = Math.max(0, Math.min(value, maxReceivable));
    
    setReceivedQuantities(prev => ({
      ...prev,
      [itemId]: clampedValue,
    }));
  };

  const handleReceiveAll = () => {
    const all: Record<string, number> = {};
    purchaseOrder.items.forEach(item => {
      all[item.id] = item.quantity - item.receivedQuantity;
    });
    setReceivedQuantities(all);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const itemsToReceive = Object.entries(receivedQuantities)
        .filter(([_, qty]) => qty > 0)
        .map(([itemId, quantity]) => ({ itemId, quantity }));

      if (itemsToReceive.length > 0) {
        await receivePOItems(purchaseOrder.id, itemsToReceive);
      }
      onSuccess();
    } catch (error) {
      console.error("Error receiving items:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalToReceive = Object.values(receivedQuantities).reduce((sum, qty) => sum + qty, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Teslim Alma: {purchaseOrder.poNumber}
          </DialogTitle>
          <DialogDescription>
            Teslim alınan ürün miktarlarını girin
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={handleReceiveAll}>
              <Check className="h-4 w-4 mr-1" />
              Tümünü Al
            </Button>
          </div>

          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ürün</TableHead>
                  <TableHead className="text-center">Sipariş</TableHead>
                  <TableHead className="text-center">Teslim Alınan</TableHead>
                  <TableHead className="text-center">Kalan</TableHead>
                  <TableHead className="text-center">Teslim Al</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchaseOrder.items.map(item => {
                  const remaining = item.quantity - item.receivedQuantity;
                  const isComplete = remaining === 0;

                  return (
                    <TableRow key={item.id} className={isComplete ? "opacity-50" : ""}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.productName}</div>
                          {item.sku && (
                            <div className="text-xs text-muted-foreground">{item.sku}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{item.quantity}</TableCell>
                      <TableCell className="text-center">
                        {item.receivedQuantity > 0 ? (
                          <Badge variant="outline">{item.receivedQuantity}</Badge>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {isComplete ? (
                          <Badge variant="default">Tamamlandı</Badge>
                        ) : (
                          <span className="font-medium text-orange-600">{remaining}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {!isComplete && (
                          <Input
                            type="number"
                            min={0}
                            max={remaining}
                            value={receivedQuantities[item.id] || 0}
                            onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 0)}
                            className="w-20 mx-auto text-center"
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="text-sm text-muted-foreground text-center">
            Toplam teslim alınacak: <strong>{totalToReceive}</strong> adet
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            İptal
          </Button>
          <Button onClick={handleSubmit} disabled={loading || totalToReceive === 0}>
            {loading ? "Kaydediliyor..." : "Teslim Al"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
