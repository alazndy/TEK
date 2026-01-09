"use client"

import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDefectStore } from '@/stores/defect-store';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash2, Package } from 'lucide-react';
import type { DefectReport, DefectStatus, InspectedProduct } from '@/lib/types';
import { format } from 'date-fns';

// Ürün schema
const inspectedProductSchema = z.object({
  id: z.string(),
  productType: z.string().min(1, "Ürün tipi girilmelidir"),
  brand: z.string().min(1, "Marka girilmelidir"),
  model: z.string().min(1, "Model girilmelidir"),
  partNumber: z.string().min(1, "Parça numarası girilmelidir"),
  serialNumber: z.string().min(1, "Seri numarası girilmelidir"),
});

const formSchema = z.object({
  customerName: z.string().min(2, "Müşteri adı girilmelidir"),
  inspectorName: z.string().min(2, "İnspektör adı girilmelidir"),
  inspectorDate: z.string().min(1, "İnceleme tarihi girilmelidir"),
  inspectedProducts: z.array(inspectedProductSchema).min(1, "En az bir ürün eklenmelidir"),
  reason: z.string().min(3, "Arıza başlığı belirtilmelidir"),
  customerStatement: z.string().min(5, "Müşteri beyanı detaylı girilmelidir"),
  inspectionResult: z.string().optional(),
  status: z.enum(['new', 'investigating', 'resolved', 'discarded'] as const),
  reportedBy: z.string().min(2, "Bildiren kişi adı girilmelidir"),
});

type FormValues = z.infer<typeof formSchema>;

interface DefectFormProps {
  initialData?: DefectReport;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// UUID benzeri ID oluştur
const generateId = () => Math.random().toString(36).substring(2, 11);

export function DefectForm({ initialData, onSuccess, onCancel }: DefectFormProps) {
  const { toast } = useToast();
  const { addDefect, updateDefect } = useDefectStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    // @ts-ignore - zodResolver type compatibility issue
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      customerName: initialData.customerName,
      inspectorName: initialData.inspectorName,
      inspectorDate: format(initialData.inspectorDate, 'yyyy-MM-dd'),
      inspectedProducts: initialData.inspectedProducts,
      reason: initialData.reason,
      customerStatement: initialData.customerStatement,
      inspectionResult: initialData.inspectionResult || '',
      status: initialData.status,
      reportedBy: initialData.reportedBy,
    } : {
      customerName: '',
      inspectorName: '',
      inspectorDate: format(new Date(), 'yyyy-MM-dd'),
      inspectedProducts: [{
        id: generateId(),
        productType: '',
        brand: '',
        model: '',
        partNumber: '',
        serialNumber: '',
      }],
      reason: '',
      customerStatement: '',
      inspectionResult: '',
      status: 'new',
      reportedBy: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "inspectedProducts",
  });

  const addProduct = () => {
    append({
      id: generateId(),
      productType: '',
      brand: '',
      model: '',
      partNumber: '',
      serialNumber: '',
    });
  };

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    try {
      const defectData = {
        ...values,
        inspectorDate: new Date(values.inspectorDate),
      };

      if (initialData) {
        await updateDefect(initialData.id, defectData);
        toast({ title: "Başarılı", description: "Arıza kaydı güncellendi." });
      } else {
        await addDefect(defectData);
        toast({ title: "Başarılı", description: "Yeni arıza kaydı oluşturuldu." });
      }
      onSuccess?.();
    } catch (error) {
      toast({ 
        title: "Hata", 
        description: "İşlem sırasında bir hata oluştu.", 
        variant: "destructive" 
      });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        {/* ========== MÜŞTERI & İNSPEKTÖR BİLGİLERİ ========== */}
        <div className="space-y-4 p-4 rounded-lg border border-zinc-800 bg-zinc-900/50">
          <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide">
            Müşteri & İnspektör Bilgileri
          </h3>
          
          <FormField
            control={form.control}
            name="customerName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Müşteri (Firma/Şahıs)</FormLabel>
                <FormControl>
                  <Input placeholder="Örn: MİLES LİFT MAKİNA SAN." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="inspectorName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>İnspektör Adı</FormLabel>
                  <FormControl>
                    <Input placeholder="Örn: G.T" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="inspectorDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>İnceleme Tarihi</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="reportedBy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Formu Dolduran</FormLabel>
                <FormControl>
                  <Input placeholder="Ad Soyad" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* ========== İNCELENEN ÜRÜNLER TABLOSU ========== */}
        <div className="space-y-4 p-4 rounded-lg border border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide flex items-center gap-2">
              <Package className="h-4 w-4" />
              İncelenen Ürünler
            </h3>
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={addProduct}
              className="border-emerald-600 text-emerald-500 hover:bg-emerald-600/10"
            >
              <Plus className="h-4 w-4 mr-1" />
              Ürün Ekle
            </Button>
          </div>

          {fields.map((field, index) => (
            <div 
              key={field.id} 
              className="p-4 rounded-lg border border-zinc-700 bg-zinc-950/50 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-400">
                  Ürün #{index + 1}
                </span>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-950/50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name={`inspectedProducts.${index}.productType`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Ürün Tipi</FormLabel>
                      <FormControl>
                        <Input placeholder="Örn: Essential Monitor" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name={`inspectedProducts.${index}.brand`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Marka</FormLabel>
                      <FormControl>
                        <Input placeholder="Örn: Brigade" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <FormField
                  control={form.control}
                  name={`inspectedProducts.${index}.model`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Model</FormLabel>
                      <FormControl>
                        <Input placeholder="Örn: VBV-670M-M" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name={`inspectedProducts.${index}.partNumber`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Parça No</FormLabel>
                      <FormControl>
                        <Input placeholder="Örn: 5775" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name={`inspectedProducts.${index}.serialNumber`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Seri No</FormLabel>
                      <FormControl>
                        <Input placeholder="Örn: 2406M01257" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          ))}
        </div>

        {/* ========== ARIZA BİLGİLERİ ========== */}
        <div className="space-y-4 p-4 rounded-lg border border-zinc-800 bg-zinc-900/50">
          <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide">
            Arıza Bilgileri
          </h3>

          <FormField
            control={form.control}
            name="reason"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Arıza Başlığı / Sebebi</FormLabel>
                <FormControl>
                  <Input placeholder="Örn: Açılmıyor, Ekran kırık..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="customerStatement"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Müşteri Beyanı (Customer Statement)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Müşterinin şikayet ve açıklamaları..." 
                    className="resize-none h-24"
                    {...field} 
                  />
                </FormControl>
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
                      <SelectValue placeholder="Durum Seçin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="new">Yeni Kayıt</SelectItem>
                    <SelectItem value="investigating">İnceleniyor</SelectItem>
                    <SelectItem value="resolved">Çözüldü</SelectItem>
                    <SelectItem value="discarded">İptal / İade</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="inspectionResult"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teknik Servis Değerlendirmesi (Technical Service Evaluation)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Teknik bulgular ve onarım detayları..." 
                    className="resize-none h-32"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* ========== BUTONLAR ========== */}
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="ghost" onClick={onCancel}>
            İptal
          </Button>
          <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Kaydet
          </Button>
        </div>
      </form>
    </Form>
  );
}
