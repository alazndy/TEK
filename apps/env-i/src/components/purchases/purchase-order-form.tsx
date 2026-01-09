"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, Calculator } from "lucide-react";
import { usePurchaseStore } from "@/stores/purchase-store";
import { useSupplierStore } from "@/stores/supplier-store";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { PurchaseOrder, POItem } from "@/lib/types";

const poItemSchema = z.object({
  id: z.string(),
  productId: z.string().min(1, "Ürün seçin"),
  productName: z.string(),
  sku: z.string().optional(),
  quantity: z.number().min(1, "Miktar en az 1 olmalı"),
  unitCost: z.number().min(0, "Birim fiyat gerekli"),
  totalCost: z.number(),
  receivedQuantity: z.number(),
});

const poSchema = z.object({
  supplierId: z.string().min(1, "Tedarikçi seçin"),
  warehouseId: z.string().min(1, "Depo seçin"),
  items: z.array(poItemSchema).min(1, "En az bir kalem ekleyin"),
  taxRate: z.number().min(0).max(100),
  shippingCost: z.number().min(0),
  currency: z.enum(["TRY", "EUR", "GBP", "USD"]),
  expectedDate: z.date().optional(),
  notes: z.string().optional(),
});

type POFormData = z.infer<typeof poSchema>;

interface PurchaseOrderFormProps {
  purchaseOrder?: PurchaseOrder | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function PurchaseOrderForm({ purchaseOrder, onSuccess, onCancel }: PurchaseOrderFormProps) {
  const { addPurchaseOrder, updatePurchaseOrder, generatePONumber, calculatePOTotals } = usePurchaseStore();
  const { suppliers } = useSupplierStore();
  const { warehouses, products } = useDataStore();
  const { user } = useAuth();

  const form = useForm<POFormData>({
    resolver: zodResolver(poSchema),
    defaultValues: {
      supplierId: purchaseOrder?.supplierId || "",
      warehouseId: purchaseOrder?.warehouseId || "",
      items: purchaseOrder?.items || [],
      taxRate: purchaseOrder?.taxRate || 20,
      shippingCost: purchaseOrder?.shippingCost || 0,
      currency: purchaseOrder?.currency || "TRY",
      expectedDate: purchaseOrder?.expectedDate ? new Date(purchaseOrder.expectedDate) : undefined,
      notes: purchaseOrder?.notes || "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchedItems = form.watch("items");
  const watchedTaxRate = form.watch("taxRate");
  const watchedShipping = form.watch("shippingCost");

  const totals = calculatePOTotals(watchedItems, watchedTaxRate, watchedShipping);

  const handleAddItem = () => {
    append({
      id: crypto.randomUUID(),
      productId: "",
      productName: "",
      sku: "",
      quantity: 1,
      unitCost: 0,
      totalCost: 0,
      receivedQuantity: 0,
    });
  };

  const handleProductSelect = (index: number, productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      form.setValue(`items.${index}.productId`, productId);
      form.setValue(`items.${index}.productName`, product.name);
      form.setValue(`items.${index}.sku`, product.barcode || "");
      form.setValue(`items.${index}.unitCost`, product.price || 0);
      updateItemTotal(index);
    }
  };

  const updateItemTotal = (index: number) => {
    const quantity = form.getValues(`items.${index}.quantity`);
    const unitCost = form.getValues(`items.${index}.unitCost`);
    form.setValue(`items.${index}.totalCost`, quantity * unitCost);
  };

  const onSubmit = async (data: POFormData) => {
    try {
      const supplier = suppliers.find(s => s.id === data.supplierId);
      const warehouse = warehouses.find(w => w.id === data.warehouseId);
      const { subtotal, taxAmount, total } = calculatePOTotals(data.items, data.taxRate, data.shippingCost);

      const poData = {
        ...data,
        poNumber: purchaseOrder?.poNumber || generatePONumber(),
        supplierName: supplier?.name,
        warehouseName: warehouse?.name,
        status: purchaseOrder?.status || "draft" as const,
        subtotal,
        taxAmount,
        total,
        createdBy: user?.email || "system",
      };

      if (purchaseOrder) {
        await updatePurchaseOrder(purchaseOrder.id, poData);
      } else {
        await addPurchaseOrder(poData);
      }
      onSuccess();
    } catch (error) {
      console.error("Error saving purchase order:", error);
    }
  };

  const formatCurrency = (amount: number) => {
    const currency = form.getValues("currency");
    const symbols: Record<string, string> = { TRY: "₺", EUR: "€", USD: "$", GBP: "£" };
    return `${symbols[currency]} ${amount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}`;
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Header Fields */}
        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="supplierId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tedarikçi *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Tedarikçi seçin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {suppliers.filter(s => s.isActive).map(supplier => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="warehouseId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teslim Deposu *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Depo seçin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {warehouses.map(warehouse => (
                      <SelectItem key={warehouse.id} value={warehouse.id}>
                        {warehouse.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="expectedDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Beklenen Teslim Tarihi</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "d MMMM yyyy", { locale: tr })
                        ) : (
                          <span>Tarih seçin</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date()}
                      locale={tr}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Items Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Sipariş Kalemleri</h3>
            <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
              <Plus className="h-4 w-4 mr-1" />
              Kalem Ekle
            </Button>
          </div>

          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Ürün</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="w-[100px]">Miktar</TableHead>
                  <TableHead className="w-[120px]">Birim Fiyat</TableHead>
                  <TableHead className="w-[120px]">Toplam</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                      Henüz kalem eklenmemiş
                    </TableCell>
                  </TableRow>
                ) : (
                  fields.map((field, index) => (
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
                            {products.map(product => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {form.getValues(`items.${index}.sku`) || "-"}
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={1}
                          {...form.register(`items.${index}.quantity`, { valueAsNumber: true })}
                          onChange={(e) => {
                            form.setValue(`items.${index}.quantity`, parseInt(e.target.value) || 1);
                            updateItemTotal(index);
                          }}
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={0}
                          step={0.01}
                          {...form.register(`items.${index}.unitCost`, { valueAsNumber: true })}
                          onChange={(e) => {
                            form.setValue(`items.${index}.unitCost`, parseFloat(e.target.value) || 0);
                            updateItemTotal(index);
                          }}
                          className="w-28"
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(form.getValues(`items.${index}.totalCost`) || 0)}
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
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Totals */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Para Birimi</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="TRY">TRY (₺)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notlar</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} placeholder="Sipariş notları..." />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-3 bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-4">
              <FormField
                control={form.control}
                name="taxRate"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>KDV Oranı (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        {...field}
                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="shippingCost"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Kargo</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        {...field}
                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-2 pt-2 border-t">
              <div className="flex justify-between text-sm">
                <span>Ara Toplam:</span>
                <span>{formatCurrency(totals.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>KDV ({watchedTaxRate}%):</span>
                <span>{formatCurrency(totals.taxAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Kargo:</span>
                <span>{formatCurrency(watchedShipping)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Toplam:</span>
                <span>{formatCurrency(totals.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>
            İptal
          </Button>
          <Button type="submit">
            {purchaseOrder ? "Güncelle" : "Oluştur"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
