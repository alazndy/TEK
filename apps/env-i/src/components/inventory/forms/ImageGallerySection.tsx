import React from "react";
import { ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormLabel } from "@/components/ui/form";
import { ProductFormSectionProps } from "./schema";

export function ImageGallerySection({ form }: ProductFormSectionProps) {
  return (
    <div className="space-y-4 border rounded-md p-4 bg-muted/20">
        <div className="flex items-center justify-between">
            <FormLabel className="font-semibold text-primary">Görsel Galeri</FormLabel>
            <span className="text-xs text-muted-foreground">Maks. 5 fotoğraf</span>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Existing Images */}
            {form.watch('images')?.map((img, index) => (
                <div key={index} className="relative aspect-square group rounded-md overflow-hidden border bg-background">
                    <img src={img} alt={`Product ${index}`} className="w-full h-full object-cover" />
                    <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => {
                            const currentImages = form.getValues('images') || [];
                            form.setValue('images', currentImages.filter((_, i) => i !== index));
                        }}
                    >
                        <X className="h-3 w-3" />
                    </Button>
                </div>
            ))}

            {/* Upload Placeholder */}
            <div className="aspect-square rounded-md border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors flex flex-col items-center justify-center p-4 cursor-pointer bg-background/50 hover:bg-background"
                onClick={() => document.getElementById('image-upload')?.click()}
            >
                <ImagePlus className="h-8 w-8 text-muted-foreground mb-2" />
                <span className="text-xs text-center text-muted-foreground">Fotoğraf Ekle</span>
                <input 
                    id="image-upload" 
                    type="file" 
                    accept="image/*" 
                    multiple 
                    className="hidden" 
                    onChange={(e) => {
                        const files = e.target.files;
                        if (files) {
                            // Simulating upload by creating object URLs
                            // In a real app, upload to Firebase Storage here and get URL
                            const newImages = Array.from(files).map(file => URL.createObjectURL(file));
                            const currentImages = form.getValues('images') || [];
                            form.setValue('images', [...currentImages, ...newImages]);
                        }
                    }}
                />
            </div>
        </div>
    </div>
  );
}
