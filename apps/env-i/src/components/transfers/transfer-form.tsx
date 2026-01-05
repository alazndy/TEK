"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2 } from "lucide-react";
import { useTransferStore } from "@/stores/transfer-store";
import { useDataStore } from "@/stores/data-store";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const transferItemSchema = z.object({
  id: z.string(),
  productId: z.string().min(1, "Ürün seçin"),
  productName: z.string(),
  requestedQuantity: z.number().min(1, "Miktar en az 1 olmalı"),
  shippedQuantity: z.number(),
  receivedQuantity: z.number(),
});

const transferSchema = z.object({
  fromWarehouseId: z.string().min(1, "Kaynak depo seçin"),
  toWarehouseId: z.string().min(1, "Hedef depo seçin"),
  items: z.array(transferItemSchema).min(1, "En az bir ürün ekleyin"),
  notes: z.string().optional(),
}).refine(data => data.fromWarehouseId !== data.toWarehouseId, {
  message: "Kaynak ve hedef depo aynı olamaz",
  path: ["toWarehouseId"],
});

type TransferFormData = z.infer<typeof transferSchema>;

interface TransferFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function TransferForm({ onSuccess, onCancel }: TransferFormProps) {
  const { addTransfer, generateTransferNumber } = useTransferStore();
  const { warehouses, products } = useDataStore();
  const { user } = useAuth();

  const form = useForm<TransferFormData>({
    // @ts-ignore
    resolver: zodResolver(transferSchema),
    defaultValues: {
      fromWarehouseId: "",
      toWarehouseId: "",
      items: [],
      notes: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchedFromWarehouse = form.watch("fromWarehouseId");

  const handleAddItem = () => {
    append({
      id: crypto.randomUUID(),
      productId: "",
      productName: "",
      requestedQuantity: 1,
      shippedQuantity: 0,
      receivedQuantity: 0,
    });
  };

  const handleProductSelect = (index: number, productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      form.setValue(`items.${index}.productId`, productId);
      form.setValue(`items.${index}.productName`, product.name);
    }
  };

  const onSubmit = async (data: TransferFormData) => {
    try {
      const fromWarehouse = warehouses.find(w => w.id === data.fromWarehouseId);
      const toWarehouse = warehouses.find(w => w.id === data.toWarehouseId);

      await addTransfer({
        ...data,
        transferNumber: generateTransferNumber(),
        fromWarehouseName: fromWarehouse?.name,
        toWarehouseName: toWarehouse?.name,
        status: "pending",
        requestedBy: user?.email || "system",
      });
      onSuccess();
    } catch (error) {
      console.error("Error creating transfer:", error);
    }
  };

  // Get available stock for selected source warehouse
  const getAvailableStock = (productId: string) => {
    if (!watchedFromWarehouse) return 0;
    const product = products.find(p => p.id === productId);
    if (!product) return 0;
    return product.stockByLocation?.[watchedFromWarehouse] || product.stock;
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Warehouse Selection */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="fromWarehouseId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kaynak Depo *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Depo seçin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {warehouses.map(w => (
                      <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="toWarehouseId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hedef Depo *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Depo seçin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {warehouses
                      .filter(w => w.id !== watchedFromWarehouse)
                      .map(w => (
                        <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Items */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Transfer Kalemleri</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddItem}
              disabled={!watchedFromWarehouse}
            >
              <Plus className="h-4 w-4 mr-1" />
              Ürün Ekle
            </Button>
          </div>

          {!watchedFromWarehouse && (
            <p className="text-sm text-muted-foreground">Önce kaynak deposu seçin</p>
          )}

          {watchedFromWarehouse && (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Ürün</TableHead>
                    <TableHead className="text-center">Mevcut Stok</TableHead>
                    <TableHead className="w-[120px]">Miktar</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                        Ürün eklenmemiş
                      </TableCell>
                    </TableRow>
                  ) : (
                    fields.map((field, index) => {
                      const availableStock = getAvailableStock(form.getValues(`items.${index}.productId`));
                      return (
                        <TableRow key={field.id}>
                          <TableCell>
                            <Select
                              value={form.getValues(`items.${index}.productId`)}
                              onValueChange={(v) => handleProductSelect(index, v)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Ürün seçin" />
                              </SelectTrigger>
                              <SelectContent>
                                {products
                                  .filter(p => p.stock > 0 || (p.stockByLocation && p.stockByLocation[watchedFromWarehouse] > 0))
                                  .map(p => (
                                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-center text-muted-foreground">
                            {availableStock}
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min={1}
                              max={availableStock}
                              {...form.register(`items.${index}.requestedQuantity`, { valueAsNumber: true })}
                              className="w-24"
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => remove(index)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notlar</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Transfer notları..." rows={2} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            İptal
          </Button>
          <Button type="submit">
            Transfer Oluştur
          </Button>
        </div>
      </form>
    </Form>
  );
}
