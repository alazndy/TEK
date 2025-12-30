
"use client"

import * as React from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Order, Product } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Check, ChevronsUpDown, Loader2, PlusCircle, Trash2 } from "lucide-react"
import { format } from 'date-fns'

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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

const orderSchema = z.object({
  orderNumber: z.string().min(1, "Sipariş numarası zorunludur."),
  customerName: z.string().min(1, "Müşteri adı zorunludur."),
  status: z.enum(["Beklemede", "Kargolandı", "Teslim Edildi", "İptal Edildi"]),
  trackingNumber: z.string().optional(),
  items: z.array(z.object({
    productId: z.string().min(1, "Ürün seçimi zorunlu"),
    quantity: z.coerce.number().min(1, "Miktar en az 1 olmalı"),
    price: z.coerce.number().min(0, "Fiyat 0'dan küçük olamaz")
  })).min(1, "Siparişte en az bir ürün olmalıdır."),
})

// We derive the form values type from the schema, but also need to calculate total and itemCount
type OrderFormValues = Omit<Order, 'id' | 'date' | 'total' | 'itemCount'> & {
    items: { productId: string; quantity: number, price: number }[];
}

interface OrderFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: Omit<Order, 'id'>) => void
  customerNames: string[]
  products: Product[]
}

export function OrderFormSheet({ open, onOpenChange, onSubmit, customerNames, products }: OrderFormSheetProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      orderNumber: "", // Will be generated dynamically
      customerName: "",
      status: "Beklemede",
      trackingNumber: "",
      items: [{ productId: '', quantity: 1, price: 0 }],
    },
  })
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items"
  });

  const watchItems = form.watch("items");
  const total = React.useMemo(() => {
    return watchItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  }, [watchItems]);


  const generateOrderNumber = React.useCallback((firstProductId?: string) => {
      const datePart = format(new Date(), 'yyMMdd');
      const productPart = firstProductId ? `-${firstProductId}` : '';
      const randomPart = `-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
      return `${datePart}${productPart}${randomPart}`;
  }, []);

  React.useEffect(() => {
    const firstProductId = watchItems[0]?.productId;
    const currentOrderNumber = form.getValues('orderNumber');
    
    // Generate order number when the sheet opens or first product is selected
    if (open && (!currentOrderNumber || firstProductId)) {
        const product = products.find(p => p.id === firstProductId);
        if (product) {
            const newOrderNumber = generateOrderNumber(product.id);
            form.setValue('orderNumber', newOrderNumber);
        } else if (!currentOrderNumber) {
            // Set a temporary one if no product is selected yet
            form.setValue('orderNumber', generateOrderNumber());
        }
    }
    
    // Reset form when it opens
    if (open && form.formState.isSubmitSuccessful) {
        form.reset({
            orderNumber: generateOrderNumber(),
            customerName: "",
            status: "Beklemede",
            trackingNumber: "",
            items: [{ productId: '', quantity: 1, price: 0 }],
        });
    }

  }, [open, watchItems, form, products, generateOrderNumber]);

  
  const handleProductSelect = (productId: string, index: number) => {
      const product = products.find(p => p.id === productId);
      if(product) {
          form.setValue(`items.${index}.productId`, productId);
          form.setValue(`items.${index}.price`, product.price || 0);

          // If this is the first item, regenerate the order number
          if (index === 0) {
              form.setValue('orderNumber', generateOrderNumber(product.id));
          }
      }
  }

  const handleSubmit = async (values: OrderFormValues) => {
    setIsSubmitting(true);
    
    const finalOrderData: Omit<Order, 'id'> = {
        ...values,
        date: new Date().toISOString(),
        itemCount: values.items.reduce((sum, item) => sum + item.quantity, 0),
        total: values.items.reduce((sum, item) => sum + item.quantity * item.price, 0),
    };
    
    await onSubmit(finalOrderData);
    setIsSubmitting(false);
  }
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-3xl">
        <SheetHeader>
          <SheetTitle>Yeni Sipariş Oluştur</SheetTitle>
          <SheetDescription>Yeni bir satış veya satın alma siparişi oluşturun.</SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4 pr-4 overflow-y-auto h-[calc(100vh-150px)]">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FormField
                  control={form.control}
                  name="orderNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sipariş Numarası</FormLabel>
                      <FormControl>
                        <Input placeholder="Otomatik oluşturulacak..." {...field} readOnly />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Müşteri Adı</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-full justify-between",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value || "Müşteri seçin veya yazın..."}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                          <Command>
                             <CommandInput 
                                placeholder="Müşteri ara veya yeni ekle..."
                                onValueChange={(search) => form.setValue("customerName", search)}
                              />
                            <CommandList>
                              <CommandEmpty>Müşteri bulunamadı.</CommandEmpty>
                              <CommandGroup>
                                {customerNames.map((name) => (
                                  <CommandItem
                                    value={name}
                                    key={name}
                                    onSelect={() => form.setValue("customerName", name)}
                                  >
                                    <Check className={cn("mr-2 h-4 w-4", name === field.value ? "opacity-100" : "opacity-0")} />
                                    {name}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Durum</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger>
                            <SelectValue placeholder="Bir durum seçin" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="Beklemede">Beklemede</SelectItem>
                            <SelectItem value="Kargolandı">Kargolandı</SelectItem>
                            <SelectItem value="Teslim Edildi">Teslim Edildi</SelectItem>
                            <SelectItem value="İptal Edildi">İptal Edildi</SelectItem>
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                  control={form.control}
                  name="trackingNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kargo Takip Numarası</FormLabel>
                      <FormControl>
                        <Input placeholder="Kargo takip numarasını girin..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
             </div>
             
             <div className="space-y-4">
                <FormLabel>Sipariş Kalemleri</FormLabel>
                <div className="space-y-4 rounded-md border p-4">
                    {fields.map((item, index) => (
                        <div key={item.id} className="grid grid-cols-12 gap-4 items-end">
                            <div className="col-span-6">
                                <FormField
                                    control={form.control}
                                    name={`items.${index}.productId`}
                                    render={({ field }) => (
                                        <FormItem>
                                            {index === 0 && <FormLabel>Ürün</FormLabel>}
                                            <Select onValueChange={(value) => handleProductSelect(value, index)} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Ürün seçin..." />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {products.map(p => (
                                                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                             <div className="col-span-2">
                                <FormField
                                    control={form.control}
                                    name={`items.${index}.quantity`}
                                    render={({ field }) => (
                                        <FormItem>
                                             {index === 0 && <FormLabel>Miktar</FormLabel>}
                                            <FormControl>
                                                <Input type="number" placeholder="1" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="col-span-2">
                                <FormField
                                    control={form.control}
                                    name={`items.${index}.price`}
                                    render={({ field }) => (
                                        <FormItem>
                                             {index === 0 && <FormLabel>Birim Fiyat</FormLabel>}
                                            <FormControl>
                                                <Input type="number" placeholder="100.00" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                             <div className="col-span-2 flex items-center gap-2">
                                <p className="font-medium text-sm w-full text-right">
                                    {(watchItems[index].quantity * watchItems[index].price).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                                </p>
                                <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)} disabled={fields.length <= 1}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                             </div>
                        </div>
                    ))}
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => append({ productId: '', quantity: 1, price: 0 })}
                    >
                       <PlusCircle className="mr-2 h-4 w-4" />
                       Yeni Kalem Ekle
                    </Button>
                </div>
             </div>

             <div className="flex justify-end pt-4 pr-4">
                <div className="text-right">
                    <p className="text-muted-foreground">Toplam Tutar</p>
                    <p className="text-2xl font-bold">{total.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</p>
                </div>
             </div>

            <SheetFooter className="pt-4">
              <SheetClose asChild>
                <Button type="button" variant="outline" disabled={isSubmitting}>
                  İptal
                </Button>
              </SheetClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Siparişi Kaydet
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
    