
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Consumable } from "@/lib/types"
import { useEffect } from "react"

const formSchema = z.object({
  name: z.string().min(2, "İsim en az 2 karakter olmalıdır."),
  manufacturer: z.string().min(2, "Üretici en az 2 karakter olmalıdır."),
  description: z.string().optional(),
  partNumber: z.string().optional(),
  barcode: z.string().min(2, "Barkod en az 2 karakter olmalıdır."),
  stock: z.coerce.number().min(0, "Stok negatif olamaz."),
  price: z.coerce.number().optional(),
})

interface ConsumableFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  consumable?: Consumable;
  onSubmit: (data: any) => void;
}

export function ConsumableFormSheet({ open, onOpenChange, consumable, onSubmit }: ConsumableFormSheetProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: consumable || { 
        name: "", 
        manufacturer: "", 
        description: "", 
        partNumber: "", 
        barcode: "", 
        stock: 1, 
        price: 0,
    },
  })

  useEffect(() => {
    form.reset(consumable || { 
        name: "", 
        manufacturer: "", 
        description: "", 
        partNumber: "", 
        barcode: "", 
        stock: 1, 
        price: 0,
    });
  }, [consumable, form]);

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    const dataToSubmit: any = { ...values, category: "Sarf Malzeme" };
    if (consumable?.id) {
      dataToSubmit.id = consumable.id;
    }
    onSubmit(dataToSubmit);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{consumable ? "Sarf Malzemeyi Düzenle" : "Yeni Sarf Malzeme Ekle"}</SheetTitle>
          <SheetDescription>
            {consumable ? "Sarf malzeme detaylarını güncelleyin." : "Yeni bir sarf malzeme ekleyin."}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>İsim</FormLabel>
                  <FormControl>
                    <Input placeholder="örn. Eldiven" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="manufacturer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Üretici</FormLabel>
                  <FormControl>
                    <Input placeholder="örn. Beybi" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Açıklama</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Sarf malzeme hakkında bilgi" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="partNumber"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Parça Numarası</FormLabel>
                    <FormControl>
                        <Input {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                 <FormField
                  control={form.control}
                  name="barcode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Barkod</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
             <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Stok</FormLabel>
                    <FormControl>
                        <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Fiyat</FormLabel>
                    <FormControl>
                        <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            <Button type="submit">{consumable ? "Değişiklikleri Kaydet" : "Sarf Malzemeyi Ekle"}</Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
