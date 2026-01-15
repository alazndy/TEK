import React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ProductFormSectionProps } from "./schema";
import { Product } from "@/lib/types";
import { Switch } from "@/components/ui/switch";
import { FormDescription } from "@/components/ui/form";

interface GeneralInfoSectionProps extends ProductFormSectionProps {
  manufacturers: string[];
  productTemplates: Omit<Product, 'history'>[];
  onTemplateSelect: (id: string) => void;
}

export function GeneralInfoSection({ form, manufacturers, productTemplates, onTemplateSelect }: GeneralInfoSectionProps) {
  return (
    <div className="space-y-4">
      {/* Product Name & Template Selection */}
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Ürün Adı</FormLabel>
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
                    {field.value
                      ? productTemplates.find(
                          (p) => p.name === field.value
                        )?.name ?? field.value
                      : "Ürün seçin veya yeni bir isim yazın..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0 !bg-zinc-950 border border-zinc-800">
                <Command>
                  <CommandInput 
                    placeholder="Ürün adı ara veya yeni ekle..."
                    onValueChange={(search) => {
                      field.onChange(search)
                    }}
                  />
                  <CommandList>
                    <CommandEmpty>Ürün bulunamadı.</CommandEmpty>
                    <CommandGroup>
                      {productTemplates.map((p) => (
                        <CommandItem
                          value={p.name}
                          key={p.id}
                          onSelect={() => {
                            onTemplateSelect(p.id)
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              p.name === field.value
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {p.name}
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
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Açıklama</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Ürünle ilgili ek bilgiler, kullanım alanları vb."
                className="resize-none"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Manufacturer */}
        <FormField
          control={form.control}
          name="manufacturer"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Üretici</FormLabel>
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
                      {field.value
                        ? manufacturers.find(
                            (m) => m === field.value
                          )
                        : "Bir üretici seçin veya yazın..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0 !bg-zinc-950 border border-zinc-800">
                  <Command>
                    <CommandInput 
                      placeholder="Üretici ara veya yeni ekle..."
                      onValueChange={(search) => {
                        if(!manufacturers.some(m => m.toLowerCase() === search.toLowerCase())){
                           form.setValue("manufacturer", search)
                        }
                      }}
                    />
                    <CommandList>
                      <CommandEmpty>Üretici bulunamadı.</CommandEmpty>
                      <CommandGroup>
                        {manufacturers.map((m) => (
                          <CommandItem
                            value={m}
                            key={m}
                            onSelect={() => {
                              form.setValue("manufacturer", m)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                m === field.value
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {m}
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
          name="modelNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Model Numarası</FormLabel>
              <FormControl>
                <Input placeholder="BS-01" {...field} />
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
                <Input placeholder="5001" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="productCategory"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ürün Tipi (Kategori)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Bir tip seçin" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Sensor">Sensor</SelectItem>
                  <SelectItem value="Monitor">Monitor</SelectItem>
                  <SelectItem value="Kablo">Kablo</SelectItem>
                  <SelectItem value="Adaptör">Adaptör</SelectItem>
                  <SelectItem value="Kamera">Kamera</SelectItem>
                  <SelectItem value="Sistem">Sistem</SelectItem>
                  <SelectItem value="Aksesuar">Aksesuar</SelectItem>
                  <SelectItem value="Diğer">Diğer</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kategori</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Bir kategori seçin" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Stok Malzemesi">Stok Malzemesi</SelectItem>
                  <SelectItem value="Sarf Malzeme">Sarf Malzeme</SelectItem>
                  <SelectItem value="Demirbaş">Demirbaş</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
            control={form.control}
            name="isFaulty"
            render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm md:col-span-1">
                <div className="space-y-0.5">
                    <FormLabel>Arızalı Ürün</FormLabel>
                    <FormDescription>
                    Bu ürünü arızalı olarak işaretle.
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
    </div>
  );
}
