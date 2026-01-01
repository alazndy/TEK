import { z } from "zod";

// --- Auth Schemas ---
export const loginSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi giriniz."),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır.")
});

export const registerSchema = z.object({
  fullName: z.string().min(2, "Ad Soyad en az 2 karakter olmalıdır"),
  email: z.string().email("Geçerli bir e-posta adresi giriniz"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Şifreler eşleşmiyor",
  path: ["confirmPassword"]
});

// --- Product Schemas ---
export const productSchema = z.object({
  name: z.string().min(3, "Ürün adı en az 3 karakter olmalıdır"),
  description: z.string().min(10, "Açıklama en az 10 karakter olmalıdır"),
  price: z.coerce.number().min(0.01, "Fiyat 0'dan büyük olmalıdır"),
  category: z.enum(["software", "hardware", "service", "addon"]),
  tags: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
  imageUrl: z.string().url("Geçerli bir görsel URL'si giriniz").optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ProductInput = z.infer<typeof productSchema>;
