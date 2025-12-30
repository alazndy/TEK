'use client';

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useInventoryStore } from "@/stores/inventory-store";
import { Loader2 } from "lucide-react";
import { Product } from "@/types/inventory";

interface EditProductDialogProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

import { useTranslations } from 'next-intl';

export function EditProductDialog({ product, open, onOpenChange }: EditProductDialogProps) {
  const t = useTranslations('Inventory.editProduct');
  const tForm = useTranslations('Inventory.form');
  const [loading, setLoading] = useState(false);
  const updateProduct = useInventoryStore((state) => state.updateProduct);

  const [formData, setFormData] = useState<Partial<Product>>({ ...product });

  useEffect(() => {
    if (product) {
       setFormData({ ...product });
    }
  }, [product, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
        await updateProduct(product.id, formData);
        onOpenChange(false);
    } catch (error) {
        console.error("Failed to update product", error);
    } finally {
        setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
            <DialogHeader>
            <DialogTitle>{t('title')}</DialogTitle>
            <DialogDescription>{t('description')}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                {tForm('name')}
                </Label>
                <Input
                id="edit-name"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="col-span-3"
                required
                />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-category" className="text-right">
                {tForm('category')}
                </Label>
                <Select
                    value={formData.category} // Keeping existing value logic
                    onValueChange={(value: any) => setFormData({ ...formData, category: value })}
                >
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder={tForm('selectCategory')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Stok Malzemesi">{tForm('stockItem')}</SelectItem>
                        <SelectItem value="Sarf Malzeme">{tForm('consumable')}</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-manufacturer" className="text-right">
                {tForm('brand')}
                </Label>
                <Input
                id="edit-manufacturer"
                value={formData.manufacturer || ''}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                className="col-span-3"
                />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-stock" className="text-right">
                {tForm('stock')}
                </Label>
                <Input
                id="edit-stock"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                className="col-span-3"
                required
                />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-price" className="text-right">
                {tForm('price')}
                </Label>
                <Input
                id="edit-price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                className="col-span-3"
                />
            </div>
            </div>
            <DialogFooter>
            <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {tForm('save')}
            </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
