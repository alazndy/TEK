"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Plus, Minus, Trash2, Package, Clock, Hash, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useInvoiceStore } from "@/stores/invoice-store";
import type { Invoice, InvoiceItem } from "@/types/invoice";

interface InvoiceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice?: Invoice;
  userId: string;
  projectId?: string;
  projectName?: string;
}

interface FormData {
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  customerTaxId: string;
  issueDate: string;
  dueDate: string;
  notes: string;
  termsAndConditions: string;
  currency: string;
  discountPercent: number;
  taxRate: number;
}

export function InvoiceForm({
  open,
  onOpenChange,
  invoice,
  userId,
  projectId,
  projectName,
}: InvoiceFormProps) {
  const { addInvoice, updateInvoice, loading, generateInvoiceNumber } = useInvoiceStore();
  const isEdit = !!invoice;

  const [items, setItems] = useState<Omit<InvoiceItem, "id" | "total">[]>(
    invoice?.items.map(({ id, total, ...rest }) => rest) || [
      { description: "", quantity: 1, unitPrice: 0, discount: 0, taxRate: 18, itemType: "service" },
    ]
  );

  const { register, handleSubmit, watch, setValue } = useForm<FormData>({
    defaultValues: {
      customerName: invoice?.customerName || "",
      customerEmail: invoice?.customerEmail || "",
      customerAddress: invoice?.customerAddress || "",
      customerTaxId: invoice?.customerTaxId || "",
      issueDate: invoice?.issueDate
        ? new Date(invoice.issueDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      dueDate: invoice?.dueDate
        ? new Date(invoice.dueDate).toISOString().split("T")[0]
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      notes: invoice?.notes || "",
      termsAndConditions: invoice?.termsAndConditions || "",
      currency: invoice?.currency || "TRY",
      discountPercent: 0,
      taxRate: 18,
    },
  });

  const currency = watch("currency");
  const discountPercent = watch("discountPercent");
  const taxRate = watch("taxRate");

  const addItem = () => {
    setItems([
      ...items,
      { description: "", quantity: 1, unitPrice: 0, discount: 0, taxRate: 18, itemType: "service" },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof Omit<InvoiceItem, "id" | "total">, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const calculateItemTotal = (item: Omit<InvoiceItem, "id" | "total">) => {
    const base = item.quantity * item.unitPrice;
    const afterDiscount = base * (1 - (item.discount || 0) / 100);
    return afterDiscount;
  };

  const subtotal = items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  const discountAmount = subtotal * (discountPercent / 100);
  const afterDiscount = subtotal - discountAmount;
  const taxAmount = afterDiscount * (taxRate / 100);
  const total = afterDiscount + taxAmount;

  const formatCurrency = (amount: number) => {
    const symbols: Record<string, string> = { TRY: "₺", EUR: "€", USD: "$", GBP: "£" };
    return `${symbols[currency] || currency} ${amount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}`;
  };

  const onSubmit = async (data: FormData) => {
    const invoiceData = {
      userId,
      projectId,
      projectName,
      customerName: data.customerName,
      customerEmail: data.customerEmail || undefined,
      customerAddress: data.customerAddress || undefined,
      customerTaxId: data.customerTaxId || undefined,
      issueDate: new Date(data.issueDate),
      dueDate: new Date(data.dueDate),
      items: items.map((item, i) => ({
        id: `item-${i + 1}`,
        ...item,
        total: calculateItemTotal(item),
      })),
      discountAmount,
      taxAmount,
      subtotal,
      total,
      currency: data.currency as "TRY" | "EUR" | "USD" | "GBP",
      notes: data.notes || undefined,
      termsAndConditions: data.termsAndConditions || undefined,
      status: (invoice?.status || 'draft') as any, // Default to draft for new, keep existing for edit
      invoiceNumber: invoice?.invoiceNumber || generateInvoiceNumber(),
    };

    if (isEdit && invoice) {
      await updateInvoice(invoice.id, invoiceData);
    } else {
      await addInvoice(invoiceData);
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Fatura Düzenle" : "Yeni Fatura"}</DialogTitle>
          <DialogDescription>
            Fatura detaylarını girin. Zorunlu alanları doldurun.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Customer Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Müşteri Adı *</Label>
              <Input id="customerName" {...register("customerName", { required: true })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerEmail">E-posta</Label>
              <Input id="customerEmail" type="email" {...register("customerEmail")} />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="customerAddress">Adres</Label>
              <Textarea id="customerAddress" {...register("customerAddress")} rows={2} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerTaxId">Vergi No</Label>
              <Input id="customerTaxId" {...register("customerTaxId")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Para Birimi</Label>
              <Select value={currency} onValueChange={(v) => setValue("currency", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TRY">TRY (₺)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="issueDate">Düzenleme Tarihi</Label>
              <Input id="issueDate" type="date" {...register("issueDate")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Vade Tarihi</Label>
              <Input id="dueDate" type="date" {...register("dueDate")} />
            </div>
          </div>

          <Separator />

          {/* Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base">Fatura Kalemleri</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-1" />
                Kalem Ekle
              </Button>
            </div>

            {items.map((item, index) => (
              <Card key={index}>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-12 gap-3 items-end">
                    <div className="col-span-5 space-y-1">
                      <Label className="text-xs">Açıklama</Label>
                      <Input
                        value={item.description}
                        onChange={(e) => updateItem(index, "description", e.target.value)}
                        placeholder="Ürün veya hizmet açıklaması"
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <Label className="text-xs">Tür</Label>
                      <Select
                        value={item.itemType}
                        onValueChange={(v) => updateItem(index, "itemType", v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="service">Hizmet</SelectItem>
                          <SelectItem value="product">Ürün</SelectItem>
                          <SelectItem value="time">Zaman</SelectItem>
                          <SelectItem value="expense">Gider</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-1 space-y-1">
                      <Label className="text-xs">Miktar</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, "quantity", Number(e.target.value))}
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <Label className="text-xs">Birim Fiyat</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(index, "unitPrice", Number(e.target.value))}
                      />
                    </div>
                    <div className="col-span-1 space-y-1">
                      <Label className="text-xs">İsk. %</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={item.discount || 0}
                        onChange={(e) => updateItem(index, "discount", Number(e.target.value))}
                      />
                    </div>
                    <div className="col-span-1 flex items-end gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(index)}
                        disabled={items.length === 1}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground mt-2">
                    Toplam: {formatCurrency(calculateItemTotal(item))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Separator />

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-80 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Ara Toplam:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span>İskonto:</span>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    className="w-16 h-7"
                    {...register("discountPercent", { valueAsNumber: true })}
                  />
                  <span>%</span>
                </div>
                <span className="text-red-500">-{formatCurrency(discountAmount)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span>KDV:</span>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    className="w-16 h-7"
                    {...register("taxRate", { valueAsNumber: true })}
                  />
                  <span>%</span>
                </div>
                <span>+{formatCurrency(taxAmount)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Genel Toplam:</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Notlar</Label>
              <Textarea id="notes" {...register("notes")} rows={3} placeholder="Müşteriye özel notlar..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="termsAndConditions">Şartlar ve Koşullar</Label>
              <Textarea
                id="termsAndConditions"
                {...register("termsAndConditions")}
                rows={3}
                placeholder="Ödeme koşulları..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              İptal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Kaydediliyor..." : isEdit ? "Güncelle" : "Oluştur"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
