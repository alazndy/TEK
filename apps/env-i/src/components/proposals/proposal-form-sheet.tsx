
"use client"

import * as React from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Proposal, Product, ProposalItem } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Check, ChevronsUpDown, Loader2, PlusCircle, Trash2, UploadCloud } from "lucide-react"

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

const proposalSchema = z.object({
  proposalNumber: z.string().min(1, "Teklif numarası zorunludur."),
  customerName: z.string().min(1, "Müşteri adı zorunludur."),
  status: z.enum(["Taslak", "Gönderildi", "Kabul Edildi", "Reddedildi"]),
  items: z.array(z.object({
    productId: z.string().min(1, "Ürün seçimi zorunlu"),
    quantity: z.coerce.number().min(1, "Miktar en az 1 olmalı"),
    price: z.coerce.number().min(0, "Fiyat 0'dan küçük olamaz")
  })).min(1, "Teklifte en az bir ürün olmalıdır."),
  pdfFile: z.instanceof(File, { message: "Lütfen bir PDF dosyası yükleyin." })
    .refine(file => file.size < 5 * 1024 * 1024, "Dosya boyutu 5MB'dan küçük olmalıdır.")
    .refine(file => file.type === "application/pdf", "Sadece PDF dosyaları kabul edilmektedir.")
    .optional(),
});

type ProposalFormValues = z.infer<typeof proposalSchema>;

interface ProposalFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: Omit<Proposal, 'id' | 'pdfUrl'>, pdfFile: File) => void
  customerNames: string[]
  products: Product[]
}

export function ProposalFormSheet({ open, onOpenChange, onSubmit, customerNames, products }: ProposalFormSheetProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<ProposalFormValues>({
    resolver: zodResolver(proposalSchema),
    defaultValues: {
      proposalNumber: `T-${Date.now().toString().slice(-6)}`,
      customerName: "",
      status: "Taslak",
      items: [{ productId: '', quantity: 1, price: 0 }],
    },
  })
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items"
  });

  const watchItems = form.watch("items");
  const pdfFile = form.watch("pdfFile");
  const total = React.useMemo(() => {
    return watchItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  }, [watchItems]);


  React.useEffect(() => {
    if (open) {
      form.reset({
        proposalNumber: `T-${Date.now().toString().slice(-6)}`,
        customerName: "",
        status: "Taslak",
        items: [{ productId: '', quantity: 1, price: 0 }],
        pdfFile: undefined,
      })
    }
  }, [open, form])
  
  const handleProductSelect = (productId: string, index: number) => {
      const product = products.find(p => p.id === productId);
      if(product) {
          form.setValue(`items.${index}.productId`, productId);
          form.setValue(`items.${index}.price`, product.price || 0);
      }
  }

  const handleSubmit = async (values: ProposalFormValues) => {
    const { pdfFile, ...proposalData } = values;

    if (!pdfFile) {
        form.setError("pdfFile", { type: "manual", message: "PDF dosyası yüklemek zorunludur." });
        return;
    }
    setIsSubmitting(true);
    
    const finalProposalData: Omit<Proposal, 'id' | 'pdfUrl'> = {
        ...proposalData,
        date: new Date().toISOString(),
        total: proposalData.items.reduce((sum, item) => sum + item.quantity * item.price, 0),
    };
    
    await onSubmit(finalProposalData, pdfFile);
    setIsSubmitting(false);
  }
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-3xl">
        <SheetHeader>
          <SheetTitle>Yeni Teklif Oluştur</SheetTitle>
          <SheetDescription>Yeni bir teklif oluşturun ve PDF dosyasını sisteme yükleyin.</SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4 pr-4 overflow-y-auto h-[calc(100vh-150px)]">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FormField
                  control={form.control}
                  name="proposalNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teklif Numarası</FormLabel>
                      <FormControl>
                        <Input placeholder="T-123456" {...field} />
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
                            <SelectItem value="Taslak">Taslak</SelectItem>
                            <SelectItem value="Gönderildi">Gönderildi</SelectItem>
                            <SelectItem value="Kabul Edildi">Kabul Edildi</SelectItem>
                            <SelectItem value="Reddedildi">Reddedildi</SelectItem>
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
             </div>

             <FormField
                control={form.control}
                name="pdfFile"
                render={({ field: { onChange, value, ...rest } }) => (
                    <FormItem>
                        <FormLabel>Teklif PDF'i</FormLabel>
                        <FormControl>
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full justify-start text-left font-normal"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <UploadCloud className="mr-2 h-4 w-4" />
                                {pdfFile ? pdfFile.name : "Bir PDF dosyası seçin..."}
                            </Button>
                        </FormControl>
                        <Input
                            {...rest}
                            type="file"
                            accept="application/pdf"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    onChange(file);
                                }
                            }}
                        />
                        <FormMessage />
                    </FormItem>
                )}
                />
             
             <div className="space-y-4">
                <FormLabel>Teklif Kalemleri</FormLabel>
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
                Teklifi Kaydet
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}

    