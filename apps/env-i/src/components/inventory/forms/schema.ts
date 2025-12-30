import { UseFormReturn } from "react-hook-form";
import * as z from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "Ürün adı zorunludur."),
  description: z.string().optional(),
  manufacturer: z.string().min(1, "Üretici zorunludur."),
  category: z.enum(["Stok Malzemesi", "Sarf Malzeme", "Demirbaş"]),
  stock: z.coerce.number().min(0, "Stok 0'dan küçük olamaz."),
  stockByLocation: z.record(z.coerce.number()).optional(),
  minStock: z.coerce.number().min(0, "Minimum stok 0'dan küçük olamaz.").optional(),
  price: z.coerce.number().min(0, "Fiyat 0'dan küçük olamaz.").optional(),
  room: z.string().optional(),
  shelf: z.string().optional(),
  barcode: z.string().min(1, "Barkod zorunludur."),
  guideUrl: z.string().url("Geçerli bir URL girin.").optional().or(z.literal('')),
  brochureUrl: z.string().url("Geçerli bir URL girin.").optional().or(z.literal('')),
  modelNumber: z.string().optional(),
  partNumber: z.string().optional(),
  productCategory: z.string().optional(),
  isFaulty: z.boolean().optional(),
  priceCurrency: z.enum(['TRY', 'EUR', 'GBP', 'USD']).optional(),
  weaveFileUrl: z.string().url("Geçerli bir URL girin.").optional().or(z.literal('')),
  images: z.array(z.string()).optional(),
});

export type ProductFormValues = z.infer<typeof productSchema>;

export interface ProductFormSectionProps {
  form: UseFormReturn<ProductFormValues>;
}
