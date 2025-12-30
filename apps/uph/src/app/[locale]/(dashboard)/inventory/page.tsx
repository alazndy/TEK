'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { 
    Search, 
    Filter, 
} from 'lucide-react';
import { useInventoryStore } from '@/stores/inventory-store';
import { AssignProjectDialog } from '@/components/inventory/assign-project-dialog';
import { ProductUsageView } from '@/components/inventory/product-usage-view';
import { AddProductDialog } from '@/components/inventory/add-product-dialog';
import { EditProductDialog } from '@/components/inventory/edit-product-dialog';
import { Product } from '@/types/inventory';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { useTranslations } from 'next-intl';
import { InventoryTable } from '@/components/inventory/list/inventory-table';

export default function InventoryPage() {
  const t = useTranslations('Inventory');
  const { products, fetchInventory, isLoading, deleteProduct } = useInventoryStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [usageViewOpen, setUsageViewOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  
  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const filteredProducts = products.filter(product => {
      const matchesSearch = (product.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                            (product.category?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      const matchesLowStock = showLowStockOnly ? product.stock <= (product.minStock || 3) : true;
      
      return matchesSearch && matchesLowStock;
  });

  const handleAssignClick = (product: Product) => {
      setSelectedProduct(product);
      setAssignDialogOpen(true);
  };

  const handleViewUsageClick = (product: Product) => {
      setSelectedProduct(product);
      setUsageViewOpen(true);
  };

  const handleEditClick = (product: Product) => {
      setSelectedProduct(product);
      setEditDialogOpen(true);
  };
  
  const handleDeleteClick = (product: Product) => {
      setSelectedProduct(product);
      setDeleteDialogOpen(true);
  }

  const confirmDelete = async () => {
      if (selectedProduct) {
          await deleteProduct(selectedProduct.id);
          setDeleteDialogOpen(false);
          setSelectedProduct(null);
      }
  }

  return (
    <div className="flex-1 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
            {t('title')}
          </h2>
          <p className="text-muted-foreground text-sm">{t('subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" className="text-muted-foreground hover:text-white hover:bg-white/5 rounded-xl border border-white/10 uppercase text-[10px] font-bold tracking-widest px-4">
            {t('import')}
          </Button>
          <AddProductDialog />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
         <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
                placeholder={t('searchPlaceholder')}
                className="pl-10 h-11 bg-muted/30 dark:bg-white/5 border-border/50 dark:border-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 rounded-xl transition-all" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>
         <Button 
            variant="outline"
            onClick={() => setShowLowStockOnly(!showLowStockOnly)}
            className={cn(
              "h-11 px-6 rounded-xl border-border/50 dark:border-white/10 transition-all",
              showLowStockOnly 
                ? "bg-amber-500/10 border-amber-500/50 text-amber-600 dark:text-amber-500" 
                : "bg-muted/30 dark:bg-white/5 text-muted-foreground hover:bg-muted/50 dark:hover:bg-white/10"
            )}
         >
             <Filter className="mr-2 h-4 w-4" /> 
             {showLowStockOnly ? t('showingLowStock') : t('filterLowStock')}
         </Button>
      </div>

      <InventoryTable 
        products={filteredProducts}
        isLoading={isLoading}
        t={t}
        onAssign={handleAssignClick}
        onViewUsage={handleViewUsageClick}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
      />

      {/* Dialogs */}
      {selectedProduct && (
        <>
            <AssignProjectDialog 
                product={selectedProduct} 
                open={assignDialogOpen} 
                onOpenChange={setAssignDialogOpen} 
            />
            <ProductUsageView 
                product={selectedProduct} 
                open={usageViewOpen} 
                onOpenChange={setUsageViewOpen} 
            />
            <EditProductDialog 
                product={selectedProduct} 
                open={editDialogOpen} 
                onOpenChange={setEditDialogOpen} 
            />
            
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent className="bg-zinc-950 border-white/10 rounded-3xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-white">{t('deleteDialog.title')}</AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground">
                            {t.rich('deleteDialog.description', {
                                name: selectedProduct?.name,
                                span: (chunks) => <span className="font-semibold text-white">{chunks}</span>
                            })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-transparent border-white/10 text-white hover:bg-white/5 rounded-xl">{t('deleteDialog.cancel')}</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white rounded-xl border-none">{t('deleteDialog.confirm')}</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
      )}
    </div>
  );
}
