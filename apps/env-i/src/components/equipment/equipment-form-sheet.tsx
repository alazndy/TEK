
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
import { Equipment } from "@/lib/types"
import { useEffect } from "react"

const formSchema = z.object({
  name: z.string().min(2, "İsim en az 2 karakter olmalıdır."),
  manufacturer: z.string().min(2, "Üretici en az 2 karakter olmalıdır."),
  description: z.string().optional(),
  modelNumber: z.string().optional(),
  partNumber: z.string().optional(),
  barcode: z.string().min(2, "Barkod en az 2 karakter olmalıdır."),
  room: z.string().min(1, "Oda boş bırakılamaz."),
  shelf: z.string().min(1, "Raf boş bırakılamaz."),
  stock: z.coerce.number().min(0, "Stok negatif olamaz."),
  price: z.coerce.number().optional(),
  purchaseDate: z.string().optional(),
  warrantyEndDate: z.string().optional(),
})

interface EquipmentFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipment?: Equipment;
  onSubmit: (data: any) => void;
}

export function EquipmentFormSheet({ open, onOpenChange, equipment, onSubmit }: EquipmentFormSheetProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    // @ts-ignore
    resolver: zodResolver(formSchema),
    defaultValues: equipment || { 
        name: "", 
        manufacturer: "", 
        description: "", 
        modelNumber: "", 
        partNumber: "", 
        barcode: "", 
        room: "", 
        shelf: "", 
        stock: 1, 
        price: 0, 
        purchaseDate: "", 
        warrantyEndDate: "",
    },
  })

  useEffect(() => {
    form.reset(equipment || { 
        name: "", 
        manufacturer: "", 
        description: "", 
        modelNumber: "", 
        partNumber: "", 
        barcode: "", 
        room: "", 
        shelf: "", 
        stock: 1, 
        price: 0, 
        purchaseDate: "", 
        warrantyEndDate: "",
    });
  }, [equipment, form]);

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    const dataToSubmit: any = { ...values, category: "Demirbaş" };
    // Only add the id if we are editing an existing equipment
    if (equipment?.id) {
      dataToSubmit.id = equipment.id;
    }
    onSubmit(dataToSubmit);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{equipment ? "Ekipmanı Düzenle" : "Yeni Ekipman Ekle"}</SheetTitle>
          <SheetDescription>
            {equipment ? "Ekipman detaylarını güncelleyin." : "Yeni bir ekipman ekleyin."}
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
                    <Input placeholder="örn. Matkap" {...field} />
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
                    <Input placeholder="örn. Bosch" {...field} />
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
                    <Textarea placeholder="Ekipman hakkında bilgi" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="modelNumber"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Model Numarası</FormLabel>
                    <FormControl>
                        <Input {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
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
            </div>
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
             <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="room"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Oda</FormLabel>
                    <FormControl>
                        <Input {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="shelf"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Raf</FormLabel>
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
            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="purchaseDate"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Satın Alma Tarihi</FormLabel>
                    <FormControl>
                        <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="warrantyEndDate"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Garanti Bitiş Tarihi</FormLabel>
                    <FormControl>
                        <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>

            <Button type="submit">{equipment ? "Değişiklikleri Kaydet" : "Ekipmanı Ekle"}</Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
