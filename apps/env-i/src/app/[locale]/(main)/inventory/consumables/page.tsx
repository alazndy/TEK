"use client"

import * as React from "react"
import { useDataStore } from "@/stores/data-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/data-table"
import { columns } from "@/components/inventory/columns"
import { PlusCircle, Loader2, PackageOpen } from "lucide-react"
import { ProductFormSheet } from "@/components/inventory/product-form-sheet"
import { ProductDetailDialog } from "@/components/inventory/product-detail-dialog"
import { BarcodeLabelDialog } from "@/components/inventory/barcode-label-dialog"
import { Consumable, Product } from "@/lib/types"
import { seedProducts } from "@/lib/seed-data"

export default function ConsumablesPage() {
  // Use consumables from store (separate collection)
  const consumables = useDataStore(state => state.consumables);
  const loadingConsumables = useDataStore(state => state.loadingConsumables);
  const addConsumable = useDataStore(state => state.addConsumable);
  const updateConsumable = useDataStore(state => state.updateConsumable);
  const deleteConsumable = useDataStore(state => state.deleteConsumable);
  const loadMoreConsumables = useDataStore(state => state.loadMoreConsumables);
  const hasMoreConsumables = useDataStore(state => state.hasMoreConsumables);
  const fetchConsumables = useDataStore(state => state.fetchConsumables);

  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = React.useState(false);
  const [isLabelDialogOpen, setIsLabelDialogOpen] = React.useState(false);
  const [selectedProduct, setSelectedProduct] = React.useState<Product | undefined>(undefined);

  // Fetch consumables on mount
  React.useEffect(() => {
    if (consumables.length === 0) {
      fetchConsumables(true);
    }
  }, [fetchConsumables, consumables.length]);

  const handleAddProduct = () => {
    setSelectedProduct(undefined);
    setIsSheetOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsSheetOpen(true);
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailDialogOpen(true);
  };

  const handleFormSubmit = async (data: any) => {
    if (selectedProduct) {
      await updateConsumable(selectedProduct.id, data);
    } else {
      await addConsumable({ ...data, category: "Sarf Malzeme" });
    }
    setIsSheetOpen(false);
  };

  const dynamicColumns = columns({ 
    onEdit: handleEditProduct, 
    onDelete: (productId) => deleteConsumable(productId, consumables.find((c: Consumable) => c.id === productId)?.name || ''),
    onPrintLabel: (product) => {
      setSelectedProduct(product);
      setIsLabelDialogOpen(true);
    },
    onView: handleViewProduct,
    onShowOnMap: (product) => {
      const zoneParam = encodeURIComponent(product.room || '');
      window.location.href = `/warehouse-map?zone=${zoneParam}&product=${product.id}`;
    },
  }) as any;

  const manufacturers = [...new Set(consumables.map((c: Consumable) => c.manufacturer).filter(Boolean))];

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <PackageOpen className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <CardTitle>Sarf Malzemeleri</CardTitle>
                <CardDescription>Sarf malzemelerini görüntüleyin ve yönetin.</CardDescription>
              </div>
            </div>
            <Button onClick={handleAddProduct}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Sarf Malzeme Ekle
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loadingConsumables && consumables.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <DataTable 
              columns={dynamicColumns} 
              data={consumables}
              onLoadMore={loadMoreConsumables}
              hasMore={hasMoreConsumables}
              isLoading={loadingConsumables}
            />
          )}
        </CardContent>
      </Card>
      
      <ProductFormSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        product={selectedProduct}
        onSubmit={handleFormSubmit}
        manufacturers={manufacturers}
        productTemplates={seedProducts}
      />
      <ProductDetailDialog
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        product={selectedProduct}
      />
      <BarcodeLabelDialog
        open={isLabelDialogOpen}
        onOpenChange={setIsLabelDialogOpen}
        product={selectedProduct}
      />
    </>
  )
}
