"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Product } from "@/lib/types"
import { useDataStore } from "@/stores/data-store"
import { useCurrencyStore } from "@/stores/currency-store"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import { Form } from "@/components/ui/form"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { productSchema, ProductFormValues } from "./forms/schema"
import { GeneralInfoSection } from "./forms/GeneralInfoSection"
import { PricingSection } from "./forms/PricingSection"
import { StockSection } from "./forms/StockSection"
import { ExternalLinksSection } from "./forms/ExternalLinksSection"
import { ImageGallerySection } from "./forms/ImageGallerySection"

interface ProductFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: Product
  onSubmit: (product: Product) => void
  manufacturers: string[]
  productTemplates: Omit<Product, 'history'>[]
}

export function ProductFormSheet({ open, onOpenChange, product, onSubmit, manufacturers, productTemplates }: ProductFormSheetProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const warehouses = useDataStore(state => state.warehouses);
  const fetchWarehouses = useDataStore(state => state.fetchWarehouses);
  const { fetchRates } = useCurrencyStore();

  React.useEffect(() => {
      fetchWarehouses();
      fetchRates();
  }, [fetchWarehouses, fetchRates]);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      manufacturer: "",
      category: "Stok Malzemesi",
      stock: 0,
      stockByLocation: {},
      minStock: 0,
      price: 0,
      room: "",
      shelf: "",
      barcode: "",
      guideUrl: "",
      brochureUrl: "",
      weaveFileUrl: "",
      modelNumber: "",
      partNumber: "",
      isFaulty: false,
      priceCurrency: 'TRY',
      productCategory: "Diğer",
      images: [],
      ...product,
    },
  })

  React.useEffect(() => {
    if (open) {
      form.reset({
        name: "",
        description: "",
        manufacturer: "",
        category: "Stok Malzemesi",
        stock: 0,
        minStock: 0,
        price: 0,
        room: "",
        shelf: "",
        barcode: "",
        guideUrl: "",
        brochureUrl: "",
        weaveFileUrl: "",
        modelNumber: "",
        partNumber: "",
        productCategory: "Diğer",
        isFaulty: false,
        stockByLocation: {},
        ...product,
      })
    }
  }, [open, product, form])

  const handleTemplateSelect = (templateId: string) => {
    const template = productTemplates.find(p => p.id === templateId)
    if (template) {
        form.reset({
            ...form.getValues(), 
            ...template,
            stock: form.getValues('stock') || 0,
            room: form.getValues('room') || 'Depo',
            shelf: form.getValues('shelf') || 'A1',
        })
    }
  }

  const handleSubmit = async (values: ProductFormValues) => {
    setIsSubmitting(true);
    const dataToSubmit: any = { ...values };
    if (product?.id) {
        dataToSubmit.id = product.id;
    }
    await onSubmit(dataToSubmit as Product);
    setIsSubmitting(false);
  }

  const title = product ? "Ürünü Düzenle" : "Yeni Ürün Ekle"
  const description = product
    ? "Mevcut ürünün bilgilerini güncelleyin."
    : "Envanterinize yeni bir ürün ekleyin."

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-3xl flex flex-col h-full w-full !bg-zinc-950 shadow-2xl border-l border-zinc-800">
        <SheetHeader className="mb-4">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        
        <Form {...form}>
          <form 
            onSubmit={form.handleSubmit(handleSubmit, (errors) => console.log("Form Errors:", errors))} 
            className="flex-1 overflow-hidden flex flex-col"
          >
            <ScrollArea className="flex-1 -mx-6 px-6">
                <div className="space-y-6 pb-6">
                    <Tabs defaultValue="general" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="general">Genel</TabsTrigger>
                            <TabsTrigger value="stock">Stok & Depo</TabsTrigger>
                            <TabsTrigger value="pricing">Fiyat & Satın Alma</TabsTrigger>
                            <TabsTrigger value="media">Medya & Linkler</TabsTrigger>
                        </TabsList>
                        
                        <div className="mt-4 space-y-4">
                            <TabsContent value="general" className="mt-0 space-y-4 animate-in fade-in-50">
                                <GeneralInfoSection 
                                    form={form} 
                                    manufacturers={manufacturers} 
                                    productTemplates={productTemplates}
                                    onTemplateSelect={handleTemplateSelect}
                                />
                            </TabsContent>
                            
                            <TabsContent value="stock" className="mt-0 space-y-4 animate-in fade-in-50">
                                <StockSection form={form} warehouses={warehouses} />
                            </TabsContent>
                            
                            <TabsContent value="pricing" className="mt-0 space-y-4 animate-in fade-in-50">
                                <PricingSection form={form} />
                            </TabsContent>

                            <TabsContent value="media" className="mt-0 space-y-4 animate-in fade-in-50">
                                <ImageGallerySection form={form} />
                                <Separator />
                                <ExternalLinksSection form={form} />
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            </ScrollArea>

            <SheetFooter className="pt-4 mt-auto border-t">
              <SheetClose asChild>
                <Button type="button" variant="outline" disabled={isSubmitting}>
                  İptal
                </Button>
              </SheetClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {product ? "Değişiklikleri Kaydet" : "Ürünü Kaydet"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
