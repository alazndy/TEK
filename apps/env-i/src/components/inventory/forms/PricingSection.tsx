import React from "react";
import { cn } from "@/lib/utils";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductFormSectionProps } from "./schema";
import { useCurrencyStore, currencySymbols, currencyNames } from "@/stores/currency-store";

export function PricingSection({ form }: ProductFormSectionProps) {
  const { rates } = useCurrencyStore();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fiyat</FormLabel>
              <FormControl>
                <Input type="number" placeholder="120.50" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="priceCurrency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Para Birimi</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value || 'TRY'} value={field.value || 'TRY'}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Para birimi seçin" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="TRY">₺ TRY</SelectItem>
                  <SelectItem value="EUR">€ EUR</SelectItem>
                  <SelectItem value="GBP">£ GBP</SelectItem>
                  <SelectItem value="USD">$ USD</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Live Currency Conversion Preview */}
      {(form.watch('price') ?? 0) > 0 && rates && (
        <div className="p-3 bg-muted/50 rounded-md space-y-1">
          <div className="text-xs font-medium text-muted-foreground">Döviz Karşılıkları:</div>
          <div className="grid grid-cols-3 gap-2 text-sm">
            {(['TRY', 'EUR', 'GBP'] as const).map(currency => {
              const inputPrice = form.watch('price') || 0;
              const inputCurrency = (form.watch('priceCurrency') || 'TRY') as keyof typeof rates;
              const ratesData = rates!; // We know rates exists from the condition above
              const converted = inputCurrency === currency 
                ? inputPrice 
                : (inputPrice / ratesData[inputCurrency]) * ratesData[currency];
              return (
                <div key={currency} className={cn(
                  "text-center p-2 rounded",
                  inputCurrency === currency ? "bg-primary/20 font-bold" : "bg-background"
                )}>
                  <div className="text-xs text-muted-foreground">{currencyNames[currency]}</div>
                  <div>{currencySymbols[currency]}{converted.toFixed(2)}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
