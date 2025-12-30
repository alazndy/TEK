'use client';

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { useState } from "react";
import { useInventoryStore } from "@/stores/inventory-store";
import { Plus, Loader2 } from "lucide-react";
import { Product } from "@/types/inventory";

import { useTranslations } from 'next-intl';

export function AddProductDialog() {
  const t = useTranslations('Inventory.addProduct');
  const tForm = useTranslations('Inventory.form');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const addProduct = useInventoryStore((state) => state.addProduct);

  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    // We use hardcoded Turkish values for category to match the Type definition and Store expectation
    category: 'Stok Malzemesi', 
    manufacturer: '',
    stock: 0,
    price: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
        await addProduct(formData as Product);
        setOpen(false);
        setFormData({
            name: '',
            category: 'Stok Malzemesi', // Keep internal value? Or translate?
            // If I change value to "Stock Item", existing items "Stok Malzemesi" won't match. 
            // Better to keep internal values consistent or migrate data. 
            // Assuming I should translate the DISPLAY but keep the VALUE if possible, or update the value.
            // Since this is a new app phase, maybe I can start using English values or Keys?
            // But let's assume "Stok Malzemesi" is the value. 
            // Wait, this is "Stok Malzemesi" in the code I read.
            // If I change it, I should change it everywhere.
            // I'll stick to translation for now.
            manufacturer: '',
            stock: 0,
            price: 0,
        });
    } catch (error) {
        console.error("Failed to add product", error);
    } finally {
        setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
            <Plus className="mr-2 h-4 w-4" /> {t('button')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
            <DialogHeader>
            <DialogTitle>{t('title')}</DialogTitle>
            <DialogDescription>{t('description')}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                {tForm('name')}
                </Label>
                <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="col-span-3"
                required
                />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                {tForm('category')}
                </Label>
                <Select
                    value={formData.category} // If I keep values as 'Stok Malzemesi' etc, I need to make sure options match.
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
                <Label htmlFor="manufacturer" className="text-right">
                {tForm('brand')}
                </Label>
                <Input
                id="manufacturer"
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                className="col-span-3"
                />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="stock" className="text-right">
                {tForm('stock')}
                </Label>
                <Input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                className="col-span-3"
                required
                />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">
                {tForm('price')}
                </Label>
                <Input
                id="price"
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
