'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useInventoryStore } from '@/stores/inventory-store';
import { useAuthStore } from '@/stores/auth-store';
import { useSettingsStore } from '@/stores/settings-store';
import { Package, Plus, Minus, AlertCircle, Loader2, HardHat, FlaskConical, Box } from 'lucide-react';
import { toast } from 'sonner';

interface AddInventoryDialogProps {
  projectId: string;
  projectName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddInventoryDialog({ 
  projectId, 
  projectName, 
  open, 
  onOpenChange 
}: AddInventoryDialogProps) {
  const [selectedProductId, setSelectedProductId] = useState('');
  const [activeTab, setActiveTab] = useState<'product' | 'equipment' | 'consumable'>('product');
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { products, equipment, consumables, assignToProject, fetchInventory, isLoading } = useInventoryStore();
  const user = useAuthStore(state => state.user);
  const { system } = useSettingsStore();
  
  const envEnabled = system.integrations?.envInventory ?? true;

  // Fetch inventory when dialog opens
  useEffect(() => {
    if (open && products.length === 0) {
      fetchInventory();
    }
  }, [open, products.length, fetchInventory]);

  const getActiveList = () => {
      switch(activeTab) {
          case 'product': return products;
          case 'equipment': return equipment;
          case 'consumable': return consumables;
          default: return products;
      }
  }

  const items = getActiveList();

  // Deduplicate and filter available items (assuming all have 'stock' property)
  const seenIds = new Set<string>();
  const availableItems = items.filter(item => {
    // Equipment usually has stock 1 per item if unique, but here we treat them as stockable quantities
    const stock = (item as any).stock || 0;
    if (stock <= 0 || seenIds.has(item.id)) return false;
    seenIds.add(item.id);
    return true;
  });

  const selectedItem = items.find(p => p.id === selectedProductId);

  // Reset selection when tab changes
  useEffect(() => {
      setSelectedProductId('');
      setQuantity(1);
  }, [activeTab]);

  const handleSubmit = async () => {
    if (!selectedProductId || quantity < 1) return;
    if (!selectedItem) return;
    
    // Safety check for stock
    const currentStock = (selectedItem as any).stock || 0;
    if (quantity > currentStock) {
      toast.error(`Stokta sadece ${currentStock} adet var`);
      return;
    }

    setIsSubmitting(true);
    try {
      await assignToProject(
        selectedProductId,
        projectId,
        projectName,
        quantity,
        user?.email || 'Unknown',
        activeTab
      );
      
      toast.success(`${quantity}x ${selectedItem.name} projeye eklendi`);
      handleClose();
    } catch (error) {
      toast.error('Ürün eklenirken hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedProductId('');
    setQuantity(1);
    setActiveTab('product');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        {!envEnabled ? (
             <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground" />
                <DialogHeader>
                    <DialogTitle>Entegrasyon Kapalı</DialogTitle>
                    <DialogDescription>
                        ENV-I entegrasyonu sistem ayarlarından kapatılmış. 
                        Envanterden malzeme eklemek için lütfen ayarlardan entegrasyonu açın.
                    </DialogDescription>
                </DialogHeader>
                 <DialogFooter>
                    <Button onClick={handleClose}>Kapat</Button>
                </DialogFooter>
            </div>
        ) : (
        <>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Envanterden Ekle
          </DialogTitle>
          <DialogDescription>
            <span className="font-medium">{projectName}</span> projesine malzeme veya demirbaş ata
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="product" value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="product" className="flex gap-2">
                    <Box className="h-4 w-4" />
                    Ürün
                </TabsTrigger>
                <TabsTrigger value="consumable" className="flex gap-2">
                    <FlaskConical className="h-4 w-4" />
                    Sarf
                </TabsTrigger>
                <TabsTrigger value="equipment" className="flex gap-2">
                    <HardHat className="h-4 w-4" />
                    Demirbaş
                </TabsTrigger>
            </TabsList>

            <div className="py-4 space-y-4">
                 {/* Item Select */}
                <div className="space-y-2">
                    <Label htmlFor="item">Seçim Yap</Label>
                    <Select value={selectedProductId} onValueChange={setSelectedProductId} disabled={isLoading}>
                    <SelectTrigger>
                        <SelectValue placeholder={isLoading ? "Yükleniyor..." : "Listeden seçin..."} />
                    </SelectTrigger>
                    <SelectContent>
                        {isLoading ? (
                        <div className="p-4 text-center text-muted-foreground text-sm flex items-center justify-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Yükleniyor...
                        </div>
                        ) : availableItems.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground text-sm">
                            Bu kategoride uygun stok yok
                        </div>
                        ) : (
                        availableItems.map(item => (
                            <SelectItem key={item.id} value={item.id}>
                            <div className="flex items-center gap-2 w-full">
                                <span className="truncate max-w-[200px]">{item.name}</span>
                                <Badge variant="secondary" className="ml-auto text-xs whitespace-nowrap">
                                Stok: {(item as any).stock}
                                </Badge>
                            </div>
                            </SelectItem>
                        ))
                        )}
                    </SelectContent>
                    </Select>
                </div>

                {/* Quantity Input */}
                {selectedItem && (
                    <div className="space-y-2">
                    <Label htmlFor="quantity">Miktar</Label>
                    <div className="flex items-center gap-2">
                        <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                        >
                        <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                        id="quantity"
                        type="number"
                        min={1}
                        max={(selectedItem as any).stock}
                        value={quantity}
                        onChange={(e) => setQuantity(Math.min((selectedItem as any).stock, Math.max(1, parseInt(e.target.value) || 1)))}
                        className="w-20 text-center"
                        />
                        <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => setQuantity(Math.min((selectedItem as any).stock, quantity + 1))}
                        disabled={quantity >= (selectedItem as any).stock}
                        >
                        <Plus className="h-4 w-4" />
                        </Button>
                        <span className="text-sm text-muted-foreground">
                        / {(selectedItem as any).stock} mevcut
                        </span>
                    </div>
                    </div>
                )}
            </div>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>İptal</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!selectedProductId || quantity < 1 || isSubmitting}
          >
            {isSubmitting ? 'Ekleniyor...' : 'Projeye Ekle'}
          </Button>
        </DialogFooter>
        </>
        )}
      </DialogContent>
    </Dialog>
  );
}
