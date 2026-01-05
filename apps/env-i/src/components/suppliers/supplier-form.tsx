"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSupplierStore } from "@/stores/supplier-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Star } from "lucide-react";
import type { Supplier } from "@/lib/types";

const supplierSchema = z.object({
  name: z.string().min(1, "Tedarikçi adı gerekli"),
  code: z.string().min(1, "Tedarikçi kodu gerekli"),
  contactPerson: z.string().optional(),
  email: z.string().email("Geçerli email adresi girin").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  website: z.string().url("Geçerli URL girin").optional().or(z.literal("")),
  taxId: z.string().optional(),
  paymentTerms: z.string().optional(),
  currency: z.enum(["TRY", "EUR", "GBP", "USD"]).optional(),
  rating: z.number().min(1).max(5).optional(),
  notes: z.string().optional(),
  isActive: z.boolean(),
});

type SupplierFormData = z.infer<typeof supplierSchema>;

interface SupplierFormProps {
  supplier?: Supplier | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function SupplierForm({ supplier, onSuccess, onCancel }: SupplierFormProps) {
  const { addSupplier, updateSupplier, generateSupplierCode } = useSupplierStore();

  const form = useForm<SupplierFormData>({
    // @ts-ignore
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: supplier?.name || "",
      code: supplier?.code || generateSupplierCode(),
      contactPerson: supplier?.contactPerson || "",
      email: supplier?.email || "",
      phone: supplier?.phone || "",
      address: supplier?.address || "",
      city: supplier?.city || "",
      country: supplier?.country || "Türkiye",
      website: supplier?.website || "",
      taxId: supplier?.taxId || "",
      paymentTerms: supplier?.paymentTerms || "",
      currency: supplier?.currency || "TRY",
      rating: supplier?.rating || undefined,
      notes: supplier?.notes || "",
      isActive: supplier?.isActive ?? true,
    },
  });

  const onSubmit = async (data: SupplierFormData) => {
    try {
      if (supplier) {
        await updateSupplier(supplier.id, data);
      } else {
        await addSupplier(data as Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>);
      }
      onSuccess();
    } catch (error) {
      console.error("Error saving supplier:", error);
    }
  };

  const RatingSelector = ({ value, onChange }: { value?: number; onChange: (val: number) => void }) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className="p-0.5 hover:scale-110 transition-transform"
          onClick={() => onChange(star)}
        >
          <Star
            className={`h-5 w-5 ${
              value && star <= value
                ? "fill-yellow-400 text-yellow-400"
                : "text-muted-foreground hover:text-yellow-400"
            }`}
          />
        </button>
      ))}
      {value && (
        <button
          type="button"
          className="ml-2 text-xs text-muted-foreground hover:text-foreground"
          onClick={() => onChange(0)}
        >
          Temizle
        </button>
      )}
    </div>
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tedarikçi Kodu *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="SUP-001" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tedarikçi Adı *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="ABC Ticaret Ltd." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="contactPerson"
            render={({ field }) => (
              <FormItem>
                <FormLabel>İletişim Kişisi</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ahmet Yılmaz" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefon</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="+90 212 123 4567" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-posta</FormLabel>
              <FormControl>
                <Input {...field} type="email" placeholder="info@abcticaret.com" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Address */}
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Adres</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Adres bilgisi" rows={2} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Şehir</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="İstanbul" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ülke</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Türkiye" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Business Info */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="taxId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vergi No</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="1234567890" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Web Sitesi</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="https://www.abcticaret.com" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="paymentTerms"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ödeme Koşulları</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seçin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Peşin">Peşin</SelectItem>
                    <SelectItem value="Net 15">Net 15</SelectItem>
                    <SelectItem value="Net 30">Net 30</SelectItem>
                    <SelectItem value="Net 45">Net 45</SelectItem>
                    <SelectItem value="Net 60">Net 60</SelectItem>
                    <SelectItem value="Net 90">Net 90</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Para Birimi</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seçin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="TRY">TRY (₺)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Rating & Status */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="rating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Değerlendirme</FormLabel>
                <FormControl>
                  <RatingSelector
                    value={field.value}
                    onChange={(val) => field.onChange(val || undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel>Aktif</FormLabel>
                  <FormDescription>
                    Tedarikçi aktif olarak kullanılabilir
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notlar</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Ek notlar..." rows={3} />
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
            {supplier ? "Güncelle" : "Ekle"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
