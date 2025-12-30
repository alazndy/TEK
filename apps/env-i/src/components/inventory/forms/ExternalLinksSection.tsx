import React from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ProductFormSectionProps } from "./schema";

export function ExternalLinksSection({ form }: ProductFormSectionProps) {
  return (
    <div className="space-y-4">
        <FormField
            control={form.control}
            name="guideUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kullanım Kılavuzu Linki</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com/kullanim-kilavuzu.pdf" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
        />
        <FormField
            control={form.control}
            name="brochureUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Broşür Linki</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com/brosur.pdf" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
        />
        <FormField
            control={form.control}
            name="weaveFileUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Weave Kütüphane Dosyası (.weave / .tsproj)</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com/dosya.weave" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
        />
    </div>
  );
}
